---
name: setup-auth-convex
description: Setup Better Auth + Convex integration untuk Next.js. Termasuk plugins username, admin, organization, route groups (auth)/(main), middleware, dan permission system.
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - glob
---

# Setup Better Auth + Convex Integration

This skill sets up a complete authentication system using Better Auth integrated with Convex for Next.js projects. It includes role-based access control, organization management, and proper route structure.

## When to Use This Skill

Use this skill when:
- Starting a new Next.js project with Convex backend that needs authentication
- Setting up a project template that includes auth, roles, and organizations
- Need a complete auth system with role-based permissions (root, admin, teamAdmin, user)
- Want to use Better Auth plugins: username, admin, organization
- Need route groups to separate auth pages (sign-in, sign-up) from main app pages

## What This Setup Includes

**Better Auth Integration:**
- Convex adapter for Better Auth
- Email & password authentication
- Additional user field: `mustChangePassword` (for onboarding flow)

**Plugins:**
- `username` — User can have custom username
- `admin` — Role-based access control with 4 roles: root, admin, teamAdmin, user
- `organization` — Team/organization management with teams enabled

**Permission System:**
- Default resources: orgs, users, settings
- Custom roles with different access levels
- Access control using Better Auth's admin plugin

**Next.js Structure:**
- Route group `(auth)` — pages without shared layout (sign-in, sign-up, onboarding)
- Route group `(main)` — pages with shared layout (sidebar/navbar)
- Middleware for redirect rules and auth protection

**Files Created:**
- `convex/auth.config.ts` — Convex auth provider config
- `convex/betterAuth/` — Better Auth component (auth.ts, schema.ts, adapter.ts, convex.config.ts)
- `lib/auth-permission.ts` — Role and permission definitions
- `lib/auth-client.ts` — Client-side auth instance
- `lib/auth-server.ts` — Server-side auth helpers
- `app/api/auth/[...all]/route.ts` — Auth API routes
- `app/api/ConvexClientProvider.tsx` — Convex provider wrapper
- `proxy.ts` + `middleware.ts` — Middleware for auth protection
- Route groups: `(auth)` and `(main)` with layouts and pages

## Prerequisites

Before running this skill, verify:
- Next.js App Router + TypeScript is already set up
- Shadcn/ui is installed and initialized
- Convex is set up (`convex/` directory exists)
- `convex dev` has been run at least once (`convex/_generated/` exists)
- Package manager: `bun`

---

## Setup Steps

### Step 1: Install Packages

Install Better Auth and the Convex integration:

```bash
bun add better-auth @convex-dev/better-auth
```

**Why:** These packages provide the core auth functionality and the Convex adapter that connects Better Auth to your Convex backend.

---

### Step 2: Configure Environment Variables

Set up environment variables in Convex (for the auth instance running on Convex):

```bash
bunx convex env set BETTER_AUTH_SECRET $(bunx auth secret)
bunx convex env set SITE_URL http://localhost:3000
```

Ensure `.env.local` has these variables (these are for Next.js):

```env
CONVEX_DEPLOYMENT=dev:adjective-animal-123

NEXT_PUBLIC_CONVEX_URL=https://adjective-animal-123.convex.cloud

# Same as NEXT_PUBLIC_CONVEX_URL but with .site at the end
NEXT_PUBLIC_CONVEX_SITE_URL=https://adjective-animal-123.convex.site

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Why:** `BETTER_AUTH_SECRET` is used for encryption and hash generation. `SITE_URL` is used by the auth instance running on Convex. The Next.js env vars are for the frontend to connect to Convex.

---

### Step 3: Create Convex Auth Config

Create `convex/auth.config.ts` to register Better Auth as an auth provider in Convex:

```typescript
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
```

**Why:** This tells Convex to use Better Auth as the authentication provider.

---

### Step 4: Setup Convex Component

#### 4a. Create Component Definition

Create `convex/betterAuth/convex.config.ts` to define the Better Auth component:

```typescript
import { defineComponent } from "convex/server";

const component = defineComponent("betterAuth");

export default component;
```

#### 4b. Register Component

Check if `convex/convex.config.ts` exists:
- **If exists:** Add the import and `app.use(betterAuth)` to it
- **If not exists:** Create it with:

```typescript
import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";

const app = defineApp();
app.use(betterAuth);

export default app;
```

**Why:** Convex uses a component system. This registers the Better Auth component so it can be used in your Convex functions.

---

### Step 5: Create Permission System

Create `lib/auth-permission.ts` with role-based access control:

```typescript
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

// Default resources: orgs, users, settings
// TODO: Add custom resources based on your project features
// Example: orders: ["create", "read", "update", "delete"],
const statement = {
    ...defaultStatements,
    orgs: ["create", "read", "update", "delete"],
    users: ["create", "read", "update", "delete"],
    settings: ["read", "update"],
} as const;

const ac = createAccessControl(statement);

// Root: full access to all resources
export const root = ac.newRole({
    orgs: ["create", "read", "update", "delete"],
    users: ["create", "read", "update", "delete"],
    settings: ["read", "update"],
    ...adminAc.statements,
});

// Admin: can manage users but cannot create/delete orgs
export const admin = ac.newRole({
    orgs: ["read", "update"],
    users: ["create", "read", "update", "delete"],
    settings: ["read", "update"],
});

// Team Admin: no access to orgs/users management pages
export const teamAdmin = ac.newRole({
    orgs: [],
    users: [],
    settings: ["read", "update"],
});

// User: minimal access
export const user = ac.newRole({
    orgs: [],
    users: [],
    settings: ["read", "update"],
});

export { ac };
```

**Why:** This defines what each role can do. You'll need to update this file whenever you add new features to your project.

---

### Step 6: Create Auth Client

Create `lib/auth-client.ts` for client-side auth operations:

```typescript
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { usernameClient, adminClient, organizationClient } from "better-auth/client/plugins";
import { ac, root, admin, teamAdmin, user } from "./auth-permission";

export const authClient = createAuthClient({
    plugins: [
        convexClient(),
        usernameClient(),
        adminClient({
            ac,
            roles: { root, admin, teamAdmin, user },
        }),
        organizationClient({
            teams: {
                enabled: true,
            },
        }),
    ],
});
```

**Why:** This is the client-side auth instance used in React components. It must have the same plugins and roles as the server-side config.

---

### Step 7: Create Auth Server Helpers

Create `lib/auth-server.ts` for server-side auth operations:

```typescript
import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});
```

**Why:** These helpers are used in server components, route handlers, and middleware to check auth status and fetch auth data.

---

### Step 8: Create Better Auth Instance

Create `convex/betterAuth/auth.ts`:

```typescript
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { admin, username, organization } from "better-auth/plugins";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";
import { ac, root, teamAdmin, user, admin as adminRole } from "@/lib/auth-permission";

// Better Auth Component
export const authComponent = createClient<DataModel, typeof schema>(
    components.betterAuth,
    {
        local: { schema },
        verbose: false,
    },
);

// Better Auth Options
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
    return {
        appName: "My App", // TODO: Change to your app name
        baseURL: process.env.SITE_URL,
        secret: process.env.BETTER_AUTH_SECRET,
        database: authComponent.adapter(ctx),
        user: {
            additionalFields: {
                mustChangePassword: {
                    type: "boolean",
                    defaultValue: true,
                    input: true,
                },
            },
            deleteUser: {
                enabled: true,
            },
        },
        emailAndPassword: {
            enabled: true,
            autoSignIn: false,
        },
        plugins: [
            convex({ authConfig }),
            username(),
            admin({
                ac,
                roles: { root, admin: adminRole, teamAdmin, user },
                defaultRole: "user",
            }),
            organization({
                teams: {
                    enabled: true,
                    allowRemovingAllTeams: false,
                },
            }),
        ],
    } satisfies BetterAuthOptions;
};

// For `auth` CLI
export const options = createAuthOptions({} as GenericCtx<DataModel>);

// Better Auth Instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
    return betterAuth(createAuthOptions(ctx));
};
```

**Why:** This is the server-side auth instance that runs on Convex. It defines the auth configuration including plugins, user fields, and options.

---

### Step 9: Generate Schema

**IMPORTANT:** Ensure `convex dev` is running before executing this command.

```bash
bunx auth generate --config ./convex/betterAuth/auth.ts --output ./convex/betterAuth/schema.ts
```

The file `convex/betterAuth/schema.ts` will be generated automatically. **Do not edit this file manually.**

**Why:** This generates the Convex schema based on your Better Auth configuration. You must re-run this whenever you change the auth configuration.

---

### Step 10: Create Adapter

Create `convex/betterAuth/adapter.ts`:

```typescript
import { createApi } from "@convex-dev/better-auth";
import { createAuthOptions } from "./auth";
import schema from "./schema";

export const {
  create,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
} = createApi(schema, createAuthOptions);
```

**Why:** These adapter functions are used in Convex functions to interact with the auth database.

---

### Step 11: Setup HTTP Router

Check if `convex/http.ts` exists:
- **If exists:** Add `authComponent.registerRoutes(http, createAuth)` to it
- **If not exists:** Create it with:

```typescript
import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./betterAuth/auth";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

export default http;
```

**Why:** This registers the auth HTTP routes on your Convex deployment so Next.js can proxy auth requests to Convex.

---

### Step 12: Create getCurrentUser Query

Create `convex/users.ts`:

```typescript
import { query } from "./_generated/server";
import { findOne } from "./betterAuth/adapter";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await findOne(ctx, {
      model: "user",
      where: [{ field: "id", value: identity.subject }],
    });

    return user;
  },
});
```

**Why:** This is a Convex query that fetches the current authenticated user. You'll use this in your app to get user data.

---

### Step 13: Setup Next.js API Route

Create `app/api/auth/[...all]/route.ts`:

```typescript
import { handler } from "@/lib/auth-server";

export const { GET, POST } = handler;
```

**Why:** This proxies auth requests from Next.js to your Convex deployment.

---

### Step 14: Create ConvexClientProvider

Create `app/api/ConvexClientProvider.tsx`:

```tsx
"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "@/lib/auth-client";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({
  children,
  initialToken,
}: {
  children: React.ReactNode;
  initialToken?: string | null;
}) {
  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient}
      initialToken={initialToken}
    >
      {children}
    </ConvexBetterAuthProvider>
  );
}
```

**Why:** This provider wraps your app to give React components access to Convex and auth functionality.

---

### Step 15: Update Root Layout

Read `app/layout.tsx` that already exists, then update it to wrap with ConvexClientProvider. Preserve existing font and metadata configuration. Only add the import and wrapping:

```tsx
import type { Metadata } from "next";
import { ConvexClientProvider } from "./api/ConvexClientProvider";
import { getToken } from "@/lib/auth-server";
import "./globals.css";

export const metadata: Metadata = {
  title: "My App", // Adjust as needed
  description: "My App Description", // Adjust as needed
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider initialToken={token}>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

**Why:** This ensures the auth provider is available throughout your app and the auth token is preloaded for SSR.

---

### Step 16: Create Route Groups

#### Group (auth) — pages without shared layout

Create `app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      {children}
    </main>
  );
}
```

Create `app/(auth)/sign-in/page.tsx`:

```tsx
// TODO: Implement sign-in form using authClient.signIn.emailAndPassword()
export default function SignInPage() {
  return <div>Sign In</div>;
}
```

Create `app/(auth)/sign-up/page.tsx`:

```tsx
// TODO: Implement sign-up form using authClient.signUp.emailAndPassword()
export default function SignUpPage() {
  return <div>Sign Up</div>;
}
```

Create `app/(auth)/onboarding/page.tsx`:

```tsx
// This page is shown when user.mustChangePassword === true
// TODO: Implement password change form
// After successful change, update mustChangePassword = false via authClient
export default function OnboardingPage() {
  return <div>Onboarding - Change Password</div>;
}
```

#### Group (main) — pages with shared layout (sidebar/navbar)

Create `app/(main)/layout.tsx`:

```tsx
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* TODO: Add sidebar/navbar here */}
      <main>{children}</main>
    </div>
  );
}
```

Create `app/(main)/page.tsx`:

```tsx
export default function HomePage() {
  return <div>Home</div>;
}
```

**Why:** Route groups allow you to have different layouts for auth pages and main app pages. The `(auth)` group is for pages without navigation, while `(main)` is for pages with shared layout.

---

### Step 17: Setup Middleware

Create `proxy.ts` in the **project root** (not in `app/`):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { fetchAuthQuery, isAuthenticated } from "./lib/auth-server";
import { api } from "./convex/_generated/api";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hasToken = await isAuthenticated();
    const user = await fetchAuthQuery(api.users.getCurrentUser);

    // If logged in and tries to access auth pages, redirect to home
    if (hasToken && (pathname === "/sign-in" || pathname === "/sign-up")) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // If not logged in, only allow access to sign-in and sign-up
    if (!hasToken && pathname !== "/sign-in" && pathname !== "/sign-up") {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // If mustChangePassword = true, force to onboarding
    if (hasToken && user?.mustChangePassword && pathname !== "/onboarding") {
        return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // If mustChangePassword = false, prevent access to onboarding
    if (hasToken && !user?.mustChangePassword && pathname === "/onboarding") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // TODO: Add role-based access control here
    // Example:
    // if (hasToken && user?.role) {
    //     const userRole = user.role as "root" | "admin" | "teamAdmin" | "user";
    //     const protectedRoutes = ["/users", "/orgs"];
    //     if (protectedRoutes.includes(pathname)) {
    //         if (!hasAccess(userRole, pathname)) {
    //             return NextResponse.redirect(new URL("/", request.url));
    //         }
    //     }
    // }

    return NextResponse.next();
}

export const config = {
    // TODO: Add all protected routes here
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

Create `middleware.ts` in the **project root**:

```typescript
import { proxy, config } from "./proxy";

export default proxy;
export { config };
```

**Why:** Middleware protects your routes and handles redirects based on auth status and user state (like mustChangePassword).

---

## After Setup

Once setup is complete:

1. **Test the auth flow:**
   - Visit `http://localhost:3000/` — should redirect to `/sign-in`
   - Visit `/sign-in` — should show sign-in page
   - Sign up a new user — should redirect to `/onboarding`
   - Change password on onboarding — should redirect to home

2. **Implement the TODO pages:**
   - Complete sign-in form in `app/(auth)/sign-in/page.tsx`
   - Complete sign-up form in `app/(auth)/sign-up/page.tsx`
   - Complete onboarding form in `app/(auth)/onboarding/page.tsx`
   - Add sidebar/navbar in `app/(main)/layout.tsx`

3. **Update permissions:**
   - Add custom resources to `lib/auth-permission.ts` based on your features
   - Update role permissions as needed

4. **Implement role-based access:**
   - Add `hasAccess` function and role checks in `proxy.ts`
   - Update matcher to include all protected routes

---

## Common Issues & Troubleshooting

**Issue:** TypeScript errors after running `bunx auth generate`
- **Solution:** Make sure `convex dev` is running. The generated schema depends on Convex types.

**Issue:** Auth requests fail with 404
- **Solution:** Ensure `convex/http.ts` has `authComponent.registerRoutes(http, createAuth)` and `app/api/auth/[...all]/route.ts` exists.

**Issue:** `isAuthenticated()` always returns false
- **Solution:** Check that `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL` are set correctly in `.env.local`.

**Issue:** Schema generation fails
- **Solution:** Make sure all imports in `convex/betterAuth/auth.ts` are correct and `lib/auth-permission.ts` exists.

**Issue:** User cannot access pages after login
- **Solution:** Check `proxy.ts` redirect logic and ensure the matcher includes the routes you're trying to access.

---

## Tips

- **Always run `convex dev`** when generating schema or making auth changes
- **Regenerate schema** whenever you modify `convex/betterAuth/auth.ts` (add plugins, change user fields, etc.)
- **Update permissions** in `lib/auth-permission.ts` whenever you add new features
- **Test auth flow** in development before deploying
- **Use `mustChangePassword`** for onboarding flows — new users must change their password before accessing the app
- **Keep plugin configs consistent** between `lib/auth-client.ts` and `convex/betterAuth/auth.ts`

---

## Notes

- `convex/betterAuth/schema.ts` is auto-generated via `bunx auth generate`. Do not edit manually.
- If you add/remove Better Auth plugins, re-run `bunx auth generate` to update the schema.
- `lib/auth-permission.ts` needs to be updated whenever you add new resources/features to your project.
- `proxy.ts` matcher needs to be adjusted to include all routes that need protection in this project.
- For role-based access control in middleware, implement the `hasAccess` logic according to your project needs.
