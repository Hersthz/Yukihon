import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface ExampleSentence {
  japanese: string;
  reading: string;
  english: string;
}

interface VocabularyItem {
  id: number;
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
  partOfSpeech: string;
  examples: ExampleSentence[];
}

interface VocabularyCardProps {
  item: VocabularyItem;
  showFurigana: boolean;
  showRomaji: boolean;
  isMarkedDifficult: boolean;
  onToggleFurigana: () => void;
  onToggleRomaji: () => void;
  onToggleDifficult: () => void;
}

const VocabularyCard = ({
  item,
  showFurigana,
  showRomaji,
  isMarkedDifficult,
  onToggleFurigana,
  onToggleRomaji,
  onToggleDifficult,
}: VocabularyCardProps) => {
  return (
    <Card className="card-premium animate-fade-in">
      <CardContent className="p-8 md:p-12">
        {/* Kanji Display */}
        <div className="text-center mb-8">
          <div className="text-6xl md:text-7xl font-bold mb-4 text-foreground">{item.kanji}</div>

          {/* Furigana/Kana */}
          {showFurigana && (
            <div className="text-2xl md:text-3xl text-muted-foreground mb-2 font-medium">
              {item.kana}
            </div>
          )}

          {/* Romaji */}
          {showRomaji && <div className="text-lg text-muted-foreground italic">{item.romaji}</div>}
        </div>

        {/* Meaning and Part of Speech */}
        <div className="text-center mb-8 pb-8 border-b">
          <div className="text-2xl md:text-3xl font-semibold mb-3 text-foreground">
            {item.meaning}
          </div>
          <Badge variant="secondary" className="text-sm">
            {item.partOfSpeech}
          </Badge>
        </div>

        {/* Example Sentences */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Examples
          </h3>
          {item.examples.map((example, index) => (
            <div key={index} className="space-y-2 p-4 rounded-lg bg-muted/30">
              <div className="text-xl font-medium text-foreground">{example.japanese}</div>
              {showFurigana && (
                <div className="text-sm text-muted-foreground">{example.reading}</div>
              )}
              <div className="text-base text-foreground/80">{example.english}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mt-8 pt-8 border-t">
          <Button
            variant={showFurigana ? "default" : "outline"}
            onClick={onToggleFurigana}
            size="sm"
          >
            Furigana: {showFurigana ? "ON" : "OFF"}
          </Button>
          <Button variant={showRomaji ? "default" : "outline"} onClick={onToggleRomaji} size="sm">
            Romaji: {showRomaji ? "ON" : "OFF"}
          </Button>
          <Button
            variant={isMarkedDifficult ? "default" : "outline"}
            onClick={onToggleDifficult}
            size="sm"
            className="ml-auto gap-2"
          >
            <Star className={`h-4 w-4 ${isMarkedDifficult ? "fill-current" : ""}`} />
            {isMarkedDifficult ? "Saved" : "Save for Review"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VocabularyCard;
