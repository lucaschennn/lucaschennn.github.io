# skyview

Private admin tool for rearranging the photos on the portfolio site and publishing the change. Design: [ARCHITECTURE.md](ARCHITECTURE.md). Build plan and progress: [BUILD.md](BUILD.md).

Independent Next.js app, deployed to Vercel with **Root Directory = `skyview`**. It is not part of the main site's Vite build.

## Local dev

```sh
cp .env.example .env.local   # fill in values; never commit
npm install
npm run dev                  # http://localhost:3000 (must match the local OAuth app's callback)
```

`next start` locally needs `AUTH_TRUST_HOST=true`. `next dev` and Vercel trust the host automatically.

## Preview

`preview/` builds the site's own `src/` (React 18, the site's CSS) into `public/preview/` (gitignored) with the repo root's Vite. skyview shows it in an iframe and sends the draft registry via `postMessage`.

- Needs the site's dependencies installed at the repo root (`npm install` in the repo root).
- `npm run dev` and `npm run build` rebuild it first. After changing site code in `src/`, run `npm run build:preview` (or restart dev) to see it in the preview.
- On Vercel, `vercel-build` installs the root dependencies before building. This needs "Include files outside the root directory" on, and no custom Build Command in the Vercel settings (one would replace `vercel-build`).

## Auth

- `auth.js`: Auth.js (GitHub provider, `read:user` scope, PKCE). `signIn` only admits `ALLOWED_GITHUB_ID`.
- Every page and API route calls `requireUser()`, which re-checks the ID on the server. `app/api/me/route.js` is the template.
