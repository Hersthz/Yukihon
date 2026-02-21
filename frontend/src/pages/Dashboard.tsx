// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Flame, Trophy, BookOpen, Brain, ArrowRight,
  GraduationCap, Zap, Settings, Shield, Clock,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KaorukoMascot from "@/components/KaorukoMascot";
import { useAuth } from "@/hooks/use-auth";

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
  const { isAdmin } = useAuth();

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
  };

  const stats = [
    {
      icon: Flame,
      label: "Current Streak",
      value: `${streak}`,
      unit: "days",
      gradient: "from-orange-500 to-amber-500",
      glow: "shadow-orange-500/20",
      iconBg: "bg-orange-500/15",
    },
    {
      icon: Trophy,
      label: "Total XP",
      value: `${xp}`,
      unit: "XP",
      gradient: "from-yellow-500 to-orange-400",
      glow: "shadow-yellow-500/20",
      iconBg: "bg-yellow-500/15",
    },
    {
      icon: BookOpen,
      label: "Lessons Done",
      value: "24",
      unit: "",
      gradient: "from-cyan-500 to-blue-500",
      glow: "shadow-cyan-500/20",
      iconBg: "bg-cyan-500/15",
    },
    {
      icon: Brain,
      label: "Words Learned",
      value: "156",
      unit: "",
      gradient: "from-purple-500 to-pink-500",
      glow: "shadow-purple-500/20",
      iconBg: "bg-purple-500/15",
    },
  ];

  const modules = [
    {
      icon: BookOpen,
      title: "Vocabulary",
      description: "Build your word list",
      path: "/vocabulary",
      gradient: "from-blue-600 to-cyan-500",
      count: "2,340 words",
      bgPattern: "radial-gradient(circle at 80% 20%, rgba(6,182,212,0.15), transparent 70%)",
    },
    {
      icon: Brain,
      title: "Grammar",
      description: "Master language patterns",
      path: "/grammar",
      gradient: "from-purple-600 to-fuchsia-500",
      count: "450+ patterns",
      bgPattern: "radial-gradient(circle at 80% 20%, rgba(168,85,247,0.15), transparent 70%)",
    },
    {
      icon: Zap,
      title: "Quiz",
      description: "Test your knowledge",
      path: "/quiz",
      gradient: "from-amber-500 to-orange-500",
      count: "180 quizzes",
      bgPattern: "radial-gradient(circle at 80% 20%, rgba(245,158,11,0.15), transparent 70%)",
    },
    {
      icon: GraduationCap,
      title: "JLPT Lessons",
      description: "Structured by level",
      path: "/jlpt-lessons",
      gradient: "from-emerald-500 to-teal-500",
      count: "N5 → N1",
      bgPattern: "radial-gradient(circle at 80% 20%, rgba(16,185,129,0.15), transparent 70%)",
    },
  ];

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-10"
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-cyan-400/70 font-medium mb-1 flex items-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </motion.p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                <span className="text-white">{greeting}, </span>
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {greetingName}
                </span>
                <span className="text-white"> 🌸</span>
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-xl">
                Keep up the momentum with your Japanese learning journey
              </p>
              {isLoadingUser && (
                <p className="mt-2 text-xs text-slate-500 animate-pulse">Loading profile...</p>
              )}
              {userError && (
                <p className="mt-2 text-xs text-red-400/80">⚠ {userError}</p>
              )}
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="hidden md:block shrink-0"
            >
              <KaorukoMascot
                mood={getKaorukoMood}
                size="lg"
                message={getKaorukoMessage}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -4 }}
              className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-4 sm:p-5 group cursor-default shadow-lg ${stat.glow}`}
            >
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

              <div className="flex items-center gap-3 mb-3">
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${stat.iconBg}`}>
                  <stat.icon className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-[0.65rem] sm:text-xs text-slate-400 font-medium uppercase tracking-wider leading-tight">
                  {stat.label}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <motion.span
                  className="text-2xl sm:text-3xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                >
                  {stat.value}
                </motion.span>
                {stat.unit && (
                  <span className="text-xs sm:text-sm text-slate-500 font-medium">{stat.unit}</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Learning Modules */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-cyan-500 to-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Learning Modules</h2>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {modules.map((mod, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Link to={mod.path} className="block group">
                  <motion.div
                    whileHover={{ scale: 1.03, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 sm:p-6 h-full transition-all hover:border-white/[0.12] hover:bg-white/[0.05]"
                    style={{ backgroundImage: mod.bgPattern }}
                  >
                    <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${mod.gradient} opacity-40 group-hover:opacity-80 transition-opacity`} />

                    <div className="flex flex-col h-full">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.gradient} bg-opacity-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`} style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))` }}>
                        <mod.icon className="w-5 h-5 text-white/80" />
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-sm text-slate-400 mb-4 flex-1">
                        {mod.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-[0.7rem] text-slate-500 font-medium">{mod.count}</span>
                        <motion.div
                          className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors"
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Continue Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Continue Learning</h2>
          </div>

          <motion.div
            whileHover={{ scale: 1.005 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm group"
          >
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.04] to-blue-500/[0.04]" />

            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {nextLesson.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/30">
                          {nextLesson.level}
                        </Badge>
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {nextLesson.timeEstimate} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400 text-xs font-medium">Progress</span>
                      <span className="text-cyan-400 font-semibold text-sm">
                        {nextLesson.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-white/[0.05] rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${nextLesson.progress}%` }}
                        transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="shrink-0"
                >
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-6 py-5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Continue Lesson
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex flex-wrap gap-3"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link to="/profile">
              <Button
                variant="outline"
                className="rounded-xl border-white/8 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings & Profile
              </Button>
            </Link>
          </motion.div>

          {isAdmin() && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/admin">
                <Button
                  variant="outline"
                  className="rounded-xl border-purple-500/20 bg-purple-500/[0.05] text-purple-300 hover:bg-purple-500/[0.12] hover:text-purple-200 transition-all"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
