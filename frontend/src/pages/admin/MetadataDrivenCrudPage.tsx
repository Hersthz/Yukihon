import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { metaApi, type FieldMetadata } from "@/api/metaApi";
import { createAutoCrudApi, type AutoCrudRow } from "@/api/autoCrudApi";
import { createAutoCrudHooks } from "@/lib/createAutoCrudHooks";

const PAGE_SIZE = 10;

interface MetadataDrivenCrudPageProps {
  /** Entity simple name (e.g. "AppSetting") or resource path (e.g. "app-settings"). */
  entityName: string;
}

type FormState = Record<string, unknown>;

const isFormField = (field: FieldMetadata) => !field.readOnly && field.name !== "id";

const initialFormState = (fields: FieldMetadata[], row?: AutoCrudRow): FormState => {
  const state: FormState = {};
  for (const field of fields.filter(isFormField)) {
    const existing = row ? row[field.name] : undefined;
    if (field.type === "boolean") {
      state[field.name] = existing != null ? Boolean(existing) : false;
    } else {
      state[field.name] = existing != null ? existing : "";
    }
  }
  return state;
};

const coerce = (field: FieldMetadata, value: unknown): unknown => {
  if (field.type === "boolean") return Boolean(value);
  if (field.type === "number") return value === "" || value == null ? null : Number(value);
  if (value === "") return null;
  return value;
};

const MetadataDrivenCrudPage = ({ entityName }: MetadataDrivenCrudPageProps) => {
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  const metaQuery = useQuery({
    queryKey: ["admin-meta", entityName],
    queryFn: () => metaApi.getEntity(entityName),
  });
  const meta = metaQuery.data ?? null;
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AutoCrudRow | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [deleteTarget, setDeleteTarget] = useState<AutoCrudRow | null>(null);

  const resourcePath = meta?.path ?? "";
  const api = useMemo(() => createAutoCrudApi(resourcePath), [resourcePath]);
  const hooks = useMemo(
    () => createAutoCrudHooks(resourcePath || "auto-crud", api),
    [resourcePath, api]
  );

  const listQuery = hooks.useList(
    { page, size: PAGE_SIZE, search: search || undefined },
    { enabled: !!meta }
  );
  const rows = useMemo(() => listQuery.data?.content ?? [], [listQuery.data]);
  const totalPages = listQuery.data?.totalPages ?? 0;
  const loading = listQuery.isLoading;

  const createMut = hooks.useCreate();
  const updateMut = hooks.useUpdate();
  const removeMut = hooks.useRemove();
  const saving = createMut.isPending || updateMut.isPending;

  const listFields = useMemo(() => (meta ? meta.fields.filter((f) => f.listVisible) : []), [meta]);
  const formFields = useMemo(() => (meta ? meta.fields.filter(isFormField) : []), [meta]);

  const can = useCallback(
    (action: string) => {
      const prefix = meta?.permissionPrefix;
      return !prefix || hasPermission(`${prefix}_${action}`);
    },
    [meta, hasPermission]
  );
  const canCreate = can("CREATE");
  const canUpdate = can("UPDATE");
  const canDelete = can("DELETE");

  useEffect(() => {
    if (metaQuery.error) {
      toast({
        title: "Không tải được metadata",
        description:
          metaQuery.error instanceof Error ? metaQuery.error.message : "Lỗi không xác định",
        variant: "destructive",
      });
    }
  }, [metaQuery.error, toast]);

  useEffect(() => {
    if (listQuery.error) {
      toast({
        title: "Không tải được dữ liệu",
        description:
          listQuery.error instanceof Error ? listQuery.error.message : "Lỗi không xác định",
        variant: "destructive",
      });
    }
  }, [listQuery.error, toast]);

  const openCreate = () => {
    if (!meta) return;
    setEditing(null);
    setForm(initialFormState(meta.fields));
    setDialogOpen(true);
  };

  const openEdit = (row: AutoCrudRow) => {
    if (!meta) return;
    setEditing(row);
    setForm(initialFormState(meta.fields, row));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!meta) return;
    const body: Record<string, unknown> = {};
    for (const field of formFields) {
      body[field.name] = coerce(field, form[field.name]);
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, body });
        toast({ title: "Đã cập nhật" });
      } else {
        await createMut.mutateAsync(body);
        toast({ title: "Đã tạo mới" });
      }
      setDialogOpen(false);
    } catch (error: unknown) {
      toast({
        title: "Lưu thất bại",
        description: error instanceof Error ? error.message : "Lỗi không xác định",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeMut.mutateAsync(deleteTarget.id);
      toast({ title: "Đã xoá" });
      setDeleteTarget(null);
      // Step back a page if we just removed the last row on it (invalidation refetches the rest).
      if (rows.length === 1 && page > 0) {
        setPage((p) => p - 1);
      }
    } catch (error: unknown) {
      toast({
        title: "Xoá thất bại",
        description: error instanceof Error ? error.message : "Lỗi không xác định",
        variant: "destructive",
      });
    }
  };

  const submitSearch = () => {
    setPage(0);
    setSearch(searchInput.trim());
  };

  const renderCell = (row: AutoCrudRow, field: FieldMetadata) => {
    const value = row[field.name];
    if (field.type === "boolean") {
      return value ? "✓" : "—";
    }
    if (value == null || value === "") return "—";
    const text = String(value);
    return text.length > 60 ? `${text.slice(0, 60)}…` : text;
  };

  const renderField = (field: FieldMetadata) => {
    const value = form[field.name];
    const setValue = (v: unknown) => setForm((prev) => ({ ...prev, [field.name]: v }));

    if (field.type === "boolean") {
      return (
        <div className="flex items-center gap-3">
          <Switch checked={Boolean(value)} onCheckedChange={setValue} />
          <span className="text-sm text-muted-foreground">{value ? "Bật" : "Tắt"}</span>
        </div>
      );
    }
    if (field.type === "textarea") {
      return (
        <Textarea
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
        />
      );
    }
    if (field.type === "select") {
      return (
        <Select value={(value as string) ?? ""} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || "Chọn..."} />
          </SelectTrigger>
          <SelectContent>
            {field.enumValues.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return (
      <Input
        type={field.type === "number" ? "number" : field.type === "password" ? "password" : "text"}
        value={(value as string) ?? ""}
        placeholder={field.placeholder}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/70">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{meta?.plural ?? entityName}</CardTitle>
              {meta?.description && <CardDescription>{meta.description}</CardDescription>}
            </div>
            <div className="flex items-center gap-2">
              {meta && meta.searchableFields.length > 0 && (
                <div className="flex items-center gap-2">
                  <Input
                    value={searchInput}
                    placeholder="Tìm kiếm..."
                    className="w-48"
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                  />
                  <Button variant="outline" size="icon" onClick={submitSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {canCreate && (
                <Button onClick={openCreate} disabled={!meta}>
                  <Plus className="mr-1 h-4 w-4" /> Thêm
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    {listFields.map((field) => (
                      <TableHead key={field.name}>{field.label}</TableHead>
                    ))}
                    <TableHead className="w-28 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={listFields.length + 2} className="py-10 text-center">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={listFields.length + 2}
                        className="py-10 text-center text-muted-foreground"
                      >
                        Chưa có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs">{row.id}</TableCell>
                        {listFields.map((field) => (
                          <TableCell key={field.name}>{renderCell(row, field)}</TableCell>
                        ))}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {canUpdate && (
                              <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteTarget(row)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Chỉnh sửa" : "Thêm mới"} {meta?.name}
            </DialogTitle>
            <DialogDescription>
              {editing ? `ID #${editing.id}` : `Tạo ${meta?.name ?? "bản ghi"} mới`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formFields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label>
                  {field.label}
                  {field.required && <span className="ml-0.5 text-destructive">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Huỷ
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá bản ghi?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xoá {meta?.name} #{deleteTarget?.id}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xoá</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default MetadataDrivenCrudPage;
