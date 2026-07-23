# 006. 심사 리스크 대응 (App Store 4.2)

**상태: 🟡 검토 필요** — 제출 전에 결론을 내야 합니다.

## 문제

Apple의 App Store Review Guideline **4.2 (Minimum Functionality)** 는
"웹사이트를 그대로 감싼 앱"을 반려 대상으로 명시합니다.

> Your app should include features, content, and UI that elevate it beyond a repackaged website.

현재 이 앱은 웹뷰 하나뿐입니다. **반려 가능성이 실재합니다.**
Google Play는 상대적으로 관대하지만 최소한의 기능은 요구합니다.

## 결정해야 할 것

- [ ] 반려를 감수하고 일단 제출해 볼지, 네이티브 기능을 먼저 붙일지
- [ ] 붙인다면 무엇을 붙일지 (아래 후보 중 선택)

## 후보 (비용이 낮은 순)

| 기능 | 패키지 | 비용 | 효과 |
| --- | --- | --- | --- |
| **푸시 알림** | `expo-notifications` | 중 (서버 연동 필요) | 4.2 대응으로 가장 확실. 리텐션에도 직접 기여 |
| 딥링크 / 유니버설 링크 | 설정만 (`scheme: 'plick'` 이미 있음) | 낮음 | 웹 링크를 앱으로 여는 것 자체가 네이티브 가치 |
| 네이티브 공유 시트 | `expo-sharing` | 낮음 | 웹 공유보다 나은 경험. 단독으로는 4.2 대응에 약함 |
| 생체 인증 잠금 | `expo-local-authentication` | 중 | 앱에서만 가능한 기능. 서비스 성격에 맞아야 의미 |
| 앱 아이콘 배지 / 위젯 | `expo-notifications` / 네이티브 | 높음 | 효과 크지만 껍데기 앱 취지에서 벗어남 |
| 오프라인 캐싱 | 웹 서비스워커 + 셸 | 중 | 웹 쪽 작업이 큼 |

## 권장 순서

1. **딥링크부터** — 설정 비용이 거의 없습니다. `scheme: 'plick'`은 이미 잡혀 있고,
   iOS Associated Domains / Android App Links를 `app.config.ts`에 추가하면 됩니다.
   웹 도메인에 `apple-app-site-association`, `assetlinks.json` 파일을 올려야 합니다.
2. **푸시 알림** — 4.2 대응의 실질적 해답. 서버에서 토큰을 받아 발송하는 구조가 필요하므로
   웹 백엔드 팀과 함께 결정해야 합니다.

## 제출 시 함께 할 것

- [ ] App Review Notes에 앱이 제공하는 네이티브 가치를 명시적으로 적기
      (푸시 알림, 딥링크, 오프라인 처리, 세션 유지 등)
- [ ] 심사용 테스트 계정 제공 — 리뷰어가 로그인 못 하면 기능을 보지 못하고 반려됩니다
- [ ] 반려 시: 재제출보다 **Resolution Center에서 반박**하는 편이 빠른 경우가 많습니다.
      네이티브 기능 목록을 근거로 제시

## 참고

- 설계 배경: [ADR-0001](../adr/0001-expo-managed-workflow-for-webview-shell.md)
- 셸을 얇게 유지하는 것이 이 저장소의 원칙입니다 (`CLAUDE.md`).
  네이티브 기능을 붙일 때도 화면을 늘리지 말고 **웹뷰를 보조하는 형태**로 붙이세요.
