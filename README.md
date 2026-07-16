# Bricks

Collection of reusable development resources including Devin skills and shadcn/ui components for Next.js projects.

## Overview

Bricks provides two main types of reusable resources:

1. **Devin Skills** - Automated setup scripts for common development tasks
2. **Shadcn Components** - Reusable React components accessible via shadcn CLI

## Structure

```
bricks/
├── skills/               # Devin skills for automation
│   └── auth-skills/     # Better Auth + Convex related skills
│       ├── setup-auth-convex
│       ├── setup-base-path
│       ├── setup-auth-routes
│       └── setup-auth-functions
├── components/          # Reusable shadcn/ui components
│   ├── sidebar/         # Advanced sidebar with role-based navigation
│   ├── breadcrumb/      # Dynamic breadcrumb component
│   ├── data-table/      # Feature-rich data table
│   └── layout.tsx       # Complete application layout
└── registry.json        # Shadcn registry configuration
```

## Shadcn Components

Reusable React components accessible via shadcn CLI. These components are designed to be generic and customizable for various Next.js projects.

### Available Components

#### Sidebar
A comprehensive sidebar component with role-based menu filtering, team switcher, and user management. Features collapsible navigation, custom menu items, and user profile dropdown.

**Install:**
```bash
bunx shadcn@latest add aditiapras/bricks/sidebar
```

#### Breadcrumb
A dynamic breadcrumb component that automatically generates navigation breadcrumbs based on the current URL. Supports custom route name mapping and mobile-responsive display.

**Install:**
```bash
bunx shadcn@latest add aditiapras/bricks/breadcrumb
```

#### Data Table
A feature-rich data table component with global search, column filtering, sorting, pagination, row selection, and column visibility controls. Built with TanStack Table.

**Install:**
```bash
bunx shadcn@latest add aditiapras/bricks/data-table
```

#### Layout
A complete application layout that combines sidebar, breadcrumb, and header into a cohesive structure. Perfect for admin dashboards and content management systems.

**Install:**
```bash
bunx shadcn@latest add aditiapras/bricks/layout
```

### Requirements

- Next.js project with shadcn/ui initialized
- Basic shadcn/ui components (Button, Separator, Sidebar, etc.) must be installed first
- For sidebar: Install shadcn sidebar components via `bunx shadcn@latest add sidebar`
- For data-table: Install TanStack Table: `bun add @tanstack/react-table`

### Notes

- All components are designed to be generic and customizable
- Auth-related components (UserButton, etc.) include commented sections for Better Auth integration
- Role-based permissions in sidebar are commented out by default - uncomment and customize as needed
- Components use relative imports within the components folder for easy installation

### Bundle Packages

#### Navigation Kit
Bundle of sidebar and breadcrumb components for complete navigation solution.

**Install:**
```bash
bunx shadcn@latest add aditiapras/bricks/navigation-kit
```

#### Layout Template
Complete layout template with sidebar, breadcrumb, and header components. Perfect starting point for admin dashboards.

**Install:**
```bash
bunx shadcn@latest add aditiapras/bricks/layout-template
```

#### UI Kit
Complete UI kit bundle with all components: sidebar, breadcrumb, data-table, and layout template.

**Install:**
```bash
bunx shadcn@latest add aditiapras/bricks/ui-kit
```

### List All Components
```bash
bunx shadcn@latest list aditiapras/bricks
```

## Devin Skills

Skills for setting up Better Auth with Convex integration in Next.js projects:

### setup-auth-convex
Complete Better Auth + Convex integration setup including:
- Plugins: username, admin, organization
- Permission system with role-based access control
- Route groups: (auth) and (main)
- Middleware for auth protection

**Install:**
```bash
bunx skills add aditiapras/bricks@auth-skills/setup-auth-convex
```

### setup-base-path
Next.js base path configuration for subpath deployments:
- Updates next.config.js with basePath
- Configures auth client with base path
- Updates middleware redirects

**Install:**
```bash
bunx skills add aditiapras/bricks@auth-skills/setup-base-path
```

### setup-auth-routes
Auth UI pages with form validation:
- Sign-in page with username/password
- Sign-up page with name, username, email, password
- Onboarding page for password change
- Uses shadcn/ui components

**Install:**
```bash
bunx skills add aditiapras/bricks@auth-skills/setup-auth-routes
```

### setup-auth-functions
Patterns for using Better Auth in Convex functions and React components:
- Server pattern: authComponent.getAuth, headers, role checking
- Client pattern: useQuery, useMutation, authClient
- Examples: listOrgs, listUsers, createOrg, updateUser

**Install:**
```bash
bunx skills add aditiapras/bricks@auth-skills/setup-auth-functions
```

## Usage Order

### For Shadcn Components:

1. Initialize shadcn/ui in your project: `bunx shadcn@latest init`
2. Install individual components or bundles as needed
3. Customize components via props (all components are props-based and generic)

### For Better Auth + Convex Setup:

1. Run `setup-auth-convex` first
2. Run `setup-auth-routes` for UI pages
3. Run `setup-base-path` if using subpath deployment
4. Reference `setup-auth-functions` when creating auth functions

## Contributing

### Adding New Skills:
1. Create a new directory in the appropriate skill group under `skills/`
2. Add a `SKILL.md` file following the skill format
3. Update this README with the new skill

### Adding New Components:
1. Create component files in the appropriate folder under `components/`
2. Make components props-based and generic for reusability
3. Add the component to `components/registry.json`
4. Validate the registry: `bunx shadcn@latest registry validate aditiapras/bricks`
5. Update this README with the new component

## License

MIT
