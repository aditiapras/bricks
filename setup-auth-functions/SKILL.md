---
name: setup-auth-functions
description: Setup Better Auth functions untuk Convex (server) dan client. Termasuk pattern authComponent.getAuth, headers, role checking, dan contoh-contoh function umum.
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - glob
---

# Setup Better Auth Functions

This skill provides patterns and examples for using Better Auth in Convex functions (server-side) and in React components (client-side). It covers the specific pattern required for Convex integration where auth functions run on the Convex backend.

## When to Use This Skill

Use this skill when:
- You need to create Convex functions that use Better Auth APIs
- You need to check user roles or permissions in Convex functions
- You want to understand the correct pattern for using `auth.api` in Convex
- You need examples of common auth operations (list users, list organizations, etc.)
- You're implementing features that require auth checks on the server

## What This Pattern Includes

**Server-Side (Convex Functions):**
- Pattern for getting auth context with `authComponent.getAuth`
- Using `headers` when calling `auth.api` methods
- Role checking with manual checks or `hasPermission`
- Session validation
- Error handling for unauthorized access

**Client-Side (React Components):**
- Standard Better Auth client pattern
- Calling Convex functions with `useQuery`, `useMutation`
- Using `authClient` for client-side auth operations

**Common Function Examples:**
- `getSession` — Get current user session
- `listUsers` — List all users with role checking
- `listOrganizations` — List organizations with role checking
- `createOrganization` — Create organization with role checking
- `updateUser` — Update user with role checking

## Prerequisites

Before using this skill, verify:
- Skill `setup-auth-convex` has been run previously
- `convex/betterAuth/auth.ts` exists with `authComponent` and `createAuth` exported
- `lib/auth-permission.ts` exists with role definitions
- Convex functions are being created in the `convex/` directory

---

## Server-Side Pattern (Convex Functions)

### Basic Pattern

The key pattern for using Better Auth in Convex functions is:

```typescript
import { query } from "./_generated/server";
import { authComponent, createAuth } from "./betterAuth/auth";

export const myFunction = query({
  args: {},
  handler: async (ctx) => {
    // 1. Get auth context and headers
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    // 2. Get session using headers
    const session = await auth.api.getSession({ headers });
    if (!session) {
      return null; // or throw error
    }

    // 3. Check role or permissions
    const userRole = session.user.role;
    if (userRole !== "root" && userRole !== "admin") {
      throw new Error("Not authorized");
    }

    // 4. Call auth.api methods with headers
    const data = await auth.api.someMethod({ headers });
    return data;
  },
});
```

**Why:** Convex functions run on the Convex backend, so we need to use `authComponent.getAuth` to get the auth context and headers. The headers are required for all `auth.api` calls to work correctly in the Convex environment.

---

### Example: List Organizations

Create `convex/orgs.ts`:

```typescript
import { query } from "./_generated/server";
import { authComponent, createAuth } from "./betterAuth/auth";

export const listOrgs = query({
    args: {},
    handler: async (ctx) => {
        const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

        const session = await auth.api.getSession({ headers });
        if (!session) {
            return null;
        }

        const userRole = session.user.role;
        if (userRole !== "root" && userRole !== "admin") {
            throw new Error("You are not allowed to list organizations");
        }

        const data = await auth.api.listOrganizations({
            headers,
        });
        return data;
    },
});
```

**Why:** This function lists organizations but only allows root and admin users to access it. It checks the session first, then validates the role before calling the API.

---

### Example: List Users

Create `convex/users.ts`:

```typescript
import { query } from "./_generated/server";
import { authComponent, createAuth } from "./betterAuth/auth";

export const listUsers = query({
    args: {},
    handler: async (ctx) => {
        const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

        const session = await auth.api.getSession({ headers });
        if (!session) {
            return null;
        }

        const userRole = session.user.role;
        if (userRole !== "root" && userRole !== "admin") {
            throw new Error("You are not allowed to list users");
        }

        const data = await auth.api.listUsers({
            headers,
        });
        return data;
    },
});
```

**Why:** Similar to listOrgs, this function lists users with role-based access control.

---

### Example: Create Organization

Create `convex/orgs.ts` (add to existing file):

```typescript
import { mutation } from "./_generated/server";
import { authComponent, createAuth } from "./betterAuth/auth";
import { v4 } from "uuid";

export const createOrg = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
    },
    handler: async (ctx, args) => {
        const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

        const session = await auth.api.getSession({ headers });
        if (!session) {
            throw new Error("Not authenticated");
        }

        const userRole = session.user.role;
        if (userRole !== "root" && userRole !== "admin") {
            throw new Error("You are not allowed to create organizations");
        }

        const data = await auth.api.createOrganization({
            headers,
            body: {
                name: args.name,
                slug: args.slug,
            },
        });
        return data;
    },
});
```

**Why:** This is a mutation that creates an organization. It uses `mutation` instead of `query` and validates the user's role before allowing the operation.

---

### Example: Using hasPermission

For more granular permission checking, you can use `hasPermission` from the access control system:

```typescript
import { query } from "./_generated/server";
import { authComponent, createAuth } from "./betterAuth/auth";
import { ac } from "@/lib/auth-permission";

export const listOrgs = query({
    args: {},
    handler: async (ctx) => {
        const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

        const session = await auth.api.getSession({ headers });
        if (!session) {
            return null;
        }

        const userRole = session.user.role;

        // Check if user has permission to read orgs
        const hasPermission = ac.can(userRole).read("orgs");
        if (!hasPermission) {
            throw new Error("You are not allowed to list organizations");
        }

        const data = await auth.api.listOrganizations({
            headers,
        });
        return data;
    },
});
```

**Why:** Using `hasPermission` provides more granular control based on the permission system defined in `lib/auth-permission.ts`. This is better than hardcoding role checks.

---

### Example: Get Current User

Create `convex/users.ts` (add to existing file):

```typescript
import { query } from "./_generated/server";
import { authComponent, createAuth } from "./betterAuth/auth";

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

        const session = await auth.api.getSession({ headers });
        if (!session) {
            return null;
        }

        return session.user;
    },
});
```

**Why:** This is a simple function to get the current authenticated user without role checking. Useful for displaying user info.

---

### Example: Update User

Create `convex/users.ts` (add to existing file):

```typescript
import { mutation } from "./_generated/server";
import { authComponent, createAuth } from "./betterAuth/auth";
import { v4 } from "uuid";

export const updateUser = mutation({
    args: {
        userId: v.string(),
        name: v.optional(v.string()),
        role: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

        const session = await auth.api.getSession({ headers });
        if (!session) {
            throw new Error("Not authenticated");
        }

        const userRole = session.user.role;

        // Only root and admin can update users
        if (userRole !== "root" && userRole !== "admin") {
            throw new Error("You are not allowed to update users");
        }

        // Only root can change roles
        if (args.role && userRole !== "root") {
            throw new Error("Only root can change user roles");
        }

        const data = await auth.api.updateUser({
            headers,
            body: {
                userId: args.userId,
                ...args,
            },
        });
        return data;
    },
});
```

**Why:** This function demonstrates nested permission checks — admin can update users but only root can change roles.

---

## Client-Side Pattern (React Components)

### Calling Convex Functions

On the client side, you call Convex functions using the standard Convex React hooks:

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function OrgsPage() {
  const orgs = useQuery(api.orgs.listOrgs);

  if (orgs === undefined) {
    return <div>Loading...</div>;
  }

  if (orgs === null) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h1>Organizations</h1>
      <ul>
        {orgs.map((org) => (
          <li key={org.id}>{org.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

**Why:** Convex functions are called with `useQuery` for queries and `useMutation` for mutations. The server-side auth checks handle authorization, so the client just needs to handle loading and error states.

---

### Using Mutations

```tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function CreateOrgForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const createOrg = useMutation(api.orgs.createOrg);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrg({ name, slug });
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Organization name"
      />
      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="Slug"
      />
      <button type="submit">Create</button>
    </form>
  );
}
```

**Why:** Mutations are called with `useMutation`. The server-side function handles authorization, so the client just needs to handle the result or error.

---

### Using authClient for Client-Side Auth

For client-side auth operations (sign in, sign out, etc.), use the `authClient`:

```tsx
"use client";

import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const handleSignOut = async () => {
    await authClient.signOut();
    // Redirect or handle sign out
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

**Why:** `authClient` is used for client-side auth operations that don't require Convex functions. This follows the standard Better Auth client pattern.

---

## Common Patterns

### Pattern 1: Session Check + Role Check

```typescript
const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
const session = await auth.api.getSession({ headers });
if (!session) {
  return null; // or throw error
}
const userRole = session.user.role;
if (userRole !== "root" && userRole !== "admin") {
  throw new Error("Not authorized");
}
```

### Pattern 2: Session Check + hasPermission

```typescript
const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
const session = await auth.api.getSession({ headers });
if (!session) {
  return null;
}
const userRole = session.user.role;
const hasPermission = ac.can(userRole).read("orgs");
if (!hasPermission) {
  throw new Error("Not authorized");
}
```

### Pattern 3: Self-Access Check (Users can only access their own data)

```typescript
const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
const session = await auth.api.getSession({ headers });
if (!session) {
  return null;
}
const currentUserId = session.user.id;
const targetUserId = args.userId;
if (currentUserId !== targetUserId && session.user.role !== "root") {
  throw new Error("Not authorized");
}
```

---

## File Organization

Recommended file organization for auth functions:

```
convex/
├── users.ts          // User-related functions (getCurrentUser, listUsers, updateUser)
├── orgs.ts           // Organization-related functions (listOrgs, createOrg)
├── teams.ts          // Team-related functions
├── auth.ts           // Auth helper functions
└── betterAuth/       // Better Auth component (from setup-auth-convex)
    ├── auth.ts
    ├── schema.ts
    ├── adapter.ts
    └── convex.config.ts
```

**Why:** Organizing functions by domain (users, orgs, teams) makes the codebase easier to navigate and maintain.

---

## Error Handling

### Server-Side Error Handling

```typescript
export const myFunction = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
      const session = await auth.api.getSession({ headers });
      if (!session) {
        throw new Error("Not authenticated");
      }

      // ... rest of the logic
    } catch (error) {
      console.error("Function error:", error);
      throw error; // Re-throw to let client handle it
    }
  },
});
```

### Client-Side Error Handling

```tsx
const orgs = useQuery(api.orgs.listOrgs);

if (orgs === undefined) {
  return <div>Loading...</div>;
}

if (orgs instanceof Error) {
  return <div>Error: {orgs.message}</div>;
}
```

**Why:** Proper error handling ensures that both server and client can gracefully handle failures.

---

## Tips

- **Always use headers** — Never forget to pass `headers` when calling `auth.api` methods in Convex functions
- **Check session first** — Always validate the session before checking roles or permissions
- **Use hasPermission** — Prefer `hasPermission` over hardcoded role checks for better maintainability
- **Handle null returns** — Decide whether to return `null` or throw errors for unauthorized access based on your use case
- **Organize by domain** — Group related functions in the same file (users.ts, orgs.ts, etc.)
- **Test role checks** — Verify that role-based access control works correctly in development
- **Log errors** — Add error logging in Convex functions for debugging

---

## Common Issues & Troubleshooting

**Issue:** `authComponent.getAuth` is undefined
- **Solution:** Ensure you're importing from the correct path: `./betterAuth/auth`. Check that `authComponent` and `createAuth` are exported in that file.

**Issue:** `auth.api` methods fail with "headers required" error
- **Solution:** Make sure you're passing the `headers` object from `authComponent.getAuth` to all `auth.api` calls.

**Issue:** Session is always null
- **Solution:** Check that the user is authenticated on the client side. Verify that the auth token is being passed correctly to Convex.

**Issue:** Role checks don't work
- **Solution:** Ensure the role field is set correctly in the user data. Check that the role names match what's defined in `lib/auth-permission.ts`.

**Issue:** hasPermission always returns false
- **Solution:** Verify that the permission system is set up correctly in `lib/auth-permission.ts`. Check that the resource and action names match.

**Issue:** TypeScript errors with `auth.api`
- **Solution:** Ensure the Better Auth types are correctly imported. Check that the schema has been generated with `bunx auth generate`.

---

## Notes

- The pattern `{ auth, headers } = await authComponent.getAuth(createAuth, ctx)` is specific to Convex integration
- Always pass `headers` to `auth.api` methods in Convex functions
- Client-side auth operations use the standard `authClient` pattern from Better Auth
- Convex functions are called with `useQuery` and `useMutation` hooks on the client
- Role-based access control can be implemented with manual checks or `hasPermission`
- The permission system defined in `lib/auth-permission.ts` is used for granular access control
- Error handling should be implemented on both server and client sides
