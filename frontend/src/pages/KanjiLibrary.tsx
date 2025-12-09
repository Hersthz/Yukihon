import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Kanji {
  character: string;
  meaning: string;
  onReading: string;
  kunReading: string;
  strokes: number;
  level: string;
  examples: string[];
}

const KanjiLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("N5");
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null);

  const kanjiData: Kanji[] = [
    {
      character: "日",
      meaning: "sun, day",
      onReading: "ニチ、ジツ",
      kunReading: "ひ、か",
      strokes: 4,
      level: "N5",
      examples: ["日本 (にほん) - Japan", "毎日 (まいにち) - every day", "今日 (きょう) - today"]
    },
    {
      character: "本",
      meaning: "book, origin",
      onReading: "ホン",
      kunReading: "もと",
      strokes: 5,
      level: "N5",
      examples: ["本 (ほん) - book", "日本 (にほん) - Japan", "本当 (ほんとう) - truth"]
    },
    {
      character: "人",
      meaning: "person",
      onReading: "ジン、ニン",
      kunReading: "ひと",
      strokes: 2,
      level: "N5",
      examples: ["人 (ひと) - person", "日本人 (にほんじん) - Japanese person", "三人 (さんにん) - three people"]
    },
    {
      character: "学",
      meaning: "study, learning",
      onReading: "ガク",
      kunReading: "まな(ぶ)",
      strokes: 8,
      level: "N5",
      examples: ["学校 (がっこう) - school", "学生 (がくせい) - student", "大学 (だいがく) - university"]
    },
    {
      character: "生",
      meaning: "life, birth",
      onReading: "セイ、ショウ",
      kunReading: "い(きる)、う(まれる)",
      strokes: 5,
      level: "N5",
      examples: ["学生 (がくせい) - student", "先生 (せんせい) - teacher", "人生 (じんせい) - life"]
    },
    {
      character: "会",
      meaning: "meet, gathering",
      onReading: "カイ、エ",
      kunReading: "あ(う)",
      strokes: 6,
      level: "N5",
      examples: ["会社 (かいしゃ) - company", "会う (あう) - to meet", "社会 (しゃかい) - society"]
    },
  ];

  const filteredKanji = kanjiData.filter(k => 
    (k.character.includes(searchQuery) || 
     k.meaning.toLowerCase().includes(searchQuery.toLowerCase())) &&
    k.level === selectedLevel
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Kanji library</h1>
          <p className="text-muted-foreground">Explore and master all JLPT kanji</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8 animate-slide-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by kanji or meaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          <Tabs value={selectedLevel} onValueChange={setSelectedLevel}>
            <TabsList className="w-full md:w-auto">
              {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                <TabsTrigger key={level} value={level}>
                  {level}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">100</div>
              <p className="text-sm text-muted-foreground">N5 Kanji</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-secondary">300</div>
              <p className="text-sm text-muted-foreground">N4 Kanji</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">650</div>
              <p className="text-sm text-muted-foreground">N3 Kanji</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">2,136</div>
              <p className="text-sm text-muted-foreground">Total Joyo</p>
            </CardContent>
          </Card>
        </div>

        {/* Kanji Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredKanji.map((kanji, i) => (
            <Card
              key={kanji.character}
              className="card-premium hover-lift cursor-pointer text-center aspect-square flex flex-col items-center justify-center animate-scale-in"
              style={{ animationDelay: `${i * 0.02}s` }}
              onClick={() => setSelectedKanji(kanji)}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <div className="text-4xl md:text-5xl font-bold mb-1">{kanji.character}</div>
                <div className="text-xs text-muted-foreground truncate w-full">{kanji.meaning.split(',')[0]}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredKanji.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No kanji found matching your search.</p>
          </div>
        )}

        {/* Kanji Detail Dialog */}
        <Dialog open={!!selectedKanji} onOpenChange={() => setSelectedKanji(null)}>
          <DialogContent className="max-w-2xl">
            {selectedKanji && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-8xl font-bold">{selectedKanji.character}</div>
                    <Badge>{selectedKanji.level}</Badge>
                  </div>
                  <DialogTitle className="text-2xl">{selectedKanji.meaning}</DialogTitle>
                  <DialogDescription>
                    {selectedKanji.strokes} strokes
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Readings */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground">On'yomi (音読み)</h3>
                      <p className="text-lg font-medium">{selectedKanji.onReading}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground">Kun'yomi (訓読み)</h3>
                      <p className="text-lg font-medium">{selectedKanji.kunReading}</p>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground">Example words</h3>
                    <div className="space-y-2">
                      {selectedKanji.examples.map((example, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/30 text-sm">
                          {example}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Placeholder for stroke order */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">Stroke order</h3>
                    <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Stroke order diagram</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default KanjiLibrary;
