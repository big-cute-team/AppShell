# ADR-0001: 웹뷰 셸을 Expo + CNG로 구성

- **상태**: Accepted
- **날짜**: 2026-07-23
- **관련**: [ADR-0002](./0002-webview-navigation-policy.md), [ADR-0003](./0003-eas-build-and-remote-versioning.md), `docs/todo/`

## 배경

빈 저장소(`README.md` 한 줄만 존재)에서 시작했습니다. 목표는 이미 운영 중인 모바일 웹을
네이티브 껍데기로 감싸 App Store / Google Play에 올리는 것이고, 앱 자체에는
비즈니스 로직을 두지 않습니다.

작업 시작 시점의 로컬 환경:

| 항목 | 상태 |
| --- | --- |
| Node.js | v22.19.0 ✅ |
| Xcode | 26.5 (Build 17F42) ✅ |
| Android SDK | `~/Library/Android/sdk` ✅ |
| JDK | Oracle 24.0.2 (기본) + Temurin 21 |
| Watchman | ❌ 미설치 |
| CocoaPods | ❌ 미설치 |
| EAS CLI | ❌ 미설치 |

즉 **로컬 iOS 네이티브 빌드 체인이 완비되어 있지 않았고**, 기본 JDK가 24라
RN Android Gradle 빌드와도 어긋나는 상태였습니다.

## 결정

**Expo SDK 57 (React Native 0.86 / React 19.2) 위에 `react-native-webview` 단일 화면**으로 구성하고,
네이티브 프로젝트는 커밋하지 않는 **CNG(Continuous Native Generation)** 방식을 채택합니다.

구체적으로:

1. `create-expo-app --template blank-typescript`로 스캐폴딩 후 저장소에 이식
2. `ios/`, `android/`는 `.gitignore`에 두고 `npx expo prebuild`로 매번 생성
3. 앱 메타데이터의 단일 출처는 **`app.config.ts` 하나** — `app.json`은 삭제
4. 네이티브 빌드 설정 변경은 `expo-build-properties` 플러그인을 통해서만

### 설치한 도구

```bash
brew install watchman      # Metro 파일 감시
brew install cocoapods     # 1.17.0 — 로컬 iOS 빌드용 (Ruby 4.0.6 동반 설치)
npm i -g eas-cli           # 21.1.0
```

`eas-cli`는 처음에 devDependency로 넣었다가 `expo-doctor`의
"Check for legacy global CLI installed locally" 검사에 걸려 전역 설치로 옮겼습니다.

### 설치한 런타임 의존성

`npx expo install`로 SDK 57 호환 버전을 고정했습니다.

`react-native-webview` 13.16.1, `expo-dev-client`, `expo-splash-screen`, `expo-web-browser`,
`expo-network`, `expo-constants`, `expo-system-ui`, `expo-build-properties`,
`react-native-safe-area-context`.

### 앱 식별자

`plick` / `com.plick.app` / URL scheme `plick`. `app.config.ts` 최상단 상수로 뽑아
iOS·Android 양쪽에 한 번에 반영되게 했습니다.

## 대안과 트레이드오프

| 대안 | 장점 | 단점 | 채택 |
| --- | --- | --- | --- |
| **Expo + EAS Build** | 클라우드 빌드로 로컬 Xcode/Gradle 의존 최소화, 크리덴셜 자동 관리, config plugin으로 네이티브 설정 선언화, OTA 업데이트 여지 | Expo 릴리스 주기에 종속, 특수 네이티브 요구 시 config plugin 작성 필요 | ✅ |
| Bare React Native CLI | 네이티브 완전 제어, 서드파티 SDK 연동 자유 | 로컬에 CocoaPods·JDK 정합성을 직접 관리해야 함(현재 미비). 껍데기 앱에 비해 유지비가 과함 | ❌ |
| Capacitor / Cordova | 웹뷰 셸에 특화, 설정 최소 | 이후 네이티브 기능(푸시, 결제) 확장 시 RN 생태계보다 선택지가 좁음 | ❌ |
| PWA만 배포 | 저장소 자체가 불필요 | iOS PWA 제약이 크고 App Store 노출을 포기하게 됨 — 요구사항 미충족 | ❌ |

`ios/`·`android/` 커밋 여부도 갈림길이었습니다. 커밋하면 네이티브 코드를 직접 만질 수 있지만,
껍데기 앱에서는 그럴 일이 거의 없는 반면 **prebuild 결과물과 손으로 고친 내용이 어긋나는 사고**가
훨씬 잦습니다. 그래서 커밋하지 않는 쪽을 골랐습니다.

## 결과

### 생긴 제약

- **Expo Go로는 이 앱을 실행할 수 없습니다.** `react-native-webview`가 네이티브 모듈이라
  `expo run:ios` / `expo run:android` 또는 EAS development 빌드가 필요합니다.
- `ios/`, `android/`를 직접 수정하면 다음 prebuild에서 **말없이 사라집니다.**
  모든 네이티브 설정은 `app.config.ts`를 경유해야 합니다.
- iOS 최소 지원 버전은 Expo SDK 57 기본값인 **16.4** 입니다.
  처음에 15.1로 지정했다가 `expo-build-properties`가 거부해서 오버라이드를 제거했습니다.
- 로컬 Android 빌드 시 기본 JDK가 24라 Gradle이 거부할 수 있습니다.
  `export JAVA_HOME=$(/usr/libexec/java_home -v 21)` 이 필요합니다. (EAS Build는 무관)

### RN 0.86에서 깨진 API (실제로 부딪힘)

| 이전 | 현재 |
| --- | --- |
| `StyleSheet.absoluteFillObject` | 제거됨 → `StyleSheet.absoluteFill` 스프레드 (0.86에서 일반 객체) |
| `<StatusBar backgroundColor>` (expo-status-bar) | 제거됨 (Android edge-to-edge 기본화) |
| `android.edgeToEdgeEnabled` 설정 키 | 제거됨 — 항상 켜짐, safe-area-context로 인셋 처리 |
| `BackHandler.removeEventListener` | 제거됨 → subscription `.remove()` |

이 목록은 `CLAUDE.md`에도 적어 두었습니다.

### 검증 결과

```
npx tsc --noEmit                      → 통과
npx expo config --type public         → 번들 ID·권한·ATS 정상 해석
npx expo-doctor                       → 20/20
npx expo prebuild --no-install --clean → ios/·android/ 생성 성공
  AndroidManifest: INTERNET, ACCESS_NETWORK_STATE, usesCleartextTraffic="false"
  build.gradle: namespace/applicationId = com.plick.app
  Info.plist: NSAllowsArbitraryLoads=false, 한국어 권한 설명 문자열 반영
npx expo export --platform ios        → 608 모듈, 1.5MB hbc 번들 성공
```

검증 후 `ios/`, `android/`는 삭제했습니다.

### 되돌리려면

Bare RN으로 전환하려면 `npx expo prebuild` 결과물을 커밋하고 `app.config.ts`의 설정을
네이티브 파일로 옮긴 뒤 `expo-*` 모듈을 대체해야 합니다. 화면이 하나뿐이라
실제 비용은 반나절 수준입니다 — 이 결정은 **비교적 싸게 되돌릴 수 있습니다.**
