# Makes bravr/tools/popeface.jpg, the face texture make_pope.js embeds in pope.glb, from bravr/popehead.png.
# The white background becomes skin colour (feathered), so the edges of the projection blend into the head.
# The game renders with linear output, and GLTFLoader decodes base colour maps as sRGB, so the pixels are
# encoded once more here: the game then shows the photo's own colours.
# Run: python bravr/tools/make_popeface.py   (needs Pillow)
import os
from collections import deque
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
im = Image.open(os.path.join(HERE, '..', 'popehead.png')).convert('RGB')
W, H = im.size
px = im.load()

# background: near-white pixels connected to the border
bg = Image.new('L', (W, H), 0)
bgp = bg.load()
q = deque([(x, y) for x in range(W) for y in (0, H - 1)] + [(x, y) for y in range(H) for x in (0, W - 1)])
while q:
    x, y = q.popleft()
    if bgp[x, y] or min(px[x, y]) < 236:
        continue
    bgp[x, y] = 255
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < W and 0 <= ny < H and not bgp[nx, ny]:
            q.append((nx, ny))

# skin tone: the cheeks below the eyes
cheek = [px[x, y] for x in range(150, 230) for y in range(520, 600)] + [px[x, y] for x in range(460, 540) for y in range(520, 600)]
fill = tuple(sorted(c[k] for c in cheek)[len(cheek) // 2] for k in range(3))
print('skin', fill, 'as a material colour:', [round(c / 255, 3) for c in fill])

# grown by a few pixels first, so the photo's anti-aliased white rim goes too
out = Image.composite(Image.new('RGB', (W, H), fill), im, bg.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(4)))
srgb = lambda c: round(255 * (12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055))
out = out.point([srgb(i / 255) for i in range(256)] * 3)
out.resize((512, round(512 * H / W)), Image.LANCZOS).save(os.path.join(HERE, 'popeface.jpg'), quality=88)
