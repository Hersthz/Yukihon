// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Flame, Trophy, BookOpen, Brain, ArrowRight,
  GraduationCap, Zap, Settings
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KaorukoMascot from "@/components/KaorukoMascot";
import GlassCard from "@/components/genshin/GlassCard";

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
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-start justify-between gap-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text mb-2">
                Welcome back, {greetingName}! 🌸
              </h1>
              <p className="text-gray-400 text-lg">
                Keep up the momentum with your Japanese learning journey
              </p>
              {isLoadingUser && (
                <p className="mt-2 text-sm text-gray-500">Loading profile...</p>
              )}
              {userError && (
                <p className="mt-2 text-sm text-red-400">Error: {userError}</p>
              )}
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <KaorukoMascot
                mood={getKaorukoMood}
                size="lg"
                message={getKaorukoMessage}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Flame, label: "Current Streak", value: `${streak} days`, color: "from-orange-500 to-red-500" },
            { icon: Trophy, label: "Total XP", value: `${xp} XP`, color: "from-yellow-500 to-orange-500" },
            { icon: BookOpen, label: "Lessons Done", value: "24", color: "from-blue-500 to-cyan-500" },
            { icon: Brain, label: "Words Learned", value: "156", color: "from-purple-500 to-pink-500" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <GlassCard className={`p-6 bg-gradient-to-br ${stat.color}/10 border border-white/10 hover:border-${stat.color.split()[1]}/50 transition-all`}>
                <div className="flex items-start justify-between mb-3">
                  <stat.icon className="w-6 h-6 text-white opacity-80" />
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</span>
                </div>
                <motion.p 
                  className="text-3xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                >
                  {stat.value}
                </motion.p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Learning Modules */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <motion.h2 
            className="text-3xl font-bold text-white mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            Learning Modules
          </motion.h2>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: BookOpen,
                title: "Vocabulary",
                description: "Build your word list",
                path: "/vocabulary",
                color: "from-blue-500 to-cyan-500",
                count: "2,340 words",
              },
              {
                icon: Brain,
                title: "Grammar",
                description: "Master language patterns",
                path: "/grammar",
                color: "from-purple-500 to-pink-500",
                count: "450+ patterns",
              },
              {
                icon: Zap,
                title: "Quiz",
                description: "Test your knowledge",
                path: "/quiz",
                color: "from-yellow-500 to-orange-500",
                count: "180 quizzes",
              },
              {
                icon: GraduationCap,
                title: "JLPT Lessons",
                description: "Structured by level",
                path: "/jlpt-lessons",
                color: "from-green-500 to-emerald-500",
                count: "N5 - N1",
              },
            ].map((module, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to={module.path}>
                  <GlassCard className={`p-6 h-full bg-gradient-to-br ${module.color}/10 hover:border-${module.color.split()[1]}/50 hover:shadow-lg transition-all group cursor-pointer`}>
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + idx * 0.05 }}
                        >
                          <module.icon className="w-8 h-8 text-white mb-3 group-hover:scale-110 transition-transform" />
                        </motion.div>
                        <motion.h3 
                          className="text-xl font-bold text-white mb-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.55 + idx * 0.05 }}
                        >
                          {module.title}
                        </motion.h3>
                        <motion.p 
                          className="text-sm text-gray-400 mb-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 + idx * 0.05 }}
                        >
                          {module.description}
                        </motion.p>
                      </div>
                      <motion.div 
                        className="flex items-end justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.65 + idx * 0.05 }}
                      >
                        <span className="text-xs text-gray-500 font-medium">{module.count}</span>
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="w-4 h-4 text-cyan-400" />
                        </motion.div>
                      </motion.div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Daily Goal Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <motion.h2 
            className="text-3xl font-bold text-white mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            Today's Task
          </motion.h2>
          <GlassCard className="p-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:border-cyan-500/50 transition-colors group">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex-1">
                <motion.h3 
                  className="text-2xl font-bold text-white mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65 }}
                >
                  {nextLesson.title}
                </motion.h3>
                <motion.div 
                  className="flex items-center gap-4 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500">{nextLesson.level}</Badge>
                  <span className="text-gray-400 text-sm">{nextLesson.timeEstimate} minutes</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.75 }}
                >
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-400">Progress</span>
                    <motion.span 
                      className="text-white font-semibold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      {nextLesson.progress}%
                    </motion.span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${nextLesson.progress}%` }}
                      transition={{ delay: 0.8, duration: 1 }}
                    />
                  </div>
                </motion.div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.85 }}
              >
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-semibold px-8 shadow-lg shadow-cyan-500/30 transition-all">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue Lesson
                </Button>
              </motion.div>
            </motion.div>
          </GlassCard>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/profile">
              <Button className="border border-slate-700 bg-slate-800/50 text-white hover:bg-slate-700/50 transition-all">
                <Settings className="w-4 h-4 mr-2" />
                Settings & Profile
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
