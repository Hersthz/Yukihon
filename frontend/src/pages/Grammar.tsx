import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, Search, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { grammarApi } from "@/api";
import { EmptyState, PageHeader, PageSection } from "@/components/layout/UserPage";

interface GrammarItem {
  id: number;
  title: string;
  pattern: string;
  explanation: string;
  usage: string;
  exampleJP: string;
  exampleEN: string;
  jlptLevel: string;
  relatedPatterns?: string;
}

const levelColors: Record<string, string> = {
  N5: "bg-emerald-100 text-emerald-700 border-emerald-200",
  N4: "bg-sky-100 text-sky-700 border-sky-200",
  N3: "bg-amber-100 text-amber-700 border-amber-200",
  N2: "bg-orange-100 text-orange-700 border-orange-200",
  N1: "bg-rose-100 text-rose-700 border-rose-200",
};

const Grammar = () => {
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: grammarList = [], isLoading } = useQuery({
    queryKey: ["grammar"],
    queryFn: () => grammarApi.getAll(),
  });

  const filteredGrammar = useMemo(() => {
    return grammarList.filter((item: GrammarItem) => {
      const levelMatch = selectedLevel === "all" || item.jlptLevel === selectedLevel;
      const q = searchQuery.toLowerCase();
      const searchMatch =
        item.title.toLowerCase().includes(q) ||
        item.pattern.toLowerCase().includes(q);
      return levelMatch && searchMatch;
    });
  }, [grammarList, selectedLevel, searchQuery]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1400px]">
        <PageHeader
          icon={<Brain className="h-5 w-5 text-violet-600" />}
          eyebrow="Grammar"
          title="Ngữ pháp"
          description="Quét nhanh mẫu câu theo cấp độ, ví dụ và cách dùng thực tế."
        />

        <PageSection className="mb-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm mẫu ngữ pháp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-2xl border-white/80 bg-white/85 pl-10 text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "N5", "N4", "N3", "N2", "N1"].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selectedLevel === level
                      ? "border-sky-200 bg-sky-100 text-sky-800"
                      : "border-white/70 bg-white/75 text-slate-600 hover:bg-white"
                  }`}
                >
                  {level === "all" ? "Tất cả" : level}
                </button>
              ))}
            </div>
          </div>
        </PageSection>

        {isLoading ? (
          <PageSection>
            <div className="flex justify-center py-16">
              <div className="relative h-12 w-12">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-violet-200"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </PageSection>
        ) : filteredGrammar.length === 0 ? (
          <PageSection>
            <EmptyState
              icon={<Brain className="h-6 w-6" />}
              title="Không tìm thấy mẫu ngữ pháp"
              description="Thử đổi từ khóa hoặc bộ lọc JLPT."
            />
          </PageSection>
        ) : (
          <PageSection>
            <div className="space-y-3">
              {filteredGrammar.map((item: GrammarItem) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[20px] border border-white bg-white/90 p-5 shadow-[0_8px_18px_rgba(148,163,184,0.08)]"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{item.pattern}</h3>
                      <p className="mt-1 text-sm text-slate-500">{item.title}</p>
                    </div>
                    <Badge className={`border ${levelColors[item.jlptLevel] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                      {item.jlptLevel}
                    </Badge>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="space-y-3">
                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-500">
                          Giải thích
                        </p>
                        <p className="text-sm leading-6 text-slate-700">{item.explanation}</p>
                      </div>

                      {item.usage && (
                        <div>
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-500">
                            Cách dùng
                          </p>
                          <p className="text-sm leading-6 text-slate-700">{item.usage}</p>
                        </div>
                      )}

                      {item.relatedPatterns && (
                        <div>
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-500">
                            Liên quan
                          </p>
                          <p className="text-sm leading-6 text-slate-600">{item.relatedPatterns}</p>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-500">
                        Ví dụ
                      </p>
                      <p className="text-sm font-medium text-slate-900">{item.exampleJP}</p>
                      {item.exampleEN && <p className="mt-2 text-sm text-slate-500">{item.exampleEN}</p>}
                      <Button className="mt-4 h-10 w-full rounded-2xl bg-violet-500 text-white hover:bg-violet-400">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Học mẫu này
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </PageSection>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Grammar;
