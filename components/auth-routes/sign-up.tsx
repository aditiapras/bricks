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

const signUpSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    username: z
      .string()
      .min(8, "Username must be 8 characters")
      .max(8, "Username must be 8 characters")
      .regex(/^\d+$/, "Username must be numeric"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignUpFormData = z.infer<typeof signUpSchema>

interface SignUpPageProps {
  // Branding
  logoLight?: string
  logoDark?: string
  appName?: string
  appDescription?: string
  // Auth handlers
  onSignUp?: (data: SignUpFormData) => Promise<void>
  // Custom validation
  usernameValidation?: {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    errorMessage?: string
  }
  passwordValidation?: {
    minLength?: number
    errorMessage?: string
  }
  // Redirect URL
  callbackURL?: string
  // Show sign-in link
  showSignInLink?: boolean
  signInURL?: string
}

export default function SignUpPage({
  logoLight = "/logo-light.png",
  logoDark = "/logo-dark.png",
  appName = "My App",
  appDescription = "Application Description",
  onSignUp,
  usernameValidation,
  passwordValidation,
  callbackURL = "/",
  showSignInLink = true,
  signInURL = "/sign-in"
}: SignUpPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Custom validation
  const customUsernameValidation = usernameValidation || {
    minLength: 8,
    maxLength: 8,
    pattern: /^\d+$/,
    errorMessage: "Username must be 8 numeric characters"
  }

  const customPasswordValidation = passwordValidation || {
    minLength: 6,
    errorMessage: "Password must be at least 6 characters"
  }

  const customSignUpSchema = z
    .object({
      name: z.string().min(1, "Name is required"),
      username: z
        .string()
        .min(customUsernameValidation.minLength, `Username must be ${customUsernameValidation.minLength} characters`)
        .max(customUsernameValidation.maxLength, `Username must be ${customUsernameValidation.maxLength} characters`)
        .regex(customUsernameValidation.pattern, customUsernameValidation.errorMessage),
      email: z.string().email("Invalid email"),
      password: z.string().min(customPasswordValidation.minLength, customPasswordValidation.errorMessage),
      confirmPassword: z.string().min(1, "Confirm password is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: formReset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(customSignUpSchema),
  })

  const onSubmit = async (data: SignUpFormData) => {
    // ============================================================
    // EXAMPLE: Better Auth implementation
    // ============================================================

    /*
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
    */

    // Generic implementation
    if (onSignUp) {
      try {
        setIsSubmitting(true)
        await onSignUp(data)
        formReset()
      } catch (error) {
        console.error("Sign up error:", error)
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
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
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
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
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
        {showSignInLink && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Already have an account? <a href={signInURL} className="underline">Sign in</a>
          </p>
        )}
      </div>
    </div>
  )
}