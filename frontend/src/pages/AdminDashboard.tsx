import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Download,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LearningFunnelTrendChart from "@/components/admin/LearningFunnelTrendChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminApi, learningAnalyticsApi } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [exportingQuizAnalytics, setExportingQuizAnalytics] = useState(false);
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

  const statsQuery = useQuery({
    queryKey: ["admin", "system-stats"],
    queryFn: () => adminApi.getSystemStats(),
  });
  const stats = statsQuery.data ?? null;
  const loading = statsQuery.isLoading;

  const funnelQueryResult = useQuery({
    queryKey: ["admin", "learning-funnel", funnelQuery],
    queryFn: () => learningAnalyticsApi.getFunnel(funnelQuery),
  });
  const funnel = funnelQueryResult.data ?? null;
  const funnelLoading = funnelQueryResult.isLoading;

  const quizAnalyticsQuery = useQuery({
    queryKey: ["admin", "quiz-analytics"],
    queryFn: () => adminApi.getQuizAnalytics(),
  });
  const quizAnalytics = quizAnalyticsQuery.data ?? null;
  const quizAnalyticsLoading = quizAnalyticsQuery.isLoading;

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  const formatPercent = (value: number | undefined) => `${(value ?? 0).toFixed(1)}%`;

  const formatPattern = (value?: string) => {
    if (!value) {
      return "Không có lỗi";
    }

    return value
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const handleExportQuizAnalytics = async () => {
    setExportingQuizAnalytics(true);
    try {
      const blob = await adminApi.exportQuizAnalyticsCsv();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "quiz-attempt-analytics.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export quiz analytics:", error);
    } finally {
      setExportingQuizAnalytics(false);
    }
  };

  const statCards = [
    {
      title: "Tổng người dùng",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      link: "/admin/users",
    },
    {
      title: "Người dùng hoạt động",
      value: stats?.activeUsers || 0,
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Quản trị viên",
      value: stats?.adminUsers || 0,
      icon: Shield,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Bài học",
      value: stats?.totalLessons || 0,
      icon: BookOpen,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Từ vựng",
      value: stats?.totalVocabulary || 0,
      icon: FileText,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      title: "Ngữ pháp",
      value: stats?.totalGrammar || 0,
      icon: MessageSquare,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Bài kiểm tra",
      value: stats?.totalQuizzes || 0,
      icon: TrendingUp,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1520px] py-2">
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
              Bảng quản trị
            </h1>
          </div>
          <p className="text-muted-foreground ml-16">
            Quản lý tài nguyên hệ thống và theo dõi thống kê nền tảng
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
                      <Link
                        to={stat.link}
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        Xem tất cả →
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quiz Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-8"
        >
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>Phân tích bài kiểm tra</CardTitle>
                <CardDescription>
                  Tìm câu hỏi gây nhiễu, các kiểu lỗi lặp lại và độ chính xác theo từng nhóm học
                  viên.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleExportQuizAnalytics}
                disabled={
                  exportingQuizAnalytics || quizAnalyticsLoading || !quizAnalytics?.totalAttempts
                }
              >
                <Download className="mr-2 h-4 w-4" />
                {exportingQuizAnalytics ? "Đang xuất..." : "Xuất CSV"}
              </Button>
            </CardHeader>
            <CardContent>
              {quizAnalyticsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
              ) : !quizAnalytics || quizAnalytics.totalAttempts === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
                  Chưa có lượt làm bài nào. Dữ liệu phân tích sẽ hiển thị sau khi học viên nộp câu
                  trả lời.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Lượt làm
                      </p>
                      <p className="mt-1 text-2xl font-semibold">{quizAnalytics.totalAttempts}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Độ chính xác tổng thể
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-emerald-400">
                        {formatPercent(quizAnalytics.overallAccuracy)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Lượt sai
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-amber-400">
                        {quizAnalytics.wrongAttempts}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Kiểu lỗi phổ biến nhất
                      </p>
                      <p className="mt-1 text-2xl font-semibold">
                        {formatPattern(quizAnalytics.mostCommonPattern)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
                    <div className="rounded-lg border border-border/60 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Câu hỏi hay sai nhất</TableHead>
                            <TableHead>Cấp độ</TableHead>
                            <TableHead>Độ khó</TableHead>
                            <TableHead className="text-right">Số lần sai</TableHead>
                            <TableHead className="text-right">Độ chính xác</TableHead>
                            <TableHead>Kiểu lỗi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {quizAnalytics.mostMissedQuestions.map((item) => (
                            <TableRow key={item.quizId}>
                              <TableCell className="max-w-[340px] font-medium">
                                <span className="line-clamp-2">{item.title}</span>
                              </TableCell>
                              <TableCell>{item.jlptLevel}</TableCell>
                              <TableCell>{item.difficultyLevel}</TableCell>
                              <TableCell className="text-right text-amber-400">
                                {item.wrongAttempts}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatPercent(item.accuracyRate)}
                              </TableCell>
                              <TableCell>{formatPattern(item.topPattern)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="grid gap-4">
                      <div className="rounded-lg border border-border/60 bg-background/30 p-4">
                        <p className="text-sm font-semibold">Phân loại kiểu lỗi</p>
                        <div className="mt-3 space-y-2">
                          {quizAnalytics.patternBreakdown.slice(0, 6).map((item) => (
                            <div
                              key={item.pattern}
                              className="flex items-center justify-between rounded-md border border-border/50 bg-card/50 px-3 py-2 text-sm"
                            >
                              <span>{formatPattern(item.pattern)}</span>
                              <span className="font-semibold text-amber-400">
                                {item.wrongAttempts}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-lg border border-border/60 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nhóm</TableHead>
                              <TableHead className="text-right">Lượt làm</TableHead>
                              <TableHead className="text-right">Độ chính xác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {quizAnalytics.cohortAccuracy.map((item) => (
                              <TableRow key={`${item.dimension}-${item.value}`}>
                                <TableCell className="font-medium">
                                  {item.dimension}: {item.value}
                                </TableCell>
                                <TableCell className="text-right">{item.totalAttempts}</TableCell>
                                <TableCell className="text-right text-emerald-400">
                                  {formatPercent(item.accuracyRate)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Learning Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle>Phễu học tập</CardTitle>
              <CardDescription>
                Theo dõi lượt bắt đầu, hoàn thành, bỏ dở và phục hồi qua bài kiểm tra để xác định
                các bài học giữ chân học viên tốt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-5 grid grid-cols-1 gap-3 border border-border/60 bg-background/30 p-4 md:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Khoảng thời gian
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                    value={funnelDays}
                    onChange={(e) => setFunnelDays(e.target.value)}
                    disabled={hasCustomDateRange}
                  >
                    <option value="7">7 ngày qua</option>
                    <option value="30">30 ngày qua</option>
                    <option value="90">90 ngày qua</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Nhóm JLPT
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                    value={funnelJlpt}
                    onChange={(e) => setFunnelJlpt(e.target.value)}
                  >
                    <option value="ALL">Tất cả cấp độ</option>
                    <option value="N5">N5</option>
                    <option value="N4">N4</option>
                    <option value="N3">N3</option>
                    <option value="N2">N2</option>
                    <option value="N1">N1</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Từ ngày
                  </label>
                  <Input
                    type="date"
                    value={funnelStartDate}
                    onChange={(e) => setFunnelStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Đến ngày
                  </label>
                  <Input
                    type="date"
                    value={funnelEndDate}
                    onChange={(e) => setFunnelEndDate(e.target.value)}
                  />
                  {hasCustomDateRange && (
                    <button
                      type="button"
                      onClick={clearDateFilter}
                      className="text-xs text-primary hover:underline"
                    >
                      Xóa bộ lọc ngày
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
                  Chưa có dữ liệu phân tích. Sự kiện sẽ xuất hiện sau khi học viên bắt đầu học bài.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-lg border border-border/60 bg-background/30 p-3 text-xs text-muted-foreground">
                    Nhóm:{" "}
                    <span className="font-medium text-foreground">
                      {funnel.jlptLevel ?? "Tất cả JLPT"}
                    </span>
                    {" • "}
                    Khoảng:{" "}
                    <span className="font-medium text-foreground">
                      {funnel.startDate && funnel.endDate
                        ? `${funnel.startDate} đến ${funnel.endDate}`
                        : `${funnel.windowDays} ngày qua`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Đã bắt đầu
                      </p>
                      <p className="mt-1 text-2xl font-semibold">{funnel.totalStarted}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Đã hoàn thành
                      </p>
                      <p className="mt-1 text-2xl font-semibold">{funnel.totalCompleted}</p>
                      <p className="text-xs text-emerald-400">
                        {formatPercent(funnel.overallCompletionRate)} tỉ lệ hoàn thành
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Đã bỏ dở
                      </p>
                      <p className="mt-1 text-2xl font-semibold">{funnel.totalAbandoned}</p>
                      <p className="text-xs text-amber-400">
                        {formatPercent(funnel.overallAbandonmentRate)} tỉ lệ bỏ dở
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Phục hồi qua bài kiểm tra
                      </p>
                      <p className="mt-1 text-2xl font-semibold">{funnel.totalQuizCorrected}</p>
                      <p className="text-xs text-cyan-400">
                        {formatPercent(funnel.overallQuizRecoveryRate)} sửa đúng sau khi sai
                      </p>
                    </div>
                  </div>

                  <LearningFunnelTrendChart dailyTrend={funnel.dailyTrend} />

                  <div className="rounded-lg border border-border/60 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bài học</TableHead>
                          <TableHead className="text-right">Lượt bắt đầu</TableHead>
                          <TableHead className="text-right">Hoàn thành</TableHead>
                          <TableHead className="text-right">Bỏ dở</TableHead>
                          <TableHead className="text-right">Phục hồi qua KT</TableHead>
                          <TableHead className="text-right">Điểm giữ chân</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {funnel.topRetainedContent.map((item) => (
                          <TableRow key={`${item.contentType}-${item.contentId}`}>
                            <TableCell className="font-medium">{item.contentTitle}</TableCell>
                            <TableCell className="text-right">{item.startedCount}</TableCell>
                            <TableCell className="text-right text-emerald-400">
                              {formatPercent(item.completionRate)}
                            </TableCell>
                            <TableCell className="text-right text-amber-400">
                              {formatPercent(item.abandonmentRate)}
                            </TableCell>
                            <TableCell className="text-right text-cyan-400">
                              {formatPercent(item.quizRecoveryRate)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatPercent(item.retentionScore)}
                            </TableCell>
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
              <CardTitle>Thao tác nhanh</CardTitle>
              <CardDescription>Các tác vụ quản trị thường dùng</CardDescription>
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
                  <div className="font-semibold">Quản lý người dùng</div>
                  <div className="text-xs text-muted-foreground">Xem và chỉnh sửa người dùng</div>
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
                  <div className="font-semibold">Quản lý nội dung</div>
                  <div className="text-xs text-muted-foreground">Thêm/sửa bài học</div>
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
                  <div className="font-semibold">Xưởng nội dung</div>
                  <div className="text-xs text-muted-foreground">
                    Dựng và duyệt nội dung kéo-thả
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
