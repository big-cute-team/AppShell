"""해축이모 리브랜딩 자산 생성.

입력(Figma 원본 래스터, logo-raw/):
  logo_5.png  804×804  앱 아이콘 · 캐릭터형 (초록 바탕 포함)
  logo_7.png  1393×491 가로형 로고 (투명)
  text_2.png  500×475  캐릭터 얼굴 (투명)
  text_3.png  853×239  흰 글자 로고 (투명)

출력:
  <repo>/assets/icon.png, android-icon-*.png, splash-icon.png, favicon.png
  <store>/icon/  app-store-icon-1024.png, play-icon-512.png, play-feature-graphic-1024x500.png
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

RAW = Path(__file__).parent / "logo-raw"
REPO_ASSETS = Path(sys.argv[1])
STORE = Path(sys.argv[2])
STORE.mkdir(parents=True, exist_ok=True)

SIZE = 1024
# iOS 마스크 + Android 적응형 마스크를 고려해 아이콘 내용물은 캔버스의 이 비율로 축소.
# 원본 804px 안에서 캐릭터+글자가 차지하는 폭이 ~85%라 0.62 × 0.85 ≈ 53% → 안전 영역(66%) 안.
ADAPTIVE_CONTENT_RATIO = 0.62


def border_color(im: Image.Image) -> tuple[int, int, int]:
    a = np.asarray(im.convert("RGB"))
    edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    return tuple(int(x) for x in np.median(edge, axis=0))


def upscale(im: Image.Image, size: int) -> Image.Image:
    return im.resize((size, size), Image.LANCZOS)


# ---- iOS 아이콘 (1024, 알파 없음) ----
src = Image.open(RAW / "logo_5.png").convert("RGBA")
bg = border_color(src)
print("icon background:", "#%02X%02X%02X" % bg)

flat = Image.new("RGBA", src.size, bg + (255,))
flat.alpha_composite(src)
icon = upscale(flat, SIZE).convert("RGB")
icon.save(REPO_ASSETS / "icon.png", optimize=True)
icon.save(STORE / "app-store-icon-1024.png", optimize=True)
icon.resize((512, 512), Image.LANCZOS).save(STORE / "play-icon-512.png", optimize=True)
icon.resize((48, 48), Image.LANCZOS).save(REPO_ASSETS / "favicon.png", optimize=True)

# ---- Android 적응형 아이콘 ----
Image.new("RGB", (SIZE, SIZE), bg).save(REPO_ASSETS / "android-icon-background.png", optimize=True)

content = int(SIZE * ADAPTIVE_CONTENT_RATIO)
fg = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
inner = upscale(flat, content)
off = (SIZE - content) // 2
fg.paste(inner, (off, off))
fg.save(REPO_ASSETS / "android-icon-foreground.png", optimize=True)

# 모노크롬: 초록 바탕과 다른 픽셀만 흰 실루엣으로. 거리 기반 알파로 가장자리 부드럽게.
arr = np.asarray(inner.convert("RGB")).astype(np.int16)
dist = np.abs(arr - np.array(bg, dtype=np.int16)).sum(axis=2)
alpha = np.clip((dist - 40) / 80.0, 0.0, 1.0)  # 40 이하 = 바탕, 120 이상 = 내용물
alpha_img = Image.fromarray((alpha * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(0.6))
mono = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
white = Image.new("RGBA", (content, content), (255, 255, 255, 255))
white.putalpha(alpha_img)
mono.paste(white, (off, off))
mono.save(REPO_ASSETS / "android-icon-monochrome.png", optimize=True)

# ---- 스플래시 (흰 배경 위 가로형 로고, 투명 PNG) ----
horiz = Image.open(RAW / "logo_7.png").convert("RGBA")
bbox = horiz.getbbox()
horiz = horiz.crop(bbox)
pad = int(horiz.width * 0.06)
splash = Image.new("RGBA", (horiz.width + pad * 2, horiz.height + pad * 2), (0, 0, 0, 0))
splash.paste(horiz, (pad, pad), horiz)
splash.save(REPO_ASSETS / "splash-icon.png", optimize=True)

# ---- Play 피처 그래픽 1024×500 (초록 바탕 + 얼굴 + 흰 글자) ----
W, H = 1024, 500
feat = Image.new("RGBA", (W, H), bg + (255,))
face = Image.open(RAW / "text_2.png").convert("RGBA")
face = face.crop(face.getbbox())
word = Image.open(RAW / "text_3.png").convert("RGBA")
word = word.crop(word.getbbox())

face_h = int(H * 0.62)
face = face.resize((int(face.width * face_h / face.height), face_h), Image.LANCZOS)
word_h = int(face_h * 0.46)
word = word.resize((int(word.width * word_h / word.height), word_h), Image.LANCZOS)
gap = 36
total_w = face.width + gap + word.width
x = (W - total_w) // 2
feat.alpha_composite(face, (x, (H - face.height) // 2))
feat.alpha_composite(word, (x + face.width + gap, (H - word.height) // 2))
feat.convert("RGB").save(STORE / "play-feature-graphic-1024x500.png", optimize=True)

for p in sorted(REPO_ASSETS.glob("*.png")) + sorted(STORE.glob("*.png")):
    im = Image.open(p)
    print(f"{p.name:40s} {im.size[0]}x{im.size[1]} mode={im.mode}")
