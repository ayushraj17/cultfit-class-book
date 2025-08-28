// main.ts
import fs from "fs";
import path from "path";
import { env } from "./config/env";
import { CultFitService } from "./services/cultFitService";

// Initialize environment
env.validate();

const LOG_DIR = path.resolve("./logs");
const LOG_RETENTION_DAYS = 7;

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

function getLogFilePath() {
  const date = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  return path.join(LOG_DIR, `booking-${date}.log`);
}

function log(message: string) {
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  const finalMessage = `[${timestamp}] ${message}`;
  console.log(finalMessage);
  fs.appendFileSync(getLogFilePath(), finalMessage + "\n");
}

function cleanupOldLogs() {
  const files = fs.readdirSync(LOG_DIR);
  const now = Date.now();

  files.forEach((file) => {
    const match = file.match(/^booking-(\d{4}-\d{2}-\d{2})\.log$/);
    if (match) {
      const fileDate = new Date(match[1]);
      const ageInDays = (now - fileDate.getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays > LOG_RETENTION_DAYS) {
        fs.unlinkSync(path.join(LOG_DIR, file));
        console.log(`Deleted old log file: ${file}`);
      }
    }
  });
}

async function attemptBooking(): Promise<boolean> {
  try {
    log("Fetching cult.fit classes...");
    const bestSlot = await CultFitService.findAndBookBestSlot();

    if (!bestSlot) {
      log("No suitable slot found for booking.");
      return false;
    }

    log(`Best slot found: ${JSON.stringify(bestSlot)}`);

    try {
      const bookingResponse = await CultFitService.bookClass(
        bestSlot.id,
        bestSlot.productType
      );
      log(`Booking successful: ${JSON.stringify(bookingResponse)}`);
      return true;
    } catch (err) {
      log(`Booking failed: ${err}`);
      return false;
    }
  } catch (err) {
    log(`Error in main process: ${err}`);
    return false;
  }
}

export async function runBookingJob() {
  cleanupOldLogs();

  const INTERVAL_MS = 60 * 1000; // 60 seconds
  const MAX_RUNTIME_MS = 7 * 60 * 1000; // 7 minutes

  const startTime = Date.now();
  let booked = false;
  let attempts = 0;

  while (!booked && Date.now() - startTime < MAX_RUNTIME_MS) {
    attempts++;
    log(`Attempt #${attempts}`);
    booked = await attemptBooking();

    if (!booked) {
      await new Promise((r) => setTimeout(r, INTERVAL_MS));
    }
  }

  if (!booked) {
    log(`Booking not successful after ${attempts} attempts. Exiting.`);
  } else {
    log(`Booking completed after ${attempts} attempts.`);
  }

  return booked;
}

// Wait until exactly 16:30:00 UTC before running
async function waitUntilTargetTime() {
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(16, 30, 0, 0);

  if (now > target) {
    log("Target time already passed, running immediately.");
    return;
  }

  const delay = target.getTime() - now.getTime();
  log(`Waiting ${delay / 1000}s until 16:30:00 UTC...`);
  await new Promise((resolve) => setTimeout(resolve, delay));
}

// Run directly if executed
if (require.main === module) {
  (async () => {
    await waitUntilTargetTime();
    await runBookingJob();
  })();
}
