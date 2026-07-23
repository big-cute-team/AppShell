# 002. EAS 프로젝트 연결

**상태: 🔴 블로커** — 연결 전에는 클라우드 빌드가 되지 않습니다.
로그인이 필요해 에이전트가 대신 실행할 수 없습니다. **사람이 직접 실행하세요.**

## 해야 할 일

- [ ] Expo 계정 준비 (팀 계정 권장 — 개인 계정에 묶이면 인수인계가 어렵습니다)
- [ ] 로그인 및 프로젝트 생성
      ```bash
      eas login
      eas init          # app.config.ts 의 extra.eas.projectId 가 채워집니다
      ```
- [ ] `projectId`가 실제로 들어갔는지 확인
      ```bash
      npx expo config --type public | grep -A2 eas
      ```
- [ ] `app.config.ts`의 `extra.eas.projectId`가 `process.env.EAS_PROJECT_ID`를 읽는 형태로
      남아 있다면, `eas init`이 써 넣은 값으로 하드코딩할지 결정
      (팀 공유 시 하드코딩이 편합니다)

## 크리덴셜

첫 빌드 때 EAS가 자동 생성 여부를 물어봅니다. 기본은 **EAS가 관리**하는 쪽입니다.

- [ ] iOS — Apple Developer Program 멤버십(연 $99) 가입 여부 확인
- [ ] iOS — 첫 빌드 시 Apple 계정 로그인. 인증서/프로비저닝 프로파일은 EAS가 생성
- [ ] Android — 키스토어를 EAS가 생성하도록 두기
      (이미 출시된 앱이 있다면 **기존 키스토어를 반드시 업로드**해야 업데이트가 가능합니다)
- [ ] 생성된 키스토어 백업: `eas credentials` → 다운로드해서 안전한 곳에 보관

> 키스토어를 잃어버리면 같은 패키지명으로 앱을 **영원히 업데이트할 수 없습니다.**
> Google Play App Signing에 등록해 두는 것을 권장합니다.

## 첫 빌드 확인

- [ ] 개발 빌드
      ```bash
      npm run build:dev
      ```
- [ ] 내부 테스트 빌드 (Android APK가 나와 설치가 쉽습니다)
      ```bash
      npm run build:preview
      ```

## 참고

- 배경: [ADR-0003](../adr/0003-eas-build-and-remote-versioning.md)
- 빌드 번호는 EAS가 관리합니다. 조회는 `eas build:version:get`.
