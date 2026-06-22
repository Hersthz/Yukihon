import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Languages,
  MessageSquareText,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import kaorukoHappy from "@/assets/kaoruko-happy.png";

const highlightCards = [
  {
    icon: Clock3,
    title: "Learn at your pace",
    description:
      "Short lessons, quick reviews, and a calm UI that keeps sessions light instead of overwhelming.",
    color: "bg-[#ffd5cd]",
  },
  {
    icon: Brain,
    title: "Smart review loops",
    description: "Dictionary, vocabulary, quiz, and Mistake DNA all connect into one study flow.",
    color: "bg-[#d9f1ff]",
  },
  {
    icon: GraduationCap,
    title: "JLPT aligned",
    description:
      "Every area of the app now supports a clearer path from N5 foundations to higher levels.",
    color: "bg-[#e6dcff]",
  },
  {
    icon: Users,
    title: "Community support",
    description:
      "Study together, ask questions quickly, and keep the social layer visible without visual clutter.",
    color: "bg-[#d7ffd9]",
  },
];

const levelCards = [
  {
    level: "N5",
    title: "Foundations",
    detail: "Kana, core vocab, essential patterns",
    color: "bg-[#d8ffe0]",
  },
  {
    level: "N4",
    title: "Daily Japanese",
    detail: "Everyday conversation and sentence building",
    color: "bg-[#dff3ff]",
  },
  {
    level: "N3",
    title: "Mid-level flow",
    detail: "More natural reading, listening, and nuance",
    color: "bg-[#fff2c8]",
  },
  {
    level: "N2",
    title: "Professional depth",
    detail: "Complex structures and work-ready Japanese",
    color: "bg-[#ffe0d2]",
  },
  {
    level: "N1",
    title: "Mastery",
    detail: "Advanced reading, precision, and subtle expression",
    color: "bg-[#eadfff]",
  },
];

const featurePanels = [
  {
    title: "Dictionary and My Words move together",
    description:
      "The redesign makes saving, reviewing, and returning to words feel like one continuous action instead of a context switch.",
    icon: BookOpen,
    tone: "bg-[#f0fbff]",
  },
  {
    title: "Dashboard becomes a command center",
    description:
      "Quick stats, next lesson, study signals, and shortcuts are surfaced in a single light dashboard with strong hierarchy.",
    icon: Target,
    tone: "bg-[#f5fff2]",
  },
  {
    title: "AI and translation stay in the same language",
    description:
      "The assistant, translation workspace, and grammar areas now share the same visual logic, spacing, and light palette.",
    icon: Languages,
    tone: "bg-[#fff8ef]",
  },
];

const testimonials = [
  {
    quote:
      "The new layout feels lighter, faster, and much easier to scan when I only have 15 minutes to study.",
    author: "Mai Anh",
    role: "JLPT N4 learner",
  },
  {
    quote:
      "I can jump from dictionary to saved words to quiz review without feeling like I entered another product.",
    author: "Khanh Linh",
    role: "Self-study user",
  },
  {
    quote:
      "The dashboard finally feels like a real study cockpit instead of a collection of disconnected widgets.",
    author: "Tuan Hoang",
    role: "Daily streak user",
  },
];

const Index = () => {
  const { isAuthenticated } = useAuth();
  const ctaLink = isAuthenticated ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <Navigation />

      <main className="relative pb-12 pt-28 sm:pt-32 lg:pt-36">
        <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(255,210,201,0.5),transparent_36%),radial-gradient(circle_at_top_right,rgba(191,238,254,0.58),transparent_32%)]" />

        <section id="hero" className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="section-kicker mb-5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                New light-first study experience
              </div>

              <h1 className="display-font max-w-3xl text-[3.4rem] leading-[0.95] text-foreground sm:text-[4.6rem] lg:text-[6.2rem]">
                Learn Japanese,
                <br />
                <span className="text-primary">Anytime,</span>
                <br />
                Anywhere.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                Yukihon is now redesigned around a warmer, clearer light theme inspired by bold
                educational layouts and modern productivity dashboards. Every key page follows one
                visual language now.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link to={ctaLink}>
                  <Button className="min-w-[210px] text-base">
                    {isAuthenticated ? "Open dashboard" : "Start learning free"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button
                    className="min-w-[210px] bg-secondary text-secondary-foreground hover:bg-secondary"
                    variant="secondary"
                  >
                    Browse course paths
                  </Button>
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-8">
                {[
                  { value: "10K+", label: "Words and lessons" },
                  { value: "2M+", label: "Study actions" },
                  { value: "500+", label: "Guided activities" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-4xl font-black tracking-tight text-foreground">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="surface-panel relative overflow-hidden bg-white/96 p-5 sm:p-6">
                <div className="absolute right-5 top-5 rounded-[1.4rem] bg-[#ffd3cb] p-4">
                  <Target className="h-8 w-8 text-foreground" />
                </div>

                <div className="grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-[1.7rem] bg-[#eef9ff] p-5">
                    <img
                      src={kaorukoHappy}
                      alt="Kaoruko"
                      className="mx-auto h-56 object-contain sm:h-64"
                    />
                    <div className="mt-3 rounded-[1.2rem] bg-white/90 p-4">
                      <p className="text-sm font-semibold text-foreground">Kaoruko is ready</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your dictionary, practice flow, and AI hints all share the same light
                        interface now.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.5rem] border border-border bg-[#f8fbf7] p-5">
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Current focus
                      </p>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-[#d9eff9]">
                          <BookOpen className="h-6 w-6 text-foreground" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">Web-style dashboard</p>
                          <p className="text-sm text-muted-foreground">
                            12 blocks, 4h 30m of interactive study flow
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-primary">65%</span>
                        </div>
                        <div className="h-3 rounded-full bg-white">
                          <div className="h-full w-[65%] rounded-full bg-primary" />
                        </div>
                      </div>

                      <Button className="mt-5 w-full">Continue learning</Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.4rem] border border-border bg-[#fff5ec] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          Design system
                        </p>
                        <p className="mt-3 text-lg font-semibold text-foreground">
                          Cream, mint, peach, sky
                        </p>
                      </div>
                      <div className="rounded-[1.4rem] border border-border bg-[#f4f0ff] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          Dashboard UI
                        </p>
                        <p className="mt-3 text-lg font-semibold text-foreground">
                          Cleaner admin and creator space
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-4 rounded-[1.3rem] bg-[#dff8de] px-4 py-3 shadow-[0_18px_36px_-22px_rgba(32,48,74,0.24)]">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#ffb11a]" />
                  <span className="text-sm font-semibold text-foreground">
                    Better hierarchy, less visual noise
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-6">
          <div className="surface-panel-soft px-6 py-8 sm:px-8">
            <div className="text-center">
              <span className="section-kicker">How it works</span>
              <h2 className="section-title mt-6">One style system across every page</h2>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
                The redesign does not stop at the home page. Dashboard, dictionary, vocabulary,
                profile, admin, and creator mode now share the same spacing rhythm, border logic,
                and pastel accent language.
              </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-4">
              {highlightCards.map((card) => (
                <div key={card.title} className="surface-panel-soft h-full p-5">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-[1.3rem] ${card.color}`}
                  >
                    <card.icon className="h-7 w-7 text-foreground" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-foreground">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="jlpt" className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="surface-panel-soft p-6 sm:p-8">
              <span className="section-kicker">JLPT path</span>
              <h2 className="section-title mt-6">Clear visual steps from N5 to N1</h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                The new UI groups lessons, progress, and recommendations so users always know what
                to do next at their current level.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Dashboard highlights the next lesson and today's goal.",
                  "Course pages use lighter cards with faster scanning.",
                  "Vocabulary, grammar, quiz, and kanji follow one hierarchy.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[1.2rem] bg-white/88 p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                    <p className="text-sm leading-7 text-foreground/82">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {levelCards.map((card) => (
                <div key={card.level} className="surface-panel-soft p-5">
                  <div className={`inline-flex rounded-[1rem] px-4 py-3 ${card.color}`}>
                    <span className="display-font text-3xl font-bold text-foreground">
                      {card.level}
                    </span>
                  </div>
                  <p className="mt-5 text-xl font-bold text-foreground">{card.title}</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-6">
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="surface-panel overflow-hidden p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="section-kicker">Product system</span>
                  <h2 className="section-title mt-6">
                    Dashboard inspiration from modern command centers
                  </h2>
                </div>
                <Badge className="rounded-full border border-primary/20 bg-[#eef9ee] px-4 py-2 text-primary hover:bg-[#eef9ee]">
                  Light theme only
                </Badge>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Saved prompts", value: "150+" },
                  { label: "AI helpers", value: "12+" },
                  { label: "Uploaded docs", value: "89" },
                  { label: "Study flows", value: "1.2K" },
                ].map((metric, index) => (
                  <div
                    key={metric.label}
                    className={
                      ["bg-[#e8f0ff]", "bg-[#eef8dd]", "bg-[#fff3b8]", "bg-[#ece4ff]"][index] +
                      " rounded-[1.5rem] p-5"
                    }
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-4 text-4xl font-black tracking-tight text-foreground">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[1.7rem] border border-border bg-[#fbfcff] p-5">
                  <p className="text-lg font-semibold text-foreground">Quick launch agents</p>
                  <div className="mt-4 rounded-[1.4rem] border border-border bg-white p-4">
                    <p className="text-sm font-semibold text-foreground">
                      Smart Email Reply Assistant
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      A calmer card system makes dense admin and creator workflows easier to scan.
                    </p>
                  </div>
                </div>
                <div className="rounded-[1.7rem] border border-border bg-[#fcfff7] p-5">
                  <p className="text-lg font-semibold text-foreground">Recent activity</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[1.3rem] bg-[#e7efff] p-4">
                      <p className="font-semibold text-foreground">Marketing Trends 2025</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Readable cards, clearer tabs, and lighter spacing.
                      </p>
                    </div>
                    <div className="rounded-[1.3rem] bg-[#e8f7df] p-4">
                      <p className="font-semibold text-foreground">Vocabulary review queue</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        States and actions are now visually consistent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {featurePanels.map((panel) => (
                <div key={panel.title} className={`surface-panel-soft p-6 ${panel.tone}`}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white">
                    <panel.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-foreground">{panel.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {panel.description}
                  </p>
                </div>
              ))}

              <div className="surface-panel-soft bg-[#fff7eb] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white">
                    <MessageSquareText className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Community signal
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      Chat, feed, and leaderboard feel connected now
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-6">
          <div className="text-center">
            <span className="section-kicker">Student stories</span>
            <h2 className="section-title mt-6">What learners notice first</h2>
          </div>

          <div className="mt-10 grid gap-4 xl:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.author} className="surface-panel-soft p-6">
                <div className="flex items-center gap-1 text-[#ffb11a]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-5 text-lg leading-8 text-foreground/85">"{item.quote}"</p>
                <div className="mt-6">
                  <p className="font-semibold text-foreground">{item.author}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-6">
          <div className="surface-panel overflow-hidden bg-[linear-gradient(135deg,#20324f_0%,#2c4165_100%)] px-6 py-10 text-white sm:px-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  Ready to ship the redesign
                </span>
                <h2 className="display-font mt-6 text-[3rem] leading-none sm:text-[4rem]">
                  A calmer, brighter Yukihon.
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
                  The visual system is now oriented around light mode, strong information hierarchy,
                  and playful cards inspired by the references you liked.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to={ctaLink}>
                  <Button className="bg-white text-foreground hover:bg-white/92">
                    {isAuthenticated ? "Go to dashboard" : "Create account"}
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button
                    className="border-white/25 bg-white/10 text-white hover:bg-white/16"
                    variant="outline"
                  >
                    Explore course structure
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
