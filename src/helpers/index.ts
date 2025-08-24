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

  const lastDay = response.classByDateList[response.classByDateList.length - 1];
  let allClasses: ClassItem[] = lastDay.classByTimeList.flatMap(
    (time) => time.classes
  );

  if (onlyAvailable) {
    allClasses = allClasses.filter(
      (c) => c.state === "AVAILABLE" && c.availableSeats > 0
    );
  }

  // Step 4: Respect BOTH workout priority AND time range priority
  for (const pref of preferredWorkouts) {
    const workoutFiltered = allClasses.filter((c) =>
      c.workoutName.toLowerCase().includes(pref.toLowerCase())
    );

    // Loop through timeRanges in order
    for (const range of timeRanges) {
      const withinTime = workoutFiltered.filter(
        (c) => c.startTime >= range.start && c.startTime <= range.end
      );

      if (withinTime.length > 0) {
        // Pick earliest within this range
        withinTime.sort((a, b) => a.startTime.localeCompare(b.startTime));
        return withinTime[0];
      }
    }
  }

  return null;
}
