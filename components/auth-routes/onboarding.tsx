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
import { useRouter } from "next/navigation"

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

const setPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number")
    .regex(/[^A-Za-z0-9]/, "Password must contain special character"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type SetPasswordFormData = z.infer<typeof setPasswordSchema>

interface OnboardingPageProps {
  // Auth handlers
  onSetPassword?: (password: string) => Promise<void>
  onUpdateUser?: () => Promise<void>
  // Custom validation
  passwordValidation?: {
    minLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumber?: boolean
    requireSpecial?: boolean
  }
  // Redirect URL
  redirectURL?: string
  // Custom messages
  title?: string
  description?: string
  submitButtonText?: string
}

export default function OnboardingPage({
  onSetPassword,
  onUpdateUser,
  passwordValidation,
  redirectURL = "/",
  title = "Onboarding",
  description = "Before you can access the system, please complete your onboarding process by setting your password.",
  submitButtonText = "Complete Onboarding"
}: OnboardingPageProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Custom validation
  const customPasswordValidation = passwordValidation || {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
  }

  // Build custom schema based on validation settings
  let passwordSchema = z.string().min(customPasswordValidation.minLength, `Password must be at least ${customPasswordValidation.minLength} characters`)
  
  if (customPasswordValidation.requireUppercase) {
    passwordSchema = passwordSchema.regex(/[A-Z]/, "Password must contain uppercase letter")
  }
  if (customPasswordValidation.requireLowercase) {
    passwordSchema = passwordSchema.regex(/[a-z]/, "Password must contain lowercase letter")
  }
  if (customPasswordValidation.requireNumber) {
    passwordSchema = passwordSchema.regex(/[0-9]/, "Password must contain number")
  }
  if (customPasswordValidation.requireSpecial) {
    passwordSchema = passwordSchema.regex(/[^A-Za-z0-9]/, "Password must contain special character")
  }

  const customSetPasswordSchema = z.object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(customSetPasswordSchema),
  })

  const onSubmit = async (data: SetPasswordFormData) => {
    setIsSubmitting(true)
    try {
      // ============================================================
      // EXAMPLE: Better Auth implementation
      // ============================================================

      /*
      await authClient.changePassword({
        newPassword: data.password,
        currentPassword: "", // Empty for onboarding flow
        revokeOtherSessions: true,
      })
      await authClient.updateUser({
        mustChangePassword: false,
      } as any)
      toast.success("Password set successfully!")
      router.push(redirectURL)
      */

      // Generic implementation
      if (onSetPassword) {
        await onSetPassword(data.password)
      }
      if (onUpdateUser) {
        await onUpdateUser()
      }
      router.push(redirectURL)
    } catch (error) {
      console.error("Password change error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen max-w-sm mx-auto w-full">
      <div className="space-y-2">
        <h1 className="font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
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
            {isSubmitting ? "Processing..." : submitButtonText}
          </Button>
        </form>
      </div>
    </div>
  )
}