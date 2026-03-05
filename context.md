# App Context

## Purpose

This project is a lightweight REST client that runs entirely in the browser and is deployed to GitHub Pages.

The app is intentionally frontend-only:

- All requests are made with the browser `fetch()` API
- Request history and the in-progress draft are stored in `localStorage`
- No backend is used
- Secrets must not be hardcoded into the app
- APIs must support browser access through CORS

This makes the project simple to host and easy to extend, but it also means some APIs that work in Postman may fail here if the server blocks browser requests.

## Product Direction

The current app is meant to be:

- Simple and fast to use
- More polished than a bare demo
- Smaller in scope than Postman
- Easy to maintain and extend

The current MVP supports:

- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- URL input
- Query params
- Headers
- JSON or text request bodies
- Response status, timing, size, headers, and body
- Local request history
- Theme toggle

## Architecture Overview

The app is built with `React + Vite + TypeScript`.

High-level flow:

1. `src/App.tsx` owns the main app state
2. The request builder updates a `RequestDraft`
3. `src/lib/http.ts` converts that draft into a `fetch()` call
4. The response is normalized into `ResponseData`
5. The request is stored in local history
6. The response viewer renders success or error output

## Key Files

### `src/App.tsx`

Main state container.

Responsibilities:

- Holds the current request draft
- Holds the latest response
- Holds the latest request error
- Holds local request history
- Handles theme state
- Formats JSON bodies
- Sends requests through `executeRequest()`
- Restores past requests from history

If you need to change app-level behavior, this is usually the first file to inspect.

### `src/components/Layout.tsx`

Simple layout shell for:

- top toolbar
- request panel
- response panel
- history panel

Keeps the main page structure separate from the application logic.

### `src/components/RequestPanel.tsx`

Request input UI.

Responsibilities:

- Method selector
- URL input
- Query parameter rows
- Header rows
- Body editor
- JSON formatting action
- Send action

The pair editor logic for query params and headers also lives here.

### `src/components/ResponsePanel.tsx`

Response display UI.

Responsibilities:

- Loading state
- Empty state
- Error state
- Response status/timing/size
- Response body output
- Header output
- Summary output
- Copy actions

### `src/components/HistoryPanel.tsx`

Displays local request history and allows restoring a previous request into the editor.

History is intentionally local-only and not synced anywhere.

### `src/lib/http.ts`

The core request execution layer.

Responsibilities:

- Validate and build the URL
- Add enabled query params
- Normalize headers
- Add `Content-Type: application/json` automatically when appropriate
- Validate JSON request bodies
- Execute the browser `fetch()`
- Parse response body as text
- Parse JSON when possible
- Capture timing and response size
- Return normalized `ResponseData`
- Throw user-facing request errors for invalid URL, invalid JSON, and likely CORS/network failures

This is the most important file for networking behavior.

### `src/lib/storage.ts`

Local persistence layer.

Responsibilities:

- Save/load request draft
- Save/load request history
- Save/load theme preference
- Limit history size

All persistence currently uses `localStorage`.

### `src/types/api.ts`

Shared application types.

Key types:

- `RequestDraft`
- `ExecutedRequest`
- `ResponseData`
- `ApiErrorState`
- `KeyValuePair`

When adding features, update the types here first if the shape of app data changes.

### `src/styles.css`

Global styling and layout rules.

Design goals:

- compact layout
- minimal chrome
- readable monospace request/response areas
- subtle cards and borders
- dark/light theme support

This file is intentionally plain CSS to keep the project lightweight.

### `.github/workflows/deploy.yml`

GitHub Pages deployment workflow.

Responsibilities:

- install dependencies
- build the app
- upload the Pages artifact
- deploy automatically on pushes to `main`

### `vite.config.ts`

Handles Vite configuration, especially the `base` path used for GitHub Pages.

Important detail:

- For project pages like `username.github.io/example-rest-tool`, the app needs a repo-specific base path during the GitHub Actions build
- For user pages like `username.github.io`, the base path should stay `/`

## Known Constraints

Because the app is browser-only:

- CORS restrictions apply
- Hidden API secrets are not possible
- OAuth and advanced auth flows are out of scope for the current design
- Some APIs may require a backend proxy in the future

## Good Future Improvements

Reasonable next steps:

- Saved collections
- Environment variables stored locally
- Import/export request sets
- Better request body editing
- URL share links
- Better error classification
- Optional proxy backend for private APIs

## Working Notes For Future Changes

When modifying this app later, keep these principles:

- Prefer small, understandable components
- Keep the app browser-first unless a backend is explicitly introduced
- Do not add secrets to the repo
- Preserve the lightweight feel of the current UI
- Keep GitHub Pages compatibility in mind
- Validate both `npm run lint` and `npm run build` after meaningful changes
