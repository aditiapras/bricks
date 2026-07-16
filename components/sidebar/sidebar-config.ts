import {
    GaugeCircle,
    Calendar,
    Map,
    ChartNoAxesColumnDecreasing,
    List,
    Network,
    Settings2,
    Users,
    Building2,
    LayoutDashboard,
    FileText,
    BarChart3,
    Database,
    Cog,
    Home
} from "lucide-react"

// Generic role type - customize based on your needs
export type UserRole = "root" | "admin" | "teamAdmin" | "user" | string
export type PermissionAction = "read" | "create" | "update" | "delete"

export interface MenuItem {
    name: string
    url: string
    icon: React.ElementType
    permission?: string // permission key
    roles: UserRole[] // roles yang bisa mengakses menu ini
}

// ============================================================
// EXAMPLE: Manual permission mapping untuk simplifikasi
// Uncomment and customize this section if you need role-based permissions
// ============================================================

/*
const rolePermissions: Record<UserRole, Record<string, PermissionAction[]>> = {
    root: {
        orgs: ["create", "read", "update", "delete"],
        users: ["create", "read", "update", "delete"],
        bom: ["create", "read", "update", "delete"],
        plan: ["create", "read", "update", "delete"],
        progress: ["create", "read", "update", "delete"],
        settings: ["read", "update"],
        specs: ["create", "read", "update", "delete"],
        weekly: ["create", "read", "update", "delete"],
    },
    admin: {
        orgs: ["read", "update"], // no create/delete org
        users: ["create", "read", "update", "delete"],
        bom: ["create", "read", "update", "delete"],
        plan: ["create", "read", "update", "delete"],
        progress: ["create", "read", "update", "delete"],
        settings: ["read", "update"],
        specs: ["create", "read", "update", "delete"],
        weekly: ["create", "read", "update", "delete"],
    },
    teamAdmin: {
        orgs: [], // no access page orgs
        users: [], // no access page users
        bom: ["create", "read", "update", "delete"],
        plan: ["create", "read", "update", "delete"],
        progress: ["create", "read", "update", "delete"],
        settings: ["read", "update"],
        specs: ["create", "read", "update", "delete"],
        weekly: ["create", "read", "update", "delete"],
    },
    user: {
        orgs: [],
        users: [],
        bom: ["read"], // restricted CRUD
        plan: ["read", "update"],
        progress: ["read", "update"],
        settings: ["read", "update"],
        specs: ["read"],
        weekly: ["read", "update"],
    }
}
*/

// ============================================================
// EXAMPLE: Menu items configuration
// Uncomment and customize this section with your own menu items
// ============================================================

/*
export const menuItems: MenuItem[] = [
    {
        name: "Dashboard",
        url: "/",
        icon: GaugeCircle,
        roles: ["root", "admin", "teamAdmin", "user"]
    },

    {
        name: "Weekly Plan",
        url: "/weekly",
        icon: Calendar,
        permission: "weekly",
        roles: ["root", "admin", "teamAdmin", "user"]
    },
    {
        name: "Development Plan",
        url: "/plan",
        icon: Map,
        permission: "plan",
        roles: ["root", "admin", "teamAdmin", "user"]
    },
    {
        name: "Progress",
        url: "/progress",
        icon: ChartNoAxesColumnDecreasing,
        permission: "progress",
        roles: ["root", "admin", "teamAdmin", "user"]
    },
    {
        name: "Specs",
        url: "/specs",
        icon: List,
        permission: "specs",
        roles: ["root", "admin", "teamAdmin"]
    },
    {
        name: "Bill of Materials (BOM)",
        url: "/bom",
        icon: Network,
        permission: "bom",
        roles: ["root", "admin", "teamAdmin"]
    },
    {
        name: "Organizations",
        url: "/orgs",
        icon: Building2,
        permission: "orgs",
        roles: ["root", "admin"] // teamAdmin dan user tidak punya akses orgs
    },
    {
        name: "Users",
        url: "/users",
        icon: Users,
        permission: "users",
        roles: ["root", "admin"] // teamAdmin dan user tidak punya akses users
    },
    {
        name: "Settings",
        url: "/settings",
        icon: Settings2,
        permission: "settings",
        roles: ["root", "admin", "teamAdmin", "user"]
    }
]
*/

// ============================================================
// DEFAULT: Generic menu items (simple example)
// Replace this with your own menu items
// ============================================================

export const defaultMenuItems: MenuItem[] = [
    {
        name: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
        roles: ["root", "admin", "teamAdmin", "user", "guest"]
    },
    {
        name: "Home",
        url: "/home",
        icon: Home,
        roles: ["root", "admin", "teamAdmin", "user", "guest"]
    },
    {
        name: "Documents",
        url: "/documents",
        icon: FileText,
        roles: ["root", "admin", "teamAdmin", "user"]
    },
    {
        name: "Analytics",
        url: "/analytics",
        icon: BarChart3,
        roles: ["root", "admin", "teamAdmin"]
    },
    {
        name: "Database",
        url: "/database",
        icon: Database,
        roles: ["root", "admin"]
    },
    {
        name: "Settings",
        url: "/settings",
        icon: Cog,
        roles: ["root", "admin", "teamAdmin", "user"]
    }
]

// ============================================================
// EXAMPLE: Helper function untuk filter menu berdasarkan role dan permission
// Uncomment if you need role-based menu filtering
// ============================================================

/*
export function getMenuItemsForRole(userRole: UserRole): MenuItem[] {
    const permissions = rolePermissions[userRole]

    return menuItems.filter(item => {
        // Cek apakah role ada di list roles yang boleh akses menu ini
        if (!item.roles.includes(userRole)) {
            return false
        }

        // Jika ada permission yang didefinisikan, cek apakah role punya permission tersebut
        if (item.permission) {
            const menuPermissions = permissions[item.permission]

            // Minimal harus punya "read" permission untuk bisa melihat menu
            return menuPermissions && menuPermissions.includes("read")
        }

        // Jika tidak ada permission yang didefinisikan, izinkan (default)
        return true
    })
}

// Helper function untuk cek apakah user punya akses ke menu tertentu
export function hasMenuAccess(userRole: UserRole, menuUrl: string): boolean {
    const menu = menuItems.find(item => item.url === menuUrl)
    if (!menu) return false

    return menu.roles.includes(userRole)
}

// Helper function untuk cek permission spesifik pada menu
export function hasMenuPermission(userRole: UserRole, menuUrl: string, action: PermissionAction): boolean {
    const menu = menuItems.find(item => item.url === menuUrl)
    if (!menu || !menu.permission) return false

    const permissions = rolePermissions[userRole]
    const menuPermissions = permissions[menu.permission]

    return menuPermissions && menuPermissions.includes(action)
}
*/
