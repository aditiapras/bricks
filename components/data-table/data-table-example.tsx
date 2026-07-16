"use client"

import { DataTable, ColumnConfig } from "./data-table"
import { createColumnHelper } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

// Example data type
type User = {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "guest"
  status: "active" | "inactive"
  createdAt: string
}

// Example data
const exampleData: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "user",
    status: "inactive",
    createdAt: "2024-03-10",
  },
]

// Column helper
const columnHelper = createColumnHelper<User>()

// Column definitions with configuration
const columns: ColumnConfig<User, any>[] = [
  {
    column: columnHelper.accessor("name", {
      id: "name",
      header: "Name",
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
      cell: (info) => (
        <span className="capitalize">{info.getValue()}</span>
      ),
    }),
    enableFilter: true,
    filterOptions: ["admin", "user", "guest"],
    enableSort: true,
  },
  {
    column: columnHelper.accessor("status", {
      id: "status",
      header: "Status",
      cell: (info) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${info.getValue() === "active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}
        >
          {info.getValue()}
        </span>
      ),
    }),
    enableFilter: true,
    filterOptions: ["active", "inactive"],
    enableSort: true,
  },
  {
    column: columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: "Created At",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    enableFilter: false,
    enableSort: true,
  },
]

export function DataTableExample() {
  const handleDeleteSelected = (selectedRows: User[]) => {
    console.log("Deleting selected rows:", selectedRows)
    // Implement delete logic here
  }

  const tableActions = (selectedRows: User[]) => (
    <Button
      variant="destructive"

      onClick={() => handleDeleteSelected(selectedRows)}
    >
      <Trash2 data-icon="inline-start" />
      Delete ({selectedRows.length})
    </Button>
  )

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Users Table</h1>
      <DataTable
        columns={columns}
        data={exampleData}
        searchPlaceholder="Search users..."
        enableGlobalSearch={true}
        enableColumnFilter={true}
        tableActions={tableActions}
        pageSize={5}
      />
    </div>
  )
}
