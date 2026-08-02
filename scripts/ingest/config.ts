import path from "path";

export const DATASET_DIR = path.join(
  process.cwd(),
  "dataset",
  "Indian_Premier_League_2022-03-26"
);

export const ZONE_NAMES = [
  "Fine Leg",
  "Square Leg",
  "Mid Wicket",
  "Long On",
  "Long Off",
  "Cover",
  "Point",
  "3rd Man",
];
