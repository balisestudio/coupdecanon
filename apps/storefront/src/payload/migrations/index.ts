import * as migration_20261001_131048_initial from "./20261001_131048_initial";

export const migrations = [
  {
    up: migration_20261001_131048_initial.up,
    down: migration_20261001_131048_initial.down,
    name: "20261001_131048_initial",
  },
];
