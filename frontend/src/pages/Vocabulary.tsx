import { useState, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { BookOpen, Filter, Search, Star, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { VocabularyFlipCard } from "@/components/learning";
import { useVocabularyList, useVocabularyLevels } from "@/hooks/learning/useVocabulary";
import { Input } from "@/components/ui/input";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";

interface VocabularyItem {
  id: number;
  kanji: string;
  hiragana: string;
  meaning: string;
  romaji: string;
  jlptLevel: string;
  exampleSentenceJP?: string;
  exampleSentenceEN?: string;
  wordType?: string;
}

const Vocabulary = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [learnedItems, setLearnedItems] = useState<Set<number>>(new Set());

  const { data: vocabulary = [], isLoading } = useVocabularyList();
  const { data: levels = [] } = useVocabularyLevels();

  const filteredVocabulary = useMemo(() => {
    return vocabulary.filter((item: VocabularyItem) => {
      const levelMatch = selectedLevel === "all" || item.jlptLevel === selectedLevel;
      const query = searchQuery.toLowerCase();
      const searchMatch =
        item.kanji.toLowerCase().includes(query) ||
        item.meaning.toLowerCase().includes(query) ||
        item.romaji.toLowerCase().includes(query);
      return levelMatch && searchMatch;
    });
  }, [vocabulary, selectedLevel, searchQuery]);

  const handleMarkLearned = (id: number) => {
    setLearnedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const stats = {
    total: vocabulary.length,
    learned: learnedItems.size,
    progress: vocabulary.length > 0 ? Math.round((learnedItems.size / vocabulary.length) * 100) : 0,
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.04 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1500px]">
        <PageHeader
          icon={<BookOpen className="h-5 w-5 text-sky-600" />}
          eyebrow="Vocabulary"
          title="Kho từ vựng"
          description="Ôn từ theo cấp độ, đánh dấu đã học và quét nhanh toàn bộ nội dung."
        />

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <MetricCard label="Tổng số" value={stats.total} icon={<BookOpen className="h-4 w-4 text-sky-500" />} />
          <MetricCard label="Đã học" value={stats.learned} icon={<Star className="h-4 w-4 text-violet-500" />} />
          <MetricCard label="Tiến độ" value={`${stats.progress}%`} icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} />
        </div>

        <PageSection className="mb-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm theo kanji, nghĩa hoặc romaji..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-2xl border-white/80 bg-white/85 pl-10 text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-sky-500" />
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-40 rounded-2xl border-white/80 bg-white/85 text-slate-800">
                  <SelectValue placeholder="Tất cả cấp độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cấp độ</SelectItem>
                  {levels.map((level: string) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PageSection>

        {isLoading ? (
          <PageSection>
            <div className="flex items-center justify-center py-16">
              <div className="relative h-12 w-12">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-sky-200"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-500"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </PageSection>
        ) : filteredVocabulary.length === 0 ? (
          <PageSection>
            <EmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="Không tìm thấy từ nào"
              description="Thử đổi từ khóa tìm kiếm hoặc bộ lọc cấp độ."
            />
          </PageSection>
        ) : (
          <PageSection>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredVocabulary.map((item: VocabularyItem) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <VocabularyFlipCard
                    item={item}
                    onLearn={handleMarkLearned}
                    isLearned={learnedItems.has(item.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </PageSection>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Vocabulary;
