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

## Auth

- `auth.js`: Auth.js (GitHub provider, `read:user` scope, PKCE). `signIn` only admits `ALLOWED_GITHUB_ID`.
- Every page and API route calls `requireUser()`, which re-checks the ID on the server. `app/api/me/route.js` is the template.
