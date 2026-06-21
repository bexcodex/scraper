# @bexcodex/scraper

A small TypeScript scraper library

## Install

```bash
npm install @bexcodex/scraper
```

```bash
pnpm add @bexcodex/scraper
```

```bash
yarn add @bexcodex/scraper
```

```bash
bun add @bexcodex/scraper
```

## Usage

### ESM / TypeScript

```ts
import { tiktokdl } from '@bexcodex/scraper'

const media = await tiktokdl('https://www.tiktok.com/@user/video/1234567890')

console.log(media.author.username)
console.log(media.video?.download_url)
```

### CommonJS

```js
const { tiktokdl } = require('@bexcodex/scraper')

const media = await tiktokdl('https://www.tiktok.com/@user/video/1234567890')
```

## Development

```bash
npm install
npm run build
npm run typecheck
```

| Script | Description |
| --- | --- |
| `npm run build` | Generate exports and build ESM, CJS, and types |
| `npm run typecheck` | Run TypeScript checks |
| `npm run clean` | Remove `dist` |
| `npm run generate:exports` | Regenerate `src/index.ts` |

## Requirements

- Node.js `>=18.18`
- TypeScript supported out of the box
- Bun supported out of the box

## License

MIT
