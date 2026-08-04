# 002. EAS 프로젝트 연결

**상태: 🟡 진행 중** — 프로젝트 연결, 첫 빌드(Android APK·iOS 시뮬레이터),
키스토어 백업까지 끝났습니다 (2026-08-04). 남은 것: **iOS 실기기용 크리덴셜**
(Apple Developer 가입 후 첫 preview/production iOS 빌드 때).

## 해야 할 일

- [x] Expo 계정 준비 (팀 계정 권장 — 개인 계정에 묶이면 인수인계가 어렵습니다)
      — `kimdowan1004s-team` 팀 계정 사용
- [x] 로그인 및 프로젝트 생성
      ```bash
      eas login
      eas init          # app.config.ts 의 extra.eas.projectId 가 채워집니다
      ```
      — `@kimdowan1004s-team/plick` 생성됨.
      구버전 eas-cli(21.1.0)는 `app.config.ts`를 읽다가
      `Cannot read properties of undefined (reading 'CommonJS')` 로 실패합니다.
      **`npx eas-cli@latest`를 쓰세요** (21.5.0에서 정상 동작 확인).
- [x] `projectId`가 실제로 들어갔는지 확인
      ```bash
      npx expo config --type public | grep -A2 eas
      ```
      — `npx eas-cli@latest project:info` 로 연결까지 확인함
- [x] `app.config.ts`의 `extra.eas.projectId`가 `process.env.EAS_PROJECT_ID`를 읽는 형태로
      남아 있다면, `eas init`이 써 넣은 값으로 하드코딩할지 결정
      (팀 공유 시 하드코딩이 편합니다)
      — 하드코딩으로 결정 (`06a29df6-638e-4045-8f1f-738bb65a6da0`)

## 크리덴셜

첫 빌드 때 EAS가 자동 생성 여부를 물어봅니다. 기본은 **EAS가 관리**하는 쪽입니다.

- [ ] iOS — Apple Developer Program 멤버십(연 $99) 가입 여부 확인
- [ ] iOS — 첫 **실기기용** 빌드 시 Apple 계정 로그인. 인증서/프로비저닝 프로파일은 EAS가 생성
      — `development` 프로파일은 시뮬레이터 빌드(`ios.simulator: true`)라 서명이 필요 없어
        크리덴셜을 묻지 않습니다. `preview`/`production` iOS 빌드 때 만들어집니다.
- [x] Android — 키스토어를 EAS가 생성하도록 두기 — 첫 preview 빌드에서 생성됨 (2026-08-04)
      (이미 출시된 앱이 있다면 **기존 키스토어를 반드시 업로드**해야 업데이트가 가능합니다)
- [x] 생성된 키스토어 백업: `eas credentials` → 다운로드해서 안전한 곳에 보관 (2026-08-04)
      — `credentials.json` + `credentials/android/keystore.jks` 세트로 백업함.
        로컬 사본은 백업 후 삭제.

> 키스토어를 잃어버리면 같은 패키지명으로 앱을 **영원히 업데이트할 수 없습니다.**
> Google Play App Signing에 등록해 두는 것을 권장합니다.

## 첫 빌드 확인

- [x] 개발 빌드 — iOS 시뮬레이터 빌드 성공 (2026-08-04)
      ```bash
      npm run build:dev
      ```
- [x] 내부 테스트 빌드 (Android APK가 나와 설치가 쉽습니다)
      — Android APK 빌드 성공, 실기기 설치·동작 확인 (2026-08-04).
        위아래 여백 이슈 발견 → [008](./008-safe-area-visuals.md)
      ```bash
      npm run build:preview
      ```

## 참고

- 배경: [ADR-0003](../adr/0003-eas-build-and-remote-versioning.md)
- 빌드 번호는 EAS가 관리합니다. 조회는 `eas build:version:get`.
