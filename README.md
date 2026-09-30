# NuxGame-Wikipedia-AQA

Playwright + TypeScript project that automates **TC-WIKI-001**: an authenticated Wikipedia user switches the interface language from English to German.

## Automated test case

**TC-WIKI-001. Successful switch of the Wikipedia interface language by an authenticated user**

**Preconditions**
- User is registered and authenticated in Wikipedia.
- The user's interface language is set to English.

**Steps and expected results**

| # | Step | Expected result |
|---|------|-----------------|
| 1 | Open Wikipedia. | The main page is opened, the user is logged in, the interface is in English. |
| 2 | Open the user menu and select Preferences. | The Preferences page (`Special:Preferences`) is opened. |
| 3 | Open User profile. | The User profile tab is selected. |
| 4 | Open Internationalisation and the interface language selector. | The Internationalisation section is displayed, the language list is opened. |
| 5 | Select German (Deutsch). | `de · Deutsch` is selected, the Save button is enabled. |
| 6 | Click Save. | The preferences are saved and the Preferences page is reloaded. |
| 7 | Verify the Wikipedia interface is displayed in German. | `<html lang="de">`, the heading is "Einstellungen", the tab "Benutzerdaten" is visible. |

The test changes a saved setting of the account, so the interface language is set back to English after the test.

## Project structure

```
tests/
  change-interface-language.spec.ts   functional test (TC-WIKI-001)
  auth.setup.ts                       Playwright setup: authentication and initial state, not a business test
pages/                                Page Objects
config/test-data.ts                   test data
playwright.config.ts                  Playwright configuration
Dockerfile, docker-compose.yml        Docker execution
```

## Prerequisites

- Node.js 20.12 or newer (tested with Node.js 24)
- Docker Desktop (only for running in Docker)
- A Wikipedia test account with valid credentials

## Environment setup

Copy `.env.example` to `.env` and fill in the credentials of the test account:

```
WIKI_USERNAME=
WIKI_PASSWORD=
```

Real credentials stay only in the local `.env`, which is in `.gitignore` and must not be committed.

## Run locally

```powershell
npm ci
npx playwright install chromium
npm test
```

Other commands:

```powershell
npm run test:headed   # run with a visible browser
npm run test:report   # open the HTML report
```

## Run in Docker

Requires the `.env` file described above. It is passed to the container with `env_file` and is not copied into the image.

```powershell
docker compose build
docker compose run --rm playwright
```

## Report

The HTML report is created in `playwright-report/index.html`.
When running in Docker, `./playwright-report/` is mounted as a volume, so the report is saved on the host machine.

## Authentication

`tests/auth.setup.ts` runs before the test: it logs in with `WIKI_USERNAME` and `WIKI_PASSWORD`, checks that the session is authenticated, sets English as the initial interface language and saves the Playwright storage state to `playwright/.auth/user.json`.

`playwright/.auth/` and `.env` are in `.gitignore`.

If Wikipedia shows an additional verification step (hCaptcha) during login, the setup fails with a message about it.
