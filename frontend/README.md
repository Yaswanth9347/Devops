# DevDeploy Frontend (Vite + React)

Production-ready frontend for the DevDeploy platform.

## Requirements

- Node.js 18+
- npm 9+

## Environment

Copy `.env.example` to `.env` and set values as needed:

```bash
cp .env.example .env
```

Variables:

- `VITE_API_URL` — Backend base URL (example: `http://127.0.0.1:8001`)
- `VITE_APP_VERSION` — UI version label (example: `v1.0`)

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Build output is generated in `dist/`.

## Production Preview (Static)

```bash
npm run preview -- --host 0.0.0.0 --port 4173
```

Then open `http://localhost:4173`.

## Deployment Notes (Ubuntu / Docker)

- Serve the `dist/` folder via Nginx or any static file server.
- Set `VITE_API_URL` during build for target environment.
- Keep frontend container/image stateless and immutable.
