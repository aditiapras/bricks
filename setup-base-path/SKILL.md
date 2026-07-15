---
name: setup-base-path
description: Setup Next.js base path untuk project yang sudah menggunakan setup-auth-convex. Update konfigurasi auth, middleware, dan env vars.
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - glob
---

# Setup Next.js Base Path

This skill configures Next.js base path for projects that have already been set up with the `setup-auth-convex` skill. Base path is useful when your app is deployed under a subpath (e.g., `/app`, `/portal`, `/dashboard`).

## When to Use This Skill

Use this skill when:
- Your Next.js app needs to be deployed under a subpath (not at the root domain)
- You're hosting multiple apps under the same domain (e.g., `example.com/app`, `example.com/portal`)
- Your reverse proxy or hosting provider requires a specific base path
- You've already completed the `setup-auth-convex` setup and now need to add base path support

## What This Setup Includes

**Next.js Configuration:**
- Adds `basePath` to `next.config.js` or `next.config.mjs`

**Environment Variables:**
- Adds `NEXT_PUBLIC_BASEPATH` to `.env.local`
- Keeps `NEXT_PUBLIC_BETTER_AUTH_URL` unchanged (still `http://localhost:3000`)

**Auth Configuration:**
- Updates `lib/auth-client.ts` baseURL to include base path
- **Does NOT change** `convex/betterAuth/auth.ts` (Convex auth runs on Convex, not Next.js)

**Middleware:**
- Updates all redirect URLs in `proxy.ts` to include base path

**URL Pattern:**
- Final auth URL: `NEXT_PUBLIC_BETTER_AUTH_URL` + `NEXT_PUBLIC_BASEPATH` + `/api/auth`
- Example: `http://localhost:3000` + `/app` + `/api/auth` = `http://localhost:3000/app/api/auth`

## Prerequisites

Before running this skill, verify:
- Skill `setup-auth-convex` has been run previously
- Auth files exist: `convex/betterAuth/auth.ts`, `lib/auth-client.ts`, `proxy.ts`, `middleware.ts`
- `next.config.js` or `next.config.mjs` exists

---

## Setup Steps

### Step 1: Get Base Path from User

Ask the user: "What base path do you want to use? (examples: /app, /portal, /dashboard)"

Save the user's answer as the variable `BASE_PATH`. Ensure the format starts with `/` and does NOT end with `/`.

**Examples:**
- ✅ `/app`
- ✅ `/portal`
- ✅ `/dashboard`
- ❌ `app` (missing leading `/`)
- ❌ `/app/` (trailing `/`)

---

### Step 2: Update Next.js Config

Check if `next.config.js` or `next.config.mjs` exists.

#### If `next.config.js` exists:

Read the file, then add `basePath` to the configuration. Preserve existing configuration.

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing configuration
  basePath: '/your-path', // Replace with BASE_PATH from user
};

module.exports = nextConfig;
```

#### If `next.config.mjs` exists:

Read the file, then add `basePath` to the configuration. Preserve existing configuration.

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing configuration
  basePath: '/your-path', // Replace with BASE_PATH from user
};

export default nextConfig;
```

#### If no config file exists:

Create `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/your-path', // Replace with BASE_PATH from user
};

module.exports = nextConfig;
```

**Why:** Next.js uses `basePath` to prefix all routes. This ensures your app works correctly when deployed under a subpath.

---

### Step 3: Update Convex Auth Config (baseURL)

**DO NOT change** `convex/betterAuth/auth.ts`. This file must continue to use:

```typescript
baseURL: process.env.SITE_URL + "/api/auth",
```

**Why:** Convex auth runs on the Convex backend, not on Next.js. The auth instance on Convex doesn't know about Next.js base path, so it should continue using the original `SITE_URL` without base path.

---

### Step 4: Add NEXT_PUBLIC_BASEPATH to .env.local

Read `.env.local`, then add the new environment variable:

```env
NEXT_PUBLIC_BASEPATH=/your-path
```

Replace `/your-path` with the `BASE_PATH` from the user.

**Why:** This environment variable is used by the client-side auth configuration to construct the correct auth URL.

---

### Step 5: Update Auth Client Config (baseURL)

Read `lib/auth-client.ts`, then update the `baseURL` to use `NEXT_PUBLIC_BETTER_AUTH_URL` + `NEXT_PUBLIC_BASEPATH`.

Find:
```typescript
export const authClient = createAuthClient({
    plugins: [
        // ... plugins
    ],
});
```

Replace with:
```typescript
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL! + process.env.NEXT_PUBLIC_BASEPATH + "/api/auth",
    plugins: [
        // ... plugins
    ],
});
```

Ensure `NEXT_PUBLIC_BETTER_AUTH_URL` exists in `.env.local` (default: `http://localhost:3000`).

**Why:** The client-side auth instance needs to know the full URL including the base path to make correct API requests to the auth endpoints.

---

### Step 6: Update Middleware Redirect URLs

Read `proxy.ts`, then update all redirect URLs to include the base path.

Find all lines like:
```typescript
return NextResponse.redirect(new URL("/", request.url));
return NextResponse.redirect(new URL("/sign-in", request.url));
return NextResponse.redirect(new URL("/onboarding", request.url));
// ... and other redirects
```

Replace all with:
```typescript
return NextResponse.redirect(new URL("/your-path/", request.url));
return NextResponse.redirect(new URL("/your-path/sign-in", request.url));
return NextResponse.redirect(new URL("/your-path/onboarding", request.url));
// ... and other redirects with base path prepended
```

Ensure all redirect URLs in `proxy.ts` are updated to include the base path.

**Why:** Middleware redirects need to include the base path so users are redirected to the correct URLs when the app is under a subpath.

---

### Step 7: Update Convex Environment Variables

**DO NOT change** Convex environment variables. `SITE_URL` should remain `http://localhost:3000` without the base path.

**Why:** As mentioned in Step 3, Convex auth runs on the Convex backend and doesn't need to know about Next.js base path.

---

### Step 8: Restart Dev Server

After all configurations are updated, restart the dev server:

```bash
# Stop the running server (Ctrl+C)
bun run dev
```

**Why:** Next.js needs to pick up the new `basePath` configuration from `next.config.js`. The dev server must be restarted for this to take effect.

---

## Verification

After all updates:

1. **Test base path access:**
   - Open browser and access `http://localhost:3000/your-path/` — should redirect to `/your-path/sign-in`
   - Access `http://localhost:3000/your-path/sign-in` — should show sign-in page

2. **Test redirects:**
   - Verify all redirects work correctly with the base path
   - Try accessing protected routes and verify redirect behavior

3. **Check for errors:**
   - Run `bun run build` to check for TypeScript errors
   - Check browser console for any auth-related errors

---

## Common Issues & Troubleshooting

**Issue:** Pages return 404 after setting base path
- **Solution:** Ensure `basePath` in `next.config.js` is correct and doesn't have a trailing `/`. Restart the dev server.

**Issue:** Auth requests fail with 404
- **Solution:** Check that `lib/auth-client.ts` has the correct `baseURL` with both `NEXT_PUBLIC_BETTER_AUTH_URL` and `NEXT_PUBLIC_BASEPATH`. Verify `NEXT_PUBLIC_BASEPATH` is set in `.env.local`.

**Issue:** Middleware redirects to wrong URLs
- **Solution:** Check that all redirect URLs in `proxy.ts` include the base path. Ensure the format is `/your-path/route` not `/your-path//route`.

**Issue:** Convex auth still tries to use base path
- **Solution:** Ensure `convex/betterAuth/auth.ts` was NOT changed. It should still use `process.env.SITE_URL + "/api/auth"` without base path.

**Issue:** `NEXT_PUBLIC_BASEPATH` is undefined
- **Solution:** Add `NEXT_PUBLIC_BASEPATH=/your-path` to `.env.local` and restart the dev server.

**Issue:** Static assets (images, fonts) fail to load
- **Solution:** Next.js automatically handles base path for static assets. If you're manually referencing URLs, ensure they include the base path or use relative paths.

---

## Tips

- **Restart dev server** after changing `next.config.js` — changes won't take effect without a restart
- **Use consistent base path** — once set, avoid changing it frequently as it requires multiple file updates
- **Test in production** — base path behavior can differ between development and production environments
- **Document your base path** — note the base path in your project README for other developers
- **Check reverse proxy config** — if using a reverse proxy (nginx, Apache), ensure it's configured to handle the base path correctly

---

## Notes

- Every time you change the base path, you need to update: `next.config.js`, `lib/auth-client.ts`, `proxy.ts`, and `NEXT_PUBLIC_BASEPATH` in `.env.local`
- **DO NOT change** `convex/betterAuth/auth.ts` or Convex environment variables — Convex auth runs on Convex, not Next.js
- `NEXT_PUBLIC_BETTER_AUTH_URL` should remain `http://localhost:3000` without the base path
- Redirect URLs in `proxy.ts` must be consistent with the base path that is set
- URL pattern: `NEXT_PUBLIC_BETTER_AUTH_URL` + `NEXT_PUBLIC_BASEPATH` + `/api/auth`
- This setup follows the Better Auth + Convex integration pattern where the auth instance runs on Convex (no base path) while the Next.js client needs to include the base path in its requests
