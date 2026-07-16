"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pencil, Lock, UserRoundPlus, MoreHorizontal, BanIcon, UserRoundCog } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTable, ColumnConfig } from "@/components/data-table/data-table"
import { createColumnHelper } from "@tanstack/react-table"
import { Skeleton } from "@/components/ui/skeleton"
import moment from "moment-timezone"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldError,
} from "@/components/ui/field"
import {
    InputGroup,
    InputGroupInput,
} from "@/components/ui/input-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { AlertDialog, AlertDialogCancel, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

// ============================================================
// EXAMPLE: If you're using Better Auth with Convex
// Uncomment and customize this section
// ============================================================

/*
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { authClient } from "@/lib/auth-client"

const users = useQuery(api.users.listUsers)
*/

// ============================================================
// User type
// ============================================================

type User = {
    id: string
    name: string
    email: string
    image?: string | null
    username?: string
    role?: string
    banned?: boolean | null
    createdAt: Date
    updatedAt: Date
}

// ============================================================
// Form schema
// ============================================================

const createUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    username: z
        .string()
        .min(8, "Username must be 8 characters")
        .max(8, "Username must be 8 characters")
        .regex(/^\d+$/, "Username must be numeric"),
    email: z.string().email("Invalid email"),
    role: z.enum(["admin", "user"]),
}).refine((data) => data.role !== undefined, {
    message: "Role is required",
    path: ["role"],
})

type CreateUserData = z.infer<typeof createUserSchema>

interface UsersPageProps {
    // Users data
    users?: User[]
    // Loading state
    isLoading?: boolean
    // User management handlers
    onCreateUser?: (data: CreateUserData) => Promise<void>
    onUpdateUserRole?: (userId: string, role: string) => Promise<void>
    onBanUser?: (userId: string) => Promise<void>
    onUnbanUser?: (userId: string) => Promise<void>
    // Refresh data callback
    onRefresh?: () => Promise<void>
}

export default function UsersPage({
    users: propUsers,
    isLoading = false,
    onCreateUser,
    onUpdateUserRole,
    onBanUser,
    onUnbanUser,
    onRefresh
}: UsersPageProps) {
    // ============================================================
    // EXAMPLE: If you're using Better Auth with Convex
    // Uncomment this section
    // ============================================================

    /*
    const users = useQuery(api.users.listUsers)
    const isLoading = !users
    */

    // ============================================================
    // Dummy data for development
    // ============================================================

    const dummyUsers: User[] = [
        {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            username: "12345678",
            role: "admin",
            banned: false,
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
        },
        {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            username: "87654321",
            role: "user",
            banned: false,
            createdAt: new Date("2024-01-02"),
            updatedAt: new Date("2024-01-02"),
        },
        {
            id: "3",
            name: "Bob Johnson",
            email: "bob@example.com",
            username: "11223344",
            role: "user",
            banned: true,
            createdAt: new Date("2024-01-03"),
            updatedAt: new Date("2024-01-03"),
        },
    ]

    const users = propUsers || dummyUsers

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateUserData>({
        resolver: zodResolver(createUserSchema),
    })

    const columnHelper = createColumnHelper<User>()

    const columns: ColumnConfig<User, any>[] = [
        {
            column: columnHelper.accessor("name", {
                id: "name",
                header: "Name",
                cell: (info) => {
                    const user = info.row.original
                    return (
                        <div className="flex items-center gap-2">
                            <Avatar className="size-7">
                                <AvatarImage src={user?.image || undefined} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {user.name}
                        </div>
                    )
                },
            }),
            enableFilter: false,
            enableSort: true,
        },
        {
            column: columnHelper.accessor("username", {
                id: "username",
                header: "Employee ID",
                cell: (info) => info.getValue(),
            }),
            enableFilter: false,
            enableSort: true,
        },
        {
            column: columnHelper.accessor("email", {
                id: "email",
                header: "Email",
                cell: (info) => info.getValue(),
            }),
            enableFilter: false,
            enableSort: true,
        },
        {
            column: columnHelper.accessor("role", {
                id: "role",
                header: "Role",
                cell: (info) => {
                    const role = info.getValue()
                    return <span className="capitalize">{role ?? "N/A"}</span>
                },
            }),
            enableFilter: true,
            filterOptions: ["admin", "user"],
            enableSort: true,
        },
        {
            column: columnHelper.accessor("banned", {
                id: "banned",
                header: "Banned",
                cell: (info) => {
                    const banned = info.getValue()
                    return <Badge variant={banned ? "destructive" : "outline"}>{banned ? "Yes" : "No"}</Badge>
                },
            }),
            enableSort: true,
        },
        {
            column: columnHelper.accessor("createdAt", {
                id: "createdAt",
                header: "Created At",
                cell: (info) => moment(info.getValue()).format("DD MMM YYYY HH:mm"),
            }),
            enableFilter: false,
            enableSort: true,
        },
        {
            column: columnHelper.display({
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                                <MoreHorizontal data-icon="inline-end" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <Dialog onOpenChange={(open) => {
                                if (!open) {
                                    setSelectedUser(null)
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault()
                                        setSelectedUser(row.original)
                                    }}>
                                        <UserRoundCog data-icon="inline-start" />
                                        Edit Role
                                    </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit User Role</DialogTitle>
                                        <DialogDescription>
                                            Change user role for {row.original.name}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form
                                        onSubmit={async (e) => {
                                            e.preventDefault()
                                            const formData = new FormData(e.currentTarget)
                                            const newRole = formData.get("role") as string

                                            // ============================================================
                                            // EXAMPLE: Better Auth implementation
                                            // ============================================================

                                            /*
                                            await authClient.admin.updateUser({
                                              userId: row.original.id,
                                              data: {
                                                role: newRole as "admin" | "user"
                                              }
                                            }, {
                                              onSuccess: () => {
                                                toast.success("User role updated successfully")
                                              },
                                              onError: (error: any) => {
                                                toast.error(error.error.message)
                                              }
                                            })
                                            */

                                            // Generic implementation
                                            if (onUpdateUserRole) {
                                                try {
                                                    await onUpdateUserRole(row.original.id, newRole)
                                                    toast.success("User role updated successfully")
                                                    if (onRefresh) await onRefresh()
                                                } catch (error) {
                                                    toast.error("Failed to update user role")
                                                }
                                            }

                                            setSelectedUser(null)
                                        }}
                                        className="flex flex-col gap-4"
                                    >
                                        <Field>
                                            <FieldLabel htmlFor="role">Role</FieldLabel>
                                            <Select name="role" defaultValue={row.original.role}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="user">User</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="outline" onClick={() => setSelectedUser(null)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">Update</Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            {row.original.banned ? (
                                <DropdownMenuItem
                                    onClick={async () => {
                                        // ============================================================
                                        // EXAMPLE: Better Auth implementation
                                        // ============================================================

                                        /*
                                        await authClient.admin.unbanUser({
                                          userId: row.original.id
                                        }, {
                                          onSuccess: () => {
                                            toast.success("User unbanned successfully")
                                          },
                                          onError: (error: any) => {
                                            toast.error(error.error.message)
                                          }
                                        })
                                        */

                                        // Generic implementation
                                        if (onUnbanUser) {
                                            try {
                                                await onUnbanUser(row.original.id)
                                                toast.success("User unbanned successfully")
                                                if (onRefresh) await onRefresh()
                                            } catch (error) {
                                                toast.error("Failed to unban user")
                                            }
                                        }
                                    }}
                                >
                                    <Lock data-icon="inline-start" />
                                    Unban User
                                </DropdownMenuItem>
                            ) : (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            onSelect={(e) => {
                                                e.preventDefault()
                                            }}
                                        >
                                            <BanIcon data-icon="inline-start" />
                                            Ban User
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action will ban {row.original.name} from accessing the system.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={async () => {
                                                    // ============================================================
                                                    // EXAMPLE: Better Auth implementation
                                                    // ============================================================

                                                    /*
                                                    await authClient.admin.banUser({
                                                      userId: row.original.id
                                                    }, {
                                                      onSuccess: () => {
                                                        toast.success("User banned successfully")
                                                      },
                                                      onError: (error: any) => {
                                                        toast.error(error.error.message)
                                                      }
                                                    })
                                                    */

                                                    // Generic implementation
                                                    if (onBanUser) {
                                                        try {
                                                            await onBanUser(row.original.id)
                                                            toast.success("User banned successfully")
                                                            if (onRefresh) await onRefresh()
                                                        } catch (error) {
                                                            toast.error("Failed to ban user")
                                                        }
                                                    }
                                                }}
                                            >
                                                Ban
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            }),
        },
    ]

    const onSubmitCreate = async (data: CreateUserData) => {
        // ============================================================
        // EXAMPLE: Better Auth implementation
        // ============================================================

        /*
        await authClient.admin.createUser({
          email: data.email,
          password: "defaultPassword123", // You should generate a secure password
          name: data.name,
          role: data.role as "admin" | "user"
        }, {
          onSuccess: () => {
            toast.success("User created successfully")
            setIsCreateDialogOpen(false)
            reset()
          },
          onError: (error: any) => {
            toast.error(error.error.message)
          }
        })
        */

        // Generic implementation
        if (onCreateUser) {
            try {
                await onCreateUser(data)
                toast.success("User created successfully")
                setIsCreateDialogOpen(false)
                reset()
                if (onRefresh) await onRefresh()
            } catch (error) {
                toast.error("Failed to create user")
            }
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <Skeleton className="h-8 w-32" />
                <div className="rounded-lg border">
                    <div className="h-64 flex items-center justify-center">
                        <Skeleton className="h-8 w-32" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-semibold">Users</h1>
                    <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserRoundPlus data-icon="inline-start" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>
                                Add a new user to the system
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmitCreate)} className="flex flex-col gap-4">
                            <FieldGroup>
                                <Field data-invalid={!!errors.name}>
                                    <FieldLabel htmlFor="name">Name</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            className="w-full"
                                            id="name"
                                            placeholder="John Doe"
                                            {...register("name")}
                                        />
                                    </InputGroup>
                                    <FieldError>{errors.name?.message}</FieldError>
                                </Field>

                                <Field data-invalid={!!errors.username}>
                                    <FieldLabel htmlFor="username">Employee ID</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            className="w-full"
                                            id="username"
                                            placeholder="12345678"
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
                                            {...register("email")}
                                        />
                                    </InputGroup>
                                    <FieldError>{errors.email?.message}</FieldError>
                                </Field>

                                <Field data-invalid={!!errors.role}>
                                    <FieldLabel htmlFor="role">Role</FieldLabel>
                                    <Select name="role" defaultValue="user">
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="user">User</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{errors.role?.message}</FieldError>
                                </Field>
                            </FieldGroup>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <DataTable
                columns={columns}
                data={users}
                searchPlaceholder="Search users..."
                enableGlobalSearch={true}
                pageSize={10}
            />
        </div>
    )
}