import { useState } from "react";
import type { LearningFunnelDailyPoint } from "@/api/learningAnalyticsApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

type MetricFocus = "retentionScore" | "completionRate" | "abandonmentRate";

const metricFocusLabels: Record<MetricFocus, string> = {
  retentionScore: "Retention Score",
  completionRate: "Completion Rate",
  abandonmentRate: "Abandonment Rate",
};

const metricFocusDescriptions: Record<MetricFocus, string> = {
  retentionScore: "Weighted quality score by day: completion + quiz recovery - abandonment.",
  completionRate: "Daily percentage of started lessons that reached completion.",
  abandonmentRate: "Daily percentage of started lessons that were dropped before completion.",
};

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
  const [metricFocus, setMetricFocus] = useState<MetricFocus>("retentionScore");

  return (
    <div className="rounded-lg border border-border/60 bg-background/35 p-4">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-medium">Daily Retention Trend</p>
          <p className="text-xs text-muted-foreground">
            {metricFocusDescriptions[metricFocus]}
          </p>
        </div>

        <div className="w-full md:w-[220px]">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Metric focus
          </label>
          <Select value={metricFocus} onValueChange={(value) => setMetricFocus(value as MetricFocus)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Choose metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retentionScore">Retention Score</SelectItem>
              <SelectItem value="completionRate">Completion Rate</SelectItem>
              <SelectItem value="abandonmentRate">Abandonment Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
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

                  const isPercent = name !== "startedCount";
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
            dataKey={metricFocus}
            name={metricFocusLabels[metricFocus]}
            stroke={`var(--color-${metricFocus})`}
            strokeWidth={metricFocus === "retentionScore" ? 3 : 2.5}
            dot={false}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
};

export default LearningFunnelTrendChart;
