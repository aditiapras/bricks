# DataTable Component

Reusable data table component built with TanStack Table and shadcn/ui components.

## Features

- ✅ **Global Search** - Fuzzy search across all columns
- ✅ **Column-Specific Filters** - Customizable filters per column
- ✅ **Sorting** - Ascending/descending sort with visual indicators
- ✅ **Row Selection** - Checkbox column with bulk actions
- ✅ **Column Visibility** - Show/hide columns via dropdown
- ✅ **Pagination** - Built-in pagination with page size control
- ✅ **Table Actions** - Custom actions for selected rows
- ✅ **Empty State** - Custom empty state component
- ✅ **TypeScript** - Full type safety

## Installation

The component requires these dependencies:
```bash
bun add @tanstack/react-table @tanstack/match-sorter-utils
```

And these shadcn components:
```bash
bunx --bun shadcn@latest add popover checkbox dropdown-menu input table button
```

## Usage

### Basic Example

```tsx
import { DataTable, ColumnConfig } from "@/components/data-table"
import { createColumnHelper } from "@tanstack/react-table"

type User = {
  id: string
  name: string
  email: string
  role: "admin" | "user"
}

const columnHelper = createColumnHelper<User>()

const columns: ColumnConfig<User, any>[] = [
  {
    column: columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    enableFilter: true,
    filterPlaceholder: "Filter name...",
    enableSort: true,
  },
  {
    column: columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    enableFilter: true,
    enableSort: true,
  },
  {
    column: columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => (
        <span className="capitalize">{info.getValue()}</span>
      ),
    }),
    enableFilter: true,
    filterType: "dropdown",
    filterOptions: ["admin", "user", "guest"],
    enableSort: true,
  },
]

export function UsersTable() {
  const [data] = useState<User[]>([
    { id: "1", name: "John", email: "john@example.com", role: "admin" },
    { id: "2", name: "Jane", email: "jane@example.com", role: "user" },
  ])

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search users..."
      pageSize={10}
    />
  )
}
```

### With Table Actions

```tsx
const tableActions = (selectedRows: User[]) => (
  <Button
    variant="destructive"
    size="sm"
    onClick={() => handleDelete(selectedRows)}
  >
    <Trash2 data-icon="inline-start" />
    Delete ({selectedRows.length})
  </Button>
)

<DataTable
  columns={columns}
  data={data}
  tableActions={tableActions}
/>
```

### With Dropdown Filters

```tsx
const columns: ColumnConfig<User, any>[] = [
  {
    column: columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => <span className="capitalize">{info.getValue()}</span>,
    }),
    enableFilter: true,
    filterOptions: ["admin", "user", "guest"], // optional
    enableSort: true,
  },
  {
    column: columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => info.getValue(),
    }),
    enableFilter: true,
    // filterOptions not provided - will auto-generate from data
    enableSort: true,
  },
]

<DataTable
  columns={columns}
  data={data}
  enableColumnFilter={true}
/>
```

### With Custom Empty State

```tsx
const emptyState = (
  <div className="flex flex-col items-center gap-2 py-8">
    <p className="text-muted-foreground">No users found</p>
    <Button onClick={handleAddUser}>Add User</Button>
  </div>
)

<DataTable
  columns={columns}
  data={data}
  emptyState={emptyState}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnConfig<TData, TValue>[]` | required | Column definitions with configuration |
| `data` | `TData[]` | required | Table data |
| `searchPlaceholder` | `string` | `"Search..."` | Placeholder for global search input |
| `enableGlobalSearch` | `boolean` | `true` | Enable/disable global search |
| `enableColumnFilter` | `boolean` | `true` | Enable/disable column-specific filters |
| `tableActions` | `(selectedRows: TData[]) => ReactNode` | `undefined` | Render function for bulk actions |
| `emptyState` | `ReactNode` | `undefined` | Custom empty state component |
| `pageSize` | `number` | `10` | Number of rows per page |

## ColumnConfig

Each column configuration object:

```tsx
interface ColumnConfig<TData, TValue> {
  column: ColumnDef<TData, TValue>    // TanStack column definition
  enableFilter?: boolean              // Enable column-specific filter (default: false)
  filterPlaceholder?: string          // Placeholder for filter dropdown button
  filterOptions?: string[]            // Custom filter options for dropdown
  enableSort?: boolean                // Enable sorting (default: true)
  defaultSort?: "asc" | "desc"        // Default sort direction
}
```

## Column Definitions

Using `createColumnHelper`:

```tsx
const columnHelper = createColumnHelper<YourDataType>()

const columns: ColumnConfig<YourDataType, any>[] = [
  {
    column: columnHelper.accessor("fieldName", {
      header: "Column Header",
      cell: (info) => info.getValue(), // or custom renderer
    }),
    enableFilter: false,
    enableSort: true,
  },
  {
    column: columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => (
        <span className="capitalize">{info.getValue()}</span>
      ),
    }),
    enableFilter: true,
    filterOptions: ["admin", "user", "guest"], // optional, auto-generates if not provided
    enableSort: true,
  },
  {
    column: columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <Button onClick={() => handleAction(row.original)}>
          Action
        </Button>
      ),
    }),
    enableFilter: false,
    enableSort: false,
  },
]
```

## Features

### Global Search
- Fuzzy search across all columns
- Shows clear button when filter is active
- Configurable placeholder text

### Column Filters
- Enable per-column with `enableFilter: true`
- Custom placeholder with `filterPlaceholder`
- All filters use dropdown menus
- Provide custom options with `filterOptions: ["option1", "option2"]`
- Or let it auto-generate from unique values in the column
- Filters appear next to global search

### Sorting
- Click column headers to sort
- Visual indicators (↑/↓) for sort direction
- Disable per-column with `enableSort: false`

### Row Selection
- Checkbox column automatically added
- Select all/deselect all in header
- Bulk actions appear when rows selected
- Selected rows passed to `tableActions` function

### Column Visibility
- Dropdown menu to show/hide columns
- Columns with `enableHiding: false` always visible
- Select/deselect column checkboxes

### Pagination
- Previous/Next buttons
- Shows selected row count
- Configurable page size via `pageSize` prop

## Example Implementation

See `components/data-table-example.tsx` for a complete working example with:
- Custom cell renderers
- Status badges
- Date formatting
- Bulk delete action
- Multiple column types

## Styling

The component uses shadcn/ui components and follows the project's design system:
- Semantic colors (`text-muted-foreground`, `bg-primary`, etc.)
- Consistent spacing with `gap-*` classes
- Responsive layout
- Dark mode support via theme system
