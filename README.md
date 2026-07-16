# Bricks

Collection of reusable development resources for Next.js projects.

## Quick Start

```bash
# List all available components
bunx shadcn@latest list aditiapras/bricks

# Install individual component
bunx shadcn@latest add aditiapras/bricks/sidebar

# Install complete UI kit
bunx shadcn@latest add aditiapras/bricks/ui-kit
```

## Available Components

### Core Components
- **sidebar** - Advanced sidebar with role-based navigation
- **breadcrumb** - Dynamic breadcrumb component  
- **data-table** - Feature-rich data table with search/filter
- **layout** - Complete application layout

### Auth Pages
- **settings-page** - Account settings with profile management
- **users-page** - User management with data table

### Auth Routes
- **sign-in-page** - Sign in page with form validation
- **sign-up-page** - Sign up page with registration form
- **onboarding-page** - Password setup for new users

### Bundles
- **navigation-kit** - Sidebar + breadcrumb
- **layout-template** - Layout + auth pages + auth routes
- **auth-pages** - Settings + users pages
- **auth-routes** - Sign-in + sign-up + onboarding
- **ui-kit** - All components combined

## How to Use

### Install Individual Components

```bash
# Install sidebar only
bunx shadcn@latest add aditiapras/bricks/sidebar

# Install breadcrumb only
bunx shadcn@latest add aditiapras/bricks/breadcrumb

# Install data-table only
bunx shadcn@latest add aditiapras/bricks/data-table

# Install layout only
bunx shadcn@latest add aditiapras/bricks/layout
```

### Install Auth Pages

```bash
# Install settings page
bunx shadcn@latest add aditiapras/bricks/settings-page

# Install users page
bunx shadcn@latest add aditiapras/bricks/users-page

# Install both auth pages
bunx shadcn@latest add aditiapras/bricks/auth-pages
```

### Install Auth Routes

```bash
# Install sign-in page
bunx shadcn@latest add aditiapras/bricks/sign-in-page

# Install sign-up page
bunx shadcn@latest add aditiapras/bricks/sign-up-page

# Install onboarding page
bunx shadcn@latest add aditiapras/bricks/onboarding-page

# Install all auth routes
bunx shadcn@latest add aditiapras/bricks/auth-routes
```

### Install Bundles

```bash
# Navigation kit (sidebar + breadcrumb)
bunx shadcn@latest add aditiapras/bricks/navigation-kit

# Layout template (layout + auth pages + auth routes)
bunx shadcn@latest add aditiapras/bricks/layout-template

# Complete UI kit (all components)
bunx shadcn@latest add aditiapras/bricks/ui-kit
```

## Requirements

- Next.js project with shadcn/ui initialized
- Install required shadcn components first
- For data-table: `bun add @tanstack/react-table moment-timezone`
- For auth routes: `bunx shadcn@latest add field input-group`

## Structure

```
bricks/
├── components/          # Shadcn components
│   ├── sidebar/
│   ├── breadcrumb/
│   ├── data-table/
│   ├── auth-pages/
│   ├── auth-routes/
│   └── layout.tsx
├── skills/              # Devin skills
│   └── auth-skills/
└── registry.json        # Shadcn registry
```

## Contributing

Add new components to `components/` and update `components/registry.json`.

## License

MIT