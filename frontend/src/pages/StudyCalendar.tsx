import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, PageSection, StatStrip } from "@/components/layout/UserPage";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { learningAnalyticsApi, type StudyCalendarDay } from "@/api";
import { cn } from "@/lib/utils";

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const parseDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};
const formatMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(date);
const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseDateKey(value));

const StudyCalendar = () => {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => new Date());

  const range = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return { startDate: toDateKey(start), endDate: toDateKey(end) };
  }, [month]);

  const { data, isLoading } = useQuery({
    queryKey: ["study-calendar", range.startDate, range.endDate],
    queryFn: () => learningAnalyticsApi.getStudyCalendar(range),
  });

  const dayMap = useMemo(() => {
    const next = new Map<string, StudyCalendarDay>();
    data?.days.forEach((day) => next.set(day.date, day));
    return next;
  }, [data?.days]);

  useEffect(() => {
    if (!data) {
      return;
    }

    const todayInMonth = data.days.find((day) => day.today);
    const firstActiveDay = data.days.find((day) => day.hasActivity);
    const fallbackDay = data.days[0];
    const nextKey = todayInMonth?.date || firstActiveDay?.date || fallbackDay?.date;

    if (!selectedDate || !dayMap.has(toDateKey(selectedDate))) {
      setSelectedDate(nextKey ? parseDateKey(nextKey) : undefined);
    }
  }, [data, dayMap, selectedDate]);

  const selectedKey = selectedDate ? toDateKey(selectedDate) : null;
  const selectedDay = selectedKey ? (dayMap.get(selectedKey) ?? null) : null;

  const modifierDates = useMemo(() => {
    if (!data) {
      return {
        light: [] as Date[],
        medium: [] as Date[],
        strong: [] as Date[],
        recommended: [] as Date[],
        deadline: [] as Date[],
      };
    }

    return {
      light: data.days
        .filter((day) => day.intensity === "light")
        .map((day) => parseDateKey(day.date)),
      medium: data.days
        .filter((day) => day.intensity === "medium")
        .map((day) => parseDateKey(day.date)),
      strong: data.days
        .filter((day) => day.intensity === "strong")
        .map((day) => parseDateKey(day.date)),
      recommended: data.days
        .filter((day) => day.recommendedStudyDay)
        .map((day) => parseDateKey(day.date)),
      deadline: data.days.filter((day) => day.deadlineDay).map((day) => parseDateKey(day.date)),
    };
  }, [data]);

  const deadlineTone =
    data?.deadlineStatus === "OFF_TRACK"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : data?.deadlineStatus === "AT_RISK"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1440px]">
        <PageHeader
          eyebrow="Lịch học"
          icon={<CalendarDays className="h-6 w-6 text-sky-600" />}
          title="Lịch học"
          description="Theo dõi ngày đã học, nhịp chuỗi ngày và mốc JLPT trong một khung tháng rõ ràng."
          action={
            <div className="flex flex-wrap items-center gap-2">
              {data?.deadlineStatus && (
                <Badge
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold",
                    deadlineTone
                  )}
                >
                  {data.deadlineStatus === "OFF_TRACK"
                    ? "Chậm tiến độ"
                    : data.deadlineStatus === "AT_RISK"
                      ? "Cần tăng nhịp"
                      : data.deadlineStatus === "COMPLETED"
                        ? "Đã hoàn thành"
                        : data.deadlineStatus === "NO_DEADLINE"
                          ? "Chưa đặt hạn"
                          : "Đang ổn"}
                </Badge>
              )}
              <Button
                variant="outline"
                className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card"
                onClick={() => {
                  setMonth(startOfMonth(new Date()));
                  setSelectedDate(new Date());
                }}
              >
                Hôm nay
              </Button>
            </div>
          }
        />

        <StatStrip
          className="mb-4"
          items={[
            { label: "chuỗi ngày", value: data?.currentStreak ?? 0 },
            { label: "ngày có học", value: data?.activeDays ?? 0 },
            { label: "phút học", value: data?.totalStudyMinutes ?? 0 },
            { label: "mục tiêu/ngày", value: data?.recommendedMinutesPerDay ?? 0 },
          ]}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <PageSection
            title="Khung tháng"
            description={`Theo dõi ${formatMonthLabel(month)} với màu mức độ học, ngày nên học và hạn JLPT.`}
            action={
              <p className="text-sm font-medium text-muted-foreground">{formatMonthLabel(month)}</p>
            }
          >
            {isLoading ? (
              <div className="flex min-h-[420px] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-sky-500" />
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
                <div className="rounded-[24px] border border-border bg-card/70 p-3">
                  <Calendar
                    mode="single"
                    month={month}
                    onMonthChange={setMonth}
                    onSelect={setSelectedDate}
                    selected={selectedDate}
                    showOutsideDays={false}
                    modifiers={{
                      activityLight: modifierDates.light,
                      activityMedium: modifierDates.medium,
                      activityStrong: modifierDates.strong,
                      recommendedStudy: modifierDates.recommended,
                      deadlineDay: modifierDates.deadline,
                    }}
                    modifiersClassNames={{
                      activityLight:
                        "bg-emerald-100 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200",
                      activityMedium:
                        "bg-sky-100 text-sky-900 hover:bg-sky-100 dark:bg-sky-500/20 dark:text-sky-100",
                      activityStrong: "bg-primary text-primary-foreground hover:bg-primary",
                      recommendedStudy:
                        "ring-1 ring-sky-300 ring-offset-2 ring-offset-background border border-dashed border-sky-300",
                      deadlineDay: "ring-2 ring-rose-400 ring-offset-2 ring-offset-background",
                    }}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="rounded-[20px] border border-border bg-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Chú thích
                    </p>
                    <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="h-4 w-4 rounded bg-emerald-100 dark:bg-emerald-500/15" />
                        Học nhẹ
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="h-4 w-4 rounded bg-sky-100 dark:bg-sky-500/20" />
                        Học đều
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="h-4 w-4 rounded bg-primary" />
                        Học sâu
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="h-4 w-4 rounded border border-dashed border-sky-300" />
                        Ngày nên học
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="h-4 w-4 rounded ring-2 ring-rose-400 ring-offset-2 ring-offset-background" />
                        Hạn JLPT
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-amber-200 bg-amber-50/80 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-semibold text-amber-800">Gợi ý nhịp học</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-foreground/80">
                      {data?.deadlineInsight ||
                        "Hãy giữ ít nhất 1 phiên học ngắn mỗi ngày để duy trì chuỗi ngày học."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </PageSection>

          <div className="space-y-4">
            <PageSection
              title="Chi tiết ngày"
              description={
                selectedDay
                  ? formatDateLabel(selectedDay.date)
                  : "Chọn một ngày trong lịch để xem chi tiết."
              }
            >
              {selectedDay ? (
                <div className="space-y-3">
                  <div className="rounded-[20px] border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">
                        {selectedDay.hasActivity ? "Đã có học tập" : "Chưa ghi nhận học tập"}
                      </p>
                      <Badge className="rounded-full border border-border bg-background text-foreground/80">
                        {selectedDay.intensity === "strong"
                          ? "Sâu"
                          : selectedDay.intensity === "medium"
                            ? "Đều"
                            : selectedDay.intensity === "light"
                              ? "Nhẹ"
                              : "Trống"}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border bg-background px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Sự kiện
                        </p>
                        <p className="mt-2 text-xl font-semibold text-foreground">
                          {selectedDay.totalEvents}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-background px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Hoàn thành
                        </p>
                        <p className="mt-2 text-xl font-semibold text-foreground">
                          {selectedDay.completedCount}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-background px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Phút học
                        </p>
                        <p className="mt-2 text-xl font-semibold text-foreground">
                          {selectedDay.totalMinutes}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedDay.recommendedStudyDay && (
                    <div className="rounded-[20px] border border-sky-200 bg-sky-50/80 p-4 text-sm leading-6 text-sky-900">
                      Đây là ngày nên ưu tiên học để giữ nhịp và bám sát kế hoạch hiện tại.
                    </div>
                  )}

                  {selectedDay.deadlineDay && (
                    <div className="rounded-[20px] border border-rose-200 bg-rose-50/80 p-4 text-sm leading-6 text-rose-900">
                      Đây là mốc deadline JLPT của bạn. Nên dành một phiên học tập trung hơn bình
                      thường.
                    </div>
                  )}

                  {!selectedDay.hasActivity &&
                    !selectedDay.recommendedStudyDay &&
                    !selectedDay.deadlineDay && (
                      <div className="rounded-[20px] border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                        Không có sự kiện nào trong ngày này. Nếu muốn giữ streak ổn định, hãy chèn
                        một phiên học ngắn 10–15 phút.
                      </div>
                    )}
                </div>
              ) : (
                <div className="rounded-[20px] border border-dashed border-border bg-muted/30 px-5 py-10 text-center text-sm text-muted-foreground">
                  Chọn một ngày trong lịch để xem hoạt động và gợi ý.
                </div>
              )}
            </PageSection>

            <PageSection
              title="Tiến độ mục tiêu"
              description="Tóm tắt nhanh để biết bạn đang ở đâu trong hành trình JLPT."
            >
              <div className="space-y-3">
                <div className="rounded-[20px] border border-border bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Mục tiêu hiện tại
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {data?.targetJlptLevel || "N5"} • {data?.dailyGoalMinutes || 0} phút/ngày
                  </p>
                </div>

                <div className="rounded-[20px] border border-border bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Deadline
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {data?.deadlineDate || "Chưa đặt"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data?.deadlineDate
                      ? `${data.daysRemainingToDeadline} ngày còn lại • cần ${data.recommendedMinutesPerDay} phút/ngày`
                      : "Hãy đặt mốc thi JLPT để hệ thống tính nhịp học chính xác hơn."}
                  </p>
                </div>

                <div className="rounded-[20px] border border-border bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Ngày học tốt nhất tháng
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {data?.bestDayDate ? formatDateLabel(data.bestDayDate) : "Chưa có"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data?.bestDayDate
                      ? `${data.bestDayMinutes} phút học là mức cao nhất trong tháng này.`
                      : "Khi có hoạt động, lịch sẽ nhận ra ngày học sâu nhất của bạn."}
                  </p>
                </div>
              </div>
            </PageSection>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudyCalendar;
