# GitHub Pages REST Client

A lightweight REST client built with `React`, `Vite`, and `TypeScript`, designed to run entirely on `GitHub Pages`.

## What It Does

- Send `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` requests
- Edit query params, headers, and request bodies
- View response status, timing, size, headers, and body
- Store recent request history in `localStorage`
- Deploy automatically to GitHub Pages with GitHub Actions

## Important Browser Constraints

This project is frontend-only, so:

- The target API must allow browser requests through `CORS`
- You should not hardcode private API keys into the app or repository
- Runtime-pasted tokens are fine for testing, but hidden secrets require a backend proxy

## Local Development

### Requirements

- `Node.js` 24 or newer
- `npm`
- `Git` for pushing to GitHub

### Run Locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

### Production Build

```bash
npm run build
```

## GitHub Repository Setup

Create the repo and push the project:

```bash
git init
git add .
git commit -m "Initial REST client app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Recommended repo names:

- `example-rest-tool`
- `rest-client-pages`
- `YOUR_USERNAME.github.io` if you want a user site at the root domain

## GitHub Pages Setup

This project already includes the workflow at `.github/workflows/deploy.yml`.

After pushing the code:

1. Open the repository on GitHub.
2. Go to `Settings` -> `Pages`.
3. Under `Build and deployment`, choose `GitHub Actions`.
4. Push to `main` or re-run the workflow from the `Actions` tab.
5. Wait for the deployment job to finish.
6. Open the published Pages URL from the workflow summary or repo Pages settings.

## Vite Base Path Notes

The `vite.config.ts` file is already set up to handle both cases:

- A normal project repo like `https://github.com/you/example-rest-tool`
- A user site repo like `https://github.com/you/you.github.io`

For project repos, the correct `base` path is applied during GitHub Actions builds automatically.

## Good APIs For Testing

- `https://jsonplaceholder.typicode.com/posts/1`
- `https://httpbin.org/get`
- Any API you control with permissive CORS enabled

## Suggested Manual Test Cases

- `GET` with query params
- `POST` with a JSON body
- Invalid URL
- Invalid JSON body
- Non-JSON response bodies
- Requests blocked by CORS
- Refresh the page and confirm history is preserved
