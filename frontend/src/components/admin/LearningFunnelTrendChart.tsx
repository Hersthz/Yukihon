import type { LearningFunnelDailyPoint } from "@/api/learningAnalyticsApi";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

const chartConfig = {
  startedCount: {
    label: "Started",
    color: "hsl(var(--primary))",
  },
  completionRate: {
    label: "Completion %",
    color: "#34d399",
  },
  abandonmentRate: {
    label: "Abandonment %",
    color: "#f59e0b",
  },
  retentionScore: {
    label: "Retention Score",
    color: "#22d3ee",
  },
} satisfies ChartConfig;

interface LearningFunnelTrendChartProps {
  dailyTrend: LearningFunnelDailyPoint[];
}

const toShortDate = (isoDate: string) => {
  const parts = isoDate.split("-");
  if (parts.length !== 3) {
    return isoDate;
  }
  return `${parts[1]}/${parts[2]}`;
};

const toReadableDate = (isoDate: string) => {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const LearningFunnelTrendChart = ({ dailyTrend }: LearningFunnelTrendChartProps) => {
  return (
    <div className="rounded-lg border border-border/60 bg-background/35 p-4">
      <div className="mb-3">
        <p className="text-sm font-medium">Daily Retention Trend</p>
        <p className="text-xs text-muted-foreground">
          Compare activity volume with retention quality by day in the selected cohort.
        </p>
      </div>

      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ComposedChart data={dailyTrend} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            minTickGap={20}
            tickFormatter={(value: string) => toShortDate(value)}
          />
          <YAxis yAxisId="count" tickLine={false} axisLine={false} allowDecimals={false} width={42} />
          <YAxis
            yAxisId="percent"
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={44}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />

          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => toReadableDate(String(value))}
                formatter={(value, name) => {
                  if (typeof value !== "number") {
                    return [String(value), String(name)];
                  }

                  const isPercent =
                    name === "completionRate" || name === "abandonmentRate" || name === "retentionScore";
                  return [isPercent ? `${value.toFixed(1)}%` : value.toLocaleString(), String(name)];
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />

          <Bar yAxisId="count" dataKey="startedCount" fill="var(--color-startedCount)" barSize={16} radius={[4, 4, 0, 0]} />
          <Line
            yAxisId="percent"
            type="monotone"
            dataKey="completionRate"
            stroke="var(--color-completionRate)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="percent"
            type="monotone"
            dataKey="abandonmentRate"
            stroke="var(--color-abandonmentRate)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="percent"
            type="monotone"
            dataKey="retentionScore"
            stroke="var(--color-retentionScore)"
            strokeWidth={3}
            dot={false}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
};

export default LearningFunnelTrendChart;
