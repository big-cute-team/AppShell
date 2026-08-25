# 005. 스토어 등록과 제출

**상태: ⚪ 대기** — 002(EAS 연결)와 004(에셋)가 끝난 뒤 진행합니다.

## App Store (iOS)

### 사전 준비

- [x] Apple Developer Program 가입 (연 $99) (2026-08-25)
- [x] App Store Connect에서 앱 레코드 생성 (2026-08-25)
      - 번들 ID `kr.co.plick.app` 등록 완료 — 기존 `kr.co.plick.web`(웹 Apple 로그인용)과
        별개의 App ID이며, 그쪽은 웹 로그인이 물고 있으므로 삭제 금지
      - 앱 이름 "PLick 플릭 - 프리미어리그 소식을 빠르게", SKU `kr-co-plick-app`, 기본 언어 한국어
      - 이름의 홍보 문구가 심사(2.3.7)에서 지적되면 부제(Subtitle)로 옮길 것
- [x] `eas.json`의 `submit.production.ios` 플레이스홀더 채우기 (2026-08-25)
      — appleId `juns0720@naver.com` / ascAppId `6804931339` / appleTeamId `T23P6539H6`

### 심사 자료

- [ ] 스크린샷 — 6.7"(필수), 6.5", 5.5" iPhone. iPad 미지원이므로 iPad 스크린샷은 불필요
      (`app.config.ts`에 `supportsTablet: false` 설정됨)
- [ ] 앱 설명, 키워드, 프로모션 텍스트
- [ ] 개인정보처리방침 URL — **필수**. 없으면 제출 자체가 안 됩니다
- [ ] App Privacy(개인정보 수집 항목) 설문 — 웹에서 수집하는 것 기준으로 답변
- [ ] 심사용 테스트 계정 (로그인이 필요한 앱이면 **필수**)
- [ ] 수출 규정 — `ITSAppUsesNonExemptEncryption: false` 로 설정되어 있음.
      HTTPS 외의 암호화를 쓴다면 이 값을 재검토

### 제출

```bash
npm run build:prod
npm run submit:prod
```

- [x] 빌드 1 업로드, TestFlight 내부 테스트 (2026-08-25)
      — 카카오·애플 로그인 정상, **구글 첫 로그인 400 발견**: 로그인 성공 직후
      `accounts.google.co.kr/accounts/SetSID`(세션 동기화 리다이렉트)가
      `INTERNAL_HOSTS`에 없어 인앱 브라우저로 새면서 실패.
      `src/config.ts`에 구글 지역 계정 도메인 패턴 추가로 수정, 시뮬레이터에서
      첫 로그인 성공 확인
- [x] 빌드 2 생성·업로드 (구글 로그인 수정 반영), TestFlight에서
      구글 로그인 정상 동작 재확인 (2026-08-25)
- [x] 심사 제출 (2026-08-25 17:06, 빌드 1.0.0 (2)) — 심사 대기 중.
      제출 과정에서 채운 것: 카테고리 스포츠(+뉴스), 연령 등급 설문(UGC 예,
      무제한 웹 액세스 아니요), 콘텐츠 권한 "예(권리 보유)", 지원 URL
- [ ] 심사 통과 후 수동 출시 ("이 버전 출시" 버튼 — 수동 출시로 설정돼 있음)
- [ ] 다음 Play 스토어 릴리즈에 구글 로그인 수정(PR #9) 포함하기
      — 안드로이드는 iframe 가드 덕에 증상이 없었지만 같은 코드로 맞춰두는 것

## Google Play (Android)

### 사전 준비

- [ ] Google Play 개발자 계정 (1회 $25). 법인 계정은 D-U-N-S 및 신원 확인 필요
- [x] Play Console에서 앱 생성, 패키지명 `kr.co.plick.app` (2026-08-24)
      — `com.plick.app`은 이미 사용 중이라 등록 불가, `kr.co.plick.app`(plick.co.kr 역도메인)으로 확정
- [ ] **첫 AAB는 Play Console에 수동 업로드** — Google 정책상 첫 릴리즈 이후에야
      API 제출이 열립니다
      ```bash
      npm run build:prod   # AAB 다운로드 → 콘솔에 직접 업로드
      ```
- [ ] 서비스 계정 생성 후 JSON 키 발급
      (Google Cloud Console → 서비스 계정 → Play Console에서 권한 부여)
- [ ] `google-play-service-account.json`으로 저장 (`.gitignore`에 이미 포함)
- [ ] 이후부터는 `npm run submit:prod`로 자동화

### 심사 자료

- [ ] 스토어 등록정보 — 아이콘 512×512, 그래픽 이미지 1024×500, 스크린샷 2장 이상
- [ ] 개인정보처리방침 URL — **필수**
- [ ] 데이터 보안 양식 (웹에서 수집하는 항목 기준)
- [ ] 콘텐츠 등급 설문
- [ ] 타겟 API 레벨 요건 확인 — Play는 매년 상향합니다.
      Expo SDK 57 기본값이 현재 요건을 충족하는지 제출 시점에 재확인
- [ ] 테스트 계정 (로그인 필요 시)

### 트랙

`eas.json`의 `submit.production.android.track`이 `internal`로 되어 있습니다.

- [ ] internal → closed → production 순으로 올릴지, 바로 production으로 갈지 결정

## 공통

- [ ] 두 스토어의 앱 이름/설명/스크린샷을 일치시키기
- [ ] 개인정보처리방침 페이지가 모바일 웹에 실제로 존재하는지 확인
- [ ] 계정 삭제 경로 — 회원가입이 있는 앱은 **양쪽 스토어 모두 필수**입니다.
      웹에 계정 삭제 기능이 없다면 먼저 만들어야 합니다
- [ ] 댓글 신고·차단 기능 (**웹 저장소 소관**) — 웹에 댓글(UGC)이 있는데 신고/차단
      수단이 없음. Google Play UGC 정책이 요구하는 항목이라 사후 점검에서 지적될 수 있음.
      콘텐츠 등급 설문에는 "없음"으로 정직하게 답변함 (2026-08-24)
      — **Apple도 동일**: 가이드라인 1.2(User-Generated Content)가 부적절 콘텐츠
      신고 수단과 사용자 차단을 요구함. iOS 심사에서 이 사유로 반려될 수 있고,
      그 경우 웹에 신고/차단 기능을 먼저 붙여야 함 (2026-08-25)

## 참고

- 빌드/제출 파이프라인 배경: [ADR-0003](../adr/0003-eas-build-and-remote-versioning.md)
- 반려 리스크: [006](./006-review-risk-native-features.md)
