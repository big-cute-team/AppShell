# 004. 브랜딩 에셋 교체

**상태: 🟢 에셋 교체 완료 (2026-08-05)** — 실기기/시뮬레이터 눈 확인만 남음 (아래 "확인" 참고).

## 교체할 파일

| 파일 | 규격 | 용도 |
| --- | --- | --- |
| `assets/icon.png` | 1024×1024 PNG, **투명/알파 채널 없음** | iOS 앱 아이콘 |
| `assets/android-icon-foreground.png` | 1024×1024, 중앙 66% 안에 로고 | Android 적응형 아이콘 전경 |
| `assets/android-icon-background.png` | 1024×1024 단색/패턴 | Android 적응형 아이콘 배경 |
| `assets/android-icon-monochrome.png` | 1024×1024 단색 실루엣 | Android 13+ 테마 아이콘 |
| `assets/splash-icon.png` | 정사각 PNG, 여백 포함 | 스플래시 중앙 로고 |
| `assets/favicon.png` | 48×48 | 웹 빌드용 (안 쓰면 무시) |

- [x] 위 파일 전부 교체 (2026-08-05, PLick 로고)
- [x] iOS 아이콘에 알파 채널이 없는지 확인 — 있으면 App Store Connect가 업로드를 거부합니다
      ```bash
      sips -g hasAlpha assets/icon.png
      ```
      → `hasAlpha: no` 확인
- [x] Android 적응형 아이콘은 원형/스퀘어클 마스크로 잘립니다.
      로고가 가장자리에 붙어 있으면 잘려 나가니 안전 영역(중앙 66%)을 지킬 것
      → 로고 bbox 602×282px, 중앙 배치 — 안전 영역 원(지름 676px) 내부 확인

## 색상 맞추기

배경색이 세 곳에 흩어져 있습니다. **같은 값으로 맞춰야** 스플래시에서 웹으로 넘어갈 때
색이 튀지 않습니다.

- [x] `app.config.ts` → `BACKGROUND_COLOR` (스플래시 배경 + 앱 배경) — `#0B0D12`
- [x] `src/config.ts` → `BACKGROUND_COLOR` (세이프에어리어 + 웹뷰 로딩 배경) — `#0B0D12`
- [x] `app.config.ts` → `android.adaptiveIcon.backgroundColor` — `BACKGROUND_COLOR` 상수 참조로 변경

- [x] 배경이 어두운 색이 되면 `WebShell.tsx`의 `<StatusBar style="dark" />`를
      `"light"`로 바꿔야 상태바 아이콘이 보입니다 — 이미 `"light"` 적용됨 (20aedbe)

## 이름

- [x] `app.config.ts`의 `APP_NAME`이 홈 화면에 표시될 이름으로 맞는지 확인
      — `'PLick'`으로 변경 (2026-08-05)

## 확인

```bash
npx expo prebuild --clean
npm run ios      # 홈 화면 아이콘과 스플래시 눈으로 확인
```

확인 후 생성된 `ios/`, `android/`는 지웁니다.

- [x] `npx expo prebuild --no-install --clean` 통과 (2026-08-05)
- [ ] 실기기/시뮬레이터에서 홈 화면 아이콘·스플래시 눈 확인
      — Android는 `eas build -p android --profile preview` APK를 갤럭시에 설치해 확인 예정
        (Android 13+ 테마 아이콘·적응형 마스크까지 볼 것), iOS는 `npm run ios`
