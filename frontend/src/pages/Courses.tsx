import { useState } from "react";
import Navigation from "@/components/Navigation";
import CourseCard from "@/components/CourseCard";
import KaorukoMascot from "@/components/KaorukoMascot";
import WinterNightBackground from "@/components/WinterNightBackground";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Courses = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const courses = [
    {
      id: "n5-foundations",
      title: "N5 Foundations",
      level: "JLPT N5",
      description:
        "Start your Japanese journey with basic grammar, hiragana, katakana, and essential vocabulary.",
      lessons: 45,
      hours: 20,
      skills: ["Vocab", "Grammar", "Kanji"],
      progress: 0,
    },
    {
      id: "n4-conversations",
      title: "N4 Daily Conversations",
      level: "JLPT N4",
      description:
        "Master everyday situations with expanded vocabulary and intermediate grammar patterns.",
      lessons: 60,
      hours: 28,
      skills: ["Vocab", "Grammar", "Listening"],
      progress: 62,
    },
    {
      id: "n3-fluency",
      title: "N3 Building Fluency",
      level: "JLPT N3",
      description:
        "Develop natural expression with complex grammar and authentic Japanese materials.",
      lessons: 75,
      hours: 35,
      skills: ["Grammar", "Reading", "Listening"],
      progress: 0,
    },
    {
      id: "n2-professional",
      title: "N2 Professional Japanese",
      level: "JLPT N2",
      description:
        "Business Japanese, news comprehension, and advanced kanji for professional contexts.",
      lessons: 90,
      hours: 42,
      skills: ["Reading", "Listening", "Kanji"],
      progress: 0,
    },
    {
      id: "n1-mastery",
      title: "N1 Complete Mastery",
      level: "JLPT N1",
      description:
        "Near-native proficiency with literature, academic texts, and nuanced expression.",
      lessons: 120,
      hours: 60,
      skills: ["All skills"],
      progress: 0,
    },
    {
      id: "business-japanese",
      title: "Business Japanese",
      level: "N3-N2",
      description:
        "Specialized course for workplace communication, emails, and meetings.",
      lessons: 40,
      hours: 18,
      skills: ["Vocab", "Grammar"],
      progress: 0,
    },
  ];

  const levels = ["all", "JLPT N5", "JLPT N4", "JLPT N3", "JLPT N2", "JLPT N1"];

  const filteredCourses =
    selectedLevel === "all" ? courses : courses.filter((c) => c.level === selectedLevel);

  return (
    <div className="min-h-screen bg-background relative">
      <WinterNightBackground snowCount={70} sparkleCount={26} intensity="normal" />
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-start gap-4">
            <KaorukoMascot
              mood="guide"
              size="lg"
              showBubble
              message="Hãy chọn khóa học phù hợp với trình độ của bạn nhé! 📖"
              bubblePosition="right"
            />
            <div className="flex-1 pt-4">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Course catalog</h1>
              <p className="text-muted-foreground">Choose your path to Japanese fluency</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 animate-slide-up">
          <Tabs value={selectedLevel} onValueChange={setSelectedLevel}>
            <TabsList className="w-full md:w-auto flex-wrap h-auto gap-2 bg-card/70 backdrop-blur-md border border-border/60 rounded-full px-1 py-1">
              {levels.map((level) => (
                <TabsTrigger
                  key={level}
                  value={level}
                  className="capitalize rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                >
                  {level === "all" ? "All levels" : level}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, i) => (
            <div
              key={course.id}
              className="animate-scale-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <CourseCard {...course} />
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <KaorukoMascot mood="thinking" size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">No courses found for this level.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;
