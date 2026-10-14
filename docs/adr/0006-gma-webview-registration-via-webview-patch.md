# ADR-0006: 앱 안 애드센스 광고를 위해 WebView를 Google Mobile Ads SDK에 등록한다 (react-native-webview 패치 방식)

- **상태**: Accepted (2026-10-14 — 로컬 iOS/Android 컴파일, 시뮬레이터·에뮬레이터에서 Google WebView API 테스트 페이지 등록 성공 확인)
- **날짜**: 2026-10-14
- **관련**: ADR-0001, ADR-0005, `docs/todo/011-adsense-in-app-webview-registration.md`, Jira KAN-655 (KAN-652 후속, 프론트 KAN-654)

## 배경

모바일 웹(`m.plick.co.kr`)에 애드센스 광고를 넣는다(프론트 KAN-652). 애드센스 정책은 앱 안 광고를
**Google Mobile Ads SDK(GMA)를 쓸 때만** 허용하므로, 지금 프론트는 앱 셸 UA(`PlickApp/x.y`)를 보면
광고 자리를 아예 그리지 않는다. 정책이 제시하는 공식 경로는 GMA SDK의 **WebView API for Ads**다.
앱이 자기 WebView를 SDK에 등록하면(`MobileAds.registerWebView` / `GADMobileAds registerWebView:`)
그 안의 애드센스 광고가 허용되는 광고가 된다. 등록은 WebView 인스턴스마다 한 번, 첫 페이지 로드 전에 해야 한다.

문제는 우리 셸이 Expo + `react-native-webview`라서 **네이티브 WebView 인스턴스를 JS에서 만질 수 없다**는 점이다.

- `react-native-google-mobile-ads`에는 이 API가 없다 (invertase#855, 2026-07 미구현으로 자동 닫힘).
- `react-native-webview`에는 같은 요청이 열려 있고(#3960) 이를 구현한 PR #4001(2026-08-26)이 미머지 상태다.
  PR은 `googleMobileAdsWebViewRegistrationEnabled` prop 하나를 추가하고, SDK는 런타임에 리플렉션으로 찾는다.

제약: 셸을 얇게(ADR-0001), `ios/`·`android/` 직접 수정 금지, 네이티브 변경은 config plugin으로.

## 결정

**`react-native-webview` 13.16.1에 PR #4001을 이식한 패치를 `patch-package`로 적용한다.**
(`patches/react-native-webview+13.16.1.patch`, `package.json`의 `postinstall: patch-package`로 EAS 빌드에서도 적용.)
`WebShell.tsx`의 WebView에 `googleMobileAdsWebViewRegistrationEnabled`를 켠다.
등록은 네이티브 WebView가 생성되는 시점(Android는 prop 적용, iOS는 `didMoveToWindow`)에 일어나므로
첫 페이지 로드보다 항상 앞선다.

GMA SDK 자체는 앱이 제공한다. 광고 유닛을 직접 띄우지 않으므로 JS 라이브러리 없이 네이티브 의존성만 넣는다.

- iOS: `expo-build-properties` `extraPods`로 `Google-Mobile-Ads-SDK ~> 13.11`, Info.plist `GADIntegrationManager = webview`
- Android: `plugins/withGoogleMobileAdsWebView.js`가 `play-services-ads 25.2.0` 의존성과
  매니페스트 `INTEGRATION_MANAGER = webview` 메타데이터를 넣는다. 25.3.0 이상은 Kotlin 2.3 메타데이터라
  RN 0.86(Kotlin 2.1.20)에서 컴파일이 깨지므로 25.2.0에 고정한다

`webview` 통합 모드는 AdMob 앱 ID 검사를 건너뛰는 선언이다. AdMob 계정·앱 ID 없이 쓸 수 있다.

## 대안과 트레이드오프

| 대안 | 장점 | 단점 | 채택 여부 |
| --- | --- | --- | --- |
| react-native-webview 패치 (PR #4001 이식) | 등록 시점이 정확(뷰 생성 직후, 로드 전). 새 아키텍처에서 뷰 탐색 불필요. 변경이 작고(11개 파일, prop 하나) 업스트림 머지 시 패치만 지우면 됨 | 업스트림 미머지 패치에 의존. `react-native-webview` 버전을 올리면 패치를 다시 떠야 함 | ✅ |
| 자체 Expo 로컬 네이티브 모듈 (Jira 티켓 원안) | 패치 의존 없음 | JS에서 reactTag로 네이티브 뷰를 찾아야 하는데 Bridgeless(새 아키텍처)에서 UIManager 경로가 null이 나는 보고(invertase#855). 등록 전에 첫 로드가 시작되지 않게 `source`를 지연시키는 추가 코드 필요. 플랫폼별 코드가 더 많음 | ❌ |
| `react-native-google-mobile-ads` 설치 | SDK·config plugin이 따라옴 | 등록 API가 없어 결국 위 둘 중 하나가 또 필요. AdMob 앱 ID를 요구. 안 쓰는 JS 모듈이 큼 | ❌ |
| 앱에서는 광고 숨김 유지 | 작업 없음 | 앱 사용자에게서 광고 수익이 없음 | ❌ (프론트의 임시 상태일 뿐) |
| 앱에 AdMob 광고를 따로 | 웹과 무관하게 수익화 | 가장 큰 작업. 웹과 앱의 광고 자리를 따로 관리 | ❌ |

## 결과

- 이 저장소에 처음으로 **`patches/`와 `postinstall` 훅**이 생겼다. `npm install` 뒤 `patch-package`가 돌며,
  패치 적용 실패는 설치 실패로 드러난다. `react-native-webview`를 올릴 때는 패치를 다시 떠야 한다
  (PR #4001이 머지된 버전이면 패치를 지우고 prop만 남긴다).
- GMA SDK(iOS 13.11 / Android 25.2)가 바이너리에 들어간다. Android SDK는 RN의 Kotlin 버전에 묶여 있어
  RN(Expo SDK)을 올릴 때 함께 올릴 수 있다.
  iOS SDK 13.x는 Xcode 26.2 이상을 요구한다(로컬 Xcode 26.5, EAS 이미지 확인 필요).
- 앱 안 동의(ATT 등)는 WebView 태그로 전달되지 않는다. 광고 동의는 웹에서 처리해야 한다.
- Google은 Android 레거시 SDK(`play-services-ads`)를 유지보수 모드로 두고 Next-Gen SDK로 이전을 권한다.
  리플렉션 대상 클래스(`com.google.android.gms.ads.MobileAds`)가 레거시 SDK 것이므로, Next-Gen으로 갈 때는 패치도 바꿔야 한다.
- 프론트는 **등록된 앱 버전 이상**에서만 광고를 켠다(KAN-654). 이 작업의 사용자용 버전은 `1.2.0`이다.
  옛 앱이 남아 있는 동안 미등록 WebView에 광고가 노출되지 않게 하는 문턱이다.
- **되돌리려면**: 패치·plugin·extraPods·Info.plist 키·prop 제거, 새 빌드와 심사. 두세 시간 + 심사 기간.
- 후속: 개발 빌드에서 Google 테스트 페이지 확인, 스토어 제출, KAN-654에 버전 번호 댓글 —
  [`docs/todo/011`](../todo/011-adsense-in-app-webview-registration.md).
