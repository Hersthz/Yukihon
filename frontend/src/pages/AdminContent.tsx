import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen,
  Download,
  FileUp,
  Filter,
  GraduationCap,
  HelpCircle,
  Layers3,
  PenTool,
  Plus,
  RefreshCw,
  Save,
} from "lucide-react";
import { adminApi, grammarApi, lessonApi, quizApi, vocabularyApi } from "@/api";
import DynamicTable from "@/components/admin/DynamicTable";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AdminContentForm from "@/pages/admin-content/AdminContentForm";
import { getCsvTemplate, parseBulkImportCsv } from "@/pages/admin-content/csvImport";
import {
  LEVEL_FILTERS,
  LESSON_STATUSES,
  TABS,
  createEmptyGrammar,
  createEmptyLesson,
  createEmptyQuiz,
  createEmptyVocab,
  grammarColumns,
  lessonColumns,
  quizColumns,
  vocabColumns,
} from "@/pages/admin-content/constants";
import {
  normalizeGrammar,
  normalizeLesson,
  normalizeLessonVersion,
  normalizeQuiz,
  normalizeVocabulary,
  toApiPayload,
} from "@/pages/admin-content/contentTransforms";
import {
  AdminTab,
  ContentOverview,
  EditableItem,
  GrammarItem,
  Lesson,
  LessonVersion,
  MediaUploadResult,
  QuizItem,
  VocabItem,
} from "@/pages/admin-content/types";

interface PagedResponse<T> {
  content: T[];
}

const isPagedResponse = <T,>(value: unknown): value is PagedResponse<T> => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as { content?: unknown };
  return Array.isArray(candidate.content);
};

const normalizeList = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (isPagedResponse<T>(value)) {
    return value.content;
  }

  return [];
};

const AdminContent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>("lessons");
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<EditableItem | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [lessonStatusFilter, setLessonStatusFilter] = useState<string>("ALL");
  const [versionsLessonId, setVersionsLessonId] = useState<number | null>(null);

  const contentQueries = useQueries({
    queries: [
      {
        queryKey: ["admin-content", "lessons"],
        queryFn: async (): Promise<Lesson[]> =>
          normalizeList<Record<string, unknown>>(await lessonApi.getAll()).map(normalizeLesson),
      },
      {
        queryKey: ["admin-content", "vocabulary"],
        queryFn: async (): Promise<VocabItem[]> =>
          normalizeList<Record<string, unknown>>(await vocabularyApi.getAll()).map(
            normalizeVocabulary
          ),
      },
      {
        queryKey: ["admin-content", "grammar"],
        queryFn: async (): Promise<GrammarItem[]> =>
          normalizeList<Record<string, unknown>>(await grammarApi.getAll()).map(normalizeGrammar),
      },
      {
        queryKey: ["admin-content", "quizzes"],
        queryFn: async (): Promise<QuizItem[]> =>
          normalizeList<Record<string, unknown>>(await quizApi.getAll()).map(normalizeQuiz),
      },
      {
        queryKey: ["admin-content", "overview"],
        queryFn: async (): Promise<ContentOverview> =>
          (await adminApi.getContentOverview()) as ContentOverview,
      },
    ],
  });

  const [lessonsQuery, vocabularyQuery, grammarQuery, quizzesQuery, overviewQuery] = contentQueries;

  const lessons = useMemo(() => lessonsQuery.data ?? [], [lessonsQuery.data]);
  const vocabulary = useMemo(() => vocabularyQuery.data ?? [], [vocabularyQuery.data]);
  const grammar = useMemo(() => grammarQuery.data ?? [], [grammarQuery.data]);
  const quizzes = useMemo(() => quizzesQuery.data ?? [], [quizzesQuery.data]);
  const overview = overviewQuery.data ?? null;
  const loading = contentQueries.some((query) => query.isLoading);

  useEffect(() => {
    if (contentQueries.some((query) => query.isError)) {
      toast({
        title: "Tải thất bại",
        description: "Không tải được dữ liệu quản lý nội dung.",
        variant: "destructive",
      });
    }
  }, [contentQueries, toast]);

  const loadContent = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["admin-content"] }),
    [queryClient]
  );

  const lessonVersionsQuery = useQuery({
    queryKey: ["admin-content", "lesson-versions", versionsLessonId],
    queryFn: async (): Promise<LessonVersion[]> =>
      normalizeList<Record<string, unknown>>(
        await lessonApi.getVersions(versionsLessonId as number)
      ).map(normalizeLessonVersion),
    enabled: versionsLessonId != null,
  });

  const lessonVersions = lessonVersionsQuery.data ?? [];

  useEffect(() => {
    if (lessonVersionsQuery.isError) {
      toast({
        title: "Không có lịch sử phiên bản",
        description: "Hiện không tải được các bản lưu của bài học.",
        variant: "destructive",
      });
    }
  }, [lessonVersionsQuery.isError, toast]);

  const currentTabLabel = useMemo(
    () => TABS.find((tab) => tab.value === activeTab)?.label ?? "Nội dung",
    [activeTab]
  );

  const singularLabels: Record<AdminTab, string> = {
    lessons: "Bài học",
    vocabulary: "Mục từ vựng",
    grammar: "Mục ngữ pháp",
    quizzes: "Bài kiểm tra",
  };

  const currentData = useMemo(() => {
    switch (activeTab) {
      case "lessons":
        return lessons;
      case "vocabulary":
        return vocabulary;
      case "grammar":
        return grammar;
      case "quizzes":
        return quizzes;
      default:
        return [];
    }
  }, [activeTab, grammar, lessons, quizzes, vocabulary]);

  const filteredData = useMemo(() => {
    return currentData.filter((row) => {
      const rowLevel = String((row as { jlptLevel?: string }).jlptLevel ?? "");
      const levelMatches = levelFilter === "ALL" || rowLevel === levelFilter;

      if (!levelMatches) {
        return false;
      }

      if (activeTab === "lessons" && lessonStatusFilter !== "ALL") {
        return (row as Lesson).status === lessonStatusFilter;
      }

      return true;
    });
  }, [activeTab, currentData, levelFilter, lessonStatusFilter]);

  const saveItem = useCallback(async (tab: AdminTab, item: EditableItem) => {
    const payload = toApiPayload(tab, item);
    const id = item.id;

    if (id) {
      if (tab === "lessons") {
        await lessonApi.update(id, payload);
      }
      if (tab === "vocabulary") {
        await vocabularyApi.update(id, payload);
      }
      if (tab === "grammar") {
        await grammarApi.update(id, payload);
      }
      if (tab === "quizzes") {
        await quizApi.update(id, payload);
      }
      return;
    }

    if (tab === "lessons") {
      await lessonApi.create(payload);
    }
    if (tab === "vocabulary") {
      await vocabularyApi.create(payload);
    }
    if (tab === "grammar") {
      await grammarApi.create(payload);
    }
    if (tab === "quizzes") {
      await quizApi.create(payload);
    }
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async ({ tab, id }: { tab: AdminTab; id: unknown }) => {
      const itemId = Number(id);

      if (tab === "lessons") {
        await lessonApi.delete(itemId);
      }
      if (tab === "vocabulary") {
        await vocabularyApi.delete(itemId);
      }
      if (tab === "grammar") {
        await grammarApi.delete(itemId);
      }
      if (tab === "quizzes") {
        await quizApi.delete(itemId);
      }
    },
    onSuccess: () => {
      toast({ title: "Đã xóa", description: `Đã xóa mục ${currentTabLabel}.` });
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
    },
    onError: () => {
      toast({
        title: "Xóa thất bại",
        description: "Không xóa được mục này.",
        variant: "destructive",
      });
    },
  });

  const deleteItem = useCallback(
    (tab: AdminTab, id: unknown) =>
      deleteMutation
        .mutateAsync({ tab, id })
        .then(() => undefined)
        .catch(() => undefined),
    [deleteMutation]
  );

  const openEditor = useCallback(async (tab: AdminTab, item?: EditableItem) => {
    setActiveTab(tab);

    if (item) {
      setEditItem(item);
      setDialogOpen(true);

      if (tab === "lessons" && item.id) {
        setVersionsLessonId(item.id);
      } else {
        setVersionsLessonId(null);
      }
      return;
    }

    if (tab === "lessons") setEditItem(createEmptyLesson());
    if (tab === "vocabulary") setEditItem(createEmptyVocab());
    if (tab === "grammar") setEditItem(createEmptyGrammar());
    if (tab === "quizzes") setEditItem(createEmptyQuiz());
    setVersionsLessonId(null);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editItem) {
      return;
    }

    try {
      setSaving(true);
      await saveItem(activeTab, editItem);
      toast({ title: "Đã lưu", description: `Đã lưu mục ${currentTabLabel} thành công.` });
      setDialogOpen(false);
      setEditItem(null);
      setVersionsLessonId(null);
      await loadContent();
    } catch {
      toast({
        title: "Lưu thất bại",
        description: "Vui lòng kiểm tra lại biểu mẫu và thử lại.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [activeTab, currentTabLabel, editItem, loadContent, saveItem, toast]);

  const handleMediaUpload = useCallback(
    async (file: File): Promise<MediaUploadResult> => {
      try {
        const result = await adminApi.uploadMedia(file);
        toast({
          title: "Tải lên hoàn tất",
          description: `${file.name} đã có sẵn trong CMS.`,
        });
        return result as MediaUploadResult;
      } catch {
        toast({
          title: "Tải lên thất bại",
          description: "Không tải lên được tệp media này.",
          variant: "destructive",
        });
        throw new Error("Upload failed");
      }
    },
    [toast]
  );

  const handleRestoreLessonVersion = useCallback(
    (version: LessonVersion) => {
      setEditItem({
        id: version.lessonId,
        title: version.title,
        description: version.description,
        content: version.content,
        jlptLevel: version.jlptLevel,
        category: version.category,
        status: version.status as Lesson["status"],
        orderIndex: version.orderIndex,
        audioUrl: version.audioUrl,
        videoUrl: version.videoUrl,
        imageUrl: version.imageUrl,
        relatedVocabularyIds: version.relatedVocabularyIds,
        relatedGrammarIds: version.relatedGrammarIds,
        relatedQuizIds: version.relatedQuizIds,
      } satisfies Lesson);

      toast({
        title: "Đã tải bản lưu",
        description: `Phiên bản ${version.versionNumber} đã được tải vào trình chỉnh sửa. Lưu để tạo bản sửa đổi mới.`,
      });
    },
    [toast]
  );

  const handleTemplateDownload = useCallback(() => {
    const blob = new Blob([getCsvTemplate(activeTab)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeTab}-template.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [activeTab]);

  const handleImportRequest = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      try {
        setImporting(true);
        const text = await file.text();
        const items = parseBulkImportCsv(activeTab, text, { lessons });

        if (items.length === 0) {
          toast({
            title: "Không nhập được dòng nào",
            description: "Tệp CSV không chứa dòng dữ liệu hợp lệ nào.",
            variant: "destructive",
          });
          return;
        }

        const results = await Promise.allSettled(items.map((item) => saveItem(activeTab, item)));
        const successCount = results.filter((result) => result.status === "fulfilled").length;
        const failedCount = results.length - successCount;

        await loadContent();

        toast({
          title: "Hoàn tất nhập CSV",
          description:
            failedCount > 0
              ? `Đã nhập ${successCount} mục, ${failedCount} mục thất bại.`
              : `Đã nhập thành công ${successCount} mục.`,
          variant: failedCount > 0 ? "destructive" : "default",
        });
      } catch {
        toast({
          title: "Nhập thất bại",
          description: "Không phân tích hoặc nhập được tệp CSV này.",
          variant: "destructive",
        });
      } finally {
        setImporting(false);
        event.target.value = "";
      }
    },
    [activeTab, lessons, loadContent, saveItem, toast]
  );

  const tableConfig = useMemo(
    () => ({
      lessons: {
        columns: lessonColumns,
        data: filteredData as Lesson[],
        searchFields: ["title", "category", "status"],
        title: "Bài học",
        icon: BookOpen,
      },
      vocabulary: {
        columns: vocabColumns,
        data: filteredData as VocabItem[],
        searchFields: ["kanji", "hiragana", "meaning", "wordType"],
        title: "Từ vựng",
        icon: PenTool,
      },
      grammar: {
        columns: grammarColumns,
        data: filteredData as GrammarItem[],
        searchFields: ["title", "pattern", "usage"],
        title: "Ngữ pháp",
        icon: PenTool,
      },
      quizzes: {
        columns: quizColumns,
        data: filteredData as QuizItem[],
        searchFields: ["title", "question", "quizType", "difficultyLevel"],
        title: "Bài kiểm tra",
        icon: HelpCircle,
      },
    }),
    [filteredData]
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1520px] py-2">
        <input
          ref={importInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => void handleImportFile(event)}
        />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/20 to-orange-500/20 p-3">
                <GraduationCap className="h-8 w-8 text-red-300" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-red-300 via-orange-300 to-amber-300 bg-clip-text text-4xl font-bold text-transparent">
                  CMS nội dung học tập
                </h1>
                <p className="text-muted-foreground">
                  Quy trình sẵn sàng vận hành cho xuất bản bài học, nhập CSV, tải media, liên kết
                  tài nguyên học tập và lịch sử sửa đổi.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => void loadContent()}
                className="border-border/70 bg-card/70"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Làm mới
              </Button>
              <Button
                variant="outline"
                onClick={handleTemplateDownload}
                className="border-border/70 bg-card/70"
              >
                <Download className="mr-2 h-4 w-4" />
                Mẫu CSV
              </Button>
              <Button
                variant="outline"
                onClick={handleImportRequest}
                disabled={importing}
                className="border-border/70 bg-card/70"
              >
                <FileUp className="mr-2 h-4 w-4" />
                {importing ? "Đang nhập..." : "Nhập CSV"}
              </Button>
              <Button onClick={() => void openEditor(activeTab)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm {singularLabels[activeTab]}
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Tổng nội dung",
              value: overview?.totalContentItems ?? 0,
              hint: "Tổng hợp tất cả loại nội dung",
              icon: Layers3,
            },
            {
              label: "Bài học",
              value: overview?.totalLessons ?? 0,
              hint: `${overview?.publishedLessons ?? 0} đã xuất bản · ${overview?.reviewLessons ?? 0} đang chờ duyệt`,
              icon: BookOpen,
            },
            {
              label: "Từ vựng + Ngữ pháp",
              value: (overview?.totalVocabulary ?? 0) + (overview?.totalGrammar ?? 0),
              hint: `${overview?.totalVocabulary ?? 0} từ vựng · ${overview?.totalGrammar ?? 0} ngữ pháp`,
              icon: PenTool,
            },
            {
              label: "Bài kiểm tra",
              value: overview?.totalQuizzes ?? 0,
              hint: "Checkpoint bài học và ngân hàng câu hỏi",
              icon: HelpCircle,
            },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-3xl border border-border/50 bg-card/70 p-5 backdrop-blur"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-foreground">{card.value}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{card.hint}</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-6 rounded-3xl border border-border/50 bg-card/60 p-5 backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Bộ lọc CMS</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[220px_220px_minmax(0,1fr)]">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Cấp độ JLPT</p>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_FILTERS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm text-muted-foreground">Trạng thái bài học</p>
              <Select
                value={lessonStatusFilter}
                onValueChange={setLessonStatusFilter}
                disabled={activeTab !== "lessons"}
              >
                <SelectTrigger className="bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  {LESSON_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-end gap-2">
              {(overview?.levelBreakdown ?? [])
                .filter((item) => item.total > 0)
                .map((item) => (
                  <button
                    key={item.jlptLevel}
                    type="button"
                    onClick={() => setLevelFilter(item.jlptLevel)}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary transition hover:bg-primary/10"
                  >
                    {item.jlptLevel}: {item.total}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as AdminTab)}
          className="w-full"
        >
          <TabsList className="mb-6 w-full justify-start border border-border/50 bg-card/40 backdrop-blur-md">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {(["lessons", "vocabulary", "grammar", "quizzes"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/50 bg-card/60 p-4 backdrop-blur">
                <div>
                  <p className="text-sm text-muted-foreground">Đang xem</p>
                  <h3 className="text-xl font-semibold text-foreground">
                    {tableConfig[tab].title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {tableConfig[tab].data.length} mục sau khi lọc.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={handleTemplateDownload}
                    className="border-border/70 bg-card/70"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Mẫu
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleImportRequest}
                    disabled={importing}
                    className="border-border/70 bg-card/70"
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    Nhập CSV
                  </Button>
                  <Button onClick={() => void openEditor(tab)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm {singularLabels[tab]}
                  </Button>
                </div>
              </div>

              <DynamicTable
                columns={tableConfig[tab].columns}
                data={tableConfig[tab].data}
                onEdit={(row) => void openEditor(tab, row as unknown as EditableItem)}
                onDelete={(id) => deleteItem(tab, id)}
                loading={loading}
                pageSize={8}
                searchFields={tableConfig[tab].searchFields}
                title={tableConfig[tab].title}
                emptyMessage="Không có nội dung nào khớp với bộ lọc hiện tại."
              />
            </TabsContent>
          ))}
        </Tabs>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditItem(null);
              setVersionsLessonId(null);
            }
          }}
        >
          <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto bg-card/95 backdrop-blur">
            <DialogHeader>
              <DialogTitle>
                {editItem?.id ? "Sửa" : "Tạo"} {singularLabels[activeTab]}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <AdminContentForm
                activeTab={activeTab}
                editItem={editItem}
                setEditItem={setEditItem}
                lessonVersions={lessonVersions}
                contentOptions={{ lessons, vocabulary, grammar, quizzes }}
                uploadMedia={handleMediaUpload}
                onRestoreLessonVersion={handleRestoreLessonVersion}
              />
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setDialogOpen(false);
                  setEditItem(null);
                  setVersionsLessonId(null);
                }}
              >
                Hủy
              </Button>
              <Button onClick={() => void handleSave()} disabled={saving || !editItem}>
                {saving ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminContent;
