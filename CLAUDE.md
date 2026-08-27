# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Install dependencies: `npm install`
- Run the service: `npm start` (or `node index.js`)
- Run tests: `npm test` (Jest). `index.test.js` uses `supertest` to hit the app in-process and `nock` to mock the TimeAPI call, so it needs no network access or running server.
- No build or lint scripts are currently defined in `package.json`.

## Architecture

Service A is a minimal single-file Express HTTP service (`index.js`). It exposes one endpoint, `GET /hello/:name`, which calls the external TimeAPI (`https://timeapi.io/api/time/current/zone`) via `axios` to fetch the current time in the `Europe/Berlin` zone and returns a greeting combining `:name` with that time.

`index.js` exports the Express `app` (`module.exports = app`) and only calls `app.listen` when run directly (`require.main === module`), which is what lets `index.test.js` import and exercise the app with `supertest` without binding a port.

The server listens on `process.env.PORT`, defaulting to `3000`.

## Branch structure

This repo's branches build on each other, each adding deployment/CI capability on top of the last. Be aware of which branch you're on before assuming a capability (e.g. Docker, GitHub workflows, tests) is present — check each branch's own `package.json`, `.github/workflows/`, and `CLAUDE.md`, since they can drift out of sync with what's described here.

- **`main`** — the pure Node app only. No CI, no Docker, no deployment config, no tests.
- **`cicd`** (based on `main`) — adds `.github/workflows/build.yml`: on every push, runs a Snyk vulnerability scan (SARIF upload to GitHub Code Scanning) and a `node-build` job (`npm ci` then `npm test`). Also adds the Jest/`supertest`/`nock` test (`index.test.js`), the `index.js` testability refactor described above, and the `test` script + `jest`/`nock`/`supertest` devDependencies in `package.json`. Bumped `express` to `^5.2.1`, `axios` to `^1.20.0`, and Actions versions (`checkout@v7`, `setup-node@v7` on Node 24, `snyk/actions/node@v1`, `codeql-action/upload-sarif@v4`).
- **`docker`** (based on `cicd`) — adds a `Dockerfile` (`node:24-slim`, `npm ci`, entrypoint `node index.js`) and extends `build.yml` with a `docker-build` job (runs only after `security`/`node-build` succeed) that builds (not pushes) the image via `docker/build-push-action`.
- **`app-engine`** (based on `cicd`, merged up to date as of PR #79 — not based on `docker`) — adds Google App Engine deployment: `app.yaml` (`runtime: nodejs24`, `instance_class: F1`, service `service-a`, autoscaling 1-3 instances), `.gcloudignore`, and `.github/workflows/app-engine-deploy.yml`, which deploys on `v*` tag pushes via `google-github-actions/deploy-appengine@v3` (auth via `google-github-actions/auth@v3`) and then smoke-tests `GET /hello/test` against the deployed URL. Carries the same `build.yml`, tests, and dependency versions as `cicd`.
