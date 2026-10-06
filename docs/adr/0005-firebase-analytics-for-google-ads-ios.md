# ADR-0005: Google Ads iOS 앱 캠페인을 위해 Firebase Analytics를 직접 붙인다 (MMP 미도입)

- **상태**: Proposed (1.1.1 빌드·검증 후 Accepted로)
- **날짜**: 2026-10-06
- **관련**: ADR-0004, `docs/todo/009-instagram-app-install-ads.md`, `docs/todo/010-haechukimo-rebrand.md`, PR #22

## 배경

2026-10-06 Google Ads 크레딧 소진용으로 Android 앱 설치 캠페인을 돌렸다. Android는 Play 설치가
자동 추적돼 SDK 없이 바로 됐지만, **iOS 앱 캠페인은 Firebase(Google Analytics) 또는 MMP의 전환 추적이
있어야 캠페인에서 앱을 선택할 수 있다.** 1.1.0(ADR-0004)에는 Meta SDK만 들어 있어 Google Ads iOS는 불가였다.

마침 1.1.0이 리브랜딩·Meta SDK로 양쪽 스토어 재심사를 앞두고 있어서, 심사를 한 번만 받으려면
지금 같이 넣어 1.1.1로 제출하는 것이 비용이 가장 적다. ADR-0004는 "Meta 외 채널을 추가하면
MMP 도입 여부를 다시 검토한다"고 했으므로 이 ADR이 그 재검토다.

제약: 셸을 얇게 유지(ADR-0001). 네이티브 폴더 없이 config plugin으로만. 광고 채널은 Meta + Google 둘.

## 결정

`@react-native-firebase/app` + `@react-native-firebase/analytics`(26.4.0)를 config plugin으로 넣는다.
Firebase 콘솔에 iOS·Android 앱을 등록하고 `GoogleService-Info.plist` / `google-services.json`을
저장소 루트에 커밋한다(공개 설정값, 비밀 아님). Info.plist `SKAdNetworkItems`에 Google의
`cstr6suwn9.skadnetwork`를 추가한다.

iOS 링크 방식은 **CocoaPods + 정적 프레임워크**다: `['@react-native-firebase/app', { ios: { disableSPM: true } }]`
+ `expo-build-properties` `ios.useFrameworks: 'static'`, `ios.forceStaticLinking: ['RNFBApp', 'RNFBAnalytics']`.
react-native-firebase 26의 기본값은 Firebase를 Swift Package Manager로 받는 방식인데, 이건 동적 프레임워크를
요구하고(`pod install`이 "SPM + static linkage is not supported"로 중단, 2026-10-06 확인), 동적 프레임워크에서는
`react-native-fbsdk-next` 13.4.3이 RN 0.86에서 링크 실패(undefined RCT* symbols, 해당 이슈 wontfix)한다.
그래서 rnfirebase.io의 Expo 안내가 제시하는 정적 경로를 택했다. CocoaPods용 Firebase는 2026-10 이후 새 버전이
안 나오므로, 다음 메이저 업그레이드 때는 SPM + 동적 프레임워크로 가야 하고 그때 fbsdk-next 호환을 다시 봐야 한다.

Google Ads 귀속에 IDFA가 쓰이도록 AdSupport를 링크한다. react-native-firebase는 기본으로 링크하지 않고
Podfile 변수(`$RNFirebaseAnalyticsEnableAdSupport`)로만 켤 수 있어서, Podfile을 고치는 작은 config plugin
(`plugins/withFirebaseAdSupport.js`)을 둔다. ATT 팝업·문구는 1.1.0(ADR-0004)의 것을 그대로 쓴다.

JS 코드는 추가하지 않는다. 설치·첫 실행(`first_open`)은 Analytics가 자동 수집하고, Google Ads 쪽에서
Firebase를 연결해 `first_open`을 전환으로 가져오면 iOS 앱 캠페인이 열린다. MMP는 여전히 도입하지 않는다.

## 대안과 트레이드오프

| 대안 | 장점 | 단점 | 채택 여부 |
| --- | --- | --- | --- |
| Firebase Analytics 직접 | 무료. Google Ads 연동이 가장 짧음(콘솔에서 연결·전환 가져오기). config plugin으로 CNG 유지 | iOS 정적 프레임워크 강제. 채널마다 SDK가 하나씩 늘어남(Meta SDK + Firebase) | ✅ |
| MMP(AppsFlyer·Adjust·Airbridge) 도입 | Meta·Google 설치 기여를 한 곳에서 비교. 채널 늘려도 SDK 하나 | 유료. 채널 둘뿐이라 비용 대비 이점이 작음. 연동·계약에 시간이 들어 이번 심사에 못 맞춤 | ❌ |
| Google Ads iOS 포기, Android만 | 변경 없음 | iOS 설치 광고를 Meta 한 채널에만 의존 | ❌ (지금 심사와 묶으면 비용이 가장 낮아서) |
| Expo의 `expo-firebase-analytics` | — | 2023년에 폐기됨. 대안이 react-native-firebase | ❌ |

SDK 두 개(Meta, Firebase)가 쌓인 상태라 **세 번째 채널**을 추가하게 되면 그때는 MMP를 진지하게 봐야 한다.

## 결과

- iOS 빌드가 정적 프레임워크로 바뀐다. 앞으로 넣는 네이티브 모듈이 `use_frameworks! :static`과 충돌하면
  이 ADR을 찾아오게 된다. 현재 조합(웹뷰, Meta SDK, Firebase)은 로컬 컴파일로 확인한다.
- 이 저장소에 처음으로 **커스텀 config plugin**(`plugins/`)이 생겼다. CLAUDE.md의 "ios/ 직접 수정 금지" 원칙은
  그대로이고, Podfile처럼 `app.config.ts`로 표현할 수 없는 변경은 이 폴더의 플러그인으로 한다.
- App Store 개인정보 영양 성분표에 Analytics 항목(기기 ID·제품 상호작용·진단 등)이 추가된다.
  Meta 때문에 "추적" 항목을 넣는 김에 같이 넣는다.
- Firebase 설정 파일 두 개가 저장소에 들어간다. 프로젝트를 옮기면 이 둘을 바꾸고 재빌드해야 한다.
- **되돌리려면**: 패키지·플러그인·설정 파일 제거, `useFrameworks` 해제, 새 빌드와 심사. 반나절 + 심사 기간.
- 후속: Google Ads ↔ Firebase 연결과 `first_open` 전환 가져오기, 스토어 개인정보 양식 —
  [`docs/todo/009`](../todo/009-instagram-app-install-ads.md) "Google Ads 앱 캠페인" 절.
