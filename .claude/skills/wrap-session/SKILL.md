---
name: wrap-session
description: 작업을 마무리합니다 — 검증 실행, docs/adr·docs/todo 갱신, 커밋, 푸시, PR 생성까지. 코드나 설정 변경을 끝냈을 때 항상 실행하세요. 사용자가 "마무리", "정리해줘", "PR 올려줘", "푸시해줘"라고 하거나 한 덩어리의 작업이 끝났을 때 트리거됩니다.
---

# 세션 마무리

작업이 끝나면 **검증 → 문서 → 커밋 → 푸시 → PR** 순으로 처리합니다.
순서를 바꾸지 마세요. 깨진 코드를 문서화하거나 PR로 올리는 일을 막기 위한 순서입니다.

## 0. 사전 확인

```bash
git branch --show-current
git status --short
```

- 변경이 없으면 여기서 멈추고 사용자에게 알립니다.
- `main` / `master` / `<이름>/main` 위에 있다면 지금 브랜치를 만듭니다
  ([`start-task`](../start-task/SKILL.md) 참고). 변경 사항은 브랜치를 바꿔도 따라옵니다.

## 1. 검증

무엇을 건드렸는지에 따라 실행합니다. **실패하면 여기서 멈추고 고칩니다.**

```bash
npx tsc --noEmit                        # 코드를 건드렸다면 (항상)
npx expo config --type public           # app.config.ts 를 건드렸다면
npx expo-doctor                         # 의존성을 추가/변경했다면
npx expo prebuild --no-install --clean  # 네이티브 설정/의존성을 건드렸다면
```

`prebuild`를 돌렸다면 **생성된 `ios/`, `android/`를 지웁니다.**

```bash
rm -rf ios android
```

남겨두면 이후 설정 변경이 반영되지 않은 것처럼 보입니다.

## 2. 문서 갱신

### ADR

이번 작업에서 되돌리기 비싼 결정을 했다면 [`write-adr`](../write-adr/SKILL.md) 스킬을 따릅니다.
단순 수정이면 건너뜁니다 — 판단 기준은 그 스킬에 있습니다.

### TODO

`docs/todo/`를 **반드시** 훑고 갱신합니다. 이건 건너뛰지 마세요.

- [ ] 이번에 끝낸 항목의 체크박스 채우기
- [ ] 파일이 통째로 끝났으면 상단에 `> 완료: YYYY-MM-DD` 추가하고
      `docs/todo/README.md` 표의 상태를 ✅ 로
- [ ] **작업 중 새로 알게 된 할 일 추가** — 이게 가장 중요합니다.
      "나중에 해야지" 하고 대화에만 남긴 것들이 여기서 유실됩니다
- [ ] 새 주제면 다음 번호로 파일 추가 후 `README.md` 표에 한 줄

### README / CLAUDE.md

- 셋업 절차, 명령어, 프로젝트 구조가 바뀌었으면 `README.md`
- 작업 규칙, 하지 말아야 할 것, 검증 방법이 바뀌었으면 `CLAUDE.md`

## 3. 커밋

논리 단위로 나눕니다. 한 덩어리면 하나로도 괜찮습니다.

```bash
git add -A
git status --short   # 커밋 전 무엇이 들어가는지 눈으로 확인
```

**들어가면 안 되는 것**: `.env`, `ios/`, `android/`, `node_modules/`,
`google-play-service-account.json`, `*.jks`, `*.p8`, `*.p12`, `credentials.json`.
`.gitignore`에 있지만 `-f` 없이도 새어 나갈 수 있으니 눈으로 확인하세요.

메시지 형식 — `<type>: <요약>` (브랜치와 같은 type 사용).

```
feat: 웹뷰 딥링크 처리 추가

- iOS Associated Domains / Android App Links 설정
- WebShell에서 초기 URL 파싱해 웹으로 전달

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

요약은 한국어, 명령형보다 **무엇이 바뀌었는지**가 드러나게. 본문은 왜 그렇게 했는지.
`git commit` 커밋 메시지 끝에는 세션 정보를 붙입니다 (환경 지침의 형식을 따르세요).

## 4. 푸시

```bash
git push -u origin HEAD
```

## 5. PR 생성

```bash
gh pr create --base main --title "<type>: <요약>" --body "$(cat <<'EOF'
## 무엇을

한 문단. 이 PR이 무엇을 바꾸는지.

## 왜

배경과 이유. ADR을 썼다면 링크: `docs/adr/NNNN-....md`

## 어떻게 확인했나

실제로 돌린 명령과 결과를 적습니다. 안 돌렸으면 안 돌렸다고 적으세요.

- `npx tsc --noEmit` → 통과
- `npx expo-doctor` → 20/20
- 시뮬레이터 확인 → (했으면 무엇을 봤는지 / 안 했으면 "미확인")

## 남은 일

`docs/todo/` 에 추가한 항목이 있으면 링크.

## 리뷰어가 봐야 할 곳

특히 눈여겨봐야 할 파일이나 판단이 갈릴 수 있는 부분.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- `--draft`는 작업이 덜 끝났을 때만.
- PR 생성 후 **URL을 사용자에게 알려주세요.**

## 6. 사용자에게 보고

마지막에 한 번에 정리합니다.

- 브랜치 이름과 PR URL
- 실행한 검증과 결과 (**실패했거나 안 돌린 게 있으면 반드시 명시**)
- 갱신한 문서
- 사람이 직접 해야 하는 남은 일 (로그인이 필요한 명령, 자산 준비 등)

## 하지 말 것

- **검증을 건너뛰고 PR을 올리지 마세요.** "간단한 변경이라" 는 이유는 통하지 않습니다.
- **돌리지 않은 검증을 돌렸다고 쓰지 마세요.** PR 본문의 "어떻게 확인했나"는 사실만 적습니다.
- 사용자가 명시적으로 요청하지 않는 한 **PR을 머지하지 마세요.**
- `git push --force`는 사용자가 요청했을 때만.
- 커밋 후 `ios/`, `android/`가 딸려 들어갔다면 되돌리고 다시 커밋하세요.
