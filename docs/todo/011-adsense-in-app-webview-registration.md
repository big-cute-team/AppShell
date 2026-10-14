# 011. 앱 안 애드센스 광고 — WebView를 Google Mobile Ads SDK에 등록

**상태: 🟡 진행 중** — 셸 코드 반영·1.2.0 양쪽 스토어 심사 제출 완료(2026-10-14, [ADR-0006](../adr/0006-gma-webview-registration-via-webview-patch.md)).
심사 통과 후 KAN-654 댓글·개인정보 라벨 확인이 남음.
Jira [KAN-655](https://whoru3918.atlassian.net/browse/KAN-655) (KAN-652 후속). 프론트 쪽 스위치는 KAN-654.

## 왜 필요한가

모바일 웹에 애드센스가 들어가는데, 애드센스 정책상 앱 WebView 안의 광고는 Google Mobile Ads SDK에
WebView를 등록했을 때만 허용된다. 등록 없이 노출하면 계정 정지 위험이 있어 프론트는 지금 앱 UA에서 광고를 숨긴다.
이 작업이 스토어에 나가고 프론트가 "이 버전 이상"으로 문턱을 바꾸면 앱에서도 광고가 켜진다.

## 1. 셸 코드 (이 저장소)

- [x] `react-native-webview` 13.16.1에 PR #4001(`googleMobileAdsWebViewRegistrationEnabled` prop) 이식 —
      `patches/react-native-webview+13.16.1.patch`, `package.json` `postinstall: patch-package`
- [x] `src/WebShell.tsx` WebView에 prop 추가
- [x] iOS: `extraPods` `Google-Mobile-Ads-SDK ~> 13.11`, Info.plist `GADIntegrationManager = webview` (`app.config.ts`)
- [x] Android: `plugins/withGoogleMobileAdsWebView.js` — `play-services-ads 25.2.0`, 매니페스트 `INTEGRATION_MANAGER = webview`
- [x] 사용자용 버전 `1.1.1 → 1.2.0` (`app.config.ts` VERSION). 프론트 문턱 값이 된다

## 2. 확인

- [x] iOS 개발 빌드에서 Google 테스트 페이지 초록 상태 막대 확인 (2026-10-14, iPhone 17 Pro 시뮬레이터)
      (`EXPO_PUBLIC_WEB_URL=https://google.github.io/webview-ads/test/ npx expo start --dev-client`,
      `#api-for-ads-tests` 섹션)
- [x] Android 개발 빌드에서 같은 확인 (2026-10-14, Medium_Phone 에뮬레이터)
- [ ] 회귀: 소셜 로그인 리다이렉트(카카오·구글·애플), 뒤로 가기, 외부 링크 인앱 브라우저, 렌더러 죽음 복구
- [x] EAS 이미지의 Xcode가 26.2 이상인지 — EAS 프로덕션 iOS 빌드 성공으로 확인 (2026-10-14)

## 3. 배포

- [x] `eas build --profile production --platform all` (2026-10-14, main f87eae5 — 011 + 012 포함)
      - iOS 1.2.0 (7): https://expo.dev/accounts/kimdowan1004s-team/projects/plick/builds/98576415-16f9-411e-be94-31b7413a02a3
      - Android 1.2.0 (versionCode 13): https://expo.dev/accounts/kimdowan1004s-team/projects/plick/builds/88488a3b-0391-4568-ae22-2b3d34857a96
      - AAB 사본: `~/Desktop/해축이모-스토어-자산-2026-10/build/haechukimo-1.2.0-versionCode13.aab`
      - 먼저 올렸다가 취소한 빌드(iOS 6 완료·Android 12 취소)는 012 미포함이라 제출하지 않음
- [x] iOS: `eas submit --id 98576415…` → App Store Connect 1.2.0에 빌드 (7) 연결, 업그레이드 사항 "안정성 및 성능 개선",
      프로모션 텍스트 추가, 심사 메모를 1.2.0 기준(GMA SDK는 WebView 등록 전용, 광고 없음)으로 교체 → **심사 대기 중 (2026-10-14)**
- [x] Android: AAB 수동 업로드 → 프로덕션 13 (1.2.0) → **검토 제출 완료 (2026-10-14)**.
      AD_ID 오류는 1.1.1 때와 같이 옛 alpha 번들 탓 → "권한 없이 출시". 가독화 파일 없음 경고는 무시(007에 기록)
- [ ] 심사 통과 뒤 alpha 트랙에도 1.2.0 번들을 올려 두기 — 다음 출시부터 AD_ID 오류가 안 뜨게
- [ ] KAN-654에 댓글: "앱 셸 등록 버전 = 1.2.0 이상" — 프론트 `resolveAdsMode`의 문턱 값
- [ ] App Store 개인정보(앱이 수집하는 개인정보): GMA SDK가 들어가므로 "광고 데이터" 항목 재확인 — 심사와 무관하게 즉시 반영됨
      (SDK는 등록 전용이고 광고 유닛은 안 띄우지만, SDK 자체가 기기 식별자를 다룬다)
- [ ] Play 데이터 보안: 광고 ID 공유는 Meta 때문에 이미 "사용함". 변경 필요 여부만 확인

## 4. 나중에

- [ ] react-native-webview PR #4001 머지 추적. 머지된 버전으로 올리면 `patches/` 삭제, prop만 유지
- [ ] `react-native-webview`를 올릴 때마다 패치 재생성 (`npx patch-package react-native-webview --exclude '^package\.json$|^android/build/'`)
- [ ] Google이 Android 레거시 SDK(`play-services-ads`)를 끝내면 Next-Gen SDK로 — 패치의 리플렉션 클래스명도 함께
- [ ] 광고 동의(IAB TCF 등)가 필요해지면 웹에서 처리. 앱의 ATT 동의는 WebView 태그로 안 넘어간다
