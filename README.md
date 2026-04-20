# deals

DoorDash-only deal recommender powered by Browser Use Cloud. The app uses a Browser Use API key plus a synced authenticated `profile_id` to inspect your DoorDash session and recommend the best deal without placing an order.

## Quick start

```bash
export BROWSER_USE_API_KEY=bu_xxx
export BROWSER_USE_PROFILE_ID=profile_xxx
npm start
```

Then open `http://localhost:3000`.

Use `Mock data` to preview the ranking flow immediately. Use `Browser Use live mode` once your Browser Use profile is synced and already logged into DoorDash.

## Available commands

- `npm start`: run the local server
- `npm run dev`: run the server with watch mode
- `npm test`: execute unit tests with the built-in Node test runner

## Browser Use setup

1. Create a Browser Use API key.
2. Sync a browser profile that is already logged into DoorDash.
3. Copy the resulting Browser Use `profile_id`.
4. Export `BROWSER_USE_API_KEY` and `BROWSER_USE_PROFILE_ID` before starting the app.

## Project layout

- `src/server.js`: local HTTP server and API routes
- `src/services/browserUseClient.js`: Browser Use task creation and polling
- `src/services/getRecommendations.js`: DoorDash recommendation flow
- `src/lib/`: normalization and ranking logic
- `src/data/`: mock data for local/demo usage
- `public/`: static UI
- `tests/`: ranking and mapping tests

## Current live-mode limitations

The Browser Use agent is more robust than our old scraper, but this is still agentic browsing:
- it depends on the synced Browser Use profile staying logged into DoorDash
- extracted fee data can still be incomplete on some flows
- the app is recommendation-only and intentionally does not add items to cart or place orders
