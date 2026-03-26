import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, FileText, Filter, GraduationCap, HelpCircle, Layers3, PenTool, Plus, RefreshCw, Save } from "lucide-react";
import { adminApi, grammarApi, lessonApi, quizApi, vocabularyApi } from "@/api";
import DynamicTable from "@/components/admin/DynamicTable";
import WinterNightBackground from "@/components/WinterNightBackground";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AdminContentForm from "@/pages/admin-content/AdminContentForm";
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
  normalizeQuiz,
  normalizeVocabulary,
  toApiPayload,
} from "@/pages/admin-content/contentTransforms";
import { AdminTab, ContentOverview, EditableItem, GrammarItem, Lesson, QuizItem, VocabItem } from "@/pages/admin-content/types";

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

  const [activeTab, setActiveTab] = useState<AdminTab>("lessons");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabItem[]>([]);
  const [grammar, setGrammar] = useState<GrammarItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [overview, setOverview] = useState<ContentOverview | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<EditableItem | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [lessonStatusFilter, setLessonStatusFilter] = useState<string>("ALL");

  const loadContent = useCallback(async () => {
    setLoading(true);

    try {
      const [lessonData, vocabData, grammarData, quizData, overviewData] = await Promise.all([
        lessonApi.getAll(),
        vocabularyApi.getAll(),
        grammarApi.getAll(),
        quizApi.getAll(),
        adminApi.getContentOverview(),
      ]);

      setLessons(normalizeList<Record<string, unknown>>(lessonData).map(normalizeLesson));
      setVocabulary(normalizeList<Record<string, unknown>>(vocabData).map(normalizeVocabulary));
      setGrammar(normalizeList<Record<string, unknown>>(grammarData).map(normalizeGrammar));
      setQuizzes(normalizeList<Record<string, unknown>>(quizData).map(normalizeQuiz));
      setOverview(overviewData as ContentOverview);
    } catch {
      toast({ title: "Load failed", description: "Could not load content management data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const currentTabLabel = useMemo(
    () => TABS.find((tab) => tab.value === activeTab)?.label ?? "Content",
    [activeTab]
  );
  const singularLabels: Record<AdminTab, string> = {
    lessons: "Lesson",
    vocabulary: "Vocabulary item",
    grammar: "Grammar item",
    quizzes: "Quiz",
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

  const deleteItem = useCallback(async (tab: AdminTab, id: unknown) => {
    try {
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

      toast({ title: "Deleted", description: `${currentTabLabel} item deleted.` });
      await loadContent();
    } catch {
      toast({ title: "Delete failed", description: "Could not delete this item.", variant: "destructive" });
    }
  }, [currentTabLabel, loadContent, toast]);

  const handleOpenCreate = useCallback((tab: AdminTab) => {
    if (tab === "lessons") setEditItem(createEmptyLesson());
    if (tab === "vocabulary") setEditItem(createEmptyVocab());
    if (tab === "grammar") setEditItem(createEmptyGrammar());
    if (tab === "quizzes") setEditItem(createEmptyQuiz());
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editItem) {
      return;
    }

    try {
      setSaving(true);
      await saveItem(activeTab, editItem);
      toast({ title: "Saved", description: `${currentTabLabel} item saved successfully.` });
      setDialogOpen(false);
      await loadContent();
    } catch {
      toast({ title: "Save failed", description: "Please review the form and try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [activeTab, currentTabLabel, editItem, loadContent, saveItem, toast]);

  const tableConfig = useMemo(() => ({
    lessons: {
      columns: lessonColumns,
      data: filteredData as Lesson[],
      searchFields: ["title", "category", "status"],
      title: "Lessons",
      icon: BookOpen,
    },
    vocabulary: {
      columns: vocabColumns,
      data: filteredData as VocabItem[],
      searchFields: ["kanji", "hiragana", "meaning", "wordType"],
      title: "Vocabulary",
      icon: FileText,
    },
    grammar: {
      columns: grammarColumns,
      data: filteredData as GrammarItem[],
      searchFields: ["title", "pattern", "usage"],
      title: "Grammar",
      icon: PenTool,
    },
    quizzes: {
      columns: quizColumns,
      data: filteredData as QuizItem[],
      searchFields: ["title", "question", "quizType", "difficultyLevel"],
      title: "Quizzes",
      icon: HelpCircle,
    },
  }), [filteredData]);

  return (
    <DashboardLayout>
      <div className="min-h-screen relative">
        <WinterNightBackground snowCount={15} sparkleCount={8} intensity="light" />

        <div className="relative z-10 container mx-auto max-w-7xl px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/20 to-orange-500/20 p-3">
                  <GraduationCap className="h-8 w-8 text-red-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-red-300 via-orange-300 to-amber-300 bg-clip-text text-transparent">
                    Learning Content CMS
                  </h1>
                  <p className="text-muted-foreground">
                    Manage lessons, vocabulary, grammar, and quizzes from one place with overview, filters, and editor-safe payloads.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => void loadContent()} className="border-border/70 bg-card/70">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button onClick={() => handleOpenCreate(activeTab)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New {singularLabels[activeTab]}
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total Content",
                value: overview?.totalContentItems ?? 0,
                hint: "All content types combined",
                icon: Layers3,
              },
              {
                label: "Lessons",
                value: overview?.totalLessons ?? 0,
                hint: `${overview?.publishedLessons ?? 0} published • ${overview?.draftLessons ?? 0} draft`,
                icon: BookOpen,
              },
              {
                label: "Vocabulary + Grammar",
                value: (overview?.totalVocabulary ?? 0) + (overview?.totalGrammar ?? 0),
                hint: `${overview?.totalVocabulary ?? 0} vocab • ${overview?.totalGrammar ?? 0} grammar`,
                icon: PenTool,
              },
              {
                label: "Quizzes",
                value: overview?.totalQuizzes ?? 0,
                hint: "Assessment bank ready for learning flow",
                icon: HelpCircle,
              },
            ].map((card) => {
              const Icon = card.icon;

              return (
                <div key={card.label} className="rounded-3xl border border-border/50 bg-card/70 p-5 backdrop-blur">
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
              <h2 className="text-lg font-semibold text-foreground">CMS Filters</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-[220px_220px_minmax(0,1fr)]">
              <div>
                <p className="mb-2 text-sm text-muted-foreground">JLPT level</p>
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
                <p className="mb-2 text-sm text-muted-foreground">Lesson status</p>
                <Select value={lessonStatusFilter} onValueChange={setLessonStatusFilter} disabled={activeTab !== "lessons"}>
                  <SelectTrigger className="bg-background/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">ALL</SelectItem>
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

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AdminTab)} className="w-full">
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
                    <p className="text-sm text-muted-foreground">Current view</p>
                    <h3 className="text-xl font-semibold text-foreground">
                      {tableConfig[tab].title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Showing {tableConfig[tab].data.length} item(s) after filters.
                    </p>
                  </div>

                  <Button onClick={() => handleOpenCreate(tab)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New {singularLabels[tab]}
                  </Button>
                </div>

                <DynamicTable
                  columns={tableConfig[tab].columns}
                  data={tableConfig[tab].data}
                  onEdit={(row) => {
                    setEditItem(row as EditableItem);
                    setDialogOpen(true);
                  }}
                  onDelete={(id) => deleteItem(tab, id)}
                  loading={loading}
                  pageSize={8}
                  searchFields={tableConfig[tab].searchFields}
                  title={tableConfig[tab].title}
                  emptyMessage="No content matches the current filters."
                />
              </TabsContent>
            ))}
          </Tabs>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto bg-card/95 backdrop-blur">
              <DialogHeader>
                <DialogTitle>{editItem?.id ? "Edit" : "Create"} {singularLabels[activeTab]}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <AdminContentForm activeTab={activeTab} editItem={editItem} setEditItem={setEditItem} />
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => void handleSave()} disabled={saving || !editItem}>
                  {saving ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminContent;
