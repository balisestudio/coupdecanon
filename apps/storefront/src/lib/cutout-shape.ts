/**
 * Cut-out shapes whose outline trembles a little differently for each seed, like paper cut by
 * hand. The same seed always gives the same shape, so a server and a browser draw it alike.
 */

/** A reference outline: `[x, y, how far the point may tremble]`, clockwise in a 48 × 48 box. */
export type Outline = [x: number, y: number, amplitude: number][];

/** How much the whole shape may turn (in radians) and stretch, at intensity 1. */
export type Wobble = { rotation: number; stretchX: number; stretchY: number };

type Point = [x: number, y: number];

/** Mulberry32: a small, seedable pseudo-random generator. */
export function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A seed from a text (FNV-1a), to give a product the same shape on every render. */
export function seedFrom(text: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193);
  }
  return hash >>> 0;
}

const cross = ([ax, ay]: Point, [bx, by]: Point, [cx, cy]: Point) =>
  (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);

function selfIntersects(points: Point[]) {
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const a = points[i] as Point;
    const b = points[(i + 1) % n] as Point;
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // Neighbouring segments share a point.
      const c = points[j] as Point;
      const d = points[(j + 1) % n] as Point;
      if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) {
        return true;
      }
    }
  }
  return false;
}

/**
 * The outline, trembled, as the `d` of a path in a 48 × 48 view box.
 * `intensity`: 0 draws the reference shape, 1 a normal one, 1.5 a very dented one.
 */
export function cutoutPath(
  base: Outline,
  wobble: Wobble,
  { seed, intensity = 1 }: { seed: number; intensity?: number },
) {
  const rand = prng(seed);
  let points: Point[] | null = null;

  for (let attempt = 0; attempt < 20 && !points; attempt++) {
    const rotation = (rand() - 0.5) * wobble.rotation * intensity;
    const scaleX = 1 + (rand() - 0.5) * wobble.stretchX * intensity;
    const scaleY = 1 + (rand() - 0.5) * wobble.stretchY * intensity;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const candidate = base.map(([x, y, amplitude]): Point => {
      const dx = (x + (rand() - 0.5) * 2 * amplitude * intensity - 24) * scaleX;
      const dy = (y + (rand() - 0.5) * 2 * amplitude * intensity - 24) * scaleY;
      return [24 + dx * cos - dy * sin, 24 + dx * sin + dy * cos];
    });
    if (!selfIntersects(candidate)) points = candidate;
  }
  const outline = points ?? base.map(([x, y]): Point => [x, y]);

  // Fit the shape back into the 48 × 48 box, with a margin of one unit.
  const xs = outline.map(([x]) => x);
  const ys = outline.map(([, y]) => y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = Math.min(1, 46 / (x1 - x0), 46 / (y1 - y0));
  const offsetX = 24 - ((x0 + x1) / 2) * k;
  const offsetY = 24 - ((y0 + y1) / 2) * k;

  return `M${outline
    .map(([x, y]) => `${(x * k + offsetX).toFixed(2)} ${(y * k + offsetY).toFixed(2)}`)
    .join(" ")}Z`;
}
