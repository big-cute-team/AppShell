# 010. 해축이모 리브랜딩 (PLick → 해축이모)

**상태: 🟡 진행 중** — 셸 코드·자산 교체 완료(2026-10-05). 스토어 등록정보 교체와 1.1.0 제출이 남음.

## 왜

2026-09 웹(`m.plick.co.kr`)이 서비스명 **해축이모**, 보라 사자 캐릭터 + 초록 글자 로고,
**라이트 전용** 테마로 전면 개편됐다. 앱은 껍데기라 화면은 그대로 따라가지만,
앱 이름·아이콘·스플래시·배경색과 양쪽 스토어의 등록정보(이름·설명·스크린샷·아이콘)는
전부 셸/스토어 쪽에 남아 있어서 따로 바꿔야 한다.

디자인 원본: Figma `Plick` 파일 → 섹션 "해축이모 리디자인 (2026-09, 현재 제품)" (로고·색상 토큰),
"📱 해축이모 앱 등록 스크린샷 · 첫 화면 분할 버전 (2026-09)" (스토어 스크린샷).

## 1. 앱 셸 (이 저장소) — 2026-10-05 완료

- [x] `app.config.ts` — `APP_NAME` → `'해축이모'`, `VERSION` → `1.1.0`
- [x] 배경색 다크 → 흰색. `BACKGROUND_COLOR = '#FFFFFF'` (app.config.ts / src/config.ts 두 곳),
      상태바 `light` → `dark`, 로딩 인디케이터·오류 화면 버튼은 웹 토큰 `--plk-accent`(`#0A6B42`)
- [x] Android 적응형 아이콘 배경은 앱 배경과 분리 — `ICON_BACKGROUND_COLOR = '#0FB569'`
      (전경 PNG에 구워진 초록과 같은 값이어야 경계가 안 보임)
- [x] `assets/` 전부 교체 — 생성 절차는 [004](./004-branding-assets.md) "해축이모 자산 생성" 참고
- [x] 식별자는 그대로 둠 — 번들/패키지 `kr.co.plick.app`, 스킴 `plick`, UA 접미사 `PlickApp/…`
      (웹이 `/PlickApp\/(\S+)/`로 앱 여부·버전을 판별하므로 바꾸면 웹도 같이 고쳐야 함)
- [x] `pageBackgroundColor()` 분기는 남겨 둠 — 지금은 우리 호스트·로그인 호스트 모두 흰색이라
      결과가 같지만, 웹이 다시 다크 배경을 쓰면 `BACKGROUND_COLOR`만 바꾸면 되도록

## 2. 스토어 자산 (생성 완료, 업로드는 사람이)

파일 위치: `~/Desktop/해축이모-스토어-자산-2026-10/`

| 폴더 | 내용 |
| --- | --- |
| `appstore/` | AS1~AS10 · 1242×2688 (iPhone 6.5") · 첫 화면 분할 버전 10장 |
| `play/` | GP1~GP8 · 1080×1920 · 첫 화면 분할 버전 8장 |
| `icon/app-store-icon-1024.png` | App Store 아이콘 (알파 없음) |
| `icon/play-icon-512.png` | Play 고해상도 아이콘 |
| `icon/play-feature-graphic-1024x500.png` | Play 피처 그래픽 — **전신 캐릭터 버전으로 확정(2026-10-05)**. 얼굴 버전은 `icon/미채택/` |

- [x] 피처 그래픽 A(얼굴)/B(전신) 중 **B 전신** 선택 (2026-10-05)

## 3. App Store Connect (1.1.0 제출과 함께)

이름은 **새 버전이 편집 가능 상태일 때만** 바꿀 수 있다. 1.1.0 버전을 만들고 그 안에서 수정.

- [ ] 앱 이름 `해축이모 - 실시간 해외축구 이슈 커뮤니티`(23자), 부제 `프리미어리그 실시간 소식을 팬들과 함께 나누는 커뮤니티`(30자) — 2026-10-06 확정.
      전체 문구는 `~/Desktop/해축이모-스토어-자산-2026-10/appstore/문구.md`
- [ ] 프로모션 텍스트 / 설명 / 키워드 — 웹 소개문("해외 축구 기자들이 X에 올리는 프리미어리그
      이적 루머와 이슈를 AI가 한국어로 번역·요약") 기준으로 다시 작성
- [ ] 스크린샷 6.5" 10장 교체 (`appstore/`). 6.9"는 6.5"로 대체 적용됨
- [ ] 앱 아이콘은 빌드에 포함되므로 별도 업로드 없음 — 빌드 선택 후 미리보기에서 확인
- [ ] 앱 개인정보 보호 → **추적에 사용되는 데이터** 추가 (기기 ID 등) — Meta SDK/ATT 때문 ([009](./009-instagram-app-install-ads.md))
- [ ] "이 버전에서 업그레이드된 사항" 필수 입력 (1.0.1 때 빠뜨려서 제출이 막혔었음)
- [ ] App Review Notes에 ATT 사용 목적(광고 성과 측정) 한 줄

## 4. Google Play Console

- [ ] 스토어 등록정보 → 앱 이름 `해축이모`, 간단한 설명(80자), 자세한 설명(4000자)
- [ ] 아이콘 512 (`icon/play-icon-512.png`), 피처 그래픽 1024×500 (`icon/play-feature-graphic-1024x500.png`)
- [ ] 휴대전화 스크린샷 8장 교체 (`play/`)
- [ ] 데이터 보안 → 기기 ID·광고 ID 공유 추가, 앱 콘텐츠 → **광고 ID 선언 "사용함"**
      (매니페스트에 `AD_ID` 권한이 들어가므로 "사용 안 함"이면 업로드가 거부됨)
- [ ] 1.1.0 AAB 업로드 → 프로덕션 (또는 alpha 경유) → 검토 제출

## 5. 빌드·제출

> 2026-10-06: 1.1.0 빌드는 완료했지만 **제출 전에 Firebase(Google Ads iOS)를 얹어 1.1.1로 다시 빌드**하기로 함 — 심사를 한 번만 받기 위해.
> 아래 1.1.0 항목은 기록용, 실제 제출은 1.1.1. 자산·문구는 그대로 쓴다.

- [x] 1.1.1 `eas build --profile production --platform all` 시작 (2026-10-06 15:00)
      - Android: https://expo.dev/accounts/kimdowan1004s-team/projects/plick/builds/15ab77da-8268-43a8-9400-cddb05321550
      - iOS: https://expo.dev/accounts/kimdowan1004s-team/projects/plick/builds/30533b5a-cc2f-4fc1-be5a-6f13eb1e41bc
      - **둘 다 FINISHED (2026-10-06 15:30)** — iOS 1.1.1 (5), Android 1.1.1 (versionCode 11)
      - AAB 사본: `~/Desktop/해축이모-스토어-자산-2026-10/build/haechukimo-1.1.1-versionCode11.aab` (1.1.0은 `구버전_미제출/`)
      - iOS 업로드: `npx eas-cli submit --platform ios --profile production --id 30533b5a-cc2f-4fc1-be5a-6f13eb1e41bc`


- [x] `eas build --profile production --platform all` 시작 (2026-10-05, 버전 1.1.0, 빌드 번호는 EAS 자동)
      - Android: https://expo.dev/accounts/kimdowan1004s-team/projects/plick/builds/2a75affd-f624-4995-bf33-3ee55a4e6a91
      - iOS: https://expo.dev/accounts/kimdowan1004s-team/projects/plick/builds/81ee1e6f-1ac8-41d8-9fb1-7039dc62d608
      - **둘 다 FINISHED (2026-10-05 13:45)** — iOS 1.1.0 (4), Android 1.1.0 (versionCode 10)
      - AAB 사본: `~/Desktop/해축이모-스토어-자산-2026-10/build/haechukimo-1.1.0-versionCode10.aab`
- [x] iOS: 1.1.1 빌드 (5) `eas submit` 업로드 → App Store Connect **심사 제출 완료 (2026-10-06 16:24, 제출 ID 264bf96e)**.
      첫 시도는 Apple 개발자 계약 갱신 미동의로 실패 → 계정 소유자가 developer.apple.com에서 동의 후 성공.
      이름·부제·설명·스크린샷(1206×2622, ASC 새 요구 크기)·개인정보 라벨(추적 항목) 갱신, 수동 출시 선택
      (Apple 로그인 필요 — 사람이) 또는 Transporter → App Store Connect 1.1.0에 빌드 (4) 연결
- [x] Android: AAB 수동 업로드 → 프로덕션 11 (1.1.1) + 스토어 등록정보 + 데이터 보안 **검토 제출 완료 (2026-10-06 16:50, 제출 #8)**.
      순서: 광고 ID 선언 "사용함" → 데이터 보안(기기 ID·앱 상호작용·대략적 위치 공유, 비정상 종료·진단 수집) → 등록정보 → AAB.
      새 버전 검토 화면의 "AD_ID 권한 없는 활성 아티팩트" 오류는 옛 1.0.1 번들(alpha) 때문 → "권한 없이 출시"로 진행.
      alpha 트랙에도 1.1.1을 올려 두면 다음부터 안 뜸
- [ ] 두 스토어 심사 통과 후 [005](./005-store-release.md) 릴리즈 기록 갱신

## 함께 가는 작업

- Meta SDK·ATT는 같은 1.1.0 빌드에 포함 — [009](./009-instagram-app-install-ads.md), [ADR-0004](../adr/0004-meta-sdk-for-instagram-install-ads.md)
- 웹 개인정보처리방침에 Meta 광고 식별자 공유 문구 추가 (웹 저장소) — 009 §2

## 참고

- 웹 디자인 토큰(라이트): 배경 `#FFFFFF`, 강조 `#0A6B42`, 강조 밝음 `#4EC98A`, 텍스트 강조 `#16181B`
- 아이콘 초록은 토큰과 다른 `#0FB569` — 로고 원본 래스터에 구워진 값을 그대로 씀
