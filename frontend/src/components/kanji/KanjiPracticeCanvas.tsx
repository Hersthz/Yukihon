import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanjiPracticeCanvasProps {
  kanji: string;
}

const CANVAS_SIZE = 520;

const KanjiPracticeCanvas = ({ kanji }: KanjiPracticeCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);

  const paintGuide = useCallback(
    (canvas: HTMLCanvasElement) => {
      const context = canvas.getContext("2d");
      if (!context) return;

      const ratio = window.devicePixelRatio || 1;
      canvas.width = CANVAS_SIZE * ratio;
      canvas.height = CANVAS_SIZE * ratio;
      canvas.style.width = "100%";
      canvas.style.aspectRatio = "1 / 1";

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      context.strokeStyle = "#dbeafe";
      context.lineWidth = 1.25;
      context.beginPath();
      context.moveTo(CANVAS_SIZE / 2, 0);
      context.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE);
      context.moveTo(0, CANVAS_SIZE / 2);
      context.lineTo(CANVAS_SIZE, CANVAS_SIZE / 2);
      context.moveTo(0, 0);
      context.lineTo(CANVAS_SIZE, CANVAS_SIZE);
      context.moveTo(CANVAS_SIZE, 0);
      context.lineTo(0, CANVAS_SIZE);
      context.stroke();

      context.font = "172px serif";
      context.fillStyle = "rgba(100, 116, 139, 0.14)";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(kanji, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 6);
    },
    [kanji]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    paintGuide(canvas);
  }, [paintGuide]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    paintGuide(canvas);
  };

  const resolvePoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const point = resolvePoint(clientX, clientY);
    if (!canvas || !context || !point) return;

    context.strokeStyle = "#0f172a";
    context.lineWidth = 6;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(point.x, point.y);
    setDrawing(true);
  };

  const draw = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const point = resolvePoint(clientX, clientY);
    if (!drawing || !canvas || !context || !point) return;

    context.lineTo(point.x, point.y);
    context.stroke();
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Writing practice</p>
          <p className="text-sm text-muted-foreground">
            Viết thử kanji lên khung này để luyện tay và ghi nhớ bố cục.
          </p>
        </div>
        <Button className="shrink-0" onClick={clearCanvas} variant="outline">
          <Eraser className="mr-2 h-4 w-4" />
          Xóa nét
        </Button>
      </div>

      <canvas
        aria-label={`Writing practice canvas for ${kanji}`}
        ref={canvasRef}
        className="aspect-square w-full touch-none rounded-lg border border-sky-100 bg-white"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          startDrawing(event.clientX, event.clientY);
        }}
        onPointerLeave={() => setDrawing(false)}
        onPointerMove={(event) => draw(event.clientX, event.clientY)}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId);
          setDrawing(false);
        }}
      />
    </div>
  );
};

export default KanjiPracticeCanvas;
