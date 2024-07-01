import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const tableRef = useRef<HTMLTableSectionElement>(null!);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [params, setParams] = useState({ width: 600, numCols: 4 });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  function handleResize() {
    let numCols = 0;
    let reserved = 0;

    columns.forEach((column) => {
      if (column.size) {
        reserved += column.size;
        numCols++;
      }
    });

    tableRef.current &&
      setParams({
        width: Math.floor(tableRef.current.clientWidth - reserved),
        numCols,
      });
  }

  useEffect(() => {
    handleResize();
  }, [tableRef]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="w-full overflow-hidden">
      <div className="items-center py-2 hidden lg:flex"></div>
      <div className="rounded-md border-2 border-primary overflow-x-hidden overflow-y-scroll w-full max-h-[65dvh] ">
        <Table className="flex flex-col w-full text-ellipsis ">
          <TableHeader className="border-b-2 border-primary sticky top-0 bg-background z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const mobile =
                    (header.column.columnDef.meta &&
                      (header.column.columnDef.meta as { mobile: boolean })
                        .mobile) ||
                    false;

                  return (
                    <TableHead
                      key={header.id}
                      className={mobile ? "" : "max-md:hidden"}
                      style={{
                        width:
                          header.getSize() === 150
                            ? Math.max(
                                150,
                                Math.floor(params.width / params.numCols)
                              )
                            : header.getSize(),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="h-fit" ref={tableRef}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const mobile =
                      (cell.column.columnDef.meta &&
                        (cell.column.columnDef.meta as { mobile: boolean })
                          .mobile) ||
                      false;

                    return (
                      <TableCell
                        key={cell.id}
                        className={mobile ? "" : "max-md:hidden"}
                        style={{
                          width:
                            cell.column.getSize() === 150
                              ? Math.max(
                                  150,
                                  Math.floor(params.width / params.numCols)
                                )
                              : cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
