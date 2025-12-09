import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import CourseCard from "@/components/CourseCard";
import ProgressRing from "@/components/ProgressRing";
import KaorukoMascot from "@/components/KaorukoMascot";
import { Flame, Trophy, BookOpen, Brain, ArrowRight, Calendar } from "lucide-react";

const Dashboard = () => {
  // Mock data
  const user = { name: "Alex", streak: 12, xp: 2450, dailyGoal: 15 };
  const nextLesson = {
    id: "n4-vocab-01",
    title: "Daily Conversations: Greetings",
    level: "N4",
    progress: 60,
    timeEstimate: 12
  };

  // Determine Kaoruko's mood based on streak
  const getKaorukoMood = () => {
    if (user.streak >= 10) return "excited";
    if (user.streak >= 5) return "happy";
    return "guide";
  };

  const getKaorukoMessage = () => {
    if (user.streak >= 10) return `${user.streak} ngày streak! すごい！ 🔥`;
    if (user.streak >= 5) return "Bạn đang học rất chăm! 📚";
    return "Cùng học tiếng Nhật nào! 頑張って！";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting with Kaoruko */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-start gap-4 mb-4">
            <KaorukoMascot
              mood={getKaorukoMood()}
              size="lg"
              showBubble
              message={getKaorukoMessage()}
              bubblePosition="right"
            />
            <div className="flex-1 pt-4">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Good evening, {user.name}
              </h1>
              <p className="text-muted-foreground">Keep up the great work on your learning journey!</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <StatsCard
            title="Current Streak"
            value={`${user.streak} days`}
            icon={Flame}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Total XP"
            value={user.xp.toLocaleString()}
            icon={Trophy}
          />
          <StatsCard
            title="Today's Progress"
            value={`${user.dailyGoal}/15 min`}
            subtitle="Daily goal"
            icon={Calendar}
          />
          <StatsCard
            title="Vocabulary"
            value="1,240"
            subtitle="words learned"
            icon={BookOpen}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Continue Learning */}
          <Card className="lg:col-span-2 card-premium animate-scale-in">
            <CardHeader>
              <CardTitle>Continue learning</CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <ProgressRing progress={nextLesson.progress} size={100} strokeWidth={8} />
                <div className="flex-1 space-y-3">
                  <div>
                    <Badge variant="secondary" className="mb-2">{nextLesson.level}</Badge>
                    <h3 className="text-xl font-semibold mb-1">{nextLesson.title}</h3>
                    <p className="text-sm text-muted-foreground">~{nextLesson.timeEstimate} minutes remaining</p>
                  </div>
                  <Link to={`/lessons/${nextLesson.id}`}>
                    <Button className="gap-2">
                      Resume lesson
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Review */}
          <Card className="card-premium animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle>Daily review</CardTitle>
              <CardDescription>Flashcards due today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-5xl font-bold text-primary">25</div>
                <p className="text-sm text-muted-foreground">cards to review</p>
                <Link to="/flashcards">
                  <Button className="w-full gap-2">
                    Start review
                    <Brain className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>This week</span>
                    <span>75% accuracy</span>
                  </div>
                  <div className="h-20 flex items-end justify-between gap-1">
                    {[40, 65, 55, 80, 70, 85, 75].map((height, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="text-lg">JLPT N4 Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall</span>
                    <span className="font-medium">62%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '62%' }} />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vocabulary</span>
                    <span className="font-medium">840/1,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grammar</span>
                    <span className="font-medium">55/95</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kanji</span>
                    <span className="font-medium">180/300</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming this week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: "Unit 5: Daily Routines", lessons: 8, type: "Vocabulary & Grammar" },
                  { title: "Listening Practice: At the Restaurant", lessons: 1, type: "Listening" },
                  { title: "Reading: Short Story", lessons: 1, type: "Reading" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.lessons} lessons • {item.type}</p>
                    </div>
                    <Button variant="ghost" size="sm">Start</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/courses">
              <Card className="card-premium hover-lift text-center p-6 cursor-pointer">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm">Browse Courses</p>
              </Card>
            </Link>
            <Link to="/kanji-library">
              <Card className="card-premium hover-lift text-center p-6 cursor-pointer">
                <span className="text-3xl mb-2 block">漢</span>
                <p className="font-medium text-sm">Kanji Library</p>
              </Card>
            </Link>
            <Link to="/profile">
              <Card className="card-premium hover-lift text-center p-6 cursor-pointer">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm">Achievements</p>
              </Card>
            </Link>
            <Link to="/profile">
              <Card className="card-premium hover-lift text-center p-6 cursor-pointer">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm">Settings</p>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
