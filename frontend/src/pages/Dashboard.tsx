// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Trophy, BookOpen, Brain, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import CourseCard from "@/components/CourseCard";
import ProgressRing from "@/components/ProgressRing";
import KaorukoMascot from "@/components/KaorukoMascot";

interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
}

interface MeResponse {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
  createdAt?: string;
}

const API_BASE_URL = "http://localhost:8080";

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("yukihon_user");
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored) as AuthUser;
      return parsed;
    } catch {
      return null;
    }
  });

  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Mock learning stats (frontend-only, not from backend)
  const [streak] = useState(12);
  const [xp] = useState(2450);
  const [dailyGoal] = useState(15);

  const nextLesson = {
    id: "n4-vocab-01",
    title: "Daily Conversations: Greetings",
    level: "N4",
    progress: 60,
    timeEstimate: 12,
  };

  const getKaorukoMood = useMemo(() => {
    const value = streak;
    if (value >= 10) return "excited";
    if (value >= 5) return "happy";
    return "guide";
  }, [streak]) as "excited" | "happy" | "guide";

  const getKaorukoMessage = useMemo(() => {
    const value = streak;
    if (value >= 10) return `${value} ngày streak! すごい！ 🔥`;
    if (value >= 5) return "Bạn đang học rất chăm! 📚";
    return "Cùng học tiếng Nhật nào! 頑張って！";
  }, [streak]);

  useEffect(() => {
    const token = localStorage.getItem("yukihon_token");
    if (!token) {
      navigate("/auth");
      return;
    }

    const fetchMe = async () => {
      setIsLoadingUser(true);
      setUserError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("yukihon_token");
          localStorage.removeItem("yukihon_user");
          navigate("/auth");
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          setUserError(text || "Failed to load user profile.");
          setIsLoadingUser(false);
          return;
        }

        const data = (await res.json()) as MeResponse;
        const mapped: AuthUser = {
          id: data.id,
          email: data.email,
          displayName: data.displayName,
          roles: data.roles,
        };
        setUser(mapped);
        localStorage.setItem("yukihon_user", JSON.stringify(mapped));
        setIsLoadingUser(false);
      } catch {
        setUserError("Network error while loading profile.");
        setIsLoadingUser(false);
      }
    };

    fetchMe();
  }, [navigate]);

  const greetingName = user?.displayName || "Learner";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting with Kaoruko */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-start gap-4 mb-4">
            <KaorukoMascot
              mood={getKaorukoMood}
              size="lg"
              showBubble
              message={getKaorukoMessage}
              bubblePosition="right"
            />
            <div className="flex-1 pt-4">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Good evening, {greetingName}
              </h1>
              <p className="text-muted-foreground">
                Keep up the great work on your learning journey!
              </p>
              {isLoadingUser && (
                <p className="mt-2 text-xs text-muted-foreground">Loading profile...</p>
              )}
              {userError && (
                <p className="mt-2 text-xs text-destructive">Profile error: {userError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <StatsCard
            title="Current Streak"
            value={`${streak} days`}
            icon={Flame}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard title="Total XP" value={xp.toLocaleString()} icon={Trophy} />
          <StatsCard
            title="Today's Progress"
            value={`${dailyGoal}/15 min`}
            subtitle="Daily goal"
            icon={Calendar}
          />
          <StatsCard title="Vocabulary" value="1,240" subtitle="words learned" icon={BookOpen} />
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
                    <Badge variant="secondary" className="mb-2">
                      {nextLesson.level}
                    </Badge>
                    <h3 className="text-xl font-semibold mb-1">{nextLesson.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      ~{nextLesson.timeEstimate} minutes remaining
                    </p>
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
          <Card className="card-premium animate-scale-in" style={{ animationDelay: "0.1s" }}>
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
                      <div
                        key={i}
                        className="flex-1 bg-primary/20 rounded-t"
                        style={{ height: `${height}%` }}
                      />
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
                    <div className="h-full bg-primary" style={{ width: "62%" }} />
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
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.lessons} lessons • {item.type}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Start
                    </Button>
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
