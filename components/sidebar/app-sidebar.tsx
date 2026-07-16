"use client"

import * as React from "react"
import { NavProjects } from "./nav-projects"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuItem, type UserRole } from "./sidebar-config"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  // User data (replace with your auth system)
  user?: {
    name: string
    email: string
    avatar?: string
    role?: UserRole
  }
  // Menu items to display
  menuItems?: MenuItem[]
  // Team/organization info
  teamName?: string
  teamDescription?: string
  // Footer menu URLs (these will be shown at the bottom)
  footerMenuUrls?: string[]
}

export function AppSidebar({
  user,
  menuItems,
  teamName = "My App",
  teamDescription = "Application Name",
  footerMenuUrls = ["/settings"],
  ...props
}: AppSidebarProps) {
  const pathname = usePathname()

  // Get user role dengan fallback ke "user" jika role tidak dikenali
  const userRole: UserRole = user?.role || "user"

  // Use provided menu items or default
  const availableMenuItems = menuItems || []

  // Pisahkan menu utama dan menu footer (Settings, Users, etc)
  const mainMenuItems = availableMenuItems.filter(item =>
    !footerMenuUrls.includes(item.url)
  )
  const footerMenuItems = availableMenuItems.filter(item =>
    footerMenuUrls.includes(item.url)
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teamName={teamName} teamDescription={teamDescription} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={mainMenuItems} />
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {footerMenuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.name}
                    className={`${pathname === item.url ? "border-l-2 border-primary rounded-l-none bg-muted" : "border-l-2 border-transparent text-muted-foreground"}`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
