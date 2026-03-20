import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Circle } from "lucide-react";

interface LessonCardProps {
  id: string;
  title: string;
  type: "vocabulary" | "grammar" | "listening" | "reading" | "mixed";
  duration: number;
  completed: boolean;
  locked?: boolean;
}

const typeColors = {
  vocabulary: "bg-primary/10 text-primary border-primary/20",
  grammar: "bg-secondary/10 text-secondary border-secondary/20",
  listening: "bg-info/10 text-info border-info/20",
  reading: "bg-accent/10 text-accent-foreground border-accent",
  mixed: "bg-muted text-muted-foreground border-border",
};

const LessonCard = ({ id, title, type, duration, completed, locked }: LessonCardProps) => {
  const content = (
    <Card className={`card-premium hover-lift ${locked ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`flex-shrink-0 ${completed ? 'text-success' : locked ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
            {completed ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm mb-1 truncate">{title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className={`text-xs ${typeColors[type]}`}>
                {type}
              </Badge>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{duration} min</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (locked) {
    return content;
  }

  return <Link to={`/lessons/${id}`}>{content}</Link>;
};

export default LessonCard;
