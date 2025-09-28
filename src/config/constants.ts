import { PreferredWorkout } from "../helpers";

export const CULT_FIT_URLS = {
  CLASSES: "https://www.cult.fit/api/cult/classes",
  BOOK_CLASS: "https://www.cult.fit/api/cult/class",
} as const;

export const DEFAULT_PRODUCT_TYPE = "FITNESS";
export const DEFAULT_CLASS_TYPE = "MEMBERSHIP";
export const TIME_RANGE = [
  { start: "08:00:00", end: "10:00:00" },
  { start: "18:30:00", end: "22:00:00" },
  { start: "06:00:00", end: "09:00:00" },
  { start: "16:00:00", end: "18:30:00" },
];
export const WORKOUTS = [PreferredWorkout.Boxing];
