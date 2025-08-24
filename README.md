# CultFit Class Booking Automation

Automates booking classes at CultFit using Node.js and TypeScript, with retry logic and logging. Can be scheduled via GitHub Actions.

---

## Repository Structure

```
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
```

## Features

* Automatically fetches and books classes at CultFit.
* Retry mechanism every 1 minute until booked or for 2 minutes max.
* Logs all attempts to a timestamped file.
* Cleans up logs older than 7 days.
* Can run automatically via GitHub Actions.

## Environment Variables

Create a `.env` file or use GitHub Secrets:

```
CULT_FIT_API_KEY=your_api_key
CULT_FIT_APP_VERSION=7
CULT_FIT_COOKIE=your_cookie
CULT_FIT_DEVICE_ID=device_id
CULT_FIT_CENTER_ID=center_id
```

## Setup

1. Clone the repository:

```bash
git clone https://github.com/ayushraj17/cultfit-class-book.git
cd cultfit-class-book
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Run locally:

```bash
node build/index.js
```

## GitHub Actions Setup

1. Push this repository to a branch `github-actions`.
2. Add secrets for your environment variables in GitHub repository settings.
3. Workflow `.github/workflows/book-cultfit.yml` triggers the script daily or manually.

### Sample Workflow Logic

* Checkout `github-actions` branch
* Install Node.js and dependencies
* Build TypeScript
* Run booking script every 1 minute until booked or 2 minutes max
* Cleanup old logs
* Upload logs as artifact

## `getBestSlot` Logic

Inside `cultFitService.ts`, the function `getBestSlot`:

```ts
function getBestSlot(response, { preferredWorkouts, timeRanges, onlyAvailable = true }) {
  if (!response.classByDateList?.length) return null;

  const lastDay = response.classByDateList[response.classByDateList.length - 1];
  let allClasses = lastDay.classByTimeList.flatMap(t => t.classes);

  if (onlyAvailable) {
    allClasses = allClasses.filter(c => c.state === 'AVAILABLE' && c.availableSeats > 0);
  }

  for (const pref of preferredWorkouts) {
    const workoutFiltered = allClasses.filter(c => c.workoutName.toLowerCase().includes(pref.toLowerCase()));
    const withinTime = workoutFiltered.filter(c => timeRanges.some(r => c.startTime >= r.start && c.startTime <= r.end));
    if (withinTime.length) {
      withinTime.sort((a, b) => a.startTime.localeCompare(b.startTime));
      return withinTime[0];
    }
  }
  return null;
}
```

This respects workout preferences and optional time ranges.

## Logs

* Stored in `/logs` with format `booking-YYYY-MM-DD.log`.
* Automatically cleaned up if older than 7 days.

## License

MIT
