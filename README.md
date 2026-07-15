# PSkills

Collection of Devin skills for various development tasks.

## Structure

```
pskills/
├── auth-skills/          # Better Auth + Convex related skills
│   ├── setup-auth-convex
│   ├── setup-base-path
│   ├── setup-auth-routes
│   └── setup-auth-functions
└── [other-skill-groups]/ # Future skill categories
```

## Auth Skills

Skills for setting up Better Auth with Convex integration in Next.js projects:

### setup-auth-convex
Complete Better Auth + Convex integration setup including:
- Plugins: username, admin, organization
- Permission system with role-based access control
- Route groups: (auth) and (main)
- Middleware for auth protection

**Install:**
```bash
bunx skills add aditiapras/pskills@auth-skills/setup-auth-convex
```

### setup-base-path
Next.js base path configuration for subpath deployments:
- Updates next.config.js with basePath
- Configures auth client with base path
- Updates middleware redirects

**Install:**
```bash
bunx skills add aditiapras/pskills@auth-skills/setup-base-path
```

### setup-auth-routes
Auth UI pages with form validation:
- Sign-in page with username/password
- Sign-up page with name, username, email, password
- Onboarding page for password change
- Uses shadcn/ui components

**Install:**
```bash
bunx skills add aditiapras/pskills@auth-skills/setup-auth-routes
```

### setup-auth-functions
Patterns for using Better Auth in Convex functions and React components:
- Server pattern: authComponent.getAuth, headers, role checking
- Client pattern: useQuery, useMutation, authClient
- Examples: listOrgs, listUsers, createOrg, updateUser

**Install:**
```bash
bunx skills add aditiapras/pskills@auth-skills/setup-auth-functions
```

## Usage Order

For a complete Better Auth + Convex setup:

1. Run `setup-auth-convex` first
2. Run `setup-auth-routes` for UI pages
3. Run `setup-base-path` if using subpath deployment
4. Reference `setup-auth-functions` when creating auth functions

## Contributing

To add new skills:
1. Create a new directory in the appropriate skill group
2. Add a `SKILL.md` file following the skill format
3. Update this README with the new skill

## License

MIT
