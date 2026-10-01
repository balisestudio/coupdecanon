import { cutoutPath, type Outline } from "./cutout-shape";

/** The reference bottles, one per kind of drink. */
const BOTTLES = {
  cider: [
    [21.4, 3.3, 0.25],
    [26.5, 3.0, 0.25],
    [26.8, 7.4, 0.2],
    [27.5, 16.2, 0.3],
    [31.3, 21.8, 0.6],
    [32.5, 28.0, 0.6],
    [32.1, 44.3, 0.7],
    [23.9, 44.9, 0.6],
    [16.1, 44.5, 0.7],
    [15.8, 27.5, 0.6],
    [17.0, 21.2, 0.6],
    [20.8, 15.9, 0.3],
    [21.2, 7.6, 0.2],
  ],
  calvados: [
    [21.9, 3.6, 0.25],
    [26.3, 3.4, 0.25],
    [26.7, 11.1, 0.25],
    [31.9, 14.6, 0.5],
    [35.2, 20.4, 0.6],
    [35.6, 43.8, 0.7],
    [27.6, 44.7, 0.6],
    [12.9, 44.3, 0.7],
    [12.4, 20.9, 0.6],
    [15.4, 15.1, 0.5],
    [21.3, 11.5, 0.25],
  ],
  juice: [
    [21.8, 3.4, 0.25],
    [26.3, 3.2, 0.25],
    [26.7, 9.3, 0.25],
    [30.6, 13.4, 0.5],
    [31.2, 19.3, 0.5],
    [30.7, 44.5, 0.6],
    [23.6, 44.9, 0.5],
    [17.1, 44.3, 0.6],
    [16.8, 18.9, 0.5],
    [17.7, 13.2, 0.5],
    [21.5, 9.5, 0.25],
  ],
} satisfies Record<string, Outline>;

export type BottleKind = keyof typeof BOTTLES;

/**
 * About ±2° of tilt. Each bottle takes its own width, up to a fifth narrower or wider than
 * the reference one, and barely changes height.
 */
const WOBBLE = { rotation: 0.07, stretchX: 0.4, stretchY: 0.05 };

/**
 * The part of the 48 × 48 box the bottles stand in, wide enough for the widest of them: they
 * are narrow, so a square box would leave them lost in its middle.
 */
export const BOTTLE_VIEW_BOX = "6 0 36 48";

/** A cut-out bottle, a little different for each seed, as the `d` of a path in a 48 × 48 box. */
export const bottlePath = ({
  kind,
  ...options
}: {
  kind: BottleKind;
  seed: number;
  intensity?: number;
}) => cutoutPath(BOTTLES[kind], WOBBLE, options);
