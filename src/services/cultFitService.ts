import {
  CULT_FIT_URLS,
  DEFAULT_PRODUCT_TYPE,
  DEFAULT_CLASS_TYPE,
} from "../config/constants";
import { getApiHeaders, getBookingHeaders } from "../config/headers";
import { env } from "../config/env";
import { ApiResponse, PreferredWorkout, getBestSlot } from "../helpers";

export class CultFitService {
  private static readonly referer =
    "https://www.cult.fit/cult/classbooking?pageFrom=cultCLP&pageType=classbooking";

  static async fetchClasses(): Promise<ApiResponse> {
    try {
      env.validate();

      const url = new URL(CULT_FIT_URLS.CLASSES);
      url.searchParams.append("center", env.CULT_FIT_CENTER_ID || "1263");
      url.searchParams.append("pageFrom", "cultCLP");
      url.searchParams.append("pageType", "classbooking");

      const headers = getApiHeaders({
        referer: this.referer,
        "if-none-match": 'W/"63e2-x0fEEhnjx8LLhYefyz9+kaujaGw"',
        "x-request-id": "d7f967b0-6b21-2629-faec-12094bd1e96c",
        Cookie: env.CULT_FIT_COOKIE!,
      });

      const response = await fetch(url.toString(), {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return (await response.json()) as ApiResponse;
    } catch (error) {
      console.error("Error fetching cult.fit classes:", error);
      throw error;
    }
  }

  static async bookClass(
    classId: string,
    productType: string = DEFAULT_PRODUCT_TYPE,
    classType: string = DEFAULT_CLASS_TYPE
  ): Promise<any> {
    try {
      env.validate();

      const url = `${CULT_FIT_URLS.BOOK_CLASS}/${classId}/book`;

      const headers = getBookingHeaders({
        Referer: this.referer,
        "x-request-id": "6f097d51-1e47-de03-f93e-aa43ea033dc1",
        Cookie: env.CULT_FIT_COOKIE!,
      });

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ classId, productType, classType }),
      });

      if (!response.ok) {
        throw new Error(`Booking failed! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error booking class:", error);
      process.exit(1); // Exit workflow with failure
    }
  }

  static async findAndBookBestSlot(preferences?: {
    preferredWorkouts?: PreferredWorkout[];
    timeRanges?: { start: string; end: string }[];
  }) {
    try {
      const responseData = await this.fetchClasses();

      const bestSlot = getBestSlot(responseData, {
        onlyAvailable: false,
        preferredWorkouts: preferences?.preferredWorkouts || [
          PreferredWorkout.Boxing,
        ],
        timeRanges: preferences?.timeRanges || [
          { start: "06:00:00", end: "09:00:00" },
          { start: "18:30:00", end: "22:00:00" },
          { start: "16:00:00", end: "18:30:00" },
        ],
      });

      if (!bestSlot) {
        console.log("No matching slot found.");
        return null;
      }

      console.log("Best slot found:", bestSlot);
      return bestSlot;
    } catch (error) {
      console.error("Error finding best slot:", error);
      throw error;
    }
  }
}
