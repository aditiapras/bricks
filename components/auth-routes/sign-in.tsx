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

// ============================================================
// EXAMPLE: If you're using Better Auth
// Uncomment and customize this section
// ============================================================

/*
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
*/

// ============================================================
// Form schema
// ============================================================

const signInSchema = z.object({
  username: z
    .string()
    .min(8, "Username must be 8 characters")
    .max(8, "Username must be 8 characters")
    .regex(/^\d+$/, "Username must be numeric"),
  password: z.string().min(1, "Password is required"),
})

type SignInFormData = z.infer<typeof signInSchema>

interface SignInPageProps {
  // Branding
  logoLight?: string
  logoDark?: string
  appName?: string
  appDescription?: string
  // Auth handlers
  onSignIn?: (username: string, password: string) => Promise<void>
  // Custom validation
  usernameValidation?: {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    errorMessage?: string
  }
  // Redirect URL
  callbackURL?: string
}

export default function SignInPage({
  logoLight = "/logo-light.png",
  logoDark = "/logo-dark.png",
  appName = "My App",
  appDescription = "Application Description",
  onSignIn,
  usernameValidation,
  callbackURL = "/"
}: SignInPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Custom validation
  const customUsernameValidation = usernameValidation || {
    minLength: 8,
    maxLength: 8,
    pattern: /^\d+$/,
    errorMessage: "Username must be 8 numeric characters"
  }

  const customSignInSchema = z.object({
    username: z
      .string()
      .min(customUsernameValidation.minLength, `Username must be ${customUsernameValidation.minLength} characters`)
      .max(customUsernameValidation.maxLength, `Username must be ${customUsernameValidation.maxLength} characters`)
      .regex(customUsernameValidation.pattern, customUsernameValidation.errorMessage),
    password: z.string().min(1, "Password is required"),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(customSignInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    // ============================================================
    // EXAMPLE: Better Auth implementation
    // ============================================================

    /*
    await authClient.signIn.username({
      username: data.username,
      password: data.password,
      callbackURL: callbackURL,
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
    */

    // Generic implementation
    if (onSignIn) {
      try {
        setIsSubmitting(true)
        await onSignIn(data.username, data.password)
      } catch (error) {
        console.error("Sign in error:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="flex items-center gap-4 mb-12 max-w-sm">
        <Image 
          src={logoLight} 
          alt="Logo" 
          loading="eager" 
          width={170} 
          height={50} 
          className="h-auto dark:hidden" 
        />
        <Image 
          src={logoDark} 
          alt="Logo" 
          loading="eager" 
          width={170} 
          height={50} 
          className="h-auto hidden dark:block" 
        />
        <Separator orientation="vertical" />
        <div className="font-hk flex items-center gap-2">
          <h1 className="text-4xl font-bold text-primary">{appName}</h1>
          <p className="text-[0.65rem] text-muted-foreground font-bold line-clamp-3">
            {appDescription}
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
                  maxLength={customUsernameValidation.maxLength}
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