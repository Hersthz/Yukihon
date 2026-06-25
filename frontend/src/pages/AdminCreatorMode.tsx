import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  PlusCircle,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  creatorModeApi,
  type CreatorAuditStage,
  type CreatorAnalytics,
  type CreatorContentType,
  type CreatorTemplate,
  type CreatorTemplateAuditEvent,
  type CreatorTemplateStatus,
} from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import CreatorBlockEditor from "@/features/creator-mode/components/CreatorBlockEditor";
import CreatorCanvas from "@/features/creator-mode/components/CreatorCanvas";
import CreatorAuditTimeline from "@/features/creator-mode/components/CreatorAuditTimeline";
import CreatorMetricCard from "@/features/creator-mode/components/CreatorMetricCard";
import {
  createDefaultBlock,
  createDefaultDocument,
  moveBlock,
  parseCreatorDocument,
  serializeCreatorDocument,
} from "@/features/creator-mode/builder";
import type { CreatorBlock } from "@/features/creator-mode/types";
import { useToast } from "@/hooks/use-toast";

interface EditorMeta {
  title: string;
  summary: string;
  contentType: CreatorContentType;
  jlptLevel: string;
  tags: string;
  estimatedMinutes: number;
}

interface AuditTimelineFilters {
  stageFilter: CreatorAuditStage | "ALL";
  actorFilter: string;
}

const DEFAULT_AUDIT_FILTERS: AuditTimelineFilters = {
  stageFilter: "ALL",
  actorFilter: "ALL",
};

const DEFAULT_EDITOR_META: EditorMeta = {
  title: "",
  summary: "",
  contentType: "MINI_LESSON",
  jlptLevel: "N5",
  tags: "",
  estimatedMinutes: 12,
};

const STATUS_STYLES: Record<CreatorTemplateStatus, string> = {
  DRAFT: "bg-slate-500/20 text-slate-200 border-slate-400/40",
  PENDING_REVIEW: "bg-amber-500/20 text-amber-200 border-amber-400/40",
  APPROVED: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  REJECTED: "bg-red-500/20 text-red-200 border-red-400/40",
  PUBLISHED: "bg-sky-500/20 text-sky-200 border-sky-400/40",
};

const AdminCreatorMode = () => {
  const { toast } = useToast();

  const [templates, setTemplates] = useState<CreatorTemplate[]>([]);
  const [reviewQueue, setReviewQueue] = useState<CreatorTemplate[]>([]);
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState("studio");

  const [editorMeta, setEditorMeta] = useState<EditorMeta>(DEFAULT_EDITOR_META);
  const [blocks, setBlocks] = useState<CreatorBlock[]>(createDefaultDocument().blocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(blocks[0]?.id ?? null);
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});
  const [auditTimelineByTemplate, setAuditTimelineByTemplate] = useState<
    Record<number, CreatorTemplateAuditEvent[]>
  >({});
  const [auditFiltersByTemplate, setAuditFiltersByTemplate] = useState<
    Record<number, AuditTimelineFilters>
  >({});
  const [loadingAuditTemplateId, setLoadingAuditTemplateId] = useState<number | null>(null);
  const [auditDialogTemplate, setAuditDialogTemplate] = useState<CreatorTemplate | null>(null);

  const [templateFilter, setTemplateFilter] = useState<CreatorTemplateStatus | "ALL">("ALL");

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId]
  );

  const filteredTemplates = useMemo(() => {
    if (templateFilter === "ALL") {
      return templates;
    }
    return templates.filter((template) => template.status === templateFilter);
  }, [templateFilter, templates]);

  const resetEditor = useCallback(() => {
    const defaultDocument = createDefaultDocument();
    setActiveTemplateId(null);
    setEditorMeta(DEFAULT_EDITOR_META);
    setBlocks(defaultDocument.blocks);
    setSelectedBlockId(defaultDocument.blocks[0]?.id ?? null);
  }, []);

  const hydrateFromTemplate = useCallback((template: CreatorTemplate) => {
    const parsed = parseCreatorDocument(template.builderJson);
    setActiveTemplateId(template.id);
    setEditorMeta({
      title: template.title,
      summary: template.summary ?? "",
      contentType: template.contentType as CreatorContentType,
      jlptLevel: template.jlptLevel,
      tags: template.tags ?? "",
      estimatedMinutes: template.estimatedMinutes,
    });
    setBlocks(parsed.blocks);
    setSelectedBlockId(parsed.blocks[0]?.id ?? null);
  }, []);

  const loadTemplateTimeline = useCallback(
    async (
      templateId: number,
      options?: {
        filters?: AuditTimelineFilters;
      }
    ) => {
      const effectiveFilters =
        options?.filters ?? auditFiltersByTemplate[templateId] ?? DEFAULT_AUDIT_FILTERS;

      try {
        setLoadingAuditTemplateId(templateId);
        const events = await creatorModeApi.getTemplateAuditTimeline(templateId, {
          stage: effectiveFilters.stageFilter === "ALL" ? undefined : effectiveFilters.stageFilter,
          actor: effectiveFilters.actorFilter === "ALL" ? undefined : effectiveFilters.actorFilter,
        });
        setAuditTimelineByTemplate((previous) => ({
          ...previous,
          [templateId]: events,
        }));
        setAuditFiltersByTemplate((previous) => ({
          ...previous,
          [templateId]: effectiveFilters,
        }));
      } catch {
        toast({
          title: "Không có dòng thời gian kiểm duyệt",
          description: "Không tải được lịch sử duyệt của mẫu này.",
          variant: "destructive",
        });
      } finally {
        setLoadingAuditTemplateId((current) => (current === templateId ? null : current));
      }
    },
    [auditFiltersByTemplate, toast]
  );

  const handleAuditFiltersChange = useCallback(
    (templateId: number, filters: AuditTimelineFilters) => {
      setAuditFiltersByTemplate((previous) => ({
        ...previous,
        [templateId]: filters,
      }));
      void loadTemplateTimeline(templateId, { filters });
    },
    [loadTemplateTimeline]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [templatesData, analyticsData] = await Promise.all([
        creatorModeApi.getTemplates(),
        creatorModeApi.getAnalytics(),
      ]);

      setTemplates(templatesData);
      setAnalytics(analyticsData);

      const queueData = await creatorModeApi.getReviewQueue();
      setReviewQueue(queueData);
    } catch {
      toast({
        title: "Tải Creator Mode thất bại",
        description: "Không tải được mẫu của creator và dữ liệu phân tích.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAddBlock = useCallback((type: CreatorBlock["type"]) => {
    const next = createDefaultBlock(type);
    setBlocks((previous) => [...previous, next]);
    setSelectedBlockId(next.id);
  }, []);

  const handleMoveBlock = useCallback((fromIndex: number, toIndex: number) => {
    setBlocks((previous) => moveBlock(previous, fromIndex, toIndex));
  }, []);

  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      setBlocks((previous) => {
        const next = previous.filter((block) => block.id !== blockId);
        if (next.length === 0) {
          const fallback = createDefaultBlock("SCENE");
          setSelectedBlockId(fallback.id);
          return [fallback];
        }
        if (selectedBlockId === blockId) {
          setSelectedBlockId(next[0].id);
        }
        return next;
      });
    },
    [selectedBlockId]
  );

  const handleUpdateBlock = useCallback((blockId: string, updates: Partial<CreatorBlock>) => {
    setBlocks((previous) =>
      previous.map((block) => (block.id === blockId ? { ...block, ...updates } : block))
    );
  }, []);

  const buildPayload = useCallback(
    () => ({
      title: editorMeta.title.trim(),
      summary: editorMeta.summary.trim(),
      contentType: editorMeta.contentType,
      jlptLevel: editorMeta.jlptLevel,
      tags: editorMeta.tags.trim(),
      estimatedMinutes: editorMeta.estimatedMinutes,
      builderJson: serializeCreatorDocument({ version: 1, blocks }),
    }),
    [blocks, editorMeta]
  );

  const saveDraft = useCallback(async () => {
    if (!editorMeta.title.trim()) {
      toast({
        title: "Thiếu tiêu đề",
        description: "Vui lòng nhập tiêu đề trước khi lưu.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();
      const saved = activeTemplateId
        ? await creatorModeApi.updateTemplate(activeTemplateId, payload)
        : await creatorModeApi.createTemplate(payload);

      setActiveTemplateId(saved.id);
      toast({ title: "Đã lưu bản nháp", description: "Mẫu của creator đã được lưu." });
      await loadData();
      await loadTemplateTimeline(saved.id);
    } catch {
      toast({
        title: "Lưu thất bại",
        description: "Không lưu được bản nháp này.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [activeTemplateId, buildPayload, editorMeta.title, loadData, loadTemplateTimeline, toast]);

  const submitCurrentTemplate = useCallback(async () => {
    try {
      let templateId = activeTemplateId;

      if (!templateId) {
        const payload = buildPayload();
        const created = await creatorModeApi.createTemplate(payload);
        templateId = created.id;
        setActiveTemplateId(created.id);
      }

      await creatorModeApi.submitForReview(templateId);
      toast({ title: "Đã gửi", description: "Mẫu đã được đưa vào hàng chờ duyệt." });
      await loadData();
      await loadTemplateTimeline(templateId);
    } catch {
      toast({
        title: "Gửi thất bại",
        description: "Không gửi được mẫu để duyệt.",
        variant: "destructive",
      });
    }
  }, [activeTemplateId, buildPayload, loadData, loadTemplateTimeline, toast]);

  const reviewAsAdmin = useCallback(
    async (templateId: number, decision: "PUBLISHED" | "REJECTED") => {
      try {
        await creatorModeApi.reviewDecision(templateId, {
          decision,
          reviewNote: reviewNotes[templateId] ?? "",
        });
        toast({
          title: "Đã lưu quyết định của quản trị viên",
          description: `Trạng thái mẫu đã đổi thành ${decision}.`,
        });
        await loadData();
        await loadTemplateTimeline(templateId);
      } catch {
        toast({
          title: "Thao tác quản trị thất bại",
          description: "Không cập nhật được quyết định của quản trị viên.",
          variant: "destructive",
        });
      }
    },
    [loadData, loadTemplateTimeline, reviewNotes, toast]
  );

  const logPlaytest = useCallback(async () => {
    if (!activeTemplateId) {
      toast({
        title: "Chưa chọn mẫu nào",
        description: "Hãy lưu bản nháp trước khi ghi số liệu.",
        variant: "destructive",
      });
      return;
    }

    try {
      await creatorModeApi.recordMetrics(activeTemplateId, {
        attempts: 20,
        completions: 14,
        averageScore: 81,
      });
      toast({ title: "Đã cập nhật số liệu", description: "Đã ghi nhận số liệu chạy thử mẫu." });
      await loadData();
    } catch {
      toast({
        title: "Ghi số liệu thất bại",
        description: "Không ghi được số liệu chạy thử.",
        variant: "destructive",
      });
    }
  }, [activeTemplateId, loadData, toast]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1520px] py-2">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-3">
              <Sparkles className="h-8 w-8 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Xưởng nội dung</h1>
              <p className="text-muted-foreground">
                Kéo-thả mini-lesson, bài kiểm tra, nhánh story. Duyệt nội dung và theo dõi hiệu quả
                tại một nơi.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetEditor}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Bản nháp mới
            </Button>
            <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/70">
            <TabsTrigger value="studio">Xưởng</TabsTrigger>
            <TabsTrigger value="review">Hàng chờ duyệt</TabsTrigger>
            <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          </TabsList>

          <TabsContent value="studio" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
              <Card className="border-border/70 bg-card/70">
                <CardHeader>
                  <CardTitle className="text-base">Thiết lập mẫu</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Tiêu đề</Label>
                    <Input
                      value={editorMeta.title}
                      onChange={(event) =>
                        setEditorMeta((previous) => ({ ...previous, title: event.target.value }))
                      }
                      className="bg-background/60"
                      placeholder="Nhập vai gọi món N4"
                    />
                  </div>

                  <div>
                    <Label>Loại nội dung</Label>
                    <Select
                      value={editorMeta.contentType}
                      onValueChange={(value) =>
                        setEditorMeta((previous) => ({
                          ...previous,
                          contentType: value as CreatorContentType,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-background/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MINI_LESSON">Mini-lesson</SelectItem>
                        <SelectItem value="QUIZ">Bài kiểm tra</SelectItem>
                        <SelectItem value="STORY_BRANCH">Nhánh story</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Cấp độ JLPT</Label>
                    <Select
                      value={editorMeta.jlptLevel}
                      onValueChange={(value) =>
                        setEditorMeta((previous) => ({ ...previous, jlptLevel: value }))
                      }
                    >
                      <SelectTrigger className="bg-background/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Thời lượng ước tính (phút)</Label>
                    <Input
                      type="number"
                      min={3}
                      max={120}
                      value={editorMeta.estimatedMinutes}
                      onChange={(event) => {
                        const next = Number.parseInt(event.target.value, 10);
                        setEditorMeta((previous) => ({
                          ...previous,
                          estimatedMinutes: Number.isNaN(next)
                            ? previous.estimatedMinutes
                            : Math.max(3, Math.min(120, next)),
                        }));
                      }}
                      className="bg-background/60"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Tóm tắt</Label>
                    <Textarea
                      value={editorMeta.summary}
                      onChange={(event) =>
                        setEditorMeta((previous) => ({ ...previous, summary: event.target.value }))
                      }
                      className="bg-background/60"
                      placeholder="Mục tiêu bài học và kết quả cho người học"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Thẻ</Label>
                    <Input
                      value={editorMeta.tags}
                      onChange={(event) =>
                        setEditorMeta((previous) => ({ ...previous, tags: event.target.value }))
                      }
                      className="bg-background/60"
                      placeholder="restaurant, keigo, speaking"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/70">
                <CardHeader>
                  <CardTitle className="text-base">Thao tác</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={() => void saveDraft()} disabled={saving}>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Lưu bản nháp
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => void submitCurrentTemplate()}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Gửi duyệt
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => void logPlaytest()}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Ghi chạy thử mẫu
                  </Button>
                  {activeTemplateId && (
                    <p className="text-xs text-muted-foreground">
                      ID mẫu đang chọn: {activeTemplateId}. Bạn có thể chuyển giữa các bản nháp bên
                      dưới.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
              <CreatorCanvas
                blocks={blocks}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
                onAddBlock={handleAddBlock}
                onMoveBlock={handleMoveBlock}
                onDeleteBlock={handleDeleteBlock}
              />

              <Card className="border-border/70 bg-card/70">
                <CardHeader>
                  <CardTitle className="text-base">Trình chỉnh sửa khối</CardTitle>
                </CardHeader>
                <CardContent>
                  <CreatorBlockEditor block={selectedBlock} onUpdate={handleUpdateBlock} />
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/70 bg-card/70">
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-base">Thư viện bản nháp</CardTitle>
                <Select
                  value={templateFilter}
                  onValueChange={(value) =>
                    setTemplateFilter(value as CreatorTemplateStatus | "ALL")
                  }
                >
                  <SelectTrigger className="w-[220px] bg-background/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                    {(
                      ["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "PUBLISHED"] as const
                    ).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      hydrateFromTemplate(template);
                      void loadTemplateTimeline(template.id);
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-3 text-left hover:bg-background/70"
                  >
                    <div>
                      <p className="font-medium text-foreground">{template.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {template.contentType} • {template.jlptLevel} • Cập nhật{" "}
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={STATUS_STYLES[template.status]}>
                      {template.status}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>

            {activeTemplateId && (
              <Card className="border-border/70 bg-card/70">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Dòng thời gian kiểm duyệt</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void loadTemplateTimeline(activeTemplateId)}
                    disabled={loadingAuditTemplateId === activeTemplateId}
                  >
                    Làm mới
                  </Button>
                </CardHeader>
                <CardContent>
                  <CreatorAuditTimeline
                    events={auditTimelineByTemplate[activeTemplateId] ?? []}
                    loading={loadingAuditTemplateId === activeTemplateId}
                    emptyMessage="Chưa có sự kiện kiểm duyệt nào cho mẫu này."
                    stageFilter={
                      (auditFiltersByTemplate[activeTemplateId] ?? DEFAULT_AUDIT_FILTERS)
                        .stageFilter
                    }
                    actorFilter={
                      (auditFiltersByTemplate[activeTemplateId] ?? DEFAULT_AUDIT_FILTERS)
                        .actorFilter
                    }
                    onFiltersChange={(filters) =>
                      handleAuditFiltersChange(activeTemplateId, filters)
                    }
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <Card className="border-border/70 bg-card/70">
              <CardHeader>
                <CardTitle className="text-base">Hàng chờ duyệt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviewQueue.length === 0 && (
                  <p className="text-sm text-muted-foreground">Không có mẫu nào đang chờ duyệt.</p>
                )}

                {reviewQueue.map((template) => (
                  <div
                    key={template.id}
                    className="rounded-xl border border-border bg-background/50 p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">{template.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {template.contentType} • {template.jlptLevel} • bởi{" "}
                          {template.createdByDisplayName ?? "Không rõ"}
                        </p>
                      </div>
                      <Badge variant="outline" className={STATUS_STYLES[template.status]}>
                        {template.status}
                      </Badge>
                    </div>

                    <Textarea
                      value={reviewNotes[template.id] ?? ""}
                      onChange={(event) =>
                        setReviewNotes((previous) => ({
                          ...previous,
                          [template.id]: event.target.value,
                        }))
                      }
                      className="mb-3 bg-background/60"
                      placeholder="Ghi chú duyệt gửi cho creator"
                    />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAuditDialogTemplate(template);
                          void loadTemplateTimeline(template.id);
                        }}
                      >
                        Dòng thời gian kiểm duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void reviewAsAdmin(template.id, "PUBLISHED")}
                      >
                        Xuất bản
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => void reviewAsAdmin(template.id, "REJECTED")}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <Dialog
            open={!!auditDialogTemplate}
            onOpenChange={(open) => !open && setAuditDialogTemplate(null)}
          >
            <DialogContent className="max-w-2xl border-border/70 bg-card/95">
              <DialogHeader>
                <DialogTitle>
                  Dòng thời gian kiểm duyệt
                  {auditDialogTemplate ? ` - ${auditDialogTemplate.title}` : ""}
                </DialogTitle>
              </DialogHeader>
              <CreatorAuditTimeline
                events={
                  auditDialogTemplate ? (auditTimelineByTemplate[auditDialogTemplate.id] ?? []) : []
                }
                loading={
                  auditDialogTemplate ? loadingAuditTemplateId === auditDialogTemplate.id : false
                }
                emptyMessage="Không tìm thấy lịch sử kiểm duyệt cho mẫu này."
                stageFilter={
                  auditDialogTemplate
                    ? (auditFiltersByTemplate[auditDialogTemplate.id] ?? DEFAULT_AUDIT_FILTERS)
                        .stageFilter
                    : "ALL"
                }
                actorFilter={
                  auditDialogTemplate
                    ? (auditFiltersByTemplate[auditDialogTemplate.id] ?? DEFAULT_AUDIT_FILTERS)
                        .actorFilter
                    : "ALL"
                }
                onFiltersChange={
                  auditDialogTemplate
                    ? (filters) => handleAuditFiltersChange(auditDialogTemplate.id, filters)
                    : undefined
                }
              />
            </DialogContent>
          </Dialog>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <CreatorMetricCard
                title="Mẫu"
                value={analytics?.totalTemplates ?? 0}
                hint={`${analytics?.drafts ?? 0} bản nháp • ${analytics?.pendingReview ?? 0} chờ duyệt`}
              />
              <CreatorMetricCard
                title="Tỉ lệ hoàn thành"
                value={`${analytics?.completionRate ?? 0}%`}
                hint={`${analytics?.totalCompletions ?? 0} lượt hoàn thành / ${analytics?.totalUsage ?? 0} lượt thử`}
              />
              <CreatorMetricCard
                title="Điểm trung bình"
                value={analytics?.averageScore ?? 0}
                hint="Điểm trung bình của mẫu creator"
              />
              <CreatorMetricCard
                title="Đã xuất bản"
                value={analytics?.published ?? 0}
                hint={`${analytics?.approved ?? 0} đã duyệt • ${analytics?.rejected ?? 0} bị từ chối`}
              />
            </div>

            <Card className="border-border/70 bg-card/70">
              <CardHeader>
                <CardTitle className="text-base">Mẫu hiệu quả nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead className="text-right">Lượt dùng</TableHead>
                      <TableHead className="text-right">Hoàn thành</TableHead>
                      <TableHead className="text-right">Điểm TB</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(analytics?.topTemplates ?? []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.contentType}</TableCell>
                        <TableCell className="text-right">{item.usageCount}</TableCell>
                        <TableCell className="text-right">{item.completionRate}%</TableCell>
                        <TableCell className="text-right">{item.averageScore}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminCreatorMode;
