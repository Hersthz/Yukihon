import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, Target, Trophy, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { quizApi } from "@/api";

interface QuizItem {
  id: number;
  title: string;
  description: string;
  quizType: string;
  difficultyLevel: string;
  jlptLevel: string;
  question: string;
}

const difficultyTone: Record<string, string> = {
  BEGINNER: "border-emerald-200 bg-emerald-50 text-emerald-700",
  INTERMEDIATE: "border-amber-200 bg-amber-50 text-amber-700",
  ADVANCED: "border-rose-200 bg-rose-50 text-rose-700",
};

const Quiz = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => quizApi.getAll(),
  });

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((item: QuizItem) => {
      const byDifficulty = selectedDifficulty === "all" || item.difficultyLevel === selectedDifficulty;
      const byLevel = selectedLevel === "all" || item.jlptLevel === selectedLevel;
      return byDifficulty && byLevel;
    });
  }, [quizzes, selectedDifficulty, selectedLevel]);

  const stats = useMemo(
    () => ({
      total: quizzes.length,
      visible: filteredQuizzes.length,
      score: quizzes.length ? 78 : 0,
    }),
    [filteredQuizzes.length, quizzes.length]
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1380px]">
        <PageHeader
          icon={<Zap className="h-6 w-6 text-amber-600" />}
          title="Quiz"
          description="Chuyển về dạng danh mục gọn hơn để bạn lọc nhanh và nhìn nhiều bộ quiz trong một lượt."
          eyebrow="Practice"
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard hint="Toàn bộ ngân hàng quiz" icon={<Zap className="h-4 w-4 text-sky-500" />} label="Tổng quiz" value={stats.total} />
          <MetricCard hint="Theo bộ lọc hiện tại" icon={<Trophy className="h-4 w-4 text-emerald-500" />} label="Đang hiển thị" value={stats.visible} />
          <MetricCard hint="Mục tiêu giữ nhịp đều" icon={<Target className="h-4 w-4 text-violet-500" />} label="Điểm mục tiêu" value={`${stats.score}%`} />
        </div>

        <PageSection className="mb-4" title="Bộ lọc" description="Ưu tiên quét nhanh thay vì đẩy người dùng vào một hero quá cao.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_240px_240px]">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Chọn level và độ khó để giữ vùng kết quả cô đọng hơn.</p>
            </div>

            <Select onValueChange={setSelectedLevel} value={selectedLevel}>
              <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
                <SelectValue placeholder="Chọn level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả level</SelectItem>
                {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedDifficulty} value={selectedDifficulty}>
              <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
                <SelectValue placeholder="Chọn độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả độ khó</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PageSection>

        <PageSection title="Danh sách quiz" description="Card thấp hơn và action rõ hơn để đỡ ngột ngạt khi danh sách dài.">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 rounded-full border-4 border-amber-100 border-t-amber-500 animate-spin" />
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <EmptyState
              description="Không có quiz phù hợp với bộ lọc hiện tại. Thử nới filter để xem thêm bài."
              icon={<Zap className="h-6 w-6" />}
              title="Chưa có quiz phù hợp"
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredQuizzes.map((quiz: QuizItem) => (
                <motion.div
                  key={quiz.id}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[22px] border border-white bg-card p-4 shadow-[0_10px_24px_rgba(148,163,184,0.10)]"
                  initial={{ opacity: 0, y: 10 }}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                      {quiz.jlptLevel}
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${difficultyTone[quiz.difficultyLevel] || "border-border bg-muted text-foreground/80"}`}>
                      {quiz.difficultyLevel}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground">{quiz.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{quiz.description}</p>
                  <p className="mt-3 line-clamp-3 rounded-[18px] border border-border bg-muted p-3 text-sm text-muted-foreground">{quiz.question}</p>

                  <Button className="mt-4 w-full rounded-2xl bg-amber-500 text-white hover:bg-amber-400">
                    <Zap className="mr-2 h-4 w-4" />
                    Bắt đầu quiz
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </PageSection>
      </div>
    </DashboardLayout>
  );
};

export default Quiz;
