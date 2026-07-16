import { AppSidebar } from "./sidebar/app-sidebar"
import { DynamicBreadcrumb } from "./breadcrumb/dynamic-breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Kbd } from "@/components/ui/kbd"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { CircleQuestionMark } from "lucide-react";
import { UserButton } from "./sidebar/user-button";
import { Toaster } from "sonner"
import { MenuItem, type UserRole } from "./sidebar/sidebar-config"

interface MainLayoutProps {
  children: React.ReactNode
  // User data for sidebar and user button
  user?: {
    name: string
    email: string
    avatar?: string
    role?: UserRole
  }
  // Menu items for sidebar
  menuItems?: MenuItem[]
  // Team/organization info
  teamName?: string
  teamDescription?: string
  // Footer menu URLs
  footerMenuUrls?: string[]
  // Breadcrumb configuration
  routeNames?: Record<string, string>
  homeName?: string
  showHomeOnMobile?: boolean
  // Header actions
  showHelpButton?: boolean
  showUserButton?: boolean
  // Custom header content
  headerActions?: React.ReactNode
  // Logout handler
  onLogout?: () => void
  // Theme configuration
  backgroundColor?: string
  headerBackgroundColor?: string
}

export default function MainLayout({
  children,
  user,
  menuItems,
  teamName = "My App",
  teamDescription = "Application Name",
  footerMenuUrls = ["/settings"],
  routeNames,
  homeName = "Dashboard",
  showHomeOnMobile = false,
  showHelpButton = true,
  showUserButton = true,
  headerActions,
  onLogout,
  backgroundColor = "bg-zinc-50 dark:bg-neutral-900",
  headerBackgroundColor = "bg-neutral-50 dark:bg-zinc-900"
}: MainLayoutProps) {
  return (
    <SidebarProvider>
      <Toaster closeButton richColors toastOptions={{ className: 'font-sans font-semibold' }} />
      <AppSidebar
        user={user}
        menuItems={menuItems}
        teamName={teamName}
        teamDescription={teamDescription}
        footerMenuUrls={footerMenuUrls}
      />
      <SidebarInset className={backgroundColor}>
        <header className={`flex h-12 shrink-0 items-center justify-between border-b gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-10 ${headerBackgroundColor}`}>
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <DynamicBreadcrumb
              routeNames={routeNames}
              homeName={homeName}
              showHomeOnMobile={showHomeOnMobile}
            />
          </div>
          <div className="pr-4 flex items-center gap-2">
            {headerActions || (
              <>
                {showHelpButton && (
                  <HoverCard>
                    <HoverCardTrigger asChild><Button variant="ghost" size="icon"><CircleQuestionMark /></Button></HoverCardTrigger>
                    <HoverCardContent className="w-fit" align="end">
                      <div className="grid grid-cols-2 gap-2">
                        <h1 className="text-sm font-medium col-span-2">Keyboard Shortcuts:</h1>
                        <Kbd>d</Kbd>
                        <span className="text-xs">Toggle Dark Mode</span>
                        <Kbd>Ctrl+B</Kbd>
                        <span className="text-xs">Toggle Sidebar</span>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
                {showUserButton && (
                  <UserButton
                    user={user}
                    onLogout={onLogout}
                  />
                )}
              </>
            )}
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
