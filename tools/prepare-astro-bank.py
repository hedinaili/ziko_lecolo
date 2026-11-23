"""Bake Y-axis views of the painted ship into a single lightweight spritesheet."""
from math import cos, sin, radians
from pathlib import Path
from PIL import Image

art = Path(__file__).resolve().parents[1] / "public" / "art"
ship = Image.open(art / "astro-ship.webp").convert("RGBA")
ship.thumbnail((216, 216), Image.Resampling.LANCZOS)
w, h = ship.size
sheet = Image.new("RGBA", (128 * 17, 128))
for i in range(17):
    angle = radians((i - 8) * 45 / 8)
    pose = Image.new("RGBA", (256, 256))
    # A raised fuselage shifts toward the leaning side more than the flat wings.
    def projected(x):
        u = 2 * x / w - 1
        depth = 36 * max(0, 1 - abs(u)) ** 2
        return round(128 + (x - w / 2) * cos(angle) + depth * sin(angle))
    for x in range(w):
        left, right = projected(x), projected(x + 1)
        if right <= left:
            continue
        perspective = 1 + (x / w - .5) * sin(angle) * .30
        height = round(h * perspective)
        strip = ship.crop((x, 0, x + 1, h)).resize((right-left, height), Image.Resampling.BICUBIC)
        pose.paste(strip, (left, (256-height)//2))
    sheet.paste(pose.resize((128,128), Image.Resampling.LANCZOS), (128*i,0))
sheet.save(art / "astro-bank.webp", quality=94, method=6)
