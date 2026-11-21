"""
Prepare painted art for the game (docs/17, docs/16 performance).

  python tools/prepare-art.py bg <source.png> <name> [--ybias 0.5]
  python tools/prepare-art.py sprite <source.png> <name>

Backgrounds are cropped to 16:9 and exported as WebP in two sizes:
  public/art/<name>.webp        (1536 px wide, desktop / tablets)
  public/art/<name>@small.webp  (960 px wide, phones and small screens)
Sprites (transparent PNG) are trimmed to their visible pixels and exported the same way (height 900 / 450).
"""
import argparse
import os

from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "art")
QUALITY = 84


def save(img: Image.Image, name: str, suffix: str = "") -> None:
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"{name}{suffix}.webp")
    img.save(path, "WEBP", quality=QUALITY, method=6)
    print(f"{path}  {img.size[0]}x{img.size[1]}  {os.path.getsize(path) // 1024} KB")


def background(src: str, name: str, ybias: float) -> None:
    img = Image.open(src).convert("RGB")
    w, h = img.size
    target_h = round(w * 9 / 16)
    if target_h <= h:
        top = round((h - target_h) * ybias)
        img = img.crop((0, top, w, top + target_h))
    else:
        target_w = round(h * 16 / 9)
        left = (w - target_w) // 2
        img = img.crop((left, 0, left + target_w, h))
    save(img.resize((1536, 864), Image.LANCZOS), name)
    save(img.resize((960, 540), Image.LANCZOS), name, "@small")


def sprite(src: str, name: str) -> None:
    img = Image.open(src).convert("RGBA")
    alpha = img.getchannel("A").point(lambda a: 255 if a > 24 else 0)
    box = alpha.getbbox()
    if box is None:
        raise SystemExit("Sprite is fully transparent")
    img = img.crop(box)
    for height, suffix in ((900, ""), (450, "@small")):
        width = round(img.size[0] * height / img.size[1])
        save(img.resize((width, height), Image.LANCZOS), name, suffix)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("kind", choices=["bg", "sprite"])
    parser.add_argument("source")
    parser.add_argument("name")
    parser.add_argument("--ybias", type=float, default=0.5, help="0 = keep top, 1 = keep bottom")
    args = parser.parse_args()
    if args.kind == "bg":
        background(args.source, args.name, args.ybias)
    else:
        sprite(args.source, args.name)


if __name__ == "__main__":
    main()
