# Repository Atlas: scraper

## Project Responsibility
Small TypeScript scraper library for TikTok media metadata and download URLs.

The library exposes scraper functions through a generated barrel and uses runtime validation in the scraper layer.

## System Entry Points
- `package.json`: scripts, package metadata, Node/npm constraints.
- `src/index.ts`: generated public export surface.
- `scripts/generate-exports.ts`: regenerates `src/index.ts` from source files.
- `tsup.config.ts`: build entry discovery and bundle settings.

## Directory Map
| Directory | Responsibility Summary | Detailed Map |
|---|---|---|
| `src/` | Library source and public API surface. | [View Map](src/codemap.md) |
| `src/scrapers/` | Individual scraper implementations with runtime validation. | [View Map](src/scrapers/codemap.md) |
| `scripts/` | Code generation utilities. | [View Map](scripts/codemap.md) |

## Build Notes
- `build` runs `clean -> generate:exports -> tsup`.
- `src/index.ts` is generated; edit source files, then regenerate exports.
- `dist/` is build output only.
