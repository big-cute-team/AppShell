# 003. 첫 실기기 동작 확인

**상태: 🔴 지금 할 것** — 로컬 개발 웹(`http://localhost:3001`)을 가리키도록
설정돼 있어 공개 도메인 없이도 진행할 수 있습니다.

지금까지의 검증은 전부 정적입니다 (타입체크 / prebuild / 번들 export).
**앱이 실제로 뜨는 것을 아직 아무도 보지 못했습니다.**

## 시작 전

- [ ] 로컬 웹 개발 서버가 떠 있는가 (`:3001`)
- [ ] `.env`의 `EXPO_PUBLIC_WEB_URL`이 **실행할 플랫폼에 맞는 주소**인가
      — iOS 시뮬레이터 `localhost`, Android 에뮬레이터 `10.0.2.2`,
        실기기는 맥의 LAN IP(`ipconfig getifaddr en0`). 자세한 건 `.env.example`
- [ ] 실기기라면 개발 서버가 `0.0.0.0`에 바인딩돼 있는가
      (`127.0.0.1`에만 묶여 있으면 폰에서 닿지 않습니다)

> `.env`를 고친 뒤에는 `npx expo prebuild --clean`을 다시 돌려야 반영됩니다 —
> `ALLOW_CLEARTEXT_TRAFFIC`은 네이티브 설정에 구워지는 값이라 JS 리로드로는 안 바뀝니다.

## 로컬 빌드로 확인

- [ ] iOS 시뮬레이터
      ```bash
      npm run ios
      ```
- [ ] Android — **JDK 21이 필수입니다** (2026-07-23 확인)
      ```bash
      export JAVA_HOME=$(/usr/libexec/java_home -v 21)
      npm run android
      ```
      기본 JDK 24로 돌리면 `:expo-modules-core:configureCMakeDebug` 에서
      `A restricted method in java.lang.System has been called` 로 실패합니다.
      한 번 실패하면 CMake 캐시가 남으니 `rm -rf android` 후 다시 빌드하세요.
- [ ] JDK 21을 기본으로 쓸지 결정하고 셸 프로필(`~/.zshrc`)에 반영
      — 안 하면 새 터미널마다 위 `export`를 다시 쳐야 합니다

> **이 체크리스트를 Expo Go로 닫지 마세요.** `react-native-webview`가 Expo Go에
> 포함돼 있어 화면은 뜨지만, Expo Go는 별개의 앱이라 `app.config.ts`의 네이티브 설정을
> 반영하지 않습니다. 아이콘·스플래시·번들ID·스킴·권한, 그리고 **평문 HTTP 허용 여부까지
> 전부 Expo Go의 설정이 적용됩니다** — Expo Go는 개발 서버를 로드해야 하므로 HTTP가
> 이미 허용돼 있어, cleartext 설정이 항상 통과한 것처럼 보입니다(거짓 통과).
>
> 로컬 웹이 폰 웹뷰에서 볼 만한지 훑는 용도로는 `npx expo start --go`가 유용합니다.
> 아래 항목을 실제로 확인하려면 개발 빌드(`npm run android`)가 필요합니다.

## 체크리스트

### 기본

- [ ] 스플래시 → 웹 화면으로 자연스럽게 전환되는가 (흰 화면 깜빡임 없음)
- [ ] 세이프 에어리어 — 노치/다이나믹 아일랜드, 하단 홈 인디케이터에 콘텐츠가 가리지 않는가
- [ ] 상태바 아이콘이 배경(`#FFFFFF`)에서 보이는가 (`style="dark"`로 설정됨)
- [ ] 스크롤이 부드러운가, 오버스크롤 글로우가 거슬리지 않는가

### 네비게이션

- [ ] Android 하드웨어 뒤로가기 → 웹 히스토리 뒤로 이동, 최상단에서는 앱 종료
- [ ] iOS 스와이프 뒤로가기 (`allowsBackForwardNavigationGestures`)
- [ ] 외부 링크 → 인앱 브라우저
- [ ] `tel:` / `mailto:` → OS 앱

### 오류 처리

- [ ] 비행기 모드에서 앱 실행 → "인터넷에 연결되어 있지 않아요" 화면
- [ ] 비행기 모드 해제 후 [다시 시도] → 정상 로드
- [ ] 잘못된 URL로 바꿔 실행 → 오류 화면 (흰 화면 아님)

### 웹 연동

- [ ] 웹에서 `navigator.userAgent.includes('PlickApp')` 가 `true`
- [ ] 파일 업로드(`<input type="file">`) — 사진 선택/촬영이 되는가
      (안 되면 iOS 권한 문자열은 `app.config.ts`에 이미 있으니 웹 쪽 확인)
- [ ] 동영상 인라인 재생 (전체화면으로 튀지 않는가)
- [ ] 당겨서 새로고침 — **iOS에서만** 동작합니다. Android도 필요한지 판단

## 발견되면 처리할 것

- [ ] 웹 콘텐츠가 상태바 아래로 들어가야 한다면 `WebShell.tsx`의
      `SafeAreaView edges` 조정 (`['bottom']`만 남기는 식)
- [ ] Android 당겨서 새로고침이 필요하면 별도 구현 검토
