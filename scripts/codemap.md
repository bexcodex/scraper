# scripts/

## Responsibility
Build-time utility scripts.

## Design
Single-purpose code generation script. `generate-exports.ts` scans source files and writes the generated barrel file at `src/index.ts`.

## Flow
1. Script reads `src/` and `src/scrapers/`.
2. It filters out `index.ts`.
3. It emits export lines for every discovered `.ts` module.
4. It writes the regenerated `src/index.ts`.

## Integration
- Consumed by: `npm run generate:exports` and the build pipeline.
- Writes to: `src/index.ts`.
