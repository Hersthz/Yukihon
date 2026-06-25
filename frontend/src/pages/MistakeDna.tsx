import { Brain, Radar, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMistakeDna } from "@/hooks/learning/useMistakeDna";
import MistakePatternCard from "@/pages/mistake-dna/MistakePatternCard";
import { severityLabel, severityTone } from "@/pages/mistake-dna/utils";

const confidenceTone = {
  HIGH: "border-emerald-200 bg-emerald-50 text-emerald-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  LOW: "border-slate-200 bg-slate-50 text-slate-700",
} as const;

const MistakeDna = () => {
  const { data, isLoading } = useMistakeDna();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1380px]">
        <PageHeader
          eyebrow="Cá nhân hóa"
          icon={<Brain className="h-6 w-6 text-primary" />}
          title="Phân tích lỗi bằng AI"
          description="Một hồ sơ dễ đọc về những lỗi bạn lặp lại, các điểm áp lực đằng sau chúng, và bước tiếp theo có thể giúp ích nhất."
          action={
            <Link to="/quiz">
              <Button className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
                Quay lại Quiz
              </Button>
            </Link>
          }
        />

        {isLoading ? (
          <div className="rounded-[28px] border border-white bg-card/70 p-10">
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            </div>
          </div>
        ) : !data ? (
          <EmptyState
            icon={<Brain className="h-6 w-6" />}
            title="Phân tích lỗi chưa sẵn sàng"
            description="Hoàn thành vài bài quiz hoặc buổi ôn tập, hồ sơ phân tích sẽ bắt đầu mô tả những lỗi bạn hay mắc lại."
          />
        ) : (
          <>
            <div className="mb-4 grid gap-3 md:grid-cols-4">
              <MetricCard
                label="Điểm rủi ro"
                value={`${data.overallRiskScore}%`}
                icon={<Radar className="h-4 w-4 text-primary" />}
                hint="Áp lực tổng hợp từ tín hiệu quiz, bài học và SRS"
              />
              <MetricCard
                label="Độ chính xác Quiz"
                value={`${data.averageQuizAccuracy}%`}
                icon={<Target className="h-4 w-4 text-sky-500" />}
                hint="Trung bình qua các lần làm checkpoint"
              />
              <MetricCard
                label="Cần ôn tập"
                value={data.dueReviews}
                icon={<Brain className="h-4 w-4 text-amber-500" />}
                hint="Số thẻ đang cần ôn lại ngay"
              />
              <MetricCard
                label="Bài học dở dang"
                value={data.inProgressLessons}
                icon={<Sparkles className="h-4 w-4 text-violet-500" />}
                hint="Những vòng học vẫn còn chưa hoàn thành"
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <PageSection
                title={data.dominantPatternTitle}
                description={data.dominantPatternDescription}
                action={
                  data.patterns[0] ? (
                    <Badge
                      className={`rounded-full border ${severityTone[data.patterns[0].severity]}`}
                    >
                      {severityLabel[data.patterns[0].severity]}
                    </Badge>
                  ) : null
                }
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="rounded-[24px] border border-border bg-background px-4 py-4">
                    <p className="text-sm leading-6 text-foreground">{data.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {data.studySignals.map((signal) => (
                        <span
                          key={signal}
                          className="rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary"
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-border bg-background px-4 py-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Độ tin cậy</p>
                      <Badge className={`rounded-full border ${confidenceTone[data.confidence]}`}>
                        {data.confidence}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Độ tin cậy cao hơn nghĩa là hồ sơ đã có đủ tín hiệu lặp lại từ hoạt động học
                      gần đây của bạn.
                    </p>

                    <div className="mt-4 space-y-3">
                      {data.nextMoves.map((move) => (
                        <div
                          key={move}
                          className="rounded-2xl border border-border bg-card px-3 py-3"
                        >
                          <p className="text-sm text-foreground">{move}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PageSection>

              <PageSection
                title="Cách đọc hồ sơ"
                description="Mỗi mẫu lỗi đều gắn với bằng chứng để hồ sơ thực sự hữu ích, không mơ hồ."
              >
                <div className="space-y-3">
                  {[
                    "Mẫu lỗi quiz đến từ điểm checkpoint và lịch sử các dạng quiz của bạn.",
                    "Điểm áp lực JLPT được suy ra từ nơi điểm số hoặc bài học chưa xong của bạn tập trung.",
                    "Khó khăn ghi nhớ đến từ thẻ cần ôn, thẻ có độ dễ thấp và lịch sử lặp lại còn nông.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </PageSection>
            </div>

            <PageSection
              className="mt-4"
              title="Các mẫu lỗi lặp lại"
              description="Đây là hình dạng cụ thể của hồ sơ lỗi hiện tại của bạn."
            >
              {data.patterns.length === 0 ? (
                <EmptyState
                  icon={<Brain className="h-6 w-6" />}
                  title="Chưa có mẫu lỗi lặp lại"
                  description="Khi bạn hoàn thành thêm các checkpoint và buổi ôn SRS, các thẻ ở đây sẽ mô tả những chỗ chính mà khả năng nhớ của bạn hay bị trượt."
                />
              ) : (
                <div className="space-y-3">
                  {data.patterns.map((pattern) => (
                    <MistakePatternCard key={pattern.key} pattern={pattern} />
                  ))}
                </div>
              )}
            </PageSection>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MistakeDna;
