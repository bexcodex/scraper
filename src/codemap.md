# src/

## Responsibility
Library source layer. Defines the public API and re-exports scraper modules.

## Design
Generated barrel file pattern. `src/index.ts` is produced by `scripts/generate-exports.ts` and re-exports source modules without hand-maintained wiring.

The source layer also contains runtime-validated scraper implementations. Validation is handled in the scraper module itself, not in the barrel.

## Flow
1. Source files are added under `src/` or `src/scrapers/`.
2. `npm run generate:exports` scans `src/**/*.ts` and `src/scrapers/**/*.ts`.
3. `src/index.ts` is rewritten with export statements.
4. `tsup` consumes `src/index.ts` and the scraper entries for ESM/CJS output.

## Integration
- Consumed by: package entrypoints in `package.json` and the tsup build.
- Depends on: `scripts/generate-exports.ts`, `src/scrapers/*.ts`.
