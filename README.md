# AppShell

모바일 웹(`plick`)을 감싸 App Store / Google Play에 배포하기 위한 **React Native 웹뷰 셸 앱**입니다.
비즈니스 로직은 전부 웹에 있고, 이 저장소는 껍데기(네이티브 컨테이너)만 담당합니다.

- **Expo SDK 57** / React Native 0.86 / React 19.2
- **react-native-webview** 기반 단일 화면
- 네이티브 프로젝트(`ios/`, `android/`)는 **커밋하지 않고** `expo prebuild`로 생성 (Continuous Native Generation)
- 스토어 빌드/제출은 **EAS Build / EAS Submit** (클라우드)

---

## 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 감쌀 웹 주소 설정
cp .env.example .env
# .env 의 EXPO_PUBLIC_WEB_URL 값을 실제 모바일 웹 주소로 수정

# 3. 개발 빌드 (최초 1회, 기기/시뮬레이터에 설치됨)
npm run ios       # 또는 npm run android

# 4. 이후 개발 시에는 Metro만 띄우면 됩니다
npm start
```

> `react-native-webview`는 네이티브 모듈이라 **Expo Go에서는 동작하지 않습니다.**
> 반드시 `npm run ios` / `npm run android`(또는 EAS development 빌드)로 만든
> **개발 빌드(dev client)** 위에서 실행하세요.

---

## 필요한 도구

| 도구 | 용도 | 설치 |
| --- | --- | --- |
| Node.js 20+ | 런타임 | `brew install node` |
| Watchman | Metro 파일 감시 | `brew install watchman` |
| EAS CLI | 클라우드 빌드/제출 | `npm i -g eas-cli` |
| Xcode 16+ | 로컬 iOS 빌드 | App Store |
| CocoaPods | iOS 의존성 | `brew install cocoapods` |
| JDK 21 | 로컬 Android 빌드 | `brew install --cask temurin@21` |
| Android SDK | 로컬 Android 빌드 | Android Studio |

로컬 네이티브 빌드를 하지 않고 EAS Build만 쓸 거라면 Node / Watchman / EAS CLI만 있으면 됩니다.

환경 점검:

```bash
npm run doctor   # npx expo-doctor
```

---

## 프로젝트 구조

```
app.config.ts          앱 이름·번들 ID·아이콘·권한·스플래시 등 모든 앱 메타데이터
eas.json               EAS Build/Submit 프로파일 (development / preview / production)
.env.example           EXPO_PUBLIC_WEB_URL 템플릿
index.ts               진입점 (registerRootComponent)
App.tsx                SafeAreaProvider + 스플래시 유지
src/
  config.ts            웹 URL, 내부/외부 호스트 판별, UA 접미사 등 셸 동작 설정
  WebShell.tsx         웹뷰 본체 — 네비게이션 정책, 뒤로가기, 오류 처리
  components/
    ErrorView.tsx      로드 실패 시 재시도 화면
assets/                아이콘 / 스플래시 이미지
docs/
  adr/                 왜 그렇게 만들었는지 (Architecture Decision Records)
  todo/                앞으로 할 일 — 배포까지 남은 작업이 여기 정리되어 있습니다
```

`ios/`, `android/` 폴더는 **생성물**이며 `.gitignore`에 있습니다.
네이티브 설정을 바꾸려면 이 폴더가 아니라 `app.config.ts`를 수정하세요.

> **처음 이 저장소를 맡았다면** [`docs/todo/README.md`](./docs/todo/README.md)부터 보세요.
> 배포까지 남은 일이 순서대로 정리되어 있습니다.
> 왜 이런 구조인지는 [`docs/adr/`](./docs/adr/README.md)에 있습니다.

## 기여 방법

`main`에 직접 커밋하지 않습니다. `<type>/<slug>` 브랜치를 만들어 작업하고 PR을 올립니다.
작업이 끝나면 `docs/todo/`를 갱신하고, 되돌리기 비싼 결정을 했다면 `docs/adr/`에 ADR을 남깁니다.
자세한 규칙은 [`CLAUDE.md`](./CLAUDE.md)에 있습니다.

---

## 웹뷰 셸이 해주는 일

`src/WebShell.tsx`에 구현되어 있습니다.

| 동작 | 설명 |
| --- | --- |
| 스플래시 유지 | 웹 첫 로드가 끝날 때까지 스플래시를 띄워 흰 화면 깜빡임 제거 |
| 외부 링크 분리 | `src/config.ts`의 `INTERNAL_HOSTS`에 없는 도메인은 인앱 브라우저로 열림 |
| 커스텀 스킴 | `tel:` `mailto:` `sms:` `intent:` `kakaotalk:` 등은 OS에 위임 |
| Android 뒤로가기 | 웹 히스토리가 있으면 뒤로 이동, 없으면 앱 종료 |
| 오류/오프라인 화면 | 로드 실패 시 재시도 UI (네트워크 단절 여부 구분) |
| 렌더러 크래시 복구 | 웹뷰 프로세스가 죽으면 자동 재마운트 |
| 세션 유지 | 쿠키 공유(`sharedCookiesEnabled`)로 앱 재실행 후에도 로그인 유지 |
| 앱 감지 | User-Agent 뒤에 `PlickApp`을 붙여 웹에서 앱 여부 판별 가능 |

### 웹에서 앱 감지하기

```js
const isApp = navigator.userAgent.includes('PlickApp');
```

---

## 설정 바꾸기

### 감쌀 웹 주소

`.env`의 `EXPO_PUBLIC_WEB_URL`. 값이 없으면 `src/config.ts`의 기본값이 쓰입니다.

> `EXPO_PUBLIC_` 값은 JS 번들에 그대로 인라인됩니다. **비밀값을 넣지 마세요.**
> EAS Build에서 쓰려면 `eas.json`의 프로파일에 `env`를 추가하거나
> `eas env:create` 로 등록하세요.

### 앱 안에서 열릴 도메인 추가 (소셜 로그인 등)

`src/config.ts`의 `INTERNAL_HOSTS`에 호스트를 추가합니다.
`.` 로 시작하면 서브도메인까지 포함합니다.

```ts
export const INTERNAL_HOSTS: string[] = [
  hostOf(WEB_URL),
  '.plick.app',          // www.plick.app, api.plick.app …
  'nid.naver.com',
  'kauth.kakao.com',
];
```

### 앱 이름 / 번들 ID / 버전

`app.config.ts` 상단 상수(`APP_NAME`, `BUNDLE_ID`, `VERSION`)를 수정합니다.
빌드 번호(iOS `buildNumber`, Android `versionCode`)는 EAS가 자동 증가시키므로
직접 관리하지 않습니다 (`eas.json`의 `appVersionSource: "remote"`).

### 아이콘 / 스플래시

`assets/` 의 이미지를 교체합니다.

- `icon.png` — 1024×1024, 투명 배경 없음 (iOS)
- `android-icon-foreground.png` / `-background.png` / `-monochrome.png` — Android 적응형 아이콘
- `splash-icon.png` — 스플래시 중앙 로고

---

## 스토어 배포

### 1. EAS 프로젝트 연결 (최초 1회)

```bash
eas login
eas init            # extra.eas.projectId 가 채워집니다
```

### 2. 빌드

```bash
npm run build:preview   # 내부 테스트용 (Android APK + iOS ad-hoc)
npm run build:prod      # 스토어 제출용 (AAB + IPA)
```

크리덴셜(인증서, 키스토어)은 EAS가 대신 생성·관리합니다.
첫 빌드 시 Apple 계정 로그인을 요구합니다.

### 3. 제출

`eas.json`의 `submit.production` 값을 실제 값으로 채운 뒤:

```bash
npm run submit:prod
```

- **iOS** — `appleId`, `ascAppId`, `appleTeamId` 필요.
  App Store Connect에 앱 레코드를 먼저 만들어 두세요.
- **Android** — Google Play Console에서 서비스 계정 JSON을 발급받아
  `google-play-service-account.json`으로 저장 (`.gitignore`에 포함되어 있습니다).
  **첫 릴리즈 1회는 Play Console에 수동 업로드**해야 이후 API 제출이 가능합니다.

### 심사 시 주의

웹뷰만 감싼 앱은 "웹사이트를 그대로 감싼 앱"으로 반려될 수 있습니다
(Apple App Store Review Guideline 4.2 — Minimum Functionality).
푸시 알림, 생체 인증, 공유 등 네이티브 기능을 하나 이상 추가하면 통과 가능성이 올라갑니다.

---

## 자주 쓰는 명령

```bash
npm start              # Metro 개발 서버 (dev client 모드)
npm run ios            # 로컬 iOS 빌드 & 실행
npm run android        # 로컬 Android 빌드 & 실행
npm run prebuild       # ios/, android/ 재생성 (--clean)
npm run typecheck      # tsc --noEmit
npm run doctor         # 프로젝트 환경 점검
```

## 문제 해결

**네이티브 설정을 바꿨는데 반영되지 않음**
`npm run prebuild` 로 네이티브 프로젝트를 재생성한 뒤 다시 빌드하세요.

**`react-native-webview` 관련 오류 / Expo Go에서 빈 화면**
Expo Go가 아니라 개발 빌드에서 실행해야 합니다 (`npm run ios` / `npm run android`).

**웹은 되는데 앱에서만 특정 링크가 안 열림**
해당 도메인이 `INTERNAL_HOSTS`에 없어 인앱 브라우저로 넘어간 것입니다. 목록에 추가하세요.

**Metro 캐시 문제**
```bash
npx expo start --clear
```
