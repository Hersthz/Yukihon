import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import KaorukoMascot from "@/components/KaorukoMascot";
import { CheckCircle2, XCircle, RotateCcw, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: number;
  type: "multiple-choice" | "typing";
  japanese: string;
  reading: string;
  correctAnswer: string;
  options?: string[];
}

interface QuizModeProps {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
  onRestart: () => void;
}

const QuizMode = ({ questions, onComplete, onRestart }: QuizModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; question: QuizQuestion }[]>([]);

  const currentQuestion = questions[currentIndex];
  const isCorrect = currentQuestion.type === "multiple-choice"
    ? selectedAnswer === currentQuestion.correctAnswer
    : typedAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();

  const handleSubmitAnswer = () => {
    if (isAnswered) return;
    
    const correct = currentQuestion.type === "multiple-choice"
      ? selectedAnswer === currentQuestion.correctAnswer
      : typedAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();

    setIsAnswered(true);
    setAnswers(prev => [...prev, { correct, question: currentQuestion }]);
    
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTypedAnswer("");
      setIsAnswered(false);
    } else {
      setShowResults(true);
      onComplete(score + (isCorrect ? 1 : 0), questions.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setTypedAnswer("");
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setAnswers([]);
    onRestart();
  };

  if (showResults) {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);
    
    return (
      <Card className="card-premium max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          {/* Kaoruko Reaction */}
          <div className="mb-6">
            <KaorukoMascot
              mood={percentage >= 80 ? "excited" : percentage >= 50 ? "happy" : "incorrect"}
              size="xl"
              className="mx-auto mb-4"
            />
            
            <h2 className="text-2xl font-bold mb-2">
              {percentage >= 80 ? "Excellent! すごい！" : percentage >= 50 ? "Good job! いいね！" : "Keep practicing! 頑張って！"}
            </h2>
            <p className="text-muted-foreground">
              You scored {finalScore} out of {questions.length} ({percentage}%)
            </p>
          </div>

          {/* Kaoruko Message */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium">
              {percentage >= 80 
                ? "Tuyệt vời! Bạn đã nắm vững bài học này rồi! 🎉" 
                : percentage >= 50 
                ? "Khá tốt! Hãy ôn tập thêm để hoàn thiện hơn nhé! 📚"
                : "Đừng nản lòng! Hãy thử lại và bạn sẽ làm tốt hơn! 💪"}
            </p>
          </div>

          {/* Answer Summary */}
          <div className="space-y-2 mb-6 text-left max-h-60 overflow-y-auto">
            {answers.map((answer, i) => (
              <div 
                key={i}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  answer.correct ? "bg-primary/5" : "bg-destructive/5"
                )}
              >
                {answer.correct ? (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{answer.question.japanese}</span>
                  <span className="text-muted-foreground ml-2">→ {answer.question.correctAnswer}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleRestart} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={() => window.history.back()}>
              Finish Lesson
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="font-medium text-primary">
          Score: {score}/{currentIndex}
        </span>
      </div>

      {/* Kaoruko Helper */}
      <div className="flex justify-center">
        <KaorukoMascot
          mood={isAnswered ? (isCorrect ? "correct" : "incorrect") : "thinking"}
          size="md"
          showBubble={isAnswered}
          message={isAnswered 
            ? (isCorrect ? "Chính xác! すごい！ 🌟" : "Cố gắng lên! 頑張って！ 💪")
            : undefined}
          bubblePosition="right"
          className={isAnswered ? (isCorrect ? "animate-wiggle" : "") : ""}
        />
      </div>

      {/* Question Card */}
      <Card className={cn(
        "card-premium transition-all duration-300",
        isAnswered && isCorrect && "ring-2 ring-green-500/50",
        isAnswered && !isCorrect && "ring-2 ring-orange-500/50"
      )}>
        <CardContent className="p-8">
          {/* Japanese Word */}
          <div className="text-center mb-8">
            <div className="text-4xl md:text-5xl font-bold mb-2">
              {currentQuestion.japanese}
            </div>
            <div className="text-lg text-muted-foreground">
              {currentQuestion.reading}
            </div>
          </div>

          {/* Question Prompt */}
          <p className="text-center text-muted-foreground mb-6">
            {currentQuestion.type === "multiple-choice" 
              ? "Select the correct meaning:"
              : "Type the meaning in English:"}
          </p>

          {/* Answer Options */}
          {currentQuestion.type === "multiple-choice" && currentQuestion.options ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === currentQuestion.correctAnswer;
                
                return (
                  <Button
                    key={option}
                    variant="outline"
                    className={cn(
                      "h-auto py-4 px-6 text-left justify-start transition-all",
                      !isAnswered && isSelected && "ring-2 ring-primary",
                      isAnswered && isCorrectOption && "bg-primary/10 border-primary text-primary",
                      isAnswered && isSelected && !isCorrectOption && "bg-destructive/10 border-destructive text-destructive"
                    )}
                    onClick={() => !isAnswered && setSelectedAnswer(option)}
                    disabled={isAnswered}
                  >
                    {option}
                    {isAnswered && isCorrectOption && (
                      <CheckCircle2 className="h-4 w-4 ml-auto" />
                    )}
                    {isAnswered && isSelected && !isCorrectOption && (
                      <XCircle className="h-4 w-4 ml-auto" />
                    )}
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type your answer..."
                className={cn(
                  "text-center text-lg py-6",
                  isAnswered && isCorrect && "border-primary bg-primary/5",
                  isAnswered && !isCorrect && "border-destructive bg-destructive/5"
                )}
                disabled={isAnswered}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isAnswered && typedAnswer.trim()) {
                    handleSubmitAnswer();
                  }
                }}
              />
              {isAnswered && !isCorrect && (
                <p className="text-center text-sm text-muted-foreground">
                  Correct answer: <span className="font-medium text-primary">{currentQuestion.correctAnswer}</span>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        {!isAnswered ? (
          <Button 
            onClick={handleSubmitAnswer}
            disabled={currentQuestion.type === "multiple-choice" ? !selectedAnswer : !typedAnswer.trim()}
            className="min-w-32"
          >
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext} className="min-w-32 animate-pop">
            {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizMode;
