// Enum for supported workouts
export enum PreferredWorkout {
  Boxing = "Boxing",
  Burn = "Burn",
  Dance = "Dance",
  Strength = "Strength",
  WeekendsAtCult = "Weekends at Cult",
  Yoga = "Yoga",
}

// Type for API class item
export type ClassItem = {
  id: string;
  date: string;
  productType: string;
  startTime: string;
  endTime: string;
  workoutId: number;
  workoutName: string;
  availableSeats: number;
  state: string; // e.g. "AVAILABLE" | "SEAT_NOT_AVAILABLE"
};

// API Response type
export type ApiResponse = {
  classByDateList: {
    id: string;
    classByTimeList: {
      id: string;
      classes: ClassItem[];
    }[];
  }[];
};

// Multiple time ranges allowed
export interface TimeRange {
  start: string; // "HH:mm:ss"
  end: string; // "HH:mm:ss"
}

export interface FilterOptions {
  preferredWorkouts: PreferredWorkout[]; // Ordered by priority
  timeRanges: TimeRange[];
  onlyAvailable?: boolean; // default true
}

/**
 * Filters the last date's classes and picks the best slot.
 * Respects strict preference order for workouts.
 */
export function getBestSlot(
  response: ApiResponse,
  { preferredWorkouts, timeRanges, onlyAvailable = true }: FilterOptions
): ClassItem | null {
  if (!response.classByDateList?.length) return null;

  // Step 1: Get the last day
  const lastDay = response.classByDateList[response.classByDateList.length - 1];

  // Step 2: Collect all classes for the day
  let allClasses: ClassItem[] = lastDay.classByTimeList.flatMap(
    (time) => time.classes
  );

  // Step 3 (optional): Filter available classes only
  if (onlyAvailable) {
    allClasses = allClasses.filter(
      (c) => c.state === "AVAILABLE" && c.availableSeats > 0
    );
  }

  // Step 4: Go through preferred workouts in order
  for (const pref of preferredWorkouts) {
    // Filter classes of this workout
    const workoutFiltered = allClasses.filter((c) =>
      c.workoutName.toLowerCase().includes(pref.toLowerCase())
    );

    // Further filter by time ranges
    const withinTime = workoutFiltered.filter((c) =>
      timeRanges.some(
        (range) => c.startTime >= range.start && c.startTime <= range.end
      )
    );

    if (withinTime.length > 0) {
      // Sort by earliest time and return first match
      withinTime.sort((a, b) => a.startTime.localeCompare(b.startTime));
      return withinTime[0];
    }
  }

  // No slot found
  return null;
}
