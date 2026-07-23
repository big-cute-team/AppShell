# Architecture Decision Records (ADR)

이 폴더는 **왜 그렇게 만들었는지**를 기록합니다.
코드를 읽으면 알 수 있는 "무엇을"이 아니라, 코드에 남지 않는 "왜"와 "무엇을 포기했는지"를 남깁니다.

## 언제 쓰나

작업 중 아래에 해당하는 판단을 했다면 ADR을 하나 추가합니다.

- 되돌리기 비싼 선택을 했을 때 (프레임워크, 빌드 파이프라인, 배포 방식, 데이터 모델)
- 두 가지 이상의 선택지를 놓고 하나를 골랐을 때
- "왜 이렇게 안 했지?" 라는 질문이 6개월 뒤에 나올 만한 결정을 했을 때
- 남들이 흔히 하는 방식을 일부러 따르지 않았을 때

반대로 **기록하지 않아도 되는 것**: 단순 버그 수정, 오타, 리네이밍, 명백한 관용 구현.

## 규칙

- 파일명: `NNNN-kebab-case-제목.md` (번호는 4자리, 이어서 증가)
- 한 번 `Accepted` 된 ADR은 **고쳐 쓰지 않습니다.** 결정이 바뀌면 새 ADR을 쓰고,
  기존 ADR의 상태를 `Superseded by ADR-NNNN` 으로 바꾸는 한 줄만 수정합니다.
- 상태: `Proposed` / `Accepted` / `Superseded by ADR-NNNN` / `Deprecated`
- 템플릿은 [`TEMPLATE.md`](./TEMPLATE.md) 참고.

## 목록

| # | 제목 | 상태 | 날짜 |
| --- | --- | --- | --- |
| [0001](./0001-expo-managed-workflow-for-webview-shell.md) | 웹뷰 셸을 Expo + CNG로 구성 | Accepted | 2026-07-23 |
| [0002](./0002-webview-navigation-policy.md) | 웹뷰 네비게이션 정책 (내부/외부/커스텀 스킴 분리) | Accepted | 2026-07-23 |
| [0003](./0003-eas-build-and-remote-versioning.md) | EAS Build/Submit + 원격 버전 관리 | Accepted | 2026-07-23 |
