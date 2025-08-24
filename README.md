CultFit Class Booker

Automated booking script to secure CultFit class slots every day at a scheduled time using Node.js + TypeScript and GitHub Actions.

⸻

Overview

This app:
	•	Interfaces with CultFit API to book classes automatically.
	•	Uses embedded slot selection logic in CultFitService.findAndBookBestSlot().
	•	Retries booking every 1 minute for up to 2 minutes.
	•	Logs attempts and outcomes into timestamped files.
	•	Cleans up logs older than 7 days.
	•	Runs daily via GitHub Actions (around 10:00 PM IST).

⸻

Repository Structure

/
├─ .github/
│  └─ workflows/
│     └─ book-cultfit.yml   # GitHub Actions workflow
├─ src/
│  └─ services/
│     └─ cultFitService.ts  # Booking + getBestSlot logic
├─ logs/                     # Generated logs
├─ package.json
├─ tsconfig.json
├─ .env.example              # Template for environment variables
└─ README.md


⸻

Best Slot Selection Logic

The logic is embedded in:

// src/services/cultFitService.ts
export class CultFitService {
  static async findAndBookBestSlot() {
    // 1. Fetch all available slots for the given center
    // 2. Apply preference logic (time, availability, capacity)
    // 3. Pick the most suitable slot
    // 4. Attempt booking via CultFit API
    // 5. Return success/failure
  }
}

	•	Adjustments to workout preferences or time ranges can be done directly in this method.
	•	The method returns the best slot and handles API booking.

⸻

Getting Started (Local)
	1.	Clone the repo:

git clone https://github.com/ayushraj17/cultfit-class-book.git
cd cultfit-class-book

	2.	Copy .env.example → .env and add your credentials:

CULT_FIT_API_KEY=...
CULT_FIT_APP_VERSION=...
CULT_FIT_COOKIE=...
CULT_FIT_DEVICE_ID=...
CULT_FIT_CENTER_ID=...

	3.	Install dependencies:

npm install

	4.	Build & run locally:

npm run build
node build/index.js

Logs will appear in:

./logs/booking-YYYY-MM-DD.log


⸻

GitHub Actions Setup

1. Add Secrets

Go to Settings → Secrets and variables → Actions → New repository secret and add:
	•	CULT_FIT_API_KEY
	•	CULT_FIT_APP_VERSION
	•	CULT_FIT_COOKIE
	•	CULT_FIT_DEVICE_ID
	•	CULT_FIT_CENTER_ID

⸻

2. Workflow Example

Create .github/workflows/book-cultfit.yml:

name: CultFit Auto Booker

on:
  schedule:
    - cron: "25 16 * * *" # Runs daily at 9:55 PM IST (16:25 UTC)
  workflow_dispatch:       # Manual trigger

jobs:
  book-class:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4
        with:
          ref: github-actions  # Run workflow on this branch

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install --legacy-peer-deps

      - name: Build Project
        run: npm run build

      - name: Run Booking Script
        run: node build/index.js
        env:
          CULT_FIT_API_KEY: ${{ secrets.CULT_FIT_API_KEY }}
          CULT_FIT_APP_VERSION: ${{ secrets.CULT_FIT_APP_VERSION }}
          CULT_FIT_COOKIE: ${{ secrets.CULT_FIT_COOKIE }}
          CULT_FIT_DEVICE_ID: ${{ secrets.CULT_FIT_DEVICE_ID }}
          CULT_FIT_CENTER_ID: ${{ secrets.CULT_FIT_CENTER_ID }}

      - name: Upload Logs
        uses: actions/upload-artifact@v4
        with:
          name: cultfit-logs
          path: logs/


⸻

3. Execution
	•	Workflow starts automatically via schedule or manually via Actions → Run workflow.
	•	Script retries internally every 1 minute for up to 2 minutes.
	•	Stops immediately if booking succeeds or if API returns an error (e.g., 400/500).

⸻

Logs
	•	Daily logs stored in logs/booking-YYYY-MM-DD.log.
	•	Logs older than 7 days are automatically cleaned.
	•	GitHub Actions uploads logs as artifacts for each run.

⸻

Modifying Preferences

If you want to change preferred time ranges or workouts, edit findAndBookBestSlot() in CultFitService:

const preferredWorkouts = ["Boxing", "Strength"];
const preferredTimeRanges = [
  { start: "16:00:00", end: "18:00:00" },
  { start: "18:00:00", end: "22:00:00" }
];

	•	Order matters: the first matching slot in this priority order will be selected.
	•	Adjust as needed for your schedule or desired workouts.

⸻

Troubleshooting
	•	Ensure .env secrets are valid.
	•	Check logs/ or GitHub Action Artifacts for errors.
	•	On module or build errors, run:

npm install
npm run build

	•	Workflow runs on the github-actions branch. Ensure this branch exists.

⸻

License

Open source – adapt freely.

⸻

Contact

Email: meayushraj17@gmail.com
