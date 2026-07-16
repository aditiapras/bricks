"use client"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon } from "lucide-react"

interface TeamSwitcherProps {
  teamName?: string
  teamDescription?: string
}

export function TeamSwitcher({
  teamName = "My App",
  teamDescription = "Application Name"
}: TeamSwitcherProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEndIcon />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight font-hk">
            <span className="truncate font-bold text-base">{teamName}</span>
            <span className="truncate text-xs text-muted-foreground">{teamDescription}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
