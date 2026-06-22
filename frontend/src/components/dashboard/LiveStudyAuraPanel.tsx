import { Link } from "react-router-dom";
import { BookOpen, BookmarkPlus, Brain, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { StudyAuraSnapshot } from "@/lib/studyAura";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LiveStudyAuraPanelProps {
  aura: StudyAuraSnapshot;
  loading: boolean;
}

const modeMeta = {
  STORY: {
    icon: BookOpen,
    tint: "from-rose-500 via-rose-400 to-orange-300",
    chip: "border-rose-200 bg-rose-50 text-rose-700",
  },
  REVIEW: {
    icon: BookmarkPlus,
    tint: "from-emerald-500 via-teal-400 to-sky-300",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  RESCUE: {
    icon: Brain,
    tint: "from-violet-500 via-fuchsia-400 to-rose-300",
    chip: "border-violet-200 bg-violet-50 text-violet-700",
  },
  LESSON: {
    icon: Sparkles,
    tint: "from-sky-500 via-cyan-400 to-emerald-300",
    chip: "border-sky-200 bg-sky-50 text-sky-700",
  },
} as const;

const LiveStudyAuraPanel = ({ aura, loading }: LiveStudyAuraPanelProps) => {
  const meta = modeMeta[aura.mode];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[28px] border border-border bg-card"
    >
      <div className={`bg-gradient-to-br ${meta.tint} px-4 py-4 text-white`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/75">Live Study Aura</p>
            <h3 className="mt-2 text-2xl font-semibold leading-tight">
              {loading ? "Dang doc nhiet do hoc..." : aura.title}
            </h3>
            <p className="mt-2 text-sm text-white/85">
              {loading
                ? "Mình đang ghép tín hiệu từ lesson, review và Mistake DNA."
                : aura.description}
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge className={`rounded-full border ${meta.chip}`}>{aura.ambientLabel}</Badge>
          {aura.signals.map((signal) => (
            <Badge
              key={signal}
              className="rounded-full border border-border bg-muted text-muted-foreground"
            >
              {loading ? "..." : signal}
            </Badge>
          ))}
        </div>

        <div className="rounded-[20px] border border-border bg-muted/35 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Mood ritual
          </p>
          <div className="mt-3 space-y-2">
            {aura.ritual.map((step) => (
              <div key={step} className="flex items-start gap-2 text-sm text-foreground">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <span>{loading ? "Dang chuan bi..." : step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={aura.primaryAction.to} className="flex-1 min-w-[180px]">
            <Button className="w-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
              {aura.primaryAction.label}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to={aura.secondaryAction.to} className="flex-1 min-w-[180px]">
            <Button
              className="w-full rounded-2xl border-border bg-card text-foreground/80 hover:bg-card"
              variant="outline"
            >
              {aura.secondaryAction.label}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveStudyAuraPanel;
