import { cutoutPath, type Outline } from "./cutout-shape";

/** The reference apple. */
const APPLE: Outline = [
  [4.1, 27.2, 1.2],
  [5.9, 16.4, 1.2],
  [13.4, 10.6, 1.0],
  [19.2, 11.0, 0.8],
  // Stem
  [22.0, 13.6, 0.3],
  [23.4, 8.6, 0.25],
  [25.2, 4.2, 0.35],
  [27.0, 4.9, 0.35],
  // Leaf
  [26.2, 8.2, 0.2],
  [29.4, 4.6, 0.5],
  [34.8, 2.6, 0.6],
  [40.6, 3.2, 0.8],
  [37.4, 7.0, 0.5],
  [32.0, 8.6, 0.3],
  [27.2, 9.4, 0.2],
  [25.9, 9.4, 0.15],
  // Body
  [25.0, 13.4, 0.3],
  [29.6, 10.2, 0.3],
  [38.4, 10.9, 0.8],
  [43.8, 17.6, 1.2],
  [44.3, 28.9, 1.2],
  [38.7, 39.4, 1.2],
  [29.8, 44.1, 1.0],
  [24.6, 42.2, 0.8],
  [17.1, 44.3, 1.0],
  [8.9, 38.6, 1.2],
];

/**
 * About ±2.5° of tilt. Each apple takes its own proportions, up to about a fifth wider, narrower,
 * taller or squatter than the reference one, so no two look alike.
 */
const WOBBLE = { rotation: 0.09, stretchX: 0.35, stretchY: 0.3 };

/**
 * A cut-out apple, clearly different for each seed, as the `d` of a path in a 48 × 48 box.
 * Its outline trembles more than the bottles' by default (`intensity` 1.4).
 */
export const applePath = ({ seed, intensity = 1.4 }: { seed: number; intensity?: number }) =>
  cutoutPath(APPLE, WOBBLE, { seed, intensity });
