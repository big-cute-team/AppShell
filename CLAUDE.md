# CLAUDE.md

이 저장소는 모바일 웹을 감싸 앱스토어/플레이스토어에 배포하는 **React Native 웹뷰 셸**입니다.
Expo SDK 57 (RN 0.86 / React 19.2) + `react-native-webview` 단일 화면 구조입니다.

사람이 읽을 셋업·배포 절차는 `README.md`에 있습니다. 이 문서는 **작업 시 지켜야 할 규칙**만 담습니다.

## 작업 흐름 (기본값)

이 저장소에서 코드나 설정을 수정할 때는 **매번 아래 흐름을 따릅니다.**
사용자가 따로 요청하지 않아도 기본 동작입니다.

```
작업 시작  →  브랜치 생성        (skill: start-task)
작업       →  구현 · 수정
마무리     →  검증 → 문서 → 커밋 → 푸시 → PR   (skill: wrap-session)
                     └ 결정을 내렸다면 ADR      (skill: write-adr)
```

- **main에 직접 커밋하지 않습니다.** 모든 변경은 `<type>/<slug>` 브랜치 → PR을 거칩니다.
- 작업이 끝나면 `docs/todo/`를 갱신합니다 — 끝낸 항목 체크, **새로 알게 된 할 일 추가**.
  대화에만 남긴 "나중에 할 것"은 여기 적지 않으면 사라집니다.
- 되돌리기 비싼 결정을 했으면 `docs/adr/`에 ADR을 남깁니다. 단순 수정은 대상이 아닙니다.
- PR 본문의 "어떻게 확인했나"에는 **실제로 돌린 것만** 적습니다.

각 단계의 구체적 절차는 `.claude/skills/` 의 스킬 문서에 있습니다.

| 스킬 | 언제 |
| --- | --- |
| `start-task` | 파일을 수정하기 전 |
| `write-adr` | 되돌리기 비싼 판단을 했을 때 |
| `wrap-session` | 한 덩어리의 작업이 끝났을 때 |

예외를 만들 때 (main 직접 커밋, 검증 생략, PR 없이 푸시)는 사용자가 명시적으로 요청한 경우뿐입니다.

## 문서 구조

| 위치 | 담는 것 |
| --- | --- |
| `README.md` | 사람이 읽는 셋업·배포 절차 |
| `CLAUDE.md` | 작업 규칙 (이 문서) |
| `docs/adr/` | **왜** 그렇게 만들었는지. 한 번 Accepted 되면 고쳐 쓰지 않음 |
| `docs/todo/` | 앞으로 할 일. 주제별 파일 + 체크박스 |

## 이 저장소의 범위

앱은 껍데기입니다. 화면·상태·라우팅·디자인은 모두 웹에 있습니다.
따라서 **UI 기능 요청은 대부분 여기가 아니라 웹 저장소에서 처리해야 합니다.**
여기에 코드를 추가해야 하는 경우는 네이티브 능력이 필요할 때뿐입니다
(푸시 알림, 딥링크, 인앱 결제, 생체 인증, 파일 접근, 앱 버전 게이팅 등).

새 화면·네비게이션 라이브러리·상태 관리 라이브러리를 추가하자는 제안은 하지 마세요.
셸을 얇게 유지하는 것이 이 저장소의 설계 목표입니다.

## 절대 하면 안 되는 것

- **`ios/`, `android/` 폴더를 직접 수정하지 마세요.** 두 폴더는 `expo prebuild` 생성물이고
  `.gitignore`에 있습니다. Info.plist / AndroidManifest / Gradle 설정 변경은 전부
  `app.config.ts`(및 `expo-build-properties` 플러그인)를 통해야 합니다.
  거기서 표현할 수 없는 변경이면 config plugin을 작성하세요.
- **`app.json`을 만들지 마세요.** 설정은 `app.config.ts` 하나로 관리합니다.
  두 파일이 공존하면 병합 규칙 때문에 혼란이 생깁니다.
- **`EXPO_PUBLIC_*`에 비밀값을 넣지 마세요.** 이 값들은 JS 번들에 평문으로 인라인됩니다.
- **네이티브 의존성을 `npm install`로 추가하지 마세요.** `npx expo install <pkg>`를 쓰면
  SDK 57과 호환되는 버전이 선택됩니다.
- **버전 번호를 손으로 올리지 마세요.** `eas.json`이 `appVersionSource: "remote"`라
  iOS `buildNumber` / Android `versionCode`는 EAS가 관리합니다.
  사용자용 버전(`app.config.ts`의 `VERSION`)만 사람이 정합니다.

## 코드 구조

| 파일 | 역할 |
| --- | --- |
| `app.config.ts` | 앱 메타데이터 전부. 상단 상수(`APP_NAME`/`BUNDLE_ID`/`VERSION`)가 단일 출처 |
| `src/config.ts` | 셸 동작 설정 — 웹 URL, `INTERNAL_HOSTS`, UA 접미사, 배경색 |
| `src/WebShell.tsx` | 웹뷰 본체. 네비게이션 정책·뒤로가기·오류 복구가 모두 여기 |
| `src/components/ErrorView.tsx` | 로드 실패 재시도 화면 |
| `eas.json` | 빌드/제출 프로파일 |

### 네비게이션 정책 (`WebShell.tsx`의 `handleShouldStartLoad`)

모든 URL 이동은 이 한 함수를 통과합니다. 링크 동작을 바꿔달라는 요청은 여기서 처리하세요.

1. `http(s)`가 아닌 스킴 → `Linking.openURL`로 OS에 위임
2. `INTERNAL_HOSTS`에 매칭 → 웹뷰에서 그대로 로드
3. 그 외 → `WebBrowser.openBrowserAsync`(인앱 브라우저)

"이 링크가 앱 안에서 안 열려요" 류의 이슈는 거의 항상 `src/config.ts`의
`INTERNAL_HOSTS`에 호스트를 추가하면 해결됩니다. `WebShell.tsx`를 고치지 마세요.

## 검증

코드를 바꾼 뒤에는 최소한 이것들을 돌리세요:

```bash
npm run typecheck                 # tsc --noEmit
npx expo config --type public     # app.config.ts 가 유효한지
npm run doctor                    # expo-doctor (의존성 버전 정합성 포함)
```

`app.config.ts`나 네이티브 의존성을 건드렸다면 prebuild가 깨지지 않는지도 확인:

```bash
npx expo prebuild --no-install --clean
```

확인 후 생성된 `ios/`, `android/`는 지우는 편이 좋습니다 — 오래된 네이티브 폴더가
남아 있으면 이후 설정 변경이 반영되지 않은 것처럼 보입니다.

시뮬레이터 실행이 필요한 검증은 `npm run ios` / `npm run android`로 개발 빌드를 만들어야
합니다. **Expo Go로는 검증할 수 없습니다.**

`react-native-webview`는 Expo Go에 포함되어 있어 화면 자체는 뜹니다. 문제는 Expo Go가
이미 빌드된 별개의 앱이라 **`app.config.ts`의 네이티브 설정을 전혀 반영하지 않는다**는 점입니다.
아이콘·스플래시·번들ID·스킴·권한 문자열·ATS/cleartext 설정이 모두 Expo Go의 것입니다.

특히 Expo Go는 개발 서버를 로드해야 하므로 **평문 HTTP가 이미 허용돼 있습니다.**
그래서 `usesCleartextTraffic` 같은 설정은 Expo Go에서 **항상 통과한 것처럼 보입니다** —
거짓 통과입니다. 네이티브 설정을 건드린 검증은 반드시 개발 빌드로 하세요.

로컬 웹의 렌더링만 빠르게 훑어보는 용도로는 `npx expo start --go`가 유용합니다
(`npm start`는 `--dev-client`가 붙어 있어 Expo Go로 붙지 않습니다).

## RN 0.86 관련 주의

- `StyleSheet.absoluteFillObject`는 제거되었습니다. `StyleSheet.absoluteFill`을 스프레드하세요
  (0.86에서는 일반 객체입니다).
- `expo-status-bar`의 `backgroundColor` prop은 없어졌습니다 (Android edge-to-edge 기본화).
- `BackHandler.removeEventListener`는 없습니다. `addEventListener`가 반환하는
  subscription의 `.remove()`를 쓰세요.
- Android `edgeToEdgeEnabled` 설정 키는 사라졌습니다. 항상 켜져 있으니
  `react-native-safe-area-context`로 인셋을 처리하세요.

## 스토어 심사

웹뷰 셸은 App Store Review Guideline 4.2(Minimum Functionality)로 반려될 수 있습니다.
심사 대응으로 네이티브 기능을 추가할 때는 셸의 얇음을 유지하는 선에서
(푸시 알림, 공유, 생체 인증 정도) 제안하세요.
