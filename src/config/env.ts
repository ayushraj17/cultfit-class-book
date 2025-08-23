import { config } from "dotenv";

config();

export const env = {
  CULT_FIT_API_KEY: process.env.CULT_FIT_API_KEY,
  CULT_FIT_APP_VERSION: process.env.CULT_FIT_APP_VERSION,
  CULT_FIT_COOKIE: process.env.CULT_FIT_COOKIE,
  CULT_FIT_DEVICE_ID: process.env.CULT_FIT_DEVICE_ID,
  CULT_FIT_CENTER_ID: process.env.CULT_FIT_CENTER_ID,

  // Validate required environment variables
  validate: () => {
    const required = [
      "CULT_FIT_API_KEY",
      "CULT_FIT_APP_VERSION",
      "CULT_FIT_COOKIE",
    ];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }
  },
};
