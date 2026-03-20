import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Plus, Save } from "lucide-react";
import { grammarApi, lessonApi, quizApi, vocabularyApi } from "@/api";
import DynamicTable from "@/components/admin/DynamicTable";
import WinterNightBackground from "@/components/WinterNightBackground";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AdminContentForm from "@/pages/admin-content/AdminContentForm";
import {
  createEmptyGrammar,
  createEmptyLesson,
  createEmptyQuiz,
  createEmptyVocab,
  grammarColumns,
  lessonColumns,
  quizColumns,
  TABS,
  vocabColumns,
} from "@/pages/admin-content/constants";
import { AdminTab, EditableItem, GrammarItem, Lesson, QuizItem, VocabItem } from "@/pages/admin-content/types";

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

const toEditableItem = (tab: AdminTab, row: Record<string, unknown>): EditableItem => {
  switch (tab) {
    case "lessons":
      return row as unknown as Lesson;
    case "vocabulary":
      return row as unknown as VocabItem;
    case "grammar":
      return row as unknown as GrammarItem;
    case "quizzes":
      return row as unknown as QuizItem;
    default:
      return row as unknown as EditableItem;
  }
};

const toApiPayload = (item: EditableItem): Record<string, unknown> => item as unknown as Record<string, unknown>;

const AdminContent = () => {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>("lessons");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [grammar, setGrammar] = useState<GrammarItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<EditableItem | null>(null);

  const fetchData = useCallback(async (tab: AdminTab) => {
    setLoading(true);

    try {
      switch (tab) {
        case "lessons": {
          const data = await lessonApi.getAll();
          setLessons(normalizeList<Lesson>(data));
          break;
        }
        case "vocabulary": {
          const data = await vocabularyApi.getAll();
          setVocab(normalizeList<VocabItem>(data));
          break;
        }
        case "grammar": {
          const data = await grammarApi.getAll();
          setGrammar(normalizeList<GrammarItem>(data));
          break;
        }
        case "quizzes": {
          const data = await quizApi.getAll();
          setQuizzes(normalizeList<QuizItem>(data));
          break;
        }
      }
    } catch {
      toast({ title: "Error", description: `Failed to load ${tab}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const saveItem = useCallback(async (tab: AdminTab, item: EditableItem) => {
    try {
      const id = item.id;
      if (id) {
        if (tab === "lessons") {
          await lessonApi.update(id, toApiPayload(item));
        }
        if (tab === "vocabulary") {
          await vocabularyApi.update(id, toApiPayload(item));
        }
        if (tab === "grammar") {
          await grammarApi.update(id, toApiPayload(item));
        }
        if (tab === "quizzes") {
          await quizApi.update(id, toApiPayload(item));
        }
      } else {
        if (tab === "lessons") {
          await lessonApi.create(toApiPayload(item));
        }
        if (tab === "vocabulary") {
          await vocabularyApi.create(toApiPayload(item));
        }
        if (tab === "grammar") {
          await grammarApi.create(toApiPayload(item));
        }
        if (tab === "quizzes") {
          await quizApi.create(toApiPayload(item));
        }
      }

      toast({ title: "Saved", description: "Data has been saved" });
      setDialogOpen(false);
      await fetchData(tab);
    } catch {
      toast({ title: "Error", description: "Save failed", variant: "destructive" });
    }
  }, [fetchData, toast]);

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

      toast({ title: "Deleted", description: "Item deleted successfully" });
      await fetchData(tab);
    } catch {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    }
  }, [fetchData, toast]);

  const handleOpenCreate = useCallback((tab: AdminTab) => {
    if (tab === "lessons") {
      setEditItem(createEmptyLesson());
    }
    if (tab === "vocabulary") {
      setEditItem(createEmptyVocab());
    }
    if (tab === "grammar") {
      setEditItem(createEmptyGrammar());
    }
    if (tab === "quizzes") {
      setEditItem(createEmptyQuiz());
    }
    setDialogOpen(true);
  }, []);

  const handleTableEdit = useCallback((row: Record<string, unknown>) => {
    setEditItem(toEditableItem(activeTab, row));
    setDialogOpen(true);
  }, [activeTab]);

  const handleSave = useCallback(async () => {
    if (!editItem) {
      return;
    }

    setSaving(true);
    await saveItem(activeTab, editItem);
    setSaving(false);
  }, [activeTab, editItem, saveItem]);

  const currentTabLabel = useMemo(
    () => TABS.find((tab) => tab.value === activeTab)?.label ?? "Content",
    [activeTab]
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen relative">
        <WinterNightBackground snowCount={15} sparkleCount={8} intensity="light" />

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
                <GraduationCap className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Quan ly noi dung
                </h1>
                <p className="text-muted-foreground">CRUD bai hoc, tu vung, ngu phap, cau hoi</p>
              </div>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AdminTab)} className="w-full">
            <TabsList className="bg-card/40 backdrop-blur-md border border-border/50 w-full justify-start mb-6">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="lessons" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => handleOpenCreate("lessons")}>
                  <Plus className="w-4 h-4 mr-2" /> Them moi
                </Button>
              </div>
              <DynamicTable
                columns={lessonColumns}
                data={lessons}
                onEdit={handleTableEdit}
                onDelete={(id) => deleteItem("lessons", id)}
                loading={loading}
                searchFields={["title", "category"]}
                title="Danh sach bai hoc"
              />
            </TabsContent>

            <TabsContent value="vocabulary" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => handleOpenCreate("vocabulary")}>
                  <Plus className="w-4 h-4 mr-2" /> Them moi
                </Button>
              </div>
              <DynamicTable
                columns={vocabColumns}
                data={vocab}
                onEdit={handleTableEdit}
                onDelete={(id) => deleteItem("vocabulary", id)}
                loading={loading}
                searchFields={["kanji", "hiragana", "meaning"]}
                title="Danh sach tu vung"
              />
            </TabsContent>

            <TabsContent value="grammar" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => handleOpenCreate("grammar")}>
                  <Plus className="w-4 h-4 mr-2" /> Them moi
                </Button>
              </div>
              <DynamicTable
                columns={grammarColumns}
                data={grammar}
                onEdit={handleTableEdit}
                onDelete={(id) => deleteItem("grammar", id)}
                loading={loading}
                searchFields={["pattern", "meaning"]}
                title="Danh sach ngu phap"
              />
            </TabsContent>

            <TabsContent value="quizzes" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => handleOpenCreate("quizzes")}>
                  <Plus className="w-4 h-4 mr-2" /> Them moi
                </Button>
              </div>
              <DynamicTable
                columns={quizColumns}
                data={quizzes}
                onEdit={handleTableEdit}
                onDelete={(id) => deleteItem("quizzes", id)}
                loading={loading}
                searchFields={["question", "category"]}
                title="Danh sach cau hoi"
              />
            </TabsContent>
          </Tabs>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur">
              <DialogHeader>
                <DialogTitle>{editItem?.id ? "Chinh sua" : "Tao moi"} {currentTabLabel}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <AdminContentForm
                  activeTab={activeTab}
                  editItem={editItem}
                  setEditItem={setEditItem}
                />
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Huy
                </Button>
                <Button onClick={handleSave} disabled={saving || !editItem}>
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  Luu
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
