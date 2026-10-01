import { prng } from "./cutout-shape";

const percent = (value: number) => `${value.toFixed(2)}%`;

/**
 * An arch cut with scissors, like the bottles and the apples: a handful of straight cuts of
 * uneven lengths rather than a curve, each arch with its own. The same seed always gives the
 * same arch, on the server and in the browser.
 *
 * The cuts follow a half circle as wide as the box whatever its ratio: their heights are in
 * `cqw`, so the element it clips must sit inside a size container as wide as itself. Every
 * point moves inwards only, so the arch never spills out of its box.
 */
export function archClipPath(seed: number) {
  const rand = prng(seed);
  const between = (min: number, max: number) => min + rand() * (max - min);

  // Four or five cuts over the curve, each spanning an uneven share of it.
  const cuts = 4 + Math.floor(rand() * 2);
  const spans = Array.from({ length: cuts }, () => between(0.75, 1.25));
  const total = spans.reduce((sum, span) => sum + span, 0);

  let travelled = 0;
  const curve = [0, ...spans].map((span, index) => {
    travelled += span;
    const angle = Math.PI * (1 - travelled / total);
    // The feet stay on the box's sides; the corners in between fall a little short.
    const isFoot = index === 0 || index === cuts;
    const reach = isFoot ? 1 : 1 - between(0, 0.045);
    return {
      x: 50 + 50 * reach * Math.cos(angle),
      y: 50 * (1 - reach * Math.sin(angle)),
    };
  });

  // One more cut down each side, and across the bottom.
  const middle = (inset: number) => `${percent(inset)} calc(50cqw + (100% - 50cqw) * 0.55)`;
  const bottom = () => percent(100 - between(0, 0.8));

  return `polygon(${[
    ...curve.map(({ x, y }) => `${percent(x)} ${y.toFixed(2)}cqw`),
    middle(100 - between(0, 1.5)),
    `${percent(100 - between(0, 1))} ${bottom()}`,
    `${percent(between(0, 1))} ${bottom()}`,
    middle(between(0, 1.5)),
  ].join(", ")})`;
}
