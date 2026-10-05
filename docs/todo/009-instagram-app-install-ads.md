# 009. 인스타그램 앱 설치 광고

**상태: 🟡 진행 중** — 광고 채널은 **인스타그램(Meta)만** 씁니다.
**셸 쪽 연동은 2026-10-05 완료**(1.1.0 빌드에 포함, [010](./010-haechukimo-rebrand.md)과 같은 빌드).
Meta 콘솔·스토어 양식·캠페인 생성이 남음. 캠페인은 기존 트래픽 캠페인을 잇지 않고 **새로 만든다.**

## 왜 필요한가

2026-09-27에 App Store 설치를 목표로 인스타 광고를 만들려 했지만 **앱 설치 캠페인을 만들 수 없었습니다.**
셸에 Meta SDK가 없어서 iOS 14+ 캠페인의 앱 선택이 음영 처리됩니다
("전환 데이터가 없거나… iOS용 Facebook SDK를 설정하세요").

그래서 증빙용으로 **트래픽 캠페인 → `https://m.plick.co.kr`**을 대신 게시했습니다(아래 "현황").
실제 설치를 목표로 한 광고와 설치 집계를 하려면 이 문서의 작업이 필요합니다.

## 현황 (2026-09-27)

| 항목 | 값 / 상태 |
| --- | --- |
| 광고 계정 | `1613179800526447` (김도완 **개인 소유**, PLick 비즈니스 포트폴리오에 없음) |
| 비즈니스 포트폴리오 | `PLick` (미인증) — 페이지 `PLick`, 인스타 `plick_football` 연결됨 |
| Meta 개발자 앱 | `PLick`, 앱 ID `1849042269863007`, **게시됨(라이브)** |
| 개발자 앱 이용 사례 | "Meta 광고 관리자로 앱 광고 만들기 및 관리하기" |
| 개발자 앱 플랫폼 | iOS만 — 번들 ID `kr.co.plick.app`, iPhone Store ID `6804931339` |
| 광고 계정 승인 | 앱 설정 → 고급 설정 → 인증된 광고 계정 ID에 `1613179800526447` 등록 |
| 게재 중 캠페인 | `PLick_iOS_트래픽_2609` / `KR_iOS_인스타_2609` / `소재A_2609` — 트래픽, 링크 클릭, 일 ₩20,000, ~10/3, Instagram만 |

## 결정

- [x] MMP 없이 **Meta SDK를 직접** 붙인다 — [ADR-0004](../adr/0004-meta-sdk-for-instagram-install-ads.md).
      2026-10-05 구현·로컬 빌드 검증 후 Accepted.

## 1. 앱 셸 (이 저장소)

네이티브 의존성이므로 전부 `npx expo install`로 추가하고, 설정은 `app.config.ts`로만 합니다.

- [x] `npx expo install react-native-fbsdk-next` → **13.4.3** (2026-10-05). 공식적으로 RN 0.86/New Arch
      지원을 명시하지 않고 Expo 55+ 관련 이슈(#668 iOS 컴파일, #643 New Arch에서 `Settings.*` 예외)가
      wontfix로 닫혀 있어, 로컬 iOS·Android 컴파일로 직접 확인함. iOS SDK 핀 `FBSDKCoreKit ~> 18.0`
- [x] `app.config.ts` `plugins`에 `react-native-fbsdk-next` config plugin 추가
      - `appID: '1849042269863007'`, `clientToken`, `displayName: APP_NAME`(해축이모), `scheme: 'fb1849042269863007'`
      - `advertiserIDCollectionEnabled`, `autoLogAppEventsEnabled`, `isAutoInitEnabled` 모두 true
      - clientToken은 `app.config.ts`의 `META_CLIENT_TOKEN` 상수. 바이너리에 들어가는 공개 식별자라
        비밀값은 아니지만 `EXPO_PUBLIC_`로 두지 않음. **앱 시크릿 코드는 절대 넣지 않습니다.**
- [x] iOS ATT — `expo-tracking-transparency` 57.0.2
      - 문구: "광고 성과 측정을 위해 사용됩니다. 허용하지 않아도 앱의 모든 기능을 쓸 수 있습니다."
      - `src/tracking.ts` — 웹 첫 로드 후(스플래시 내린 직후) 요청, 결과를 `Settings.setAdvertiserTrackingEnabled`로 전달.
        iOS 17+/FB SDK 17+ 조합은 SDK가 ATT 상태를 직접 읽지만 iOS 14.5~16 때문에 유지. 실패는 전부 삼킴
- [x] iOS `infoPlist.SKAdNetworkItems` — `v9wttpbfk9.skadnetwork`(Facebook), `n38lu8286q.skadnetwork`(Instagram).
      fbsdk-next 플러그인이 넣어 주지 않아 직접 등록. 출처 https://developers.facebook.com/docs/SKAdNetwork
- [x] Android `permissions`에 `com.google.android.gms.permission.AD_ID` — Facebook SDK 13+가 자체 매니페스트로도
      선언하지만 Play "광고 ID 선언"을 바꿔야 하는 이유가 드러나도록 명시
- [ ] (선택) 웹 → 앱 이벤트 브리지 — 회원가입 등은 웹에서 일어나므로, 웹이 `postMessage`로 알리면
      셸이 `AppEventsLogger`로 기록. 웹 저장소 작업이 함께 필요. 화면은 늘리지 않음
- [x] 검증: `npm run typecheck`, `npx expo config --type public`, `npm run doctor`(21/21),
      `npx expo prebuild --no-install --clean` — Info.plist에 FacebookAppID/ClientToken/SKAdNetworkItems/
      NSUserTrackingUsageDescription, AndroidManifest에 `com.facebook.sdk.*` meta-data·AD_ID 확인 (2026-10-05)
- [ ] 개발 빌드(`npm run ios` / `npm run android`)로 확인 — **Expo Go로는 검증 불가**
      - ATT 팝업 노출, 앱 실행 이벤트가 이벤트 관리자 "테스트 이벤트"에 들어오는지

## 2. 웹 / 개인정보

- [ ] `m.plick.co.kr/privacy`에 Meta SDK로 광고 식별자(IDFA/광고 ID)·앱 이벤트를 수집·Meta와 공유한다는 내용 추가 (웹 저장소)

## 3. 스토어

App Store Connect
- [ ] 앱 개인정보 보호(영양 성분표)에 **추적에 사용되는 데이터**(기기 ID, 제품 상호작용 등) 추가
- [ ] 새 버전 제출. App Review Notes에 ATT 사용 목적 명시 (5.1.2 반려 대비)

Google Play Console
- [ ] 데이터 보안 양식: 기기 ID를 광고 목적으로 공유한다고 갱신
- [ ] 앱 콘텐츠 → 광고 ID 선언: "사용함"
- [ ] 프로덕션 출시 완료 확인 (Android 캠페인의 전제 조건 — [005](./005-store-release.md))

## 4. Meta 설정

- [ ] 개발자 앱·페이지·비즈니스 포트폴리오 이름 `PLick` → **`해축이모`** (2026-10-05 결정)
- [ ] 개발자 앱 → 기본 설정 → 플랫폼 추가 → **Android** (패키지명 `kr.co.plick.app`, Google Play)
- [ ] SDK가 실린 빌드 배포 후 **이벤트 관리자**에서 앱 이벤트(설치·앱 실행) 수신 확인
- [ ] iOS 14+ 캠페인의 앱 선택 음영이 풀렸는지 확인

## 5. 캠페인

iOS와 Android는 **캠페인을 따로** 만듭니다 (iOS 14+ 캠페인은 iOS 전용).

- [ ] iOS: `만들기` → `앱 홍보` → 수동 → iOS 14 이상 캠페인 켜기 → 앱 `해축이모`(구 PLick)
      앱 선택 음영이 안 풀리면: 이벤트 관리자 → 데이터 소스 → 앱 → 설정 → Apple SKAdNetwork 구성 (SDK 이벤트 수신이 전제)
- [ ] Android: 같은 방식, 앱 스토어 Google Play
- [ ] 공통 광고 세트 설정: 성과 목표 **앱 설치 수 극대화**, 노출 위치 수동 → **플랫폼 Instagram만**,
      `앱 및 사이트` 해제, **`제외된 노출 위치에 제한적인 지출 허용` 해제**
- [ ] 광고: 행동 유도 `설치하기`, Advantage+ 크리에이티브 개선(음악 추가 등) 끄기
- [ ] 설치 수는 Meta 대시보드와 App Store Connect / Play Console 획득 지표를 함께 비교

## 이번에 겪은 함정 (다시 헤매지 않도록)

- **트래픽 캠페인에 App Store 링크를 넣으면 거부됩니다** (`#1487810` — 앱 스토어 URL은 앱 설치 목표 전용).
  트래픽 캠페인은 우리 도메인으로 보내야 하고, 그 페이지가 App Store로 **자동 리디렉션**하면 우회 링크로 거부될 수 있습니다.
- App Store 링크는 **`/kr/`을 붙여야** 합니다. 한국 스토어에만 출시돼 있어서 `apps.apple.com/app/id6804931339`는 결과가 없습니다
  → `https://apps.apple.com/kr/app/id6804931339`
- 트래픽 캠페인 성과 목표는 **링크 클릭**. 아이폰에서 App Store 링크는 스토어 앱이 바로 열려 랜딩 페이지 조회가 잡히지 않습니다.
- 개발자 앱을 "이용 사례 없이" 만들면 **게시 메뉴가 없습니다.** 광고용 이용 사례를 추가해야 게시할 수 있습니다.
- 광고 계정이 개인 소유라 비즈니스 설정의 "자산 연결"에 안 뜹니다. 개발자 앱 **고급 설정의 인증된 광고 계정 ID**로 연결했습니다.
  광고 계정을 포트폴리오로 옮기는 것은 **되돌릴 수 없으므로** 별도로 결정합니다.
- 노출 위치를 수동으로 바꿔도 **`제외된 노출 위치에 제한적인 지출 허용`**이 기본으로 켜져 있어 예산 ~5%가 Facebook 등으로 샙니다.
- 기기/OS 설정을 바꾸면 플랫폼 선택이 초기화된 것처럼 보일 수 있으니 요약을 다시 확인합니다.

## 참고

- 광고 관리자: https://adsmanager.facebook.com
- 개발자 앱: https://developers.facebook.com/apps/1849042269863007
- 셸을 얇게 유지하는 원칙은 그대로입니다 (`CLAUDE.md`). SDK·ATT는 화면을 추가하지 않는 형태로만 붙입니다.
