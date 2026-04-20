# Repository Guidelines

## Project Structure & Module Organization
This repository contains a local Node.js app for recommending DoorDash deals through Browser Use Cloud.
- `src/server.js` runs the local HTTP server and API routes
- `src/services/` contains Browser Use orchestration and recommendation assembly
- `src/lib/` contains normalization and ranking logic
- `src/data/` contains mock data for demo mode
- `public/` contains the browser UI
- `tests/` contains automated tests

Keep modules focused by behavior. Put ranking rules in `src/lib/`, Browser Use prompts and polling in `src/services/`, and avoid mixing UI logic into server code.

## Build, Test, and Development Commands
The repository uses npm scripts.
- `npm start` starts the local app on `http://localhost:3000`
- `npm run dev` restarts the server on file changes
- `npm test` runs the Node test suite

Live mode also requires `BROWSER_USE_API_KEY` and `BROWSER_USE_PROFILE_ID` in the environment. Document any new setup requirements in `README.md`.

## Coding Style & Naming Conventions
Use clear, descriptive names and keep file naming consistent.
- JavaScript modules: camelCase exports, lowercase file names such as `rankDeals.js`
- Directories: lowercase, plural where they group similar modules such as `services/`
- Markdown files: conventional uppercase names such as `README.md` and `AGENTS.md`

Use ES modules, 2-space indentation, and keep Browser Use prompts/schema definitions isolated to service files.

## Testing Guidelines
Tests use the built-in Node test runner.
- place tests under `tests/`
- use `*.test.js` naming
- cover ranking behavior, deal normalization, and Browser Use response mapping/fallbacks

When changing score logic, add or update tests for promo priority, fee effects, budget penalties, and ETA penalties.

## Commit & Pull Request Guidelines
Git history uses short imperative subjects. Follow that pattern:
- keep the subject line brief
- start with a verb
- avoid mixing unrelated changes in one commit
- make small, reviewable commits instead of batching large changes
- push to GitHub frequently so remote history stays current

Pull requests should include:
- a short summary of the change
- any setup or verification steps
- linked issues, if applicable
- screenshots only when UI or rendered output changes

## Documentation Expectations
Documentation is part of the implementation. Update `README.md` and this guide whenever you add commands, directories, platform support, or workflow changes.

## Agent Workflow Expectations
Treat `AGENTS.md` as a living contributor guide.
- refresh it frequently as the repository evolves
- update it after meaningful commits when workflow or structure changes
- keep instructions aligned with the current repo state, not planned future state

Contributors should work the way a senior engineer would on an active repository:
- commit frequently with helpful, specific messages
- push changes to GitHub frequently instead of letting local work drift
- prefer incremental, traceable history over large catch-all commits

## Browser Use Notes
The repo intentionally uses Browser Use Cloud as the browser/session layer instead of local scraping.
- users bring their own `BROWSER_USE_API_KEY` and `BROWSER_USE_PROFILE_ID`
- the synced profile should already be authenticated with DoorDash
- the app is recommendation-only and should not add items to cart or place orders unless the repository direction changes explicitly

Keep the Browser Use prompt narrow:
- DoorDash only
- restaurant/prepared-food deals only
- no grocery or retail noise
- no checkout/cart actions
