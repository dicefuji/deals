# deals

Local-first deal finder for food-delivery apps. The app compares DoorDash and Uber Eats promotions, estimates delivered totals, and recommends the best option based on promo strength, savings, fees, ETA, and your preferences.

## Quick start

```bash
npm install
npx playwright install chromium
npm start
```

Then open `http://localhost:3000`.

Use `Mock data` to see the full ranking flow immediately. Switch to `Live browser collection` when you want the app to open a local browser and inspect your own logged-in sessions.

## Available commands

- `npm start`: run the local server
- `npm run dev`: run the server with watch mode
- `npm test`: execute unit tests with the built-in Node test runner
- `npx playwright install chromium`: download the browser used by live collection

## Project layout

- `src/server.js`: local HTTP server and API routes
- `src/collectors/`: DoorDash and Uber Eats browser collectors
- `src/lib/`: normalization and ranking logic
- `src/data/`: mock data for local/demo usage
- `public/`: static UI
- `tests/`: ranking and normalization tests

## Current live-mode limitations

The live collectors are intentionally conservative:
- they use your local browser session, not stored credentials
- they rely on visible consumer web pages rather than private APIs
- they currently extract headline deal text and apply heuristic pricing, so mock mode is more predictable than live mode right now

## Live mode setup

Before using `Live browser collection`, run:

```bash
npx playwright install chromium
```

Then start the app, switch to live mode, and sign into DoorDash and Uber Eats in the browser Playwright opens locally.
