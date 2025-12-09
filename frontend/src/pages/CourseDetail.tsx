import { useParams, Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, CheckCircle2, Lock, Clock, BookOpen } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  vocabCount: number;
  completed: boolean;
  locked: boolean;
}

interface CourseData {
  id: string;
  title: string;
  level: string;
  description: string;
  lessons: Lesson[];
  totalHours: number;
  progress: number;
}

// Mock course data with lessons
const mockCourses: Record<string, CourseData> = {
  "n5-foundations": {
    id: "n5-foundations",
    title: "N5 Foundations",
    level: "JLPT N5",
    description: "Start your Japanese journey with basic grammar, hiragana, katakana, and essential vocabulary.",
    totalHours: 20,
    progress: 0,
    lessons: [
      { id: "n5-lesson-1", title: "Greetings & Self Introduction", duration: "15 min", vocabCount: 12, completed: false, locked: false },
      { id: "n5-lesson-2", title: "Numbers 1-100", duration: "20 min", vocabCount: 15, completed: false, locked: true },
      { id: "n5-lesson-3", title: "Basic Verbs: Eat, Drink, Go", duration: "18 min", vocabCount: 10, completed: false, locked: true },
      { id: "n5-lesson-4", title: "Days of the Week", duration: "12 min", vocabCount: 8, completed: false, locked: true },
      { id: "n5-lesson-5", title: "Time Expressions", duration: "20 min", vocabCount: 14, completed: false, locked: true },
    ]
  },
  "n4-conversations": {
    id: "n4-conversations",
    title: "N4 Daily Conversations",
    level: "JLPT N4",
    description: "Master everyday situations with expanded vocabulary and intermediate grammar patterns.",
    totalHours: 28,
    progress: 62,
    lessons: [
      { id: "n4-vocab-01", title: "Daily Conversations: Greetings", duration: "20 min", vocabCount: 12, completed: true, locked: false },
      { id: "n4-lesson-2", title: "Shopping & Money", duration: "25 min", vocabCount: 18, completed: true, locked: false },
      { id: "n4-lesson-3", title: "Directions & Transportation", duration: "22 min", vocabCount: 15, completed: true, locked: false },
      { id: "n4-lesson-4", title: "Restaurant Ordering", duration: "18 min", vocabCount: 14, completed: false, locked: false },
      { id: "n4-lesson-5", title: "Making Appointments", duration: "20 min", vocabCount: 12, completed: false, locked: true },
      { id: "n4-lesson-6", title: "Describing People", duration: "22 min", vocabCount: 16, completed: false, locked: true },
    ]
  },
  "n3-fluency": {
    id: "n3-fluency",
    title: "N3 Building Fluency",
    level: "JLPT N3",
    description: "Develop natural expression with complex grammar and authentic Japanese materials.",
    totalHours: 35,
    progress: 0,
    lessons: [
      { id: "n3-lesson-1", title: "Expressing Opinions", duration: "25 min", vocabCount: 20, completed: false, locked: false },
      { id: "n3-lesson-2", title: "Formal vs Casual Speech", duration: "30 min", vocabCount: 18, completed: false, locked: true },
      { id: "n3-lesson-3", title: "Reading News Articles", duration: "35 min", vocabCount: 25, completed: false, locked: true },
    ]
  }
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const course = mockCourses[courseId || ""] || mockCourses["n4-conversations"];
  const completedLessons = course.lessons.filter(l => l.completed).length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/courses")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>

        {/* Course Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <Badge variant="secondary" className="mb-3">{course.level}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
              <p className="text-muted-foreground max-w-2xl">{course.description}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.lessons.length} lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.totalHours}h total</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Course Progress</span>
              <span className="font-medium">{completedLessons}/{course.lessons.length} lessons</span>
            </div>
            <Progress value={(completedLessons / course.lessons.length) * 100} className="h-2" />
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold mb-4">Lessons</h2>
          {course.lessons.map((lesson, index) => (
            <Card 
              key={lesson.id}
              className={`card-premium transition-all duration-200 ${
                lesson.locked ? "opacity-60" : "hover-lift cursor-pointer"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    lesson.completed 
                      ? "bg-primary/10 text-primary" 
                      : lesson.locked 
                        ? "bg-muted text-muted-foreground"
                        : "bg-secondary/10 text-secondary"
                  }`}>
                    {lesson.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : lesson.locked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <span className="font-medium">{index + 1}</span>
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{lesson.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{lesson.duration}</span>
                      <span>•</span>
                      <span>{lesson.vocabCount} vocabulary</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {!lesson.locked && (
                    <Link to={`/lessons/${lesson.id}`}>
                      <Button 
                        variant={lesson.completed ? "outline" : "default"}
                        size="sm"
                        className="gap-2"
                      >
                        <Play className="h-4 w-4" />
                        {lesson.completed ? "Review" : "Start"}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;
