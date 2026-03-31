import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CreatorMetricCardProps {
  title: string;
  value: string | number;
  hint: string;
}

const CreatorMetricCard = ({ title, value, hint }: CreatorMetricCardProps) => (
  <Card className="border-border/70 bg-card/70">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </CardContent>
  </Card>
);

export default CreatorMetricCard;
