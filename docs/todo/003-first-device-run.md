# 003. 첫 실기기 동작 확인

**상태: ⚪ 대기** — 001(웹 URL)이 끝나야 의미가 있습니다.

지금까지의 검증은 전부 정적입니다 (타입체크 / prebuild / 번들 export).
**앱이 실제로 뜨는 것을 아직 아무도 보지 못했습니다.**

## 로컬 빌드로 확인

- [ ] iOS 시뮬레이터
      ```bash
      npm run ios
      ```
- [ ] Android 에뮬레이터 — 기본 JDK가 24라 Gradle이 거부할 수 있습니다
      ```bash
      export JAVA_HOME=$(/usr/libexec/java_home -v 21)
      npm run android
      ```
- [ ] JDK 21을 기본으로 쓸지 결정하고 셸 프로필(`~/.zshrc`)에 반영

> `npm start`만으로는 안 됩니다. `react-native-webview`가 네이티브 모듈이라
> Expo Go에서는 동작하지 않습니다. 개발 빌드가 반드시 필요합니다.

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
