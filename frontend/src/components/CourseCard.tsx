import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  level: string;
  description: string;
  lessons: number;
  hours: number;
  skills: string[];
  progress?: number;
}

const CourseCard = ({ id, title, level, description, lessons, hours, skills, progress }: CourseCardProps) => {
  return (
    <Link to={`/courses/${id}`}>
      <Card className="card-premium hover-lift h-full">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge variant="secondary" className="text-xs font-medium">{level}</Badge>
            <div className="flex gap-1">
              {skills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
              ))}
            </div>
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{lessons} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{hours}h</span>
            </div>
          </div>
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default CourseCard;
