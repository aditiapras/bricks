---
name: setup-auth-routes
description: Setup auth routes (sign-in, sign-up, onboarding) untuk project yang sudah menggunakan setup-auth-convex. Termasuk install packages, shadcn components, dan custom components.
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - glob
---

# Setup Auth Routes

This skill sets up the authentication UI pages (sign-in, sign-up, onboarding) for projects that have already been configured with the `setup-auth-convex` skill. It includes form validation, password visibility toggles, and toast notifications.

## When to Use This Skill

Use this skill when:
- You've completed the `setup-auth-convex` setup and need to implement the auth UI pages
- You need sign-in, sign-up, and onboarding pages with form validation
- You want to use your custom field and input-group components
- You need to install the required packages and components

## What This Setup Includes

**Packages to Install:**
- `react-hook-form` — Form state management and validation
- `@hookform/resolvers` — Integration with Zod validation
- `zod` — Schema validation
- `sonner` — Toast notifications

**Shadcn/ui Components to Install:**
- `button` — Button component
- `separator` — Separator component
- `field` — Field, FieldGroup, FieldLabel, FieldError
- `input-group` — InputGroup, InputGroupInput, InputGroupButton, InputGroupAddon

**Auth Pages to Create:**
- `app/(auth)/sign-in/page.tsx` — Sign-in page with username/password
- `app/(auth)/sign-up/page.tsx` — Sign-up page with name, username, email, password
- `app/(auth)/onboarding/page.tsx` — Password change page for new users

**Features:**
- Form validation with Zod schemas
- Password visibility toggles
- Loading states during form submission
- Toast notifications for success/error
- Username validation (8 digits, numeric only)
- Password strength validation (for onboarding)

## Prerequisites

Before running this skill, verify:
- Skill `setup-auth-convex` has been run previously
- `lib/auth-client.ts` exists and is configured
- Route group `(auth)` exists with layout
- Shadcn/ui is initialized (`components.json` exists)
- Package manager: `bun`

---

## Setup Steps

### Step 1: Install Required Packages

Install the required packages for form management and validation:

```bash
bun add react-hook-form @hookform/resolvers zod sonner
```

**Why:** These packages provide form state management, validation integration, schema validation, and toast notifications.

---

### Step 2: Install Shadcn/ui Components

Install the required shadcn/ui components:

```bash
bunx shadcn@latest add button separator field input-group
```

**Why:** These are the UI components used in the auth pages. If they're already installed, the command will skip them. The `field` and `input-group` components provide form field structure and input grouping capabilities.

---

### Step 3: Create Sign-In Page

Create `app/(auth)/sign-in/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldError,
} from "@/components/ui/field"
import {
    InputGroup,
    InputGroupInput,
    InputGroupButton,
    InputGroupAddon,
} from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

const signInSchema = z.object({
    username: z
        .string()
        .min(8, "Username harus 8 karakter")
        .max(8, "Username harus 8 karakter")
        .regex(/^\d+$/, "Username harus berupa angka"),
    password: z.string().min(1, "Password wajib diisi"),
})

type SignInFormData = z.infer<typeof signInSchema>

export default function SignInPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
    })

    const onSubmit = async (data: SignInFormData) => {
        await authClient.signIn.username({
            username: data.username,
            password: data.password,
            callbackURL: "/",
        }, {
            onRequest: () => {
                setIsSubmitting(true)
            },
            onSuccess: () => {
                toast("Redirecting...")
                setIsSubmitting(false)
            },
            onError: (error) => {
                toast.error(error.error.message)
                setIsSubmitting(false)
            }
        })
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center p-4">
            <div className="flex items-center gap-4 mb-12 max-w-sm">
                <Image src="/logo-light.png" alt="Logo" loading="eager" width={170} height={50} className="h-auto" />
                <Separator orientation="vertical" />
                <div className="font-hk flex items-center gap-2">
                    <h1 className="text-4xl font-bold text-primary">My App</h1>
                    <p className="text-[0.65rem] text-muted-foreground font-bold line-clamp-3">
                        My App Description
                    </p>
                </div>
            </div>
            <div className="w-full max-w-sm px-6">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    <FieldGroup>
                        <Field data-invalid={!!errors.username}>
                            <FieldLabel htmlFor="username">Username</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    className="w-full"
                                    id="username"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="12345678"
                                    maxLength={8}
                                    aria-invalid={!!errors.username}
                                    {...register("username")}
                                />
                            </InputGroup>
                            <FieldError>{errors.username?.message}</FieldError>
                        </Field>

                        <Field data-invalid={!!errors.password}>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    aria-invalid={!!errors.password}
                                    {...register("password")}
                                />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff data-icon="inline-end" />
                                        ) : (
                                            <Eye data-icon="inline-end" />
                                        )}
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                            <FieldError>{errors.password?.message}</FieldError>
                        </Field>
                    </FieldGroup>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
                <p className="text-center text-xs text-muted-foreground mt-4">
                    Don't have an account? Please contact your administrator.
                </p>
            </div>

        </div>
    )
}
```

**Why:** This is the sign-in page with username/password form. It uses the custom field and input-group components, validates the username (8 digits), and handles auth errors with toast notifications.

---

### Step 4: Create Sign-Up Page

Create `app/(auth)/sign-up/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldError,
} from "@/components/ui/field"
import {
    InputGroup,
    InputGroupInput,
    InputGroupButton,
    InputGroupAddon,
} from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

const signUpSchema = z
    .object({
        name: z.string().min(1, "Nama wajib diisi"),
        username: z
            .string()
            .min(8, "Username harus 8 karakter")
            .max(8, "Username harus 8 karakter")
            .regex(/^\d+$/, "Username harus berupa angka"),
        email: z.string().email("Email tidak valid"),
        password: z.string().min(6, "Password minimal 6 karakter"),
        confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Password tidak cocok",
        path: ["confirmPassword"],
    })

type SignUpFormData = z.infer<typeof signUpSchema>

export default function SignUpPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset: formReset,
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
    })

    const onSubmit = async (data: SignUpFormData) => {
        await authClient.signUp.email({
            email: data.email,
            name: data.name,
            password: data.password,
            username: data.username,
        }, {
            onRequest: () => {
                setIsSubmitting(true)
            },
            onSuccess: () => {
                toast.success("Successfully registered!")
                setIsSubmitting(false)
            },
            onError: (error) => {
                console.error("Sign up error:", error)
                toast.error("Registration failed!")
                setIsSubmitting(false)
            }
        })
        formReset()
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center p-4">
            <div className="flex items-center gap-4 mb-12">
                <Image src="/logo-light.png" alt="Logo" loading="eager" width={170} height={50} className="h-auto" />
                <Separator orientation="vertical" />
                <div className="font-hk flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-primary">My App</h1>
                    <p className="text-xs text-muted-foreground line-clamp-2 w-32">
                        My App Description
                    </p>
                </div>
            </div>
            <div className="w-full max-w-sm px-6">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    <FieldGroup>
                        <Field data-invalid={!!errors.name}>
                            <FieldLabel htmlFor="name">Nama</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    className="w-full"
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    aria-invalid={!!errors.name}
                                    {...register("name")}
                                />
                            </InputGroup>
                            <FieldError>{errors.name?.message}</FieldError>
                        </Field>
                        <Field data-invalid={!!errors.username}>
                            <FieldLabel htmlFor="username">NIK</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    className="w-full"
                                    id="username"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="61600540"
                                    maxLength={8}
                                    aria-invalid={!!errors.username}
                                    {...register("username")}
                                />
                            </InputGroup>
                            <FieldError>{errors.username?.message}</FieldError>
                        </Field>

                        <Field data-invalid={!!errors.email}>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    className="w-full"
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    aria-invalid={!!errors.email}
                                    {...register("email")}
                                />
                            </InputGroup>
                            <FieldError>{errors.email?.message}</FieldError>
                        </Field>

                        <Field data-invalid={!!errors.password}>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    aria-invalid={!!errors.password}
                                    {...register("password")}
                                />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff data-icon="inline-end" />
                                        ) : (
                                            <Eye data-icon="inline-end" />
                                        )}
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                            <FieldError>{errors.password?.message}</FieldError>
                        </Field>

                        <Field data-invalid={!!errors.confirmPassword}>
                            <FieldLabel htmlFor="confirmPassword">Konfirmasi Password</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    aria-invalid={!!errors.confirmPassword}
                                    {...register("confirmPassword")}
                                />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff data-icon="inline-end" />
                                        ) : (
                                            <Eye data-icon="inline-end" />
                                        )}
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                            <FieldError>{errors.confirmPassword?.message}</FieldError>
                        </Field>
                    </FieldGroup>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Signing up..." : "Sign Up"}
                    </Button>
                </form>
                <p className="text-center text-xs text-muted-foreground mt-4">
                    Already have an account? <a href="/sign-in" className="underline">Sign in</a>
                </p>
            </div>

        </div>
    )
}
```

**Why:** This is the sign-up page with name, username (NIK), email, password, and confirm password fields. It validates all fields and ensures passwords match.

---

### Step 5: Create Onboarding Page

Create `app/(auth)/onboarding/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupInput,
  InputGroupButton,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const setPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf kapital")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung angka")
    .regex(/[^A-Za-z0-9]/, "Password harus mengandung karakter spesial"),
  confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
})

type SetPasswordFormData = z.infer<typeof setPasswordSchema>

export default function Page() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
  })

  const onSubmit = async (data: SetPasswordFormData) => {
    setIsSubmitting(true)
    try {
      await authClient.changePassword({
        newPassword: data.password,
        currentPassword: "", // Empty for onboarding flow
        revokeOtherSessions: true,
      })
      await authClient.updateUser({
        mustChangePassword: false,
      } as any)
      toast.success("Password set successfully!")
      router.push("/")
    } catch (error) {
      console.error("Password change error:", error)
      toast.error("Failed to set password")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen max-w-sm mx-auto w-full">
      <div className="space-y-2">
        <h1 className="font-bold">Onboarding</h1>
        <p className="text-sm text-muted-foreground">Before you can access the system, please complete your onboarding process by setting your password.</p>
      </div>
      <div className="w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FieldGroup>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  className="w-full"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff data-icon="inline-end" />
                    ) : (
                      <Eye data-icon="inline-end" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldError>{errors.password?.message}</FieldError>
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  className="w-full"
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff data-icon="inline-end" />
                    ) : (
                      <Eye data-icon="inline-end" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldError>{errors.confirmPassword?.message}</FieldError>
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Setting Password..." : "Set Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

**Why:** This is the onboarding page for new users to set their password. It enforces strong password requirements (8+ chars, uppercase, lowercase, number, special char) and updates the `mustChangePassword` field after successful password change.

---

### Step 6: Add Sonner Toast Provider

Read `app/layout.tsx`, then add the `Toaster` component from sonner at the top of the body:

```tsx
import { Toaster } from "sonner"

// In the body:
<body>
  <Toaster />
  {/* ... existing content */}
</body>
```

**Why:** Sonner needs a Toaster component to render toast notifications. This should be placed at the root layout so toasts are available throughout the app.

---

## After Setup

Once setup is complete:

1. **Update branding:**
   - Replace `/logo-light.png` with your actual logo
   - Update "My App" and "My App Description" in sign-in and sign-up pages
   - Update the NIK label if you're not using NIK (employee ID)

2. **Customize validation:**
   - Update username validation rules if you don't need 8-digit numeric usernames
   - Adjust password requirements in the onboarding schema if needed

3. **Test the auth flow:**
   - Visit `/sign-up` — should show sign-up form
   - Register a new user — should show success toast
   - Visit `/sign-in` — should show sign-in form
   - Sign in with the new user — should redirect to `/onboarding`
   - Set password on onboarding — should redirect to home

4. **Add logo:**
   - Place your logo at `public/logo-light.png` or update the image path in the pages

---

## Common Issues & Troubleshooting

**Issue:** Shadcn components (field, input-group) don't work
- **Solution:** Ensure the components were installed correctly via `bunx shadcn@latest add field input-group`. Check that the files exist in `components/ui/`.

**Issue:** Toast notifications don't appear
- **Solution:** Make sure you added the `<Toaster />` component to `app/layout.tsx`.

**Issue:** Form validation doesn't work
- **Solution:** Check that all packages are installed: `react-hook-form`, `@hookform/resolvers`, `zod`.

**Issue:** Sign-up fails with error
- **Solution:** Check that `authClient.signUp.email` is configured correctly in `lib/auth-client.ts`. Ensure the username plugin is enabled.

**Issue:** Onboarding password change fails
- **Solution:** The `currentPassword` field is empty for onboarding flow. If your auth setup requires a current password, you may need to adjust the logic.

**Issue:** Image doesn't load
- **Solution:** Ensure `public/logo-light.png` exists or update the image path in the sign-in and sign-up pages.

**Issue:** TypeScript errors in custom components
- **Solution:** Ensure `@/lib/utils` exists with the `cn` utility function. This is typically created by shadcn/ui initialization.

---

## Tips

- **Customize username validation** — If you don't need 8-digit numeric usernames, update the validation schema in sign-in and sign-up pages
- **Adjust password requirements** — Modify the onboarding schema to match your security requirements
- **Add social login** — You can extend the sign-in page with OAuth providers (Google, GitHub) using Better Auth's social login
- **Add forgot password** — Implement a forgot password flow using Better Auth's password reset feature
- **Style customization** — The custom field and input-group components can be styled to match your design system
- **Loading states** — All forms have loading states during submission to prevent double-submission

---

## Notes

- The `field` and `input-group` components are shadcn/ui components installed via CLI and are reusable across your app
- Username validation is set to 8 digits numeric by default — adjust if your use case differs
- Password strength validation in onboarding enforces: 8+ chars, uppercase, lowercase, number, special char
- The onboarding flow uses an empty `currentPassword` since new users don't have a password yet
- After successful onboarding, `mustChangePassword` is set to `false` via `authClient.updateUser`
- All forms use toast notifications for user feedback
- The logo image path is `/logo-light.png` — place your logo in the `public/` directory or update the path
