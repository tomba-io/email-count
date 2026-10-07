# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.0.0 (2026-10-07)

### ⚠ BREAKING CHANGES

- `tombaApiKey` and `tombaApiSecret` inputs were removed. The Actor now uses built-in Tomba credentials from the `TOMBA_API_KEY` / `TOMBA_API_SECRET` environment variables, so users no longer need a Tomba account.

### Features

- Pay-per-event pricing: $0.00312 per billable request (`tomba-request`); errors, empty results and cache hits are free
- No client-side rate limit; parallel processing with `maxConcurrency`
- Automatic retries with exponential backoff for network errors, 429 and 5xx (`maxRetries`)
- Cross-run result cache (`useCache`, `cacheTtlHours`)
- Resume after migration or restart
- Domains are normalized and deduplicated
- Each dataset item now includes `charged` and `cached`
- Lookups that return no data now also produce a dataset item with `error`
- Real-time API (Apify Standby mode): `GET /?domain=…` or `POST /` with the run input returns results as JSON, with an OpenAPI web server schema
- Key-value store schema for the default store (`INPUT`, `TOMBA_STATE`)
- Default memory set to 256 MB

### Dependencies

- `tomba` upgraded to 1.1.1 (responses are now `{ data, rateLimit }`)
- `apify` upgraded to 3.7.2

### [0.0.3](https://github.com/tomba-io/email-count/compare/v0.0.2...v0.0.3) (2025-10-24)

### Features

- add input schema and dataset storage to actor configuration ([80f8d7a](https://github.com/tomba-io/email-count/commit/80f8d7ae900af6a5d67b57df65ca0885b0fc5f86))
- update version to 0.3 and remove unused views from dataset schema ([0421738](https://github.com/tomba-io/email-count/commit/04217383ebd211e555696bffed687ee17d3d2dcd))

### 0.0.2 (2025-10-20)
