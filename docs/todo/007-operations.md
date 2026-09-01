# 007. 운영 준비

**상태: ⚪ 나중에** — 첫 배포 이후에 해도 되는 것들. 다만 **크래시 리포팅만은
첫 배포 전에 붙이는 편이 좋습니다** (없으면 초기 사용자 이탈 원인을 알 수 없습니다).

## 관측

- [ ] 크래시 리포팅 도입 검토 — Sentry(`@sentry/react-native`, Expo config plugin 제공)
      또는 Firebase Crashlytics
- [ ] 웹뷰 로드 실패율 수집 — `WebShell.tsx`의 `onError` / `showError`에 이벤트 전송 추가
- [ ] 앱 버전별 사용자 분포 확인 경로 (스토어 콘솔로 충분한지)

## 앱 버전 게이팅

웹은 즉시 배포되는데 앱 셸은 심사를 거칩니다. 언젠가 **구버전 앱에서 웹이 깨지는** 상황이 옵니다.

- [x] 웹이 앱 버전을 알 수 있게 UA 접미사를 `PlickApp/1.0.0` 형태로 확장 (2026-09-01)
      — 버전은 `app.config.ts`의 `VERSION`이 임베드된 값. 웹에서는
      `/PlickApp\/(\S+)/` 패턴으로 읽으면 됨. **이 버전이 실린 빌드가 배포된
      뒤부터** 웹이 활용 가능
- [ ] 최소 지원 버전 미만이면 업데이트 안내를 띄우는 방식 결정 (웹에서 처리 / 셸에서 처리)

## CI

- [ ] GitHub Actions에 PR 검증 추가
      ```yaml
      - npm ci
      - npx tsc --noEmit
      - npx expo-doctor
      - npx expo prebuild --no-install --clean
      ```
- [ ] main 병합 시 `preview` 빌드 자동 실행 검토 (`eas build --non-interactive`)
      — EAS 토큰(`EXPO_TOKEN`)을 리포지토리 시크릿에 등록해야 합니다
- [ ] 린터 도입 여부 결정 (현재 없음 — `eslint-config-expo` 사용 가능)

## 의존성 유지보수

- [ ] SDK 57 내 패치 버전 정합 맞추기 — `expo-doctor`가 패치 불일치로 실패 중
      (2026-09-01 확인: expo 57.0.9 → ~57.0.18, react-native 0.86.2 → 0.86.3 등 7개).
      `npx expo install --fix` 후 시뮬레이터 확인해서 올리면 됨
- [ ] Expo SDK 업그레이드 주기 정하기 (연 2~3회 릴리스, 보통 1~2 메이저 뒤까지 지원)
      ```bash
      npx expo install --check      # SDK 호환 버전 이탈 확인
      npx expo install --fix
      ```
- [ ] Dependabot / Renovate 설정 여부

## 문서

- [ ] 릴리즈 절차를 아는 사람이 한 명뿐인 상태를 만들지 않기 —
      실제로 한 번 배포한 뒤 `docs/`에 실행 로그를 남기기
- [ ] 키스토어 / 인증서 보관 위치를 팀이 공유하는 곳에 기록
      (값 자체가 아니라 **어디에 있는지**를)
