# src/scrapers/

## Responsibility
Scraper implementation layer. Holds per-source fetch and transform logic.

## Design
One module per scraper source. Current implementation is `tiktok.ts`, which exports the `tiktokdl` function and related TikTok response/result types.

## Flow
1. Caller imports `tiktokdl` from the package entrypoint.
2. `tiktokdl(url)` normalizes TikTok short links, extracts the media id, and calls the TikTok feed API.
3. The JSON response is parsed and mapped into a normalized result object.
4. Video and photo posts diverge into `video` or `image` output shapes.

## Integration
- Consumed by: `src/index.ts` export barrel.
- Depends on: `fetch`, TikTok API response shape, and `scripts/generate-exports.ts` for export wiring.
