import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Edit3, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export interface ColumnDef {
  key: string;
  label: string;
  type?: "text" | "number" | "badge" | "date" | "custom";
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  badgeColor?: (value: unknown) => string;
}

export interface DynamicTableProps {
  columns: ColumnDef[];
  data: unknown[];
  onEdit: (item: Record<string, unknown>) => void;
  onDelete: (id: unknown) => Promise<void>;
  loading?: boolean;
  pageSize?: number;
  searchFields?: string[];
  idField?: string;
  title?: string;
  emptyMessage?: string;
}

const DynamicTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  loading = false,
  pageSize = 10,
  searchFields = [],
  idField = "id",
  title = "Data Table",
  emptyMessage = "No data available",
}: DynamicTableProps) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<unknown>(null);
  const [sortField, setSortField] = useState<string>("");
  const [sortAsc, setSortAsc] = useState(true);

  // Filter
  const filtered = data.filter((row) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const rowObj = row as Record<string, unknown>;
    return searchFields.some(
      (field) =>
        String(rowObj[field] ?? "")
          .toLowerCase()
          .includes(q)
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aVal = aObj[sortField];
    const bVal = bObj[sortField];
    let cmp = 0;

    if (typeof aVal === "number" && typeof bVal === "number") {
      cmp = aVal - bVal;
    } else {
      cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""));
    }

    return sortAsc ? cmp : -cmp;
  });

  // Paginate
  const total = sorted.length;
  const pageCount = Math.ceil(total / pageSize);
  const start = page * pageSize;
  const paged = sorted.slice(start, start + pageSize) as Record<string, unknown>[];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await onDelete(deleting);
      setDeleting(null);
      if (start >= total - 1 && page > 0) setPage(page - 1);
    } catch {
      // error handled by caller
    }
  };

  const renderCell = (column: ColumnDef, row: Record<string, unknown>): React.ReactNode => {
    const value = row[column.key];

    // Custom render
    if (column.render) {
      return column.render(value, row) as React.ReactNode;
    }

    // Type-based render
    switch (column.type) {
      case "badge":
        return (
          <Badge
            className={column.badgeColor ? column.badgeColor(value) : ""}
          >
            {String(value)}
          </Badge>
        );
      case "date":
        return new Date(value as string).toLocaleDateString();
      case "number":
        return Number(value).toLocaleString();
      default:
        return String(value ?? "-");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {searchFields.length > 0 && (
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-10 h-9 bg-background/50"
            />
          </div>
        )}
        <span className="text-xs text-muted-foreground">
          {total > 0 ? `${start + 1}-${Math.min(start + pageSize, total)} of ${total}` : "No data"}
        </span>
      </div>

      {/* Table */}
      <div className="border border-border/50 rounded-lg overflow-hidden bg-background/20">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : paged.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/30">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={col.width ? `w-${col.width}` : ""}
                    onClick={() => col.sortable && handleSort(col.key)}
                    style={{
                      width: col.width,
                      cursor: col.sortable ? "pointer" : "default",
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortField === col.key && (
                        <span className="text-xs">
                          {sortAsc ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((row, i) => (
                <motion.tr
                  key={String(row[idField])}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-border/30 hover:bg-muted/20 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell key={`${row[idField]}-${col.key}`} className="py-3 text-sm">
                      {renderCell(col, row)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(row)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="w-4 h-4 text-blue-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleting(row[idField])}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount - 1}
            onClick={() => setPage(page + 1)}
            className="h-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete item?</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DynamicTable;
