# ADR-0004: 인스타 앱 설치 광고를 위해 Meta SDK를 직접 붙인다 (MMP 미도입)

- **상태**: Proposed
- **날짜**: 2026-09-27
- **관련**: ADR-0001, `docs/todo/009-instagram-app-install-ads.md`

## 배경

App Store·Play Store 설치를 목표로 인스타그램 광고를 하려 한다. Meta 광고 관리자의 **앱 홍보(iOS 14+) 캠페인**은
광고할 앱이 SKAdNetwork 기반 설치 데이터를 Meta로 보낼 수 있어야 앱을 선택할 수 있다.
현재 셸에는 추적·광고 SDK가 전혀 없어서 앱 선택이 막혔다(2026-09-27 확인).

설치 데이터를 보내는 방법은 두 가지다: Meta SDK를 직접 넣거나, MMP(AppsFlyer·Adjust·Airbridge 등)를 넣고 MMP가 Meta에 전달하게 하거나.
광고 채널은 **인스타그램(Meta)만** 쓰기로 했다.

## 결정

`react-native-fbsdk-next`(Expo config plugin)로 **Meta SDK를 셸에 직접** 넣는다. MMP는 도입하지 않는다.
iOS는 `expo-tracking-transparency`로 ATT 권한을 받고 SKAdNetwork ID를 `app.config.ts`에 등록한다.
SDK는 설치·앱 실행 이벤트 자동 로깅까지만 쓰고, 화면이나 네비게이션은 추가하지 않는다.

## 대안과 트레이드오프

| 대안 | 장점 | 단점 | 채택 여부 |
| --- | --- | --- | --- |
| Meta SDK 직접 | 무료. Meta 캠페인에 필요한 연동이 가장 짧음. config plugin으로 CNG 유지 | Meta 외 채널을 늘리면 채널별 SDK가 쌓이고 기여 분석이 흩어짐 | ✅ |
| MMP 도입 | 여러 광고 채널의 설치 기여를 한 곳에서 비교 | 유료. 채널이 Meta 하나뿐이라 이점이 없음. 연동·계약 비용 | ❌ |
| SDK 없이 트래픽 캠페인만 | 셸 변경·재심사 없음 | App Store 직링크 불가(`#1487810`), 설치 최적화·집계 불가 | ❌ (증빙용 임시 운영만) |

## 결과

- iOS에 ATT 팝업이 생긴다. App Store 개인정보 영양 성분표와 Play 데이터 보안·광고 ID 선언을 "추적/공유함"으로 바꿔야 하고,
  이 변경을 담은 새 버전이 양 스토어 심사를 다시 거친다.
- 개인정보처리방침(웹)에 Meta로의 식별자 공유를 명시해야 한다.
- **되돌리려면**: 플러그인·의존성 제거 후 새 빌드와 심사, 스토어 개인정보 양식 원복. 반나절 작업 + 심사 기간.
- Meta 외 광고 채널(구글·틱톡 등)을 추가하게 되면 이 ADR을 다시 검토하고 MMP 도입 여부를 새 ADR로 남긴다.
- 후속 작업: [`docs/todo/009-instagram-app-install-ads.md`](../todo/009-instagram-app-install-ads.md)
