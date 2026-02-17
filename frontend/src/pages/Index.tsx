// src/pages/Index.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WinterNightBackground from "@/components/WinterNightBackground";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Headphones,
  TrendingUp,
  Sparkles,
  Star,
  MessageCircle,
} from "lucide-react";
import kaorukoWelcome from "@/assets/kaoruko-welcome.png";
import kaorukoHappy from "@/assets/kaoruko-happy.png";
import kaorukoGuide from "@/assets/kaoruko-guide.png";
import kaorukoExcited from "@/assets/kaoruko-excited.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      <Navigation />

      <WinterNightBackground snowCount={100} sparkleCount={60} intensity="light" />

      {/* Hero */}
      <section
        id="hero"
        className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-20 md:pb-24 relative"
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left */}
          <div className="space-y-7 relative z-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/40 shadow-lg shadow-primary/40">
                  <img src={kaorukoGuide} alt="Kaoruko" className="w-full h-full object-cover" />
                </div>
                <span className="absolute -bottom-1 -right-1 inline-flex h-4 w-4 rounded-full bg-emerald-400 border-2 border-background" />
              </div>
              <div className="bg-card/90 backdrop-blur-sm border border-border/70 rounded-2xl rounded-tl-sm px-4 py-2 shadow-md">
                <p className="text-sm font-medium">
                  Chào bạn! Mình là <span className="text-primary">Kaoruko</span>
                </p>
                <p className="text-xs text-muted-foreground">Học tiếng Nhật 15 phút mỗi ngày nhé!</p>
              </div>
            </div>

            <Badge
              variant="secondary"
              className="w-fit gap-2 border-primary/40 bg-primary/5 backdrop-blur-sm"
            >
              <Sparkles className="h-3 w-3" />
              JLPT N5 → N1 • Daily lessons • Smart reviews
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Master Japanese in focused{" "}
              <span className="relative inline-block text-primary">
                15-minute
                <span className="pointer-events-none absolute -bottom-2 left-0 right-0 h-[6px] rounded-full bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 blur-[1px]" />
              </span>{" "}
              sessions
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Build fluency through bite-sized daily lessons, intelligent spaced repetition, and
              comprehensive JLPT preparation with your personal guide, Kaoruko.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="gap-2 group relative overflow-hidden rounded-full px-8"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start free trial
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-shimmer opacity-70 group-hover:opacity-100" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-border/60 bg-background/60 hover:bg-background/80 hover-lift"
                >
                  Take level test
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-8 pt-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">50K+</span>
                <span className="text-muted-foreground">Active learners</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">4.9</span>
                <span className="text-muted-foreground">Rating</span>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative animate-scale-in">
            <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.35),_transparent_60%)] blur-3xl opacity-80" />
            <div className="relative group max-w-md mx-auto">
              <div className="pointer-events-none absolute -inset-[3px] rounded-[32px] bg-gradient-to-tr from-primary/60 via-secondary/40 to-emerald-400/40 opacity-70 blur-xl group-hover:opacity-100 transition-opacity" />
              <div className="relative rounded-[28px] bg-card/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-primary/40 overflow-hidden group-hover:-translate-y-1 group-hover:rotate-[0.5deg] transition-transform duration-300">
                <img
                  src={kaorukoWelcome}
                  alt="Kaoruko - your Japanese guide"
                  className="w-full h-full object-cover scale-[1.03] group-hover:scale-[1.05] transition-transform duration-500"
                />
              </div>

              <div className="absolute -top-3 -left-4 lg:-left-10 bg-card/95 backdrop-blur-md p-3 rounded-2xl border border-border/70 shadow-xl animate-bounce-slow">
                <div className="text-2xl font-bold text-primary">日本語</div>
                <div className="text-xs text-muted-foreground mt-1">にほんご • nihongo</div>
              </div>

              <div
                className="absolute top-1/4 -right-4 lg:-right-10 bg-card/95 backdrop-blur-md p-3 rounded-2xl border border-border/70 shadow-xl animate-bounce-slow"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="text-2xl font-bold text-secondary">勉強</div>
                <div className="text-xs text-muted-foreground mt-1">べんきょう • study</div>
              </div>

              <div
                className="hidden sm:block absolute bottom-8 -left-6 lg:-left-10 bg-card/95 backdrop-blur-md p-3 rounded-2xl border border-border/70 shadow-xl animate-bounce-slow"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-400/15 flex items-center justify-center text-lg">
                    ✓
                  </div>
                  <div>
                    <div className="text-sm font-semibold">+15 words today</div>
                    <div className="text-xs text-muted-foreground">Keep going!</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 right-0 bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-sm shadow-lg">
                <p className="text-sm font-medium">がんばって！💪</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="text-center mb-12 relative z-10">
          <Badge variant="outline" className="mb-4">
            How it works
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your path to fluency</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A structured approach to Japanese mastery
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {[
            {
              step: "01",
              title: "Take placement test",
              description: "Find your starting level with our comprehensive assessment",
              icon: "📝",
            },
            {
              step: "02",
              title: "Follow curated path",
              description: "Progress through expertly designed lessons tailored to your level",
              icon: "🎯",
            },
            {
              step: "03",
              title: "Review with SRS",
              description: "Master content with spaced repetition for long-term retention",
              icon: "🧠",
            },
            {
              step: "04",
              title: "Track progress",
              description: "Monitor your journey with detailed statistics and achievements",
              icon: "📈",
            },
          ].map((item, index) => (
            <Card
              key={item.step}
              className="card-premium text-center hover-lift group animate-scale-in"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <CardHeader>
                <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">
                  {item.icon}
                </div>
                <div className="text-sm font-bold text-primary/40 mb-2">Step {item.step}</div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Kaoruko Tips */}
      <section id="tips" className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative max-w-sm mx-auto">
                <img
                  src={kaorukoExcited}
                  alt="Kaoruko excited"
                  className="w-full rounded-2xl shadow-2xl animate-float"
                />
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary/10 rounded-full blur-2xl" />
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <Badge variant="outline" className="gap-2">
                <MessageCircle className="h-3 w-3" />
                Kaoruko's Tips
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Learning Japanese is <span className="text-primary">fun</span> with me!
              </h2>
              <div className="space-y-4">
                {[
                  { tip: "Start with hiragana and katakana basics", emoji: "あ" },
                  { tip: "Practice 15 minutes daily for best results", emoji: "⏰" },
                  { tip: "Use flashcards for vocabulary retention", emoji: "🎴" },
                  { tip: "Listen to native speakers regularly", emoji: "🎧" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/60 hover:border-primary/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                      {item.emoji}
                    </div>
                    <p className="font-medium">{item.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JLPT levels */}
      <section id="jlpt" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="text-center mb-12 relative z-10">
          <Badge variant="outline" className="mb-4">
            JLPT Preparation
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete JLPT preparation</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From beginner to advanced, we've got you covered
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {[
            {
              level: "N5",
              title: "Beginner",
              lessons: 45,
              vocab: "800 words",
              kanji: "100 kanji",
              color: "from-green-500/20 to-green-600/5",
            },
            {
              level: "N4",
              title: "Elementary",
              lessons: 60,
              vocab: "1,500 words",
              kanji: "300 kanji",
              color: "from-blue-500/20 to-blue-600/5",
            },
            {
              level: "N3",
              title: "Intermediate",
              lessons: 75,
              vocab: "3,750 words",
              kanji: "650 kanji",
              color: "from-purple-500/20 to-purple-600/5",
            },
            {
              level: "N2",
              title: "Upper Intermediate",
              lessons: 90,
              vocab: "6,000 words",
              kanji: "1,000 kanji",
              color: "from-orange-500/20 to-orange-600/5",
            },
            {
              level: "N1",
              title: "Advanced",
              lessons: 120,
              vocab: "10,000 words",
              kanji: "2,000 kanji",
              color: "from-red-500/20 to-red-600/5",
            },
          ].map((level, index) => (
            <Card
              key={level.level}
              className={`card-premium hover-lift overflow-hidden group animate-scale-in ${
                index === 4 ? "lg:col-start-2" : ""
              }`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                    {level.level}
                  </Badge>
                  <div className="flex -space-x-1">
                    {[...Array(5 - parseInt(level.level.slice(1), 10))].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                    ))}
                  </div>
                </div>
                <CardTitle className="text-xl">{level.title}</CardTitle>
                <CardDescription>{level.lessons} lessons</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Vocabulary:</span>
                    <span className="font-medium text-foreground">{level.vocab}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kanji:</span>
                    <span className="font-medium text-foreground">{level.kanji}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 mb-12">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl shrink-0">
              <img src={kaorukoHappy} alt="Kaoruko happy" className="w-full h-full object-cover" />
            </div>
            <div className="text-center lg:text-left">
              <Badge variant="outline" className="mb-4">
                Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Everything you need to succeed</h2>
              <p className="text-muted-foreground max-w-2xl">
                Comprehensive tools designed for effective learning
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Brain,
                title: "Smart review system",
                description:
                  "Spaced repetition algorithm adapts to your learning pace, ensuring efficient memorization and long-term retention.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: BookOpen,
                title: "Interactive lessons",
                description:
                  "Engaging content with furigana support, example sentences, and immediate feedback on every exercise.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Headphones,
                title: "Listening & speaking",
                description:
                  "Native audio recordings and pronunciation practice to develop natural speaking and listening skills.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: TrendingUp,
                title: "Progress dashboard",
                description:
                  "Detailed statistics, streak tracking, and achievement system to keep you motivated on your journey.",
                gradient: "from-orange-500 to-yellow-500",
              },
            ].map((feature, index) => (
              <Card key={feature.title} className="card-premium group hover-lift animate-scale-in">
                <CardHeader>
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join thousands of learners</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See what our community has achieved
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Sarah Chen",
              level: "N3 → N2",
              quote:
                "Passed N2 in 8 months! The spaced repetition system made memorizing kanji so much easier.",
              avatar: "🧑‍🎓",
            },
            {
              name: "Marcus Johnson",
              level: "N5 → N4",
              quote:
                "The daily 15-minute lessons fit perfectly into my busy schedule. Already seeing great progress.",
              avatar: "👨‍💼",
            },
            {
              name: "Yuki Tanaka",
              level: "N4 → N3",
              quote:
                "Best Japanese learning platform I've tried. The listening exercises are particularly helpful.",
              avatar: "👩‍🏫",
            },
          ].map((testimonial) => (
            <Card key={testimonial.name} className="card-premium hover-lift">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <Badge variant="secondary" className="text-xs">
                      {testimonial.level}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">"{testimonial.quote}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <Card className="card-premium relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

          <CardContent className="p-8 md:p-12 relative z-10">
            <div className="grid lg:grid-cols-5 gap-8 items-center">
              <div className="lg:col-span-2 flex justify-center">
                <div className="relative">
                  <img
                    src={kaorukoGuide}
                    alt="Kaoruko guide"
                    className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-full border-4 border-primary/20 shadow-2xl"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-card px-3 py-1 rounded-full border shadow-lg">
                    <span className="text-sm font-medium">Let's go! ✨</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  Start your journey today
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to master Japanese?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                  Join our community and let Kaoruko guide you on your path to Japanese fluency.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/auth">
                    <Button size="lg" className="gap-2 group rounded-full px-8">
                      Start free trial
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/courses">
                    <Button size="lg" variant="outline" className="rounded-full">
                      Explore courses
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
