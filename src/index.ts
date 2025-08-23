import fs from "fs";
import path from "path";
import nodeCron from "node-cron";
import { env } from "./config/env";
import { CultFitService } from "./services/cultFitService";

// Initialize environment
env.validate();

const LOG_DIR = path.resolve("./logs");
const LOG_RETENTION_DAYS = 7;

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

// Generate daily log file path
function getLogFilePath() {
  const date = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  }); // YYYY-MM-DD
  return path.join(LOG_DIR, `booking-${date}.log`);
}

// Log to console and file
function log(message: string) {
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  const finalMessage = `[${timestamp}] ${message}`;
  console.log(finalMessage);
  fs.appendFileSync(getLogFilePath(), finalMessage + "\n");
}

// Cleanup old logs beyond retention period
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

async function main(): Promise<boolean> {
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
    } catch (bookingError) {
      log(`Booking failed: ${bookingError}`);
      return false;
    }
  } catch (error) {
    log(`Error in main process: ${error}`);
    return false;
  }
}

// Schedule cron at 10:00 PM IST daily
nodeCron.schedule(
  "0 22 * * *",
  () => {
    cleanupOldLogs(); // remove old logs
    log("Starting repeated job at 10:00 PM IST...");

    let attemptCount = 0;

    const intervalId = setInterval(async () => {
      attemptCount++;
      log(`Attempt #${attemptCount}`);
      const isBooked = await main();

      if (isBooked) {
        log(
          `Booking done after ${attemptCount} attempts. Stopping repeated execution.`
        );
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      }
    }, 10000); // every 10 seconds

    const timeoutId = setTimeout(() => {
      log(
        `Max runtime reached after ${attemptCount} attempts. Stopping repeated execution.`
      );
      clearInterval(intervalId);
    }, 5 * 60 * 1000); // max 5 minutes
  },
  { timezone: "Asia/Kolkata" }
);
