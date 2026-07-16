"use client"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOutIcon, SparklesIcon, BadgeCheckIcon, CreditCardIcon, BellIcon } from "lucide-react"

interface UserButtonProps {
    user?: {
        name: string
        email: string
        avatar?: string
    }
    onLogout?: () => void
    isLoading?: boolean
}

export function UserButton({
    user,
    onLogout,
    isLoading = false
}: UserButtonProps) {
    // ============================================================
    // EXAMPLE: If you're using Better Auth or another auth system
    // Uncomment and customize this section
    // ============================================================

    /*
    import { authClient } from "@/lib/auth-client"
    import { useRouter } from "next/navigation"
    import { Skeleton } from "@/components/ui/skeleton"
    
    const { data, isPending } = authClient.useSession()
    const router = useRouter()
    
    const handleLogout = async () => {
        await authClient.signOut()
        router.push("/sign-in")
    }
    */

    const handleLogout = onLogout || (() => {
        console.log("Logout clicked - implement your logout logic")
        // Example: router.push("/sign-in")
    })

    const userData = user || { name: "User", email: "user@example.com" }

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="size-7 rounded-lg hover:scale-105 transition-transform cursor-pointer">
                        <AvatarImage src={userData.avatar || undefined} alt="user" />
                        <AvatarFallback className="rounded-full text-white bg-primary font-medium">
                            {userData.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-fit"
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={userData.avatar || undefined} alt="user" />
                                <AvatarFallback className="rounded-full text-white bg-primary font-medium">
                                    {userData.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{userData.name}</span>
                                <span className="truncate text-xs">{userData.email}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <SparklesIcon />
                            Upgrade to Pro
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <BadgeCheckIcon />
                            Account
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <CreditCardIcon />
                            Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <BellIcon />
                            Notifications
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOutIcon />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div >
    )
}