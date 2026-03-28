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
          eyebrow="Personalization"
          icon={<Brain className="h-6 w-6 text-rose-600" />}
          title="AI Mistake DNA"
          description="A readable profile of the mistakes you repeat, the pressure points behind them, and the next move that should help most."
          action={
            <Link to="/quiz">
              <Button className="rounded-2xl bg-rose-500 text-white hover:bg-rose-400">
                Back to quiz
              </Button>
            </Link>
          }
        />

        {isLoading ? (
          <div className="rounded-[28px] border border-white bg-card/70 p-10">
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-100 border-t-rose-500" />
            </div>
          </div>
        ) : !data ? (
          <EmptyState
            icon={<Brain className="h-6 w-6" />}
            title="Mistake DNA is not ready yet"
            description="Finish a few quizzes or review sessions and the pattern profile will start describing your recurring slips."
          />
        ) : (
          <>
            <div className="mb-4 grid gap-3 md:grid-cols-4">
              <MetricCard label="Risk score" value={`${data.overallRiskScore}%`} icon={<Radar className="h-4 w-4 text-rose-500" />} hint="Combined pressure from quiz, lesson, and SRS signals" />
              <MetricCard label="Quiz accuracy" value={`${data.averageQuizAccuracy}%`} icon={<Target className="h-4 w-4 text-sky-500" />} hint="Average across checkpoint attempts" />
              <MetricCard label="Due reviews" value={data.dueReviews} icon={<Brain className="h-4 w-4 text-amber-500" />} hint="Cards asking to be revisited now" />
              <MetricCard label="Open lessons" value={data.inProgressLessons} icon={<Sparkles className="h-4 w-4 text-violet-500" />} hint="Learning loops still left unfinished" />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <PageSection
                title={data.dominantPatternTitle}
                description={data.dominantPatternDescription}
                action={
                  data.patterns[0] ? (
                    <Badge className={`rounded-full border ${severityTone[data.patterns[0].severity]}`}>
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
                      <p className="text-sm font-semibold text-foreground">Confidence</p>
                      <Badge className={`rounded-full border ${confidenceTone[data.confidence]}`}>
                        {data.confidence}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Higher confidence means the profile has enough repeated signals from your recent study activity.
                    </p>

                    <div className="mt-4 space-y-3">
                      {data.nextMoves.map((move) => (
                        <div key={move} className="rounded-2xl border border-border bg-card px-3 py-3">
                          <p className="text-sm text-foreground">{move}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PageSection>

              <PageSection title="How to read it" description="Each pattern stays tied to evidence so the profile feels useful, not magical.">
                <div className="space-y-3">
                  {[
                    "Quiz patterns come from your checkpoint scores and quiz type history.",
                    "JLPT pressure points are inferred from where your scores or unfinished lessons cluster.",
                    "Memory friction comes from due reviews, low ease cards, and shallow repetition history.",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </PageSection>
            </div>

            <PageSection
              className="mt-4"
              title="Recurring patterns"
              description="This is the concrete shape of your current mistake profile."
            >
              {data.patterns.length === 0 ? (
                <EmptyState
                  icon={<Brain className="h-6 w-6" />}
                  title="No repeated pattern yet"
                  description="Once you complete more checkpoints and SRS reviews, the cards here will describe the main places where your recall slips."
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
