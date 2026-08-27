# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Install dependencies: `npm install`
- Run the service: `npm start` (or `node index.js`)
- No build, lint, or test scripts are currently defined in `package.json`.

## Architecture

Service A is a minimal single-file Express HTTP service (`index.js`). It exposes one endpoint, `GET /hello/:name`, which calls the external TimeAPI (`https://timeapi.io/api/time/current/zone`) via `axios` to fetch the current time in the `Europe/Berlin` zone and returns a greeting combining `:name` with that time.

The server listens on `process.env.PORT`, defaulting to `3000`.

## Branch structure

This repo's branches build on each other, each adding deployment/CI capability on top of the last. `index.js` (the app itself) is identical across all of them — only CI/deployment files differ. Be aware of which branch you're on before assuming a capability (e.g. Docker, GitHub workflows) is present.

- **`main`** — the pure Node app only. No CI, no Docker, no deployment config.
- **`cicd`** (based on `main`) — adds `.github/workflows/build.yml`: on every push, runs a Snyk vulnerability scan (SARIF upload to GitHub Code Scanning) and an `npm ci` build/install check.
- **`docker`** (based on `cicd`) — adds a `Dockerfile` (`node:20-slim`, `npm ci`, entrypoint `node index.js`) and extends `build.yml` with a `docker-build` job that builds (not pushes) the image via `docker/build-push-action`.
- **`app-engine`** (based on `cicd`, not `docker`) — adds Google App Engine deployment: `app.yaml` (`runtime: nodejs20`, service `service-a`, autoscaling 1-3 instances), `.gcloudignore`, and `.github/workflows/app-engine-deploy.yml`, which deploys on `v*` tag pushes via `google-github-actions/deploy-appengine` and then smoke-tests `GET /hello/test` against the deployed URL. Keeps its own copy of `build.yml` (same as `cicd`'s).
