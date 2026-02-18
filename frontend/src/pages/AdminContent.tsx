import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, FileText, PenTool, HelpCircle, Plus, Edit, Trash2,
  Search, X, Save, ChevronDown, ChevronUp, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import WinterNightBackground from "@/components/WinterNightBackground";
import apiClient from "@/lib/apiClient";
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

// --- Generic CRUD Table Component ---
function CrudSection<T extends { id?: number }>({
  title,
  items,
  loading,
  columns,
  emptyForm,
  formFields,
  onFetch,
  onSave,
  onDelete,
  renderRow,
}: {
  title: string;
  items: T[];
  loading: boolean;
  columns: string[];
  emptyForm: T;
  formFields: (item: T, setItem: (i: T) => void) => React.ReactNode;
  onFetch: () => void;
  onSave: (item: T) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  renderRow: (item: T) => React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<T>(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = items.filter((item) => {
    if (!search) return true;
    return JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
  });

  const handleOpen = (item?: T) => {
    setEditItem(item ? { ...item } : { ...emptyForm });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(editItem);
    setSaving(false);
    setDialogOpen(false);
    onFetch();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;
    await onDelete(id);
    onFetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" /> Thêm mới
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Không có dữ liệu</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-card/60">
                <TableHead className="w-[50px]">ID</TableHead>
                {columns.map((col) => (<TableHead key={col}>{col}</TableHead>))}
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} className="hover:bg-card/40">
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  {renderRow(item)}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleOpen(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleDelete(item.id!)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur">
          <DialogHeader>
            <DialogTitle>{editItem.id ? "Chỉnh sửa" : "Tạo mới"} {title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formFields(editItem, setEditItem)}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><Save className="w-4 h-4 mr-1" /> Lưu</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Main Page ---
const AdminContent = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("lessons");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [grammar, setGrammar] = useState<GrammarItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (tab: string) => {
    setLoading(true);
    try {
      switch (tab) {
        case "lessons": { const d = await apiClient.lessons.getAll() as Lesson[] | { content: Lesson[] }; setLessons(Array.isArray(d) ? d : d.content || []); break; }
        case "vocabulary": { const d = await apiClient.vocabulary.getAll() as VocabItem[] | { content: VocabItem[] }; setVocab(Array.isArray(d) ? d : d.content || []); break; }
        case "grammar": { const d = await apiClient.grammar.getAll() as GrammarItem[] | { content: GrammarItem[] }; setGrammar(Array.isArray(d) ? d : d.content || []); break; }
        case "quizzes": { const d = await apiClient.quizzes.getAll() as QuizItem[] | { content: QuizItem[] }; setQuizzes(Array.isArray(d) ? d : d.content || []); break; }
      }
    } catch {
      toast({ title: "Error", description: `Failed to load ${tab}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(activeTab); }, [fetchData, activeTab]);

  // --- CRUD helpers ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveFn = async (tab: string, item: any) => {
    try {
      const id = item.id as number | undefined;
      if (id) {
        switch (tab) {
          case "lessons": await apiClient.lessons.update(id, item); break;
          case "vocabulary": await apiClient.vocabulary.update(id, item); break;
          case "grammar": await apiClient.grammar.update(id, item); break;
          case "quizzes": await apiClient.quizzes.update(id, item); break;
        }
      } else {
        switch (tab) {
          case "lessons": await apiClient.lessons.create(item); break;
          case "vocabulary": await apiClient.vocabulary.create(item); break;
          case "grammar": await apiClient.grammar.create(item); break;
          case "quizzes": await apiClient.quizzes.create(item); break;
        }
      }
      toast({ title: "Saved!", description: "Dữ liệu đã được lưu" });
    } catch {
      toast({ title: "Error", description: "Save failed", variant: "destructive" });
    }
  };

  const deleteFn = async (tab: string, id: number) => {
    try {
      switch (tab) {
        case "lessons": await apiClient.lessons.delete(id); break;
        case "vocabulary": await apiClient.vocabulary.delete(id); break;
        case "grammar": await apiClient.grammar.delete(id); break;
        case "quizzes": await apiClient.quizzes.delete(id); break;
      }
      toast({ title: "Deleted", description: "Đã xóa thành công" });
    } catch {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    }
  };

  // --- Form field renderers ---
  const JlptField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div>
      <Label>JLPT Level</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
        <SelectContent>{JLPT_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );

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
              {TABS.map(t => (
                <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-2">
                  <t.icon className="w-4 h-4" /> {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* LESSONS */}
            <TabsContent value="lessons">
              <CrudSection<Lesson>
                title="Bài học"
                items={lessons}
                loading={loading}
                columns={["Title", "JLPT", "Category", "Order"]}
                emptyForm={{ title: "", description: "", jlptLevel: "N5", category: "", content: "", orderIndex: 0 }}
                onFetch={() => fetchData("lessons")}
                onSave={(item) => saveFn("lessons", item)}
                onDelete={(id) => deleteFn("lessons", id)}
                renderRow={(item) => (
                  <>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell><Badge variant="outline">{item.jlptLevel}</Badge></TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.orderIndex}</TableCell>
                  </>
                )}
                formFields={(item, setItem) => (
                  <>
                    <div><Label>Tiêu đề</Label><Input value={item.title} onChange={e => setItem({ ...item, title: e.target.value })} className="bg-background/50" /></div>
                    <div><Label>Mô tả</Label><Textarea value={item.description} onChange={e => setItem({ ...item, description: e.target.value })} className="bg-background/50" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <JlptField value={item.jlptLevel} onChange={v => setItem({ ...item, jlptLevel: v })} />
                      <div><Label>Category</Label><Input value={item.category} onChange={e => setItem({ ...item, category: e.target.value })} className="bg-background/50" /></div>
                    </div>
                    <div><Label>Nội dung</Label><Textarea value={item.content} onChange={e => setItem({ ...item, content: e.target.value })} className="bg-background/50 min-h-[150px]" /></div>
                    <div><Label>Order Index</Label><Input type="number" value={item.orderIndex} onChange={e => setItem({ ...item, orderIndex: parseInt(e.target.value) || 0 })} className="bg-background/50 w-24" /></div>
                  </>
                )}
              />
            </TabsContent>

            {/* VOCABULARY */}
            <TabsContent value="vocabulary">
              <CrudSection<VocabItem>
                title="Từ vựng"
                items={vocab}
                loading={loading}
                columns={["Kanji", "Hiragana", "Romaji", "Meaning", "JLPT"]}
                emptyForm={{ kanji: "", hiragana: "", romaji: "", meaning: "", jlptLevel: "N5", category: "", exampleSentence: "", exampleMeaning: "" }}
                onFetch={() => fetchData("vocabulary")}
                onSave={(item) => saveFn("vocabulary", item)}
                onDelete={(id) => deleteFn("vocabulary", id)}
                renderRow={(item) => (
                  <>
                    <TableCell className="font-bold text-lg">{item.kanji}</TableCell>
                    <TableCell className="text-cyan-400">{item.hiragana}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.romaji}</TableCell>
                    <TableCell>{item.meaning}</TableCell>
                    <TableCell><Badge variant="outline">{item.jlptLevel}</Badge></TableCell>
                  </>
                )}
                formFields={(item, setItem) => (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div><Label>Kanji</Label><Input value={item.kanji} onChange={e => setItem({ ...item, kanji: e.target.value })} className="bg-background/50 text-xl" /></div>
                      <div><Label>Hiragana</Label><Input value={item.hiragana} onChange={e => setItem({ ...item, hiragana: e.target.value })} className="bg-background/50" /></div>
                      <div><Label>Romaji</Label><Input value={item.romaji} onChange={e => setItem({ ...item, romaji: e.target.value })} className="bg-background/50" /></div>
                    </div>
                    <div><Label>Meaning (Nghĩa)</Label><Input value={item.meaning} onChange={e => setItem({ ...item, meaning: e.target.value })} className="bg-background/50" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <JlptField value={item.jlptLevel} onChange={v => setItem({ ...item, jlptLevel: v })} />
                      <div><Label>Category</Label><Input value={item.category} onChange={e => setItem({ ...item, category: e.target.value })} className="bg-background/50" /></div>
                    </div>
                    <div><Label>Ví dụ (JP)</Label><Input value={item.exampleSentence} onChange={e => setItem({ ...item, exampleSentence: e.target.value })} className="bg-background/50" /></div>
                    <div><Label>Ví dụ (VN)</Label><Input value={item.exampleMeaning} onChange={e => setItem({ ...item, exampleMeaning: e.target.value })} className="bg-background/50" /></div>
                  </>
                )}
              />
            </TabsContent>

            {/* GRAMMAR */}
            <TabsContent value="grammar">
              <CrudSection<GrammarItem>
                title="Ngữ pháp"
                items={grammar}
                loading={loading}
                columns={["Pattern", "Meaning", "JLPT"]}
                emptyForm={{ pattern: "", meaning: "", jlptLevel: "N5", explanation: "", exampleSentence: "", exampleMeaning: "" }}
                onFetch={() => fetchData("grammar")}
                onSave={(item) => saveFn("grammar", item)}
                onDelete={(id) => deleteFn("grammar", id)}
                renderRow={(item) => (
                  <>
                    <TableCell className="font-bold">{item.pattern}</TableCell>
                    <TableCell>{item.meaning}</TableCell>
                    <TableCell><Badge variant="outline">{item.jlptLevel}</Badge></TableCell>
                  </>
                )}
                formFields={(item, setItem) => (
                  <>
                    <div><Label>Pattern (Mẫu câu)</Label><Input value={item.pattern} onChange={e => setItem({ ...item, pattern: e.target.value })} className="bg-background/50 text-lg" /></div>
                    <div><Label>Meaning (Nghĩa)</Label><Input value={item.meaning} onChange={e => setItem({ ...item, meaning: e.target.value })} className="bg-background/50" /></div>
                    <JlptField value={item.jlptLevel} onChange={v => setItem({ ...item, jlptLevel: v })} />
                    <div><Label>Giải thích chi tiết</Label><Textarea value={item.explanation} onChange={e => setItem({ ...item, explanation: e.target.value })} className="bg-background/50 min-h-[100px]" /></div>
                    <div><Label>Ví dụ (JP)</Label><Input value={item.exampleSentence} onChange={e => setItem({ ...item, exampleSentence: e.target.value })} className="bg-background/50" /></div>
                    <div><Label>Ví dụ (VN)</Label><Input value={item.exampleMeaning} onChange={e => setItem({ ...item, exampleMeaning: e.target.value })} className="bg-background/50" /></div>
                  </>
                )}
              />
            </TabsContent>

            {/* QUIZZES */}
            <TabsContent value="quizzes">
              <CrudSection<QuizItem>
                title="Câu hỏi"
                items={quizzes}
                loading={loading}
                columns={["Question", "Answer", "JLPT", "Category"]}
                emptyForm={{ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", jlptLevel: "N5", category: "", explanation: "" }}
                onFetch={() => fetchData("quizzes")}
                onSave={(item) => saveFn("quizzes", item)}
                onDelete={(id) => deleteFn("quizzes", id)}
                renderRow={(item) => (
                  <>
                    <TableCell className="max-w-[300px] truncate">{item.question}</TableCell>
                    <TableCell><Badge>{item.correctAnswer}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{item.jlptLevel}</Badge></TableCell>
                    <TableCell>{item.category}</TableCell>
                  </>
                )}
                formFields={(item, setItem) => (
                  <>
                    <div><Label>Câu hỏi</Label><Textarea value={item.question} onChange={e => setItem({ ...item, question: e.target.value })} className="bg-background/50" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Option A</Label><Input value={item.optionA} onChange={e => setItem({ ...item, optionA: e.target.value })} className="bg-background/50" /></div>
                      <div><Label>Option B</Label><Input value={item.optionB} onChange={e => setItem({ ...item, optionB: e.target.value })} className="bg-background/50" /></div>
                      <div><Label>Option C</Label><Input value={item.optionC} onChange={e => setItem({ ...item, optionC: e.target.value })} className="bg-background/50" /></div>
                      <div><Label>Option D</Label><Input value={item.optionD} onChange={e => setItem({ ...item, optionD: e.target.value })} className="bg-background/50" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Đáp án đúng</Label>
                        <Select value={item.correctAnswer} onValueChange={v => setItem({ ...item, correctAnswer: v })}>
                          <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["A", "B", "C", "D"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <JlptField value={item.jlptLevel} onChange={v => setItem({ ...item, jlptLevel: v })} />
                      <div><Label>Category</Label><Input value={item.category} onChange={e => setItem({ ...item, category: e.target.value })} className="bg-background/50" /></div>
                    </div>
                    <div><Label>Giải thích</Label><Textarea value={item.explanation} onChange={e => setItem({ ...item, explanation: e.target.value })} className="bg-background/50" /></div>
                  </>
                )}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminContent;
