# Music Downloader

A Next.js web app for discovering, searching, and playing songs, albums, artists, and playlists through the JioSaavn-compatible API at `saavn.sumit.co`.

## Features

- Search across songs, albums, artists, and playlists.
- Browse trending songs and popular artists.
- Play tracks, view item details, and download available audio.
- Keep the last song, search results, and favorites in browser storage.

## Requirements

- Node.js 20.9 or newer.
- npm.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The app uses the public upstream API directly and does not require a local API key.

## Available scripts

- `npm run dev` — start the development server.
- `npm run lint` — run ESLint with the Next.js Core Web Vitals rules.
- `npm run build` — create a production build.
- `npm start` — serve the production build.

## Production build

```bash
npm run build
npm start
```

The production build downloads the Outfit font from Google Fonts at build time.
