import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MoreVertical, Folder, File } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "./column-header";
import { FileInfo } from "@/types";
import { TableActions } from "./data-table";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const columns: ColumnDef<FileInfo>[] = [
  {
    id: "select",
    meta: { mobile: true },
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  {
    accessorKey: "name",
    meta: { mobile: true },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row, table }) => {
      const file = row.original;
      const actions = (table.options.meta as { actions?: TableActions })?.actions;

      const handleClick = () => {
        if (file.isDirectory && actions?.onNavigate) {
          actions.onNavigate(file.fullPath);
        } else if (!file.isDirectory && actions?.onView) {
          actions.onView(file.fullPath);
        }
      };

      return (
        <div
          className="flex items-center gap-2 cursor-pointer hover:text-primary"
          onClick={handleClick}
        >
          {file.isDirectory ? (
            <Folder className="h-4 w-4 text-yellow-500" />
          ) : (
            <File className="h-4 w-4 text-gray-500" />
          )}
          <span>{file.name}</span>
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const file = row.original;
      if (file.isDirectory) return "Folder";
      // Extract extension from name
      const ext = file.name.split(".").pop()?.toUpperCase() || "File";
      return ext;
    },
    enableResizing: true,
  },
  {
    accessorKey: "size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Size" />
    ),
    cell: ({ row }) => {
      const file = row.original;
      if (file.isDirectory) return "-";
      return formatFileSize(file.size);
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Modified" />
    ),
    cell: ({ row }) => formatDate(row.original.date),
    enableResizing: true,
  },
  {
    id: "actions",
    header: ({ table }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-none px-2">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    meta: { mobile: true },
    cell: ({ row, table }) => {
      const file = row.original;
      const actions = (table.options.meta as { actions?: TableActions })?.actions;

      return (
        <div className="w-full flex justify-center text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(file.name)}
              >
                Copy file name
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!file.isDirectory && (
                <>
                  <DropdownMenuItem onClick={() => actions?.onView?.(file.fullPath)}>
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => actions?.onDownload?.(file.fullPath)}>
                    Download
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => actions?.onRename?.(file.fullPath)}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => actions?.onDelete?.(file.fullPath)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    size: 50,
    enableResizing: true,
  },
];
