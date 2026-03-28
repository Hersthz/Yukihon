import { Brain, Sparkles, Target } from "lucide-react";
import type { MistakePattern } from "@/api";
import { Badge } from "@/components/ui/badge";
import { severityLabel, severityTone } from "@/pages/mistake-dna/utils";

interface MistakePatternCardProps {
  pattern: MistakePattern;
}

const MistakePatternCard = ({ pattern }: MistakePatternCardProps) => {
  return (
    <div className="yukihon-card-flat px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-foreground">{pattern.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{pattern.description}</p>
        </div>
        <Badge className={`rounded-full border ${severityTone[pattern.severity]}`}>
          {severityLabel[pattern.severity]}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background px-3 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            {pattern.metricLabel}
          </div>
          <p className="mt-2 text-2xl font-semibold text-foreground">{pattern.metricValue}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background px-3 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Brain className="h-3.5 w-3.5" />
            Insight
          </div>
          <p className="mt-2 text-sm text-foreground">{pattern.insight}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background px-3 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Focus move
          </div>
          <p className="mt-2 text-sm text-foreground">{pattern.recommendedAction}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {pattern.evidence.map((item) => (
          <span
            key={`${pattern.key}-${item}`}
            className="rounded-full border border-primary/15 bg-primary/5 px-3 py-2 text-xs font-medium text-primary"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MistakePatternCard;
