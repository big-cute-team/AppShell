# ADR-0003: EAS Build/Submit + 원격 버전 관리

- **상태**: Accepted
- **날짜**: 2026-07-23
- **관련**: [ADR-0001](./0001-expo-managed-workflow-for-webview-shell.md), `eas.json`, `docs/todo/002-eas-project-setup.md`

## 배경

스토어 배포에는 (1) 서명된 바이너리를 만드는 일과 (2) 그걸 스토어에 올리는 일이 필요합니다.
둘 다 크리덴셜 관리가 따라붙습니다 — Apple 인증서/프로비저닝 프로파일, Android 키스토어.
이것들을 개인 맥에 두면 담당자가 바뀌는 순간 릴리즈가 멈춥니다.

또 하나, 빌드 번호(iOS `buildNumber`, Android `versionCode`)는 스토어에서
**단조 증가해야 하는 값**인데, 이걸 저장소 파일에 두면 브랜치 병합 때마다 충돌하고
"올리는 걸 깜빡해서 업로드 거부" 사고가 반복됩니다.

## 결정

**EAS Build로 클라우드 빌드, EAS Submit으로 스토어 업로드**를 하고,
빌드 번호는 **EAS 서버가 관리**(`appVersionSource: "remote"`)합니다.

`eas.json` 프로파일 3종:

| 프로파일 | 용도 | 산출물 |
| --- | --- | --- |
| `development` | dev client. Metro 붙여 개발 | iOS 시뮬레이터 빌드 + Android internal |
| `preview` | 내부 테스터 배포 | Android **APK** (설치 쉬움) + iOS internal |
| `production` | 스토어 제출 | Android **AAB** + iOS IPA, `autoIncrement: true` |

사람이 정하는 값은 `app.config.ts`의 `VERSION`(사용자에게 보이는 `1.0.0`) **하나뿐**입니다.

## 대안과 트레이드오프

| 대안 | 장점 | 단점 | 채택 |
| --- | --- | --- | --- |
| **EAS Build + Submit** | 크리덴셜을 EAS가 보관·자동 생성. macOS 러너 불필요. `expo prebuild`와 동일 파이프라인 | 유료 티어 대기열, Expo 서비스 종속 | ✅ |
| 로컬 Xcode/Gradle 빌드 | 무료, 완전 제어 | 크리덴셜이 개인 머신에 묶임. 현 로컬 JDK(24)·CocoaPods 정합성 문제 그대로 안게 됨 | ❌ |
| GitHub Actions 자체 구축 | CI 통합, 비용 통제 | macOS 러너 비용 + 크리덴셜을 직접 시크릿으로 관리. 껍데기 앱에 과한 투자 | ❌ (나중에 필요하면 EAS를 Actions에서 호출) |
| 버전 번호를 저장소에서 관리 | Git으로 추적 가능 | 브랜치 병합 충돌, 증가 누락으로 인한 업로드 거부 | ❌ |

## 결과

### 생긴 제약

- **빌드 번호는 이제 Git에서 볼 수 없습니다.** `eas build:version:get`으로 조회해야 합니다.
  대신 브랜치 간 충돌과 증가 누락이 사라집니다.
- EAS 프로젝트가 연결되기 전까지 빌드가 불가합니다.
  `app.config.ts`의 `extra.eas.projectId`는 `eas init`이 채웁니다.
  → `docs/todo/002-eas-project-setup.md`
- `eas.json`의 `submit.production`은 아직 **플레이스홀더**입니다
  (`APPLE_ID_EMAIL`, `APP_STORE_CONNECT_APP_ID`, `APPLE_TEAM_ID`).
  실제 값을 채우기 전에는 `eas submit`이 실패합니다.
- Google Play는 **첫 릴리즈 1회를 반드시 콘솔에서 수동 업로드**해야 이후 API 제출이 열립니다.
  이건 Google 정책이라 우회할 수 없습니다.
- 서비스 계정 JSON(`google-play-service-account.json`)과 `credentials.json`은
  `.gitignore`에 추가했습니다. 커밋되면 즉시 폐기하고 재발급해야 합니다.

### OTA 업데이트는 보류

`expo-updates`를 넣으면 JS 번들을 스토어 심사 없이 갱신할 수 있지만,
이 앱은 JS가 웹뷰 껍데기뿐이라 **갱신할 내용이 거의 없습니다.**
웹 콘텐츠는 이미 서버에서 즉시 반영됩니다. 실익 대비 복잡도(채널·런타임 버전 관리)가 커서
넣지 않았습니다. 셸에 네이티브 기능이 붙어 JS 로직이 늘어나면 재검토합니다.
