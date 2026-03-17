import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, FileText, PenTool, HelpCircle, Plus, Save, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import WinterNightBackground from "@/components/WinterNightBackground";
import DynamicTable, { ColumnDef } from "@/components/admin/DynamicTable";
import apiClient from "@/api";
import { useToast } from "@/hooks/use-toast";

// --- Types ---
interface Lesson {
  id?: number;
  title: string;
  description: string;
  jlptLevel: string;
  category: string;
  content: string;
  orderIndex: number;
}

interface VocabItem {
  id?: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  jlptLevel: string;
  category: string;
  exampleSentence: string;
  exampleMeaning: string;
}

interface GrammarItem {
  id?: number;
  pattern: string;
  meaning: string;
  jlptLevel: string;
  explanation: string;
  exampleSentence: string;
  exampleMeaning: string;
}

interface QuizItem {
  id?: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  jlptLevel: string;
  category: string;
  explanation: string;
}

// --- Tab configs ---
const TABS = [
  { value: "lessons", label: "Bài học", icon: BookOpen },
  { value: "vocabulary", label: "Từ vựng", icon: FileText },
  { value: "grammar", label: "Ngữ pháp", icon: PenTool },
  { value: "quizzes", label: "Câu hỏi", icon: HelpCircle },
];

const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"];

// --- Main Page ---
const AdminContent = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("lessons");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [grammar, setGrammar] = useState<GrammarItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editItem, setEditItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (tab: string) => {
    setLoading(true);
    try {
      switch (tab) {
        case "lessons": {
          const d = await apiClient.lessons.getAll() as Lesson[] | { content: Lesson[] };
          setLessons(Array.isArray(d) ? d : d.content || []);
          break;
        }
        case "vocabulary": {
          const d = await apiClient.vocabulary.getAll() as VocabItem[] | { content: VocabItem[] };
          setVocab(Array.isArray(d) ? d : d.content || []);
          break;
        }
        case "grammar": {
          const d = await apiClient.grammar.getAll() as GrammarItem[] | { content: GrammarItem[] };
          setGrammar(Array.isArray(d) ? d : d.content || []);
          break;
        }
        case "quizzes": {
          const d = await apiClient.quizzes.getAll() as QuizItem[] | { content: QuizItem[] };
          setQuizzes(Array.isArray(d) ? d : d.content || []);
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
  }, [fetchData, activeTab]);

  // --- CRUD helpers ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveFn = async (tab: string, item: any) => {
    try {
      const id = item.id as number | undefined;
      if (id) {
        switch (tab) {
          case "lessons":
            await apiClient.lessons.update(id, item);
            break;
          case "vocabulary":
            await apiClient.vocabulary.update(id, item);
            break;
          case "grammar":
            await apiClient.grammar.update(id, item);
            break;
          case "quizzes":
            await apiClient.quizzes.update(id, item);
            break;
        }
      } else {
        switch (tab) {
          case "lessons":
            await apiClient.lessons.create(item);
            break;
          case "vocabulary":
            await apiClient.vocabulary.create(item);
            break;
          case "grammar":
            await apiClient.grammar.create(item);
            break;
          case "quizzes":
            await apiClient.quizzes.create(item);
            break;
        }
      }
      toast({ title: "Saved!", description: "Dữ liệu đã được lưu" });
      setDialogOpen(false);
      fetchData(activeTab);
    } catch {
      toast({ title: "Error", description: "Save failed", variant: "destructive" });
    }
  };

  const deleteFn = async (tab: string, id: unknown) => {
    try {
      switch (tab) {
        case "lessons":
          await apiClient.lessons.delete(id as number);
          break;
        case "vocabulary":
          await apiClient.vocabulary.delete(id as number);
          break;
        case "grammar":
          await apiClient.grammar.delete(id as number);
          break;
        case "quizzes":
          await apiClient.quizzes.delete(id as number);
          break;
      }
      toast({ title: "Deleted", description: "Đã xóa thành công" });
      fetchData(activeTab);
    } catch {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    }
  };

  // --- Column definitions ---
  const lessonColumns: ColumnDef[] = [
    { key: "title", label: "Tiêu đề", sortable: true, render: (val) => <span className="font-medium">{String(val)}</span> },
    { key: "jlptLevel", label: "JLPT", type: "badge", badgeColor: () => "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    { key: "category", label: "Danh mục", sortable: true },
    { key: "orderIndex", label: "Order", type: "number" },
  ];

  const vocabColumns: ColumnDef[] = [
    { key: "kanji", label: "Kanji", sortable: true, render: (val) => <span className="font-bold text-lg">{String(val)}</span> },
    { key: "hiragana", label: "Hiragana", render: (val) => <span className="text-cyan-400">{String(val)}</span> },
    { key: "romaji", label: "Romaji", render: (val) => <span className="text-xs text-muted-foreground">{String(val)}</span> },
    { key: "meaning", label: "Nghĩa", sortable: true },
    { key: "jlptLevel", label: "JLPT", type: "badge", badgeColor: () => "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  ];

  const grammarColumns: ColumnDef[] = [
    { key: "pattern", label: "Mẫu câu", sortable: true, render: (val) => <span className="font-bold">{String(val)}</span> },
    { key: "meaning", label: "Nghĩa", sortable: true },
    { key: "jlptLevel", label: "JLPT", type: "badge", badgeColor: () => "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  ];

  const quizColumns: ColumnDef[] = [
    { key: "question", label: "Câu hỏi", sortable: true, render: (val) => <span className="truncate">{String(val)}</span> },
    { key: "correctAnswer", label: "Đáp án", type: "badge", badgeColor: () => "bg-green-500/20 text-green-400 border-green-500/30" },
    { key: "jlptLevel", label: "JLPT", type: "badge", badgeColor: () => "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    { key: "category", label: "Danh mục" },
  ];

  // --- Form component ---
  const renderForm = () => {
    if (!editItem) return null;

    switch (activeTab) {
      case "lessons":
        return (
          <>
            <div>
              <Label>Tiêu đề</Label>
              <Input
                value={editItem.title}
                onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={editItem.description}
                onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>JLPT Level</Label>
                <Select value={editItem.jlptLevel} onValueChange={(v) => setEditItem({ ...editItem, jlptLevel: v })}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JLPT_LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Danh mục</Label>
                <Input
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                  className="bg-background/50"
                />
              </div>
            </div>
            <div>
              <Label>Nội dung</Label>
              <Textarea
                value={editItem.content}
                onChange={(e) => setEditItem({ ...editItem, content: e.target.value })}
                className="bg-background/50 min-h-[150px]"
              />
            </div>
            <div>
              <Label>Order Index</Label>
              <Input
                type="number"
                value={editItem.orderIndex}
                onChange={(e) => setEditItem({ ...editItem, orderIndex: parseInt(e.target.value) || 0 })}
                className="bg-background/50 w-24"
              />
            </div>
          </>
        );

      case "vocabulary":
        return (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Kanji</Label>
                <Input
                  value={editItem.kanji}
                  onChange={(e) => setEditItem({ ...editItem, kanji: e.target.value })}
                  className="bg-background/50 text-xl"
                />
              </div>
              <div>
                <Label>Hiragana</Label>
                <Input
                  value={editItem.hiragana}
                  onChange={(e) => setEditItem({ ...editItem, hiragana: e.target.value })}
                  className="bg-background/50"
                />
              </div>
              <div>
                <Label>Romaji</Label>
                <Input
                  value={editItem.romaji}
                  onChange={(e) => setEditItem({ ...editItem, romaji: e.target.value })}
                  className="bg-background/50"
                />
              </div>
            </div>
            <div>
              <Label>Nghĩa</Label>
              <Input
                value={editItem.meaning}
                onChange={(e) => setEditItem({ ...editItem, meaning: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>JLPT Level</Label>
                <Select value={editItem.jlptLevel} onValueChange={(v) => setEditItem({ ...editItem, jlptLevel: v })}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JLPT_LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Danh mục</Label>
                <Input
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                  className="bg-background/50"
                />
              </div>
            </div>
            <div>
              <Label>Ví dụ (JP)</Label>
              <Input
                value={editItem.exampleSentence}
                onChange={(e) => setEditItem({ ...editItem, exampleSentence: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div>
              <Label>Ví dụ (VN)</Label>
              <Input
                value={editItem.exampleMeaning}
                onChange={(e) => setEditItem({ ...editItem, exampleMeaning: e.target.value })}
                className="bg-background/50"
              />
            </div>
          </>
        );

      case "grammar":
        return (
          <>
            <div>
              <Label>Mẫu câu</Label>
              <Input
                value={editItem.pattern}
                onChange={(e) => setEditItem({ ...editItem, pattern: e.target.value })}
                className="bg-background/50 text-lg"
              />
            </div>
            <div>
              <Label>Nghĩa</Label>
              <Input
                value={editItem.meaning}
                onChange={(e) => setEditItem({ ...editItem, meaning: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div>
              <Label>JLPT Level</Label>
              <Select value={editItem.jlptLevel} onValueChange={(v) => setEditItem({ ...editItem, jlptLevel: v })}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JLPT_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Giải thích chi tiết</Label>
              <Textarea
                value={editItem.explanation}
                onChange={(e) => setEditItem({ ...editItem, explanation: e.target.value })}
                className="bg-background/50 min-h-[100px]"
              />
            </div>
            <div>
              <Label>Ví dụ (JP)</Label>
              <Input
                value={editItem.exampleSentence}
                onChange={(e) => setEditItem({ ...editItem, exampleSentence: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div>
              <Label>Ví dụ (VN)</Label>
              <Input
                value={editItem.exampleMeaning}
                onChange={(e) => setEditItem({ ...editItem, exampleMeaning: e.target.value })}
                className="bg-background/50"
              />
            </div>
          </>
        );

      case "quizzes":
        return (
          <>
            <div>
              <Label>Câu hỏi</Label>
              <Textarea
                value={editItem.question}
                onChange={(e) => setEditItem({ ...editItem, question: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Option A</Label>
                <Input
                  value={editItem.optionA}
                  onChange={(e) => setEditItem({ ...editItem, optionA: e.target.value })}
                  className="bg-background/50"
                />
              </div>
              <div>
                <Label>Option B</Label>
                <Input
                  value={editItem.optionB}
                  onChange={(e) => setEditItem({ ...editItem, optionB: e.target.value })}
                  className="bg-background/50"
                />
              </div>
              <div>
                <Label>Option C</Label>
                <Input
                  value={editItem.optionC}
                  onChange={(e) => setEditItem({ ...editItem, optionC: e.target.value })}
                  className="bg-background/50"
                />
              </div>
              <div>
                <Label>Option D</Label>
                <Input
                  value={editItem.optionD}
                  onChange={(e) => setEditItem({ ...editItem, optionD: e.target.value })}
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Đáp án đúng</Label>
                <Select value={editItem.correctAnswer} onValueChange={(v) => setEditItem({ ...editItem, correctAnswer: v })}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D"].map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>JLPT Level</Label>
                <Select value={editItem.jlptLevel} onValueChange={(v) => setEditItem({ ...editItem, jlptLevel: v })}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JLPT_LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Danh mục</Label>
                <Input
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                  className="bg-background/50"
                />
              </div>
            </div>
            <div>
              <Label>Giải thích</Label>
              <Textarea
                value={editItem.explanation}
                onChange={(e) => setEditItem({ ...editItem, explanation: e.target.value })}
                className="bg-background/50"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const handleTableEdit = (item: Record<string, unknown>) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveFn(activeTab, editItem);
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen relative">
        <WinterNightBackground snowCount={15} sparkleCount={8} intensity="light" />
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
                <GraduationCap className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Quản lý nội dung 管理
                </h1>
                <p className="text-muted-foreground">CRUD bài học, từ vựng, ngữ pháp, câu hỏi</p>
              </div>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-card/40 backdrop-blur-md border border-border/50 w-full justify-start mb-6">
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-2">
                  <t.icon className="w-4 h-4" /> {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* LESSONS Tab */}
            <TabsContent value="lessons" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setEditItem({
                      title: "",
                      description: "",
                      jlptLevel: "N5",
                      category: "",
                      content: "",
                      orderIndex: 0,
                    });
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Thêm mới
                </Button>
              </div>
              <DynamicTable
                columns={lessonColumns}
                data={lessons}
                onEdit={handleTableEdit}
                onDelete={(id) => deleteFn("lessons", id)}
                loading={loading}
                searchFields={["title", "category"]}
                title="Danh sách bài học"
              />
            </TabsContent>

            {/* VOCABULARY Tab */}
            <TabsContent value="vocabulary" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setEditItem({
                      kanji: "",
                      hiragana: "",
                      romaji: "",
                      meaning: "",
                      jlptLevel: "N5",
                      category: "",
                      exampleSentence: "",
                      exampleMeaning: "",
                    });
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Thêm mới
                </Button>
              </div>
              <DynamicTable
                columns={vocabColumns}
                data={vocab}
                onEdit={handleTableEdit}
                onDelete={(id) => deleteFn("vocabulary", id)}
                loading={loading}
                searchFields={["kanji", "hiragana", "meaning"]}
                title="Danh sách từ vựng"
              />
            </TabsContent>

            {/* GRAMMAR Tab */}
            <TabsContent value="grammar" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setEditItem({
                      pattern: "",
                      meaning: "",
                      jlptLevel: "N5",
                      explanation: "",
                      exampleSentence: "",
                      exampleMeaning: "",
                    });
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Thêm mới
                </Button>
              </div>
              <DynamicTable
                columns={grammarColumns}
                data={grammar}
                onEdit={handleTableEdit}
                onDelete={(id) => deleteFn("grammar", id)}
                loading={loading}
                searchFields={["pattern", "meaning"]}
                title="Danh sách ngữ pháp"
              />
            </TabsContent>

            {/* QUIZZES Tab */}
            <TabsContent value="quizzes" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setEditItem({
                      question: "",
                      optionA: "",
                      optionB: "",
                      optionC: "",
                      optionD: "",
                      correctAnswer: "A",
                      jlptLevel: "N5",
                      category: "",
                      explanation: "",
                    });
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Thêm mới
                </Button>
              </div>
              <DynamicTable
                columns={quizColumns}
                data={quizzes}
                onEdit={handleTableEdit}
                onDelete={(id) => deleteFn("quizzes", id)}
                loading={loading}
                searchFields={["question", "category"]}
                title="Danh sách câu hỏi"
              />
            </TabsContent>
          </Tabs>

          {/* Edit/Create Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur">
              <DialogHeader>
                <DialogTitle>
                  {editItem?.id ? "Chỉnh sửa" : "Tạo mới"}{" "}
                  {
                    TABS.find((t) => t.value === activeTab)?.label
                  }
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {renderForm()}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  Lưu
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
