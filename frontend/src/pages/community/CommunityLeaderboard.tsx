import { PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { CommunityStats, LeaderboardEntry } from "./types";

interface CommunityLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  stats: CommunityStats | null;
}

const CommunityLeaderboard = ({ leaderboard, stats }: CommunityLeaderboardProps) => (
  <PageSection
    title="Leaderboard"
    description="Xep hang nho de nhin nhanh ai dang tao gia tri cho cong dong."
  >
    <div className="space-y-3">
      {leaderboard.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chua du du lieu de xep hang.</p>
      ) : (
        leaderboard.map((entry, index) => (
          <div key={entry.userId} className="rounded-[18px] border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  #{index + 1} {entry.userDisplayName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.postsCount} posts · {entry.commentsCount} comments · {entry.likesReceived}{" "}
                  likes received
                </p>
              </div>
              <Badge className="rounded-full border border-pink-200 bg-pink-50 text-pink-700">
                {entry.score} pts
              </Badge>
            </div>
          </div>
        ))
      )}

      {stats?.trendingTags?.length ? (
        <div className="pt-2">
          <p className="mb-2 text-sm font-medium text-foreground">Trending tags</p>
          <div className="flex flex-wrap gap-2">
            {stats.trendingTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  </PageSection>
);

export default CommunityLeaderboard;
