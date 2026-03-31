import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  TrendingUp,
  Shield,
  Activity,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import WinterNightBackground from "@/components/WinterNightBackground";
import { adminApi, learningAnalyticsApi, type LearningFunnelResponse } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  totalLessons: number;
  totalVocabulary: number;
  totalGrammar: number;
  totalQuizzes: number;
}

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [funnel, setFunnel] = useState<LearningFunnelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [funnelLoading, setFunnelLoading] = useState(true);
  const [funnelDays, setFunnelDays] = useState("30");
  const [funnelJlpt, setFunnelJlpt] = useState("ALL");
  const [funnelStartDate, setFunnelStartDate] = useState("");
  const [funnelEndDate, setFunnelEndDate] = useState("");

  const jlptFilter = funnelJlpt === "ALL" ? undefined : funnelJlpt;
  const hasCustomDateRange = Boolean(funnelStartDate || funnelEndDate);

  const funnelQuery = useMemo(
    () => ({
      days: hasCustomDateRange ? undefined : Number(funnelDays),
      limit: 8,
      contentType: "LESSON" as const,
      jlptLevel: jlptFilter,
      startDate: funnelStartDate || undefined,
      endDate: funnelEndDate || undefined,
    }),
    [funnelDays, hasCustomDateRange, jlptFilter, funnelStartDate, funnelEndDate]
  );

  const clearDateFilter = () => {
    setFunnelStartDate("");
    setFunnelEndDate("");
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsResult = await adminApi.getSystemStats() as SystemStats;
        setStats(statsResult);
      } catch (error) {
        console.error("Failed to fetch system stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const fetchFunnel = useCallback(async () => {
    setFunnelLoading(true);
    try {
      const result = await learningAnalyticsApi.getFunnel(funnelQuery);
      setFunnel(result);
    } catch (error) {
      console.error("Failed to fetch learning funnel:", error);
    } finally {
      setFunnelLoading(false);
    }
  }, [funnelQuery]);

  useEffect(() => {
    void fetchFunnel();
  }, [fetchFunnel]);

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  const formatPercent = (value: number | undefined) => `${(value ?? 0).toFixed(1)}%`;

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      link: "/admin/users",
    },
    {
      title: "Active Users",
      value: stats?.activeUsers || 0,
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Admins",
      value: stats?.adminUsers || 0,
      icon: Shield,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Lessons",
      value: stats?.totalLessons || 0,
      icon: BookOpen,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Vocabulary",
      value: stats?.totalVocabulary || 0,
      icon: FileText,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      title: "Grammar",
      value: stats?.totalGrammar || 0,
      icon: MessageSquare,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Quizzes",
      value: stats?.totalQuizzes || 0,
      icon: TrendingUp,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="min-h-screen relative pb-20">
      <WinterNightBackground snowCount={40} sparkleCount={20} intensity="light" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground ml-16">
            Manage system resources and monitor platform statistics
          </p>
        </motion.div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/40 backdrop-blur-md border-border/50 hover:bg-card/60 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    {stat.link && (
                      <Link to={stat.link} className="text-xs text-primary hover:underline mt-1 inline-block">
                        View all →
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Learning Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle>Learning Funnel</CardTitle>
              <CardDescription>
                Track start, completion, abandonment, and quiz recovery to identify high-retention lessons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-5 grid grid-cols-1 gap-3 border border-border/60 bg-background/30 p-4 md:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Window</label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                    value={funnelDays}
                    onChange={(e) => setFunnelDays(e.target.value)}
                    disabled={hasCustomDateRange}
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">JLPT Cohort</label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                    value={funnelJlpt}
                    onChange={(e) => setFunnelJlpt(e.target.value)}
                  >
                    <option value="ALL">All levels</option>
                    <option value="N5">N5</option>
                    <option value="N4">N4</option>
                    <option value="N3">N3</option>
                    <option value="N2">N2</option>
                    <option value="N1">N1</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">From date</label>
                  <Input type="date" value={funnelStartDate} onChange={(e) => setFunnelStartDate(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">To date</label>
                  <Input type="date" value={funnelEndDate} onChange={(e) => setFunnelEndDate(e.target.value)} />
                  {hasCustomDateRange && (
                    <button
                      type="button"
                      onClick={clearDateFilter}
                      className="text-xs text-primary hover:underline"
                    >
                      Clear date filter
                    </button>
                  )}
                </div>
              </div>

              {funnelLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
              ) : !funnel || funnel.contentBreakdown.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
                  No analytics data yet. Events will appear after users start learning lessons.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-lg border border-border/60 bg-background/30 p-3 text-xs text-muted-foreground">
                    Cohort: <span className="font-medium text-foreground">{funnel.jlptLevel ?? "All JLPT"}</span>
                    {" • "}
                    Range: <span className="font-medium text-foreground">{funnel.startDate && funnel.endDate ? `${funnel.startDate} to ${funnel.endDate}` : `Last ${funnel.windowDays} days`}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Started</p>
                      <p className="mt-1 text-2xl font-semibold">{funnel.totalStarted}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Completed</p>
                      <p className="mt-1 text-2xl font-semibold">{funnel.totalCompleted}</p>
                      <p className="text-xs text-emerald-400">{formatPercent(funnel.overallCompletionRate)} completion rate</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Abandoned</p>
                      <p className="mt-1 text-2xl font-semibold">{funnel.totalAbandoned}</p>
                      <p className="text-xs text-amber-400">{formatPercent(funnel.overallAbandonmentRate)} abandonment rate</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Quiz Recovery</p>
                      <p className="mt-1 text-2xl font-semibold">{funnel.totalQuizCorrected}</p>
                      <p className="text-xs text-cyan-400">{formatPercent(funnel.overallQuizRecoveryRate)} corrected after wrong</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lesson</TableHead>
                          <TableHead className="text-right">Starts</TableHead>
                          <TableHead className="text-right">Completion</TableHead>
                          <TableHead className="text-right">Abandonment</TableHead>
                          <TableHead className="text-right">Quiz Recovery</TableHead>
                          <TableHead className="text-right">Retention Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {funnel.topRetainedContent.map((item) => (
                          <TableRow key={`${item.contentType}-${item.contentId}`}>
                            <TableCell className="font-medium">{item.contentTitle}</TableCell>
                            <TableCell className="text-right">{item.startedCount}</TableCell>
                            <TableCell className="text-right text-emerald-400">{formatPercent(item.completionRate)}</TableCell>
                            <TableCell className="text-right text-amber-400">{formatPercent(item.abandonmentRate)}</TableCell>
                            <TableCell className="text-right text-cyan-400">{formatPercent(item.quizRecoveryRate)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatPercent(item.retentionScore)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                to="/admin/users"
                className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 hover:border-blue-500/50 transition-all group"
              >
                <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold">Manage Users</div>
                  <div className="text-xs text-muted-foreground">View and edit users</div>
                </div>
              </Link>

              <Link
                to="/admin/content"
                className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 hover:border-purple-500/50 transition-all group"
              >
                <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold">Manage Content</div>
                  <div className="text-xs text-muted-foreground">Add/edit lessons</div>
                </div>
              </Link>

              <Link
                to="/admin/creator-mode"
                className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 hover:border-green-500/50 transition-all group"
              >
                <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                  <Sparkles className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="font-semibold">Creator Mode</div>
                  <div className="text-xs text-muted-foreground">Build and review drag-drop content</div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
