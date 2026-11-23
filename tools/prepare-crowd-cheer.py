"""Animate the raised arms in the existing three oil-creature portraits."""
from math import cos, pi
from pathlib import Path
from PIL import Image

art = Path(__file__).resolve().parents[1] / "public" / "art"
source = Image.open(art / "meduse-crowd.webp").convert("RGBA")
size, frames = 128, 8
sheet = Image.new("RGBA", (size * frames, size * 3))
for row in range(3):
    body = source.crop((row * size, 0, (row + 1) * size, size))
    for frame in range(frames):
        # Warp just the two outer arms about the shoulders; keep the face and feet still.
        def warp(x, y):
            side = -1 if x < 64 else 1
            phase = (1 - cos(2 * pi * frame / frames + side * .30)) / 2
            arm = min(1, max(0, (abs(x - 64) - 17) / 13))
            lift = max(0, (60 - y) / 60) * arm * phase
            return x - side * 8 * lift, y - 24 * lift

        mesh = []
        for y in range(0, size, 8):
            for x in range(0, size, 8):
                corners = [(x,y), (x,y+8), (x+8,y+8), (x+8,y)]
                mesh.append(((x,y,x+8,y+8), tuple(v for a,b in corners for v in warp(a,b))))
        pose = body.transform(body.size, Image.Transform.MESH, mesh, Image.Resampling.BICUBIC)
        sheet.paste(pose, (size * frame, size * row))
sheet.save(art / "meduse-cheer.webp", quality=92, method=6)
