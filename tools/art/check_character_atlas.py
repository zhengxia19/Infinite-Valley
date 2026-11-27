"""Validate Infinite Valley untrimmed character atlases; never publish assets."""
import argparse
import json
from itertools import combinations
from pathlib import Path

from PIL import Image, ImageChops


def check(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    errors = []
    w, h = data["frameSize"]
    ax, ay = data["anchorPx"]
    size = data["meta"]["size"]
    expected = (size["w"], size["h"])
    if data.get("characterDisplayFrame", [w, h]) != [48, 64] or data["tileSize"] != 32:
        errors.append("display or tile size mismatch")
    if not (0 <= ax < w and 0 <= ay < h):
        errors.append("anchor outside frame")

    def load(name):
        with Image.open(path.parent / name) as source:
            if source.format != "PNG":
                errors.append(f"{name}: not PNG")
            im = source.convert("RGBA")
        if im.size != expected:
            errors.append(f"{name}: atlas dimensions mismatch")
        if set(im.getchannel("A").getdata()) - {0, 255}:
            errors.append(f"{name}: non-binary alpha")
        return im

    base = load(data["meta"]["image"])
    boxes, pixels = {}, {}
    for name, record in data["frames"].items():
        f = record["frame"]
        x, y, fw, fh = (f[k] for k in ("x", "y", "w", "h"))
        box = (x, y, x + fw, y + fh)
        if (fw, fh) != (w, h) or not (0 <= x < x + fw <= expected[0] and 0 <= y < y + fh <= expected[1]):
            errors.append(f"{name}: invalid frame geometry")
            continue
        if record.get("rotated") or record.get("trimmed") or record.get("anchor") != {"x": ax / w, "y": ay / h}:
            errors.append(f"{name}: rotation, trim or anchor mismatch")
        boxes[name] = box
        frame = base.crop(box)
        alpha = frame.getchannel("A")
        if not alpha.getbbox():
            errors.append(f"{name}: empty frame")
        # Transparent RGB bytes do not count as animation changes.
        pixels[name] = Image.composite(frame, Image.new("RGBA", frame.size), alpha).tobytes()
    for (a, u), (b, v) in combinations(boxes.items(), 2):
        if max(u[0], v[0]) < min(u[2], v[2]) and max(u[1], v[1]) < min(u[3], v[3]):
            errors.append(f"{a}/{b}: overlap")
    used = set()
    for name, anim in data["animations"].items():
        frames = anim["frames"]
        used.update(frames)
        if not frames or anim["fps"] <= 0 or any(f not in pixels for f in frames):
            errors.append(f"{name}: invalid animation references or fps")
        elif len({pixels[f] for f in frames}) != len(frames):
            errors.append(f"{name}: repeated visible frames")
    if used != set(data["frames"]):
        errors.append("animation coverage mismatch")
    if data.get("layers"):
        combined = Image.new("RGBA", expected)
        for layer in data["layers"]:
            default, *variants = layer["variants"]
            im = load(default)
            for variant in variants:
                other = load(variant)
                if data.get("layering", "").startswith("disjoint_visible_pixel_layers") and ImageChops.difference(im.getchannel("A"), other.getchannel("A")).getbbox():
                    errors.append(f"{variant}: recolor silhouette mismatch")
            combined = Image.alpha_composite(combined, im)
        # Compare visible RGBA including alpha, not hidden RGB under transparency.
        def visible(im):
            return Image.composite(im, Image.new("RGBA", im.size), im.getchannel("A")).tobytes()
        if visible(combined) != visible(base):
            errors.append("default layers do not reproduce base")
    for overlay in data.get("optionalOverlays", []):
        load(overlay["image"])
    return {"atlas": str(path), "frames": len(boxes), "animations": len(data["animations"]), "errors": errors}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("atlases", nargs="+", type=Path)
    args = parser.parse_args()
    results = []
    for path in args.atlases:
        try:
            results.append(check(path))
        except (OSError, ValueError, KeyError, TypeError) as exc:
            results.append({"atlas": str(path), "errors": [str(exc)]})
    print(json.dumps(results, ensure_ascii=False, indent=2))
    return int(any(item["errors"] for item in results))


if __name__ == "__main__":
    raise SystemExit(main())
