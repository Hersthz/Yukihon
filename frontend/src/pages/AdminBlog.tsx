import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import DynamicTable, { type ColumnDef } from "@/components/admin/DynamicTable";
import { PageHeader, PageSection } from "@/components/layout/UserPage";
import { blogApi, type BlogPostDto, type BlogPostRequest } from "@/api/blogApi";

const COLUMNS: ColumnDef[] = [
  { key: "title", label: "Tiêu đề", sortable: true },
  { key: "authorName", label: "Tác giả" },
  {
    key: "status",
    label: "Trạng thái",
    type: "badge",
    badgeColor: (v) =>
      v === "PUBLISHED"
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : "bg-amber-100 text-amber-700 border-amber-200",
    render: (v) => (
      <Badge
        className={
          v === "PUBLISHED"
            ? "bg-emerald-100 text-emerald-700 border-emerald-200 text-xs"
            : "bg-amber-100 text-amber-700 border-amber-200 text-xs"
        }
      >
        {v === "PUBLISHED" ? "Đã đăng" : "Nháp"}
      </Badge>
    ),
  },
  {
    key: "publishedAt",
    label: "Ngày đăng",
    render: (v) =>
      v ? (
        new Date(v as string).toLocaleDateString("vi-VN")
      ) : (
        <span className="text-muted-foreground/60">—</span>
      ),
  },
  {
    key: "tags",
    label: "Thẻ",
    render: (v) => {
      const tags = v as string[];
      if (!tags || tags.length === 0) return <span className="text-muted-foreground/60">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      );
    },
  },
];

const emptyForm = (): BlogPostRequest => ({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  tags: [],
  authorName: "",
  status: "DRAFT",
});

const AdminBlog = () => {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<BlogPostRequest>(emptyForm());
  const [tagsInput, setTagsInput] = useState("");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin", "blog"],
    queryFn: () => blogApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: BlogPostRequest) => blogApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "blog"] });
      qc.invalidateQueries({ queryKey: ["blog", "published"] });
      toast.success("Đã tạo bài viết.");
      closeDialog();
    },
    onError: () => toast.error("Tạo bài viết thất bại."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BlogPostRequest }) => blogApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "blog"] });
      qc.invalidateQueries({ queryKey: ["blog", "published"] });
      toast.success("Đã cập nhật bài viết.");
      closeDialog();
    },
    onError: () => toast.error("Cập nhật thất bại."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => blogApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "blog"] });
      qc.invalidateQueries({ queryKey: ["blog", "published"] });
      toast.success("Đã xóa bài viết.");
    },
    onError: () => toast.error("Xóa thất bại."),
  });

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setTagsInput("");
    setDialogOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    const post = row as unknown as BlogPostDto;
    setEditId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      coverImageUrl: post.coverImageUrl ?? "",
      tags: post.tags,
      authorName: post.authorName ?? "",
      status: post.status,
    });
    setTagsInput(post.tags.join(", "));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditId(null);
  };

  const handleSubmit = () => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload: BlogPostRequest = { ...form, tags };

    if (editId !== null) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Quản lý Blog"
          description="Tạo và quản lý bài viết kiến thức"
          icon={<Newspaper className="h-5 w-5 text-primary" />}
          eyebrow="Admin"
        />
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Bài viết mới
        </Button>
      </div>

      <PageSection title="Danh sách bài viết">
        <DynamicTable
          columns={COLUMNS}
          data={posts}
          onEdit={openEdit}
          onDelete={(id) => deleteMutation.mutateAsync(id as number)}
          loading={isLoading}
          searchFields={["title", "authorName"]}
          emptyMessage="Chưa có bài viết nào"
        />
      </PageSection>

      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Tiêu đề *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Tiêu đề bài viết"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Slug (URL)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="tu-dong-tao-tu-tieu-de"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Tác giả</Label>
                <Input
                  value={form.authorName}
                  onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                  placeholder="Tên tác giả"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as "DRAFT" | "PUBLISHED" })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Nháp</SelectItem>
                  <SelectItem value="PUBLISHED">Đã đăng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Ảnh bìa (URL)</Label>
              <Input
                value={form.coverImageUrl}
                onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Thẻ (cách nhau bằng dấu phẩy)</Label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="JLPT, N4, Ngữ pháp"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Mô tả ngắn</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Tóm tắt bài viết (hiển thị ở trang danh sách)"
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Nội dung (Markdown)</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Viết nội dung bằng Markdown..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving || !form.title.trim()}>
              {isSaving ? "Đang lưu..." : editId ? "Cập nhật" : "Tạo bài viết"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
