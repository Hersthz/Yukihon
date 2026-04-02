import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock3, Flame, Sparkles, Target } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
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
const formatMonthLabel = (date: Date) => new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(date);
const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(parseDateKey(value));

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

    const todayInMonth = data.days.find((day) => day.isToday);
    const firstActiveDay = data.days.find((day) => day.hasActivity);
    const fallbackDay = data.days[0];
    const nextKey = todayInMonth?.date || firstActiveDay?.date || fallbackDay?.date;

    if (!selectedDate || !dayMap.has(toDateKey(selectedDate))) {
      setSelectedDate(nextKey ? parseDateKey(nextKey) : undefined);
    }
  }, [data, dayMap, selectedDate]);

  const selectedKey = selectedDate ? toDateKey(selectedDate) : null;
  const selectedDay = selectedKey ? dayMap.get(selectedKey) ?? null : null;

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
      light: data.days.filter((day) => day.intensity === "light").map((day) => parseDateKey(day.date)),
      medium: data.days.filter((day) => day.intensity === "medium").map((day) => parseDateKey(day.date)),
      strong: data.days.filter((day) => day.intensity === "strong").map((day) => parseDateKey(day.date)),
      recommended: data.days.filter((day) => day.isRecommendedStudyDay).map((day) => parseDateKey(day.date)),
      deadline: data.days.filter((day) => day.isDeadlineDay).map((day) => parseDateKey(day.date)),
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
          eyebrow="Study calendar"
          icon={<CalendarDays className="h-6 w-6 text-sky-600" />}
          title="Lich hoc"
          description="Theo doi ngay da hoc, nhiep streak va moc JLPT trong mot month view ro rang."
          action={
            <div className="flex flex-wrap items-center gap-2">
              {data?.deadlineStatus && (
                <Badge className={cn("rounded-full border px-3 py-1 text-xs font-semibold", deadlineTone)}>
                  {data.deadlineStatus === "OFF_TRACK"
                    ? "Cham deadline"
                    : data.deadlineStatus === "AT_RISK"
                      ? "Can tang nhip"
                      : data.deadlineStatus === "COMPLETED"
                        ? "Da hoan thanh"
                        : data.deadlineStatus === "NO_DEADLINE"
                          ? "Chua dat deadline"
                          : "Dang on"}
                </Badge>
              )}
              <Button variant="outline" className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card" onClick={() => { setMonth(startOfMonth(new Date())); setSelectedDate(new Date()); }}>
                Hom nay
              </Button>
            </div>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Current streak" value={data?.currentStreak ?? 0} hint={`Longest ${data?.longestStreak ?? 0} ngay`} icon={<Flame className="h-4 w-4 text-amber-500" />} />
          <MetricCard label="Ngay active" value={data?.activeDays ?? 0} hint={formatMonthLabel(month)} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
          <MetricCard label="Tong phut hoc" value={data?.totalStudyMinutes ?? 0} hint={`${data?.totalStudyEvents ?? 0} su kien hoc tap`} icon={<Clock3 className="h-4 w-4 text-sky-500" />} />
          <MetricCard label="Daily target" value={data?.recommendedMinutesPerDay ?? 0} hint={`Muc tieu hien tai ${data?.dailyGoalMinutes ?? 0} phut`} icon={<Target className="h-4 w-4 text-violet-500" />} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <PageSection
            title="Month view"
            description={`Theo doi ${formatMonthLabel(month)} voi mau muc do hoc, ngay nen hoc va deadline JLPT.`}
            action={<p className="text-sm font-medium text-muted-foreground">{formatMonthLabel(month)}</p>}
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
                      activityLight: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200",
                      activityMedium: "bg-sky-100 text-sky-900 hover:bg-sky-100 dark:bg-sky-500/20 dark:text-sky-100",
                      activityStrong: "bg-primary text-primary-foreground hover:bg-primary",
                      recommendedStudy: "ring-1 ring-sky-300 ring-offset-2 ring-offset-background border border-dashed border-sky-300",
                      deadlineDay: "ring-2 ring-rose-400 ring-offset-2 ring-offset-background",
                    }}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="rounded-[20px] border border-border bg-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Chu thich</p>
                    <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-3"><span className="h-4 w-4 rounded bg-emerald-100 dark:bg-emerald-500/15" />Hoc nhe</div>
                      <div className="flex items-center gap-3"><span className="h-4 w-4 rounded bg-sky-100 dark:bg-sky-500/20" />Hoc deu</div>
                      <div className="flex items-center gap-3"><span className="h-4 w-4 rounded bg-primary" />Hoc sau</div>
                      <div className="flex items-center gap-3"><span className="h-4 w-4 rounded border border-dashed border-sky-300" />Ngay nen hoc</div>
                      <div className="flex items-center gap-3"><span className="h-4 w-4 rounded ring-2 ring-rose-400 ring-offset-2 ring-offset-background" />Deadline JLPT</div>
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-amber-200 bg-amber-50/80 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-semibold text-amber-800">Goi y nhip hoc</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-foreground/80">
                      {data?.deadlineInsight || "Hay giu it nhat 1 phien hoc ngan moi ngay de duy tri da hoc."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </PageSection>

          <div className="space-y-4">
            <PageSection title="Chi tiet ngay" description={selectedDay ? formatDateLabel(selectedDay.date) : "Chon mot ngay trong lich de xem chi tiet."}>
              {selectedDay ? (
                <div className="space-y-3">
                  <div className="rounded-[20px] border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">
                        {selectedDay.hasActivity ? "Da co hoc tap" : "Chua ghi nhan hoc tap"}
                      </p>
                      <Badge className="rounded-full border border-border bg-background text-foreground/80">
                        {selectedDay.intensity === "strong"
                          ? "Sau"
                          : selectedDay.intensity === "medium"
                            ? "Deu"
                            : selectedDay.intensity === "light"
                              ? "Nhe"
                              : "Trong"}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border bg-background px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Su kien</p>
                        <p className="mt-2 text-xl font-semibold text-foreground">{selectedDay.totalEvents}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-background px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Hoan thanh</p>
                        <p className="mt-2 text-xl font-semibold text-foreground">{selectedDay.completedCount}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-background px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Phut hoc</p>
                        <p className="mt-2 text-xl font-semibold text-foreground">{selectedDay.totalMinutes}</p>
                      </div>
                    </div>
                  </div>

                  {selectedDay.isRecommendedStudyDay && (
                    <div className="rounded-[20px] border border-sky-200 bg-sky-50/80 p-4 text-sm leading-6 text-sky-900">
                      Day la mot ngay nen uu tien hoc de giu nhip va bam sat ke hoach hien tai.
                    </div>
                  )}

                  {selectedDay.isDeadlineDay && (
                    <div className="rounded-[20px] border border-rose-200 bg-rose-50/80 p-4 text-sm leading-6 text-rose-900">
                      Day la moc deadline JLPT cua ban. Nen danh mot phien hoc tap trung hon binh thuong.
                    </div>
                  )}

                  {!selectedDay.hasActivity && !selectedDay.isRecommendedStudyDay && !selectedDay.isDeadlineDay && (
                    <div className="rounded-[20px] border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                      Khong co su kien nao trong ngay nay. Neu muon giu streak on dinh, hay chen mot phien hoc ngan 10-15 phut.
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-[20px] border border-dashed border-border bg-muted/30 px-5 py-10 text-center text-sm text-muted-foreground">
                  Chon mot ngay trong lich de xem activity va goi y.
                </div>
              )}
            </PageSection>

            <PageSection title="Tien do muc tieu" description="Tom tat nhanh de biet minh dang o dau trong hanh trinh JLPT.">
              <div className="space-y-3">
                <div className="rounded-[20px] border border-border bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Muc tieu hien tai</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {data?.targetJlptLevel || "N5"} • {data?.dailyGoalMinutes || 0} phut/ngay
                  </p>
                </div>

                <div className="rounded-[20px] border border-border bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Deadline</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{data?.deadlineDate || "Chua dat"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data?.deadlineDate
                      ? `${data.daysRemainingToDeadline} ngay con lai • can ${data.recommendedMinutesPerDay} phut/ngay`
                      : "Hay dat moc thi JLPT de he thong tinh nhiep hoc chinh xac hon."}
                  </p>
                </div>

                <div className="rounded-[20px] border border-border bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Best day trong thang</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{data?.bestDayDate ? formatDateLabel(data.bestDayDate) : "Chua co"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data?.bestDayDate ? `${data.bestDayMinutes} phut hoc la muc cao nhat trong thang nay.` : "Khi co activity, lich se nhan ra ngay hoc sau nhat cua ban."}
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
