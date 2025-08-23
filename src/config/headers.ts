export const commonHeaders = {
  accept: "application/json",
  "accept-language": "en,hi;q=0.9",
  "content-type": "application/json",
  dnt: "1",
  priority: "u=1, i",
  "sec-ch-ua":
    '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  timezone: "Asia/Kolkata",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
};

export const getApiHeaders = (
  additionalHeaders: Record<string, string> = {}
) => ({
  ...commonHeaders,
  apikey: process.env.CULT_FIT_API_KEY!,
  appversion: process.env.CULT_FIT_APP_VERSION!,
  browsername: "Web",
  osname: "browser",
  ...additionalHeaders,
});

export const getBookingHeaders = (
  additionalHeaders: Record<string, string> = {}
) => ({
  ...commonHeaders,
  apiKey: process.env.CULT_FIT_API_KEY!,
  appVersion: process.env.CULT_FIT_APP_VERSION!,
  browsername: "Web",
  osName: "browser",
  ...additionalHeaders,
});
