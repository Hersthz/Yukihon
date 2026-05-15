import { AnimatePresence, motion } from "framer-motion";
import kaorukoGuide from "@/assets/kaoruko-guide.png";
import type { AuthMode } from "./auth.types";

interface AuthHeroProps {
  mode: AuthMode;
  typingKanji: string;
}

const AuthHero = ({ mode, typingKanji }: AuthHeroProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="hidden lg:flex flex-col justify-center space-y-10"
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <motion.div
            className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/25 shadow-lg shadow-primary/15"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src={kaorukoGuide} alt="Kaoruko" className="w-full h-full object-cover" />
          </motion.div>
          <motion.span
            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-background"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="bg-card/60 backdrop-blur-sm learnhub-edge learnhub-shadow-sm rounded-2xl rounded-tl-sm px-6 py-4 max-w-sm relative"
        >
          <div className="absolute -left-2 top-4 w-4 h-4 bg-card/60 learnhub-edge rotate-45 border-t-0 border-r-0" />
          <p className="text-base leading-relaxed relative z-10">
            <span className="font-black text-primary uppercase tracking-tighter">Kaoruko</span>
            <br />
            <AnimatePresence mode="wait">
              <motion.span
                key={mode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-foreground/90 font-medium inline-block"
              >
                {mode === "login"
                  ? "Welcome back! I missed our study sessions together."
                  : mode === "register"
                    ? "So happy to meet you. Let's start our journey to mastery."
                    : "No worries. We will get your account access cleaned up."}
              </motion.span>
            </AnimatePresence>
          </p>
        </motion.div>
      </div>

      <motion.div
        className="text-3xl font-bold text-primary/40 h-10 flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {typingKanji}
        <motion.span
          className="inline-block w-0.5 h-7 bg-primary/60 ml-1"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </motion.div>

      <div className="space-y-4">
        <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight">
          Master Japanese
          <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            with Kaoruko
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
          Your personal guide to Japanese fluency - comprehensive dictionary,
          JLPT practice, vocabulary quizzes, and immersive exercises.
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex -space-x-2">
          {["学", "読", "語", "雪"].map((emoji, index) => (
            <motion.div
              key={`${emoji}-${index}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 border-2 border-background flex items-center justify-center text-xs"
            >
              {emoji}
            </motion.div>
          ))}
        </div>
        <span>
          <span className="font-semibold text-foreground">50,000+</span> learners already joined
        </span>
      </div>
    </motion.div>
  );
};

export default AuthHero;
