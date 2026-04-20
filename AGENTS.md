# Repository Guidelines

## Project Structure & Module Organization
This repository now contains a local Node.js app for comparing DoorDash and Uber Eats deals.
- `src/server.js` runs the local HTTP server and API routes
- `src/collectors/` holds per-platform browser collectors
- `src/lib/` contains normalization and ranking logic
- `src/data/` contains mock data used for demo mode
- `public/` contains the browser UI
- `tests/` contains automated tests

Keep modules focused by behavior. Put ranking rules in `src/lib/`, platform-specific extraction in `src/collectors/`, and avoid mixing UI logic into server code.

## Build, Test, and Development Commands
The repository uses npm scripts.
- `npm install` installs dependencies, including Playwright for live browser collection
- `npx playwright install chromium` downloads the local browser binary required for Playwright
- `npm start` starts the local app on `http://localhost:3000`
- `npm run dev` restarts the server on file changes
- `npm test` runs the Node test suite

Do not add new commands without documenting them in `README.md`.

## Coding Style & Naming Conventions
Use clear, descriptive names and keep file naming consistent within the language you introduce.
- JavaScript modules: camelCase exports, lowercase file names such as `rankDeals.js`
- Directories: lowercase, plural where they group similar modules such as `collectors/`
- Markdown files: short uppercase names only when conventional, such as `README.md` and `AGENTS.md`

Use ES modules, 2-space indentation, and keep browser-automation selectors isolated to collector files.

## Testing Guidelines
Tests use the built-in Node test runner.
- place tests under `tests/`
- use `*.test.js` naming
- cover ranking behavior, deal normalization, and collector fallbacks

When changing score logic, add or update tests for promo priority, fee effects, budget penalties, and ETA penalties.

## Commit & Pull Request Guidelines
Git history currently uses short imperative subjects such as `Initial commit`. Follow that pattern:
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
Documentation remains part of the implementation. Update `README.md` and this guide whenever you add commands, new directories, platform support, or meaningful workflow changes.

## Agent Workflow Expectations
Treat `AGENTS.md` as a living contributor guide rather than a one-time file.
- refresh it frequently as the repository evolves
- update it after meaningful commits when workflow or structure changes
- keep instructions aligned with the current repo state, not planned future state

Contributors should work the way a senior engineer would on an active repository:
- commit frequently with helpful, specific messages such as `Add AGENTS contributor guide` or `Document test command in README`
- push changes to GitHub frequently instead of letting local work drift
- prefer incremental, traceable history over large catch-all commits
