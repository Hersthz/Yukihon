import { Clock3, UserRound } from "lucide-react";
import type { CreatorTemplateAuditEvent } from "@/api";
import { Badge } from "@/components/ui/badge";

interface CreatorAuditTimelineProps {
  events: CreatorTemplateAuditEvent[];
  loading?: boolean;
  emptyMessage?: string;
}

const STAGE_LABELS: Record<CreatorTemplateAuditEvent["stage"], string> = {
  AUTHORING: "Authoring",
  REVIEW_SUBMISSION: "Review Submission",
  REVIEWER_REVIEW: "Reviewer Review",
  ADMIN_APPROVAL: "Admin Approval",
};

const formatEventTitle = (event: CreatorTemplateAuditEvent): string => {
  switch (event.action) {
    case "CREATED":
      return "Draft created";
    case "UPDATED_DRAFT":
      return "Draft updated";
    case "SUBMITTED_FOR_REVIEW":
      return "Submitted for review";
    case "REVIEW_DECISION":
      return event.decision === "REJECTED" ? "Reviewer rejected" : "Reviewer approved";
    case "ADMIN_DECISION":
      if (event.decision === "PUBLISHED") {
        return "Admin published";
      }
      return "Admin rejected";
    default:
      return event.action;
  }
};

const formatEventTime = (createdAt: string): string => {
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) {
    return createdAt;
  }
  return parsed.toLocaleString();
};

const CreatorAuditTimeline = ({
  events,
  loading = false,
  emptyMessage = "No audit events yet.",
}: CreatorAuditTimelineProps) => {
  if (loading) {
    return (
      <div className="flex min-h-28 items-center justify-center text-sm text-muted-foreground">
        Loading audit timeline...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/80 p-4 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
      {events.map((event, index) => (
        <div key={event.id} className="relative rounded-lg border border-border/70 bg-background/40 p-3">
          {index < events.length - 1 && (
            <div className="absolute left-[1.18rem] top-[2.65rem] h-[calc(100%+0.85rem)] w-px bg-border/70" />
          )}

          <div className="flex items-start gap-3">
            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
            <div className="w-full space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground">{formatEventTitle(event)}</p>
                <Badge variant="outline" className="border-border/70 text-[11px] text-muted-foreground">
                  {STAGE_LABELS[event.stage]}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <UserRound className="h-3.5 w-3.5" />
                  {event.actorDisplayName ?? "System"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatEventTime(event.createdAt)}
                </span>
              </div>

              {event.note && (
                <div className="rounded-md border border-border/70 bg-muted/30 px-2.5 py-2 text-xs text-muted-foreground">
                  {event.note}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CreatorAuditTimeline;