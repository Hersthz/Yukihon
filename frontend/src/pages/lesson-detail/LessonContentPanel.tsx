import { EmptyState, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Target } from "lucide-react";
import { parseQuizOptions } from "./utils";

interface LessonQuiz {
  id: number;
  lessonId?: number | null;
  title: string;
  description?: string;
  question: string;
  options?: string;
  correctAnswer: string;
  explanation?: string;
  jlptLevel?: string;
}

interface LessonContentPanelProps {
  lesson: {
    title: string;
    content?: string | null;
  };
  progressPercent: number;
  relatedQuizzes: LessonQuiz[];
  isQuizLoading: boolean;
  quizAnswers: Record<number, string>;
  quizScore: number | null;
  quizPassed: boolean | null;
  gradingQuiz: boolean;
  onAnswerChange: (quizId: number, value: string) => void;
  onSubmitCheckpoint: () => void;
  onResetQuiz: () => void;
}

const LessonContentPanel = ({
  lesson,
  progressPercent,
  relatedQuizzes,
  isQuizLoading,
  quizAnswers,
  quizScore,
  quizPassed,
  gradingQuiz,
  onAnswerChange,
  onSubmitCheckpoint,
  onResetQuiz,
}: LessonContentPanelProps) => (
  <PageSection
    title="Noi dung bai hoc"
    description="Phien ban doc nhanh cho flow hoc co the tiep tuc ngay trong du an hien tai."
  >
    {lesson.content ? (
      <div className="space-y-4">
        <div className="rounded-[22px] border border-border bg-card p-5">
          <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#60a5fa,#22d3ee)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/85">
            {lesson.content}
          </div>
        </div>

        <div className="rounded-[22px] border border-amber-200 bg-amber-50/70 p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Lesson checkpoint quiz</h3>
              <p className="mt-1 text-sm text-foreground/75">
                Hoan thanh quiz nay de he thong tu dong chot completion cho lesson.
              </p>
            </div>
            {quizScore != null ? (
              <Badge
                className={
                  quizPassed
                    ? "rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "rounded-full border border-rose-200 bg-rose-50 text-rose-700"
                }
              >
                {quizScore}%
              </Badge>
            ) : null}
          </div>

          {isQuizLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-100 border-t-amber-500" />
            </div>
          ) : relatedQuizzes.length === 0 ? (
            <EmptyState
              title="Chua co checkpoint quiz"
              description="Hay lien ket quiz voi lesson trong CMS de flow completion day du hon."
              icon={<Target className="h-6 w-6" />}
            />
          ) : (
            <div className="space-y-4">
              {relatedQuizzes.map((quiz, index) => {
                const options = parseQuizOptions(quiz.options);
                const selected = quizAnswers[quiz.id];

                return (
                  <div
                    key={quiz.id}
                    className="rounded-[20px] border border-amber-200 bg-white/80 p-4"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      Cau {index + 1}: {quiz.title}
                    </p>
                    <p className="mt-2 text-sm text-foreground/80">{quiz.question}</p>

                    <div className="mt-3 grid gap-2">
                      {options.map((option) => {
                        const active = selected === option;
                        return (
                          <button
                            key={`${quiz.id}-${option}`}
                            type="button"
                            onClick={() => onAnswerChange(quiz.id, option)}
                            className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                              active
                                ? "border-amber-300 bg-amber-100 text-amber-900"
                                : "border-border bg-card text-foreground/80 hover:bg-muted"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {quizScore != null ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Dap an dung: {quiz.correctAnswer}.{" "}
                        {quiz.explanation || "Khong co giai thich bo sung."}
                      </p>
                    ) : null}
                  </div>
                );
              })}

              <div className="flex flex-wrap gap-2">
                <Button
                  className="rounded-2xl bg-amber-500 text-white hover:bg-amber-400"
                  disabled={gradingQuiz}
                  onClick={onSubmitCheckpoint}
                >
                  Cham checkpoint
                </Button>
                {quizPassed === false ? (
                  <Button
                    className="rounded-2xl"
                    disabled={gradingQuiz}
                    onClick={onResetQuiz}
                    variant="outline"
                  >
                    Lam lai
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    ) : (
      <EmptyState
        title="Noi dung dang trong"
        description="Lesson da ton tai nhung chua co content de hoc."
        icon={<BookOpen className="h-6 w-6" />}
      />
    )}
  </PageSection>
);

export default LessonContentPanel;
