"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Moon, Pencil, Sun, UserLock, Eye, EyeOff, Upload } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// ============================================================
// EXAMPLE: If you're using Better Auth
// Uncomment and customize this section
// ============================================================

/*
import { authClient } from "@/lib/auth-client"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useMutation } from "convex/react"
import { Id } from "@/convex/_generated/dataModel"

const currentUser = useQuery(api.users.getCurrentUser)
const generateUploadUrl = useMutation(api.users.generateUploadUrl)
const updateAvatar = useMutation(api.users.updateAvatar)
const { data: session } = authClient.useSession()
*/

// ============================================================
// Form schemas
// ============================================================

const updateNameSchema = z.object({
  name: z.string().min(1, "Name is required"),
})

type UpdateNameData = z.infer<typeof updateNameSchema>

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number")
    .regex(/[^A-Za-z0-9]/, "Password must contain special character"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type UpdatePasswordData = z.infer<typeof updatePasswordSchema>

interface SettingsPageProps {
  // User data (replace with your auth system)
  user?: {
    name: string
    email: string
    username?: string
    image?: string
  }
  // Loading state
  isLoading?: boolean
  // Auth handlers
  onUpdateName?: (name: string) => Promise<void>
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>
  onUploadAvatar?: (file: File) => Promise<void>
}

export default function SettingsPage({
  user,
  isLoading = false,
  onUpdateName,
  onChangePassword,
  onUploadAvatar
}: SettingsPageProps) {
  // ============================================================
  // EXAMPLE: If you're using Better Auth with Convex
  // Uncomment this section
  // ============================================================

  /*
  const currentUser = useQuery(api.users.getCurrentUser)
  const isLoading = !currentUser
  const { data: session } = authClient.useSession()
  const generateUploadUrl = useMutation(api.users.generateUploadUrl)
  const updateAvatar = useMutation(api.users.updateAvatar)
  */

  // ============================================================
  // Dummy data for development
  // ============================================================

  const dummyUser = {
    name: "John Doe",
    email: "john@example.com",
    username: "12345678",
    image: undefined
  }

  const currentUser = user || dummyUser

  const { theme, setTheme } = useTheme()
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register: registerName,
    handleSubmit: handleSubmitName,
    formState: { errors: nameErrors },
    reset: resetName,
  } = useForm<UpdateNameData>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: {
      name: currentUser?.name,
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<UpdatePasswordData>({
    resolver: zodResolver(updatePasswordSchema),
  })

  const onSubmitName = async (data: UpdateNameData) => {
    // ============================================================
    // EXAMPLE: Better Auth implementation
    // ============================================================

    /*
    await authClient.updateUser({
      name: data.name,
    })
    */

    // Generic implementation
    if (onUpdateName) {
      await onUpdateName(data.name)
    }

    setIsNameDialogOpen(false)
    resetName()
  }

  const onSubmitPassword = async (data: UpdatePasswordData) => {
    // ============================================================
    // EXAMPLE: Better Auth implementation
    // ============================================================

    /*
    await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      revokeOtherSessions: true,
    })
    */

    // Generic implementation
    if (onChangePassword) {
      await onChangePassword(data.currentPassword, data.newPassword)
    }

    setIsPasswordDialogOpen(false)
    resetPassword()
  }

  const handleNameDialogChange = (open: boolean) => {
    setIsNameDialogOpen(open)
    if (!open) {
      resetName()
    }
  }

  const handlePasswordDialogChange = (open: boolean) => {
    setIsPasswordDialogOpen(open)
    if (!open) {
      resetPassword()
    }
  }

  const handleAvatarDialogChange = (open: boolean) => {
    setIsAvatarDialogOpen(open)
    if (!open) {
      setSelectedFile(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)

      // ============================================================
      // EXAMPLE: Convex file upload implementation
      // ============================================================

      /*
      // Step 1: Get upload URL from Convex
      const postUrl = await generateUploadUrl()

      // Step 2: Upload file to Convex storage
      const response = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      })

      if (!response.ok) {
        throw new Error("Failed to upload file")
      }

      const { storageId } = await response.json()

      // Step 3: Update user avatar with storage ID
      await updateAvatar({
        storageId: storageId as Id<"_storage">,
      })
      */

      // Generic implementation
      if (onUploadAvatar) {
        await onUploadAvatar(selectedFile)
      }

      setIsAvatarDialogOpen(false)
      setSelectedFile(null)
      // Refresh the page to get updated avatar
      window.location.reload()
    } catch (error) {
      console.error("Failed to upload avatar:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 w-full max-w-3xl mx-auto">
      <div>
        <h1 className="font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings and user preferences.</p>
      </div>
      {isLoading ? (
        <div className="flex flex-col mt-4 gap-1">
          <Skeleton className="h-5 w-16 mb-2" />
          <div className="rounded-lg bg-background border">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-b last:border-0">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col mt-4 gap-1">
            <h1 className="text-sm font-medium">Profile</h1>
            <div className="rounded-lg bg-background border">
              <div className="flex items-center justify-between p-3 hover:bg-muted/50 border-b">
                <div>
                  <h2 className="text-[0.8rem] font-medium">Avatar</h2>
                  <p className="text-[0.8rem] text-muted-foreground">Upload or change your profile picture</p>
                </div>
                <Dialog open={isAvatarDialogOpen} onOpenChange={handleAvatarDialogChange}>
                  <DialogTrigger asChild>
                    <Avatar className="cursor-pointer rounded-full">
                      <AvatarImage src={currentUser?.image || undefined} alt={currentUser?.name || "User"} />
                      <AvatarFallback className="bg-primary text-white font-medium rounded-full">{currentUser?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Avatar</DialogTitle>
                      <DialogDescription>
                        Upload a new profile picture
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col items-center gap-4">
                        <Avatar className="size-20">
                          <AvatarImage src={selectedFile ? URL.createObjectURL(selectedFile) : currentUser?.image || undefined} alt="Preview" />
                          <AvatarFallback className="bg-primary text-white font-medium">{currentUser?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload data-icon="inline-start" />
                          Select Image
                        </Button>
                        {selectedFile && (
                          <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAvatarDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleAvatarUpload}
                          disabled={!selectedFile || isUploading}
                        >
                          {isUploading ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-muted/50 border-b">
                <div>
                  <h2 className="text-[0.8rem] font-medium">Name</h2>
                  <p className="text-[0.8rem] text-muted-foreground">{currentUser?.name}</p>
                </div>
                <Dialog open={isNameDialogOpen} onOpenChange={handleNameDialogChange}>
                  <DialogTrigger asChild>
                    <Button variant="outline"><Pencil data-icon="inline-start" />Update</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Name</DialogTitle>
                      <DialogDescription>
                        Update your display name
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitName(onSubmitName)} className="flex flex-col gap-4">
                      <FieldGroup>
                        <Field data-invalid={!!nameErrors.name}>
                          <FieldLabel htmlFor="name">Name</FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              className="w-full"
                              id="name"
                              type="text"
                              placeholder="John Doe"
                              aria-invalid={!!nameErrors.name}
                              defaultValue={currentUser?.name || ""}
                              {...registerName("name")}
                            />
                          </InputGroup>
                          <FieldError>{nameErrors.name?.message}</FieldError>
                        </Field>
                      </FieldGroup>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsNameDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Update</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-muted/50 border-b">
                <div>
                  <h2 className="text-[0.8rem] font-medium">Employee ID</h2>
                  <p className="text-[0.8rem] text-muted-foreground">{currentUser?.username || "N/A"}</p>
                </div>
                <Button variant="outline" disabled><Pencil />Change</Button>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-muted/50 border-b">
                <div>
                  <h2 className="text-[0.8rem] font-medium">Email</h2>
                  <p className="text-[0.8rem] text-muted-foreground">{currentUser?.email || "N/A"}</p>
                </div>
                <Button variant="outline" disabled><Pencil />Change</Button>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-muted/50">
                <div>
                  <h2 className="text-[0.8rem] font-medium">Password</h2>
                  <p className="text-[0.8rem] text-muted-foreground">********</p>
                </div>
                <Dialog open={isPasswordDialogOpen} onOpenChange={handlePasswordDialogChange}>
                  <DialogTrigger asChild>
                    <Button variant="outline"><UserLock data-icon="inline-start" />Change</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Update your password
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="flex flex-col gap-4">
                      <FieldGroup>
                        <Field data-invalid={!!passwordErrors.currentPassword}>
                          <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              className="w-full"
                              id="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder="••••••••"
                              aria-invalid={!!passwordErrors.currentPassword}
                              {...registerPassword("currentPassword")}
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? (
                                  <EyeOff />
                                ) : (
                                  <Eye />
                                )}
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                          <FieldError>{passwordErrors.currentPassword?.message}</FieldError>
                        </Field>

                        <Field data-invalid={!!passwordErrors.newPassword}>
                          <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              className="w-full"
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              placeholder="••••••••"
                              aria-invalid={!!passwordErrors.newPassword}
                              {...registerPassword("newPassword")}
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? (
                                  <EyeOff />
                                ) : (
                                  <Eye />
                                )}
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                          <FieldError>{passwordErrors.newPassword?.message}</FieldError>
                        </Field>

                        <Field data-invalid={!!passwordErrors.confirmPassword}>
                          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              className="w-full"
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              aria-invalid={!!passwordErrors.confirmPassword}
                              {...registerPassword("confirmPassword")}
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff />
                                ) : (
                                  <Eye />
                                )}
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                          <FieldError>{passwordErrors.confirmPassword?.message}</FieldError>
                        </Field>
                      </FieldGroup>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Update</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="flex flex-col mt-4 gap-1">
            <h1 className="text-sm font-medium">Appearance</h1>
            <div className="rounded-lg bg-background border">
              <div className="flex items-center justify-between p-3">
                <div>
                  <h2 className="text-[0.8rem] font-medium">Theme</h2>
                  <p className="text-[0.8rem] text-muted-foreground">Select your preferred theme</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun /> : <Moon />}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}