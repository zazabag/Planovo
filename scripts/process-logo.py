import json
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

SRC = Path(
    r"C:\Users\Admin\.cursor\projects\d-cursor-project-vpn-Planovo\assets\c__Users_Admin_AppData_Roaming_Cursor_User_workspaceStorage_fa815635a8e92876bd4625eec51cf6b6_images_5305664528177633704-d42e2d10-4e07-46d9-be3a-ea02f711faf3.png"
)
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "logo.png"
ASSETS = ROOT / "assets" / "logo.png"
TARGET = 1024


def white_to_alpha(img: Image.Image, threshold: int = 248) -> Image.Image:
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                px[x, y] = (r, g, b, 0)
    return img


def trim_transparent(img: Image.Image, pad: int = 6) -> Image.Image:
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    if not bbox:
        return img
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(img.width, right + pad)
    bottom = min(img.height, bottom + pad)
    return img.crop((left, top, right, bottom))


def main():
    src = Image.open(SRC).convert("RGBA")

    rgb = ImageEnhance.Contrast(src.convert("RGB")).enhance(1.06)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.15)
    sharp = rgb.filter(ImageFilter.UnsharpMask(radius=1.0, percent=120, threshold=2))
    img = sharp.convert("RGBA")
    img.putalpha(src.split()[-1])

    img = white_to_alpha(img, threshold=246)
    img = trim_transparent(img, pad=8)

    size = max(img.width, img.height)
    square = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ox = (size - img.width) // 2
    oy = (size - img.height) // 2
    square.paste(img, (ox, oy), img)

    square = square.resize((TARGET, TARGET), Image.Resampling.LANCZOS)
    square = square.filter(ImageFilter.UnsharpMask(radius=0.7, percent=105, threshold=2))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    ASSETS.parent.mkdir(parents=True, exist_ok=True)
    square.save(OUT, format="PNG", optimize=True)
    square.save(ASSETS, format="PNG", optimize=True)

    fav32 = square.resize((32, 32), Image.Resampling.LANCZOS)
    fav32.save(ROOT / "favicon-32.png", format="PNG", optimize=True)

    print(json.dumps({"out": str(OUT), "size": square.size}))


if __name__ == "__main__":
    main()
