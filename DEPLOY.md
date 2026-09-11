# Deployment Plan (no actual deployment required)

## Frontend
- **Host:** Vercel (or Netlify) — deploy the `frontend/` directory as a
  static Vite build (`npm run build` → `dist/`).
- Vercel auto-detects the Vite framework preset; build command
  `npm run build`, output directory `dist`.

## Backend
- **Host:** Render (or Railway) — deploy `backend/` as a Node web service.
  Start command: `npm start`. These platforms handle Express apps with file
  uploads (using ephemeral disk, which is fine since uploaded files are
  deleted immediately after processing) without extra config.
- If persistent scan history were added later (MongoDB bonus), a small
  managed instance like MongoDB Atlas free tier would sit alongside this.

## Environment variables

| Variable          | Where          | Example                                |
|--------------------|----------------|-----------------------------------------|
| `PORT`             | Backend host   | `5000` (or whatever the host assigns)   |
| `CORS_ORIGIN`      | Backend host   | `https://tender-scanner.vercel.app`     |
| `VITE_API_BASE_URL`| Frontend build | `https://tender-scanner-api.onrender.com` |

`VITE_API_BASE_URL` is baked in at build time (Vite convention), so it needs
to be set in the frontend host's build environment before `npm run build`
runs.

## Production API URL (example)

```
https://tender-scanner-api.onrender.com/api/scan
```

The frontend would call this via `VITE_API_BASE_URL` instead of
`http://localhost:5000`.
