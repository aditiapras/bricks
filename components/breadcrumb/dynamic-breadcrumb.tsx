"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

interface DynamicBreadcrumbProps {
  // Custom route name mapping
  routeNames?: Record<string, string>
  // Custom home name
  homeName?: string
  // Show home on mobile
  showHomeOnMobile?: boolean
}

export function DynamicBreadcrumb({
  routeNames,
  homeName = "Dashboard",
  showHomeOnMobile = false
}: DynamicBreadcrumbProps) {
  const pathname = usePathname()

  // ============================================================
  // EXAMPLE: Custom route name mapping
  // Uncomment and customize this section with your own route names
  // ============================================================

  /*
  const customRouteNames: Record<string, string> = {
    "/": "Dashboard",
    "/users": "Users",
    "/orgs": "Organizations",
    "/weekly": "Weekly Plan",
    "/plan": "Development Plan",
    "/progress": "Progress",
    "/specs": "Specs",
    "/bom": "Bill of Materials",
    "/settings": "Settings",
    "/onboarding": "Onboarding",
    "/sign-in": "Sign In",
    "/sign-up": "Sign Up",
  }
  */

  // Default route names (generic)
  const defaultRouteNames: Record<string, string> = {
    "/": homeName,
    "/dashboard": "Dashboard",
    "/home": "Home",
    "/settings": "Settings",
    "/profile": "Profile",
    "/admin": "Admin",
    "/users": "Users",
  }

  const names = routeNames || defaultRouteNames

  // Handle dynamic routes like /orgs/[id]
  const getRouteName = (path: string): string => {
    // Check if it's a dynamic route (customize this based on your needs)
    // Example: if (path.startsWith("/orgs/") && path !== "/orgs") {
    //   const parts = path.split("/")
    //   if (parts.length === 3) {
    //     return "Organization Details"
    //   }
    // }

    // Return mapped name or capitalize the path
    return names[path] || path.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || path
  }

  // Generate breadcrumb items
  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)

    if (segments.length === 0) {
      return [{ name: homeName, href: "/", isLast: true }]
    }

    const breadcrumbs = []
    let currentPath = ""

    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`
      const isLast = i === segments.length - 1
      const name = getRouteName(currentPath)

      breadcrumbs.push({
        name,
        href: currentPath,
        isLast,
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <div key={item.href} className="flex items-center">
            <BreadcrumbItem className={index === 0 && !showHomeOnMobile ? "hidden md:block" : ""}>
              {item.isLast ? (
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.name}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && (
              <BreadcrumbSeparator className={index === 0 && !showHomeOnMobile ? "hidden md:block" : ""} />
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
