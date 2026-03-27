import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanjiPracticeCanvasProps {
  kanji: string;
}

const KanjiPracticeCanvas = ({ kanji }: KanjiPracticeCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#dbeafe";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.moveTo(0, canvas.height / 2);
    context.lineTo(canvas.width, canvas.height / 2);
    context.stroke();

    context.font = "120px serif";
    context.fillStyle = "rgba(148, 163, 184, 0.16)";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(kanji, canvas.width / 2, canvas.height / 2);
  }, [kanji]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#dbeafe";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.moveTo(0, canvas.height / 2);
    context.lineTo(canvas.width, canvas.height / 2);
    context.stroke();
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
    <div className="rounded-[22px] border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Writing practice</p>
          <p className="text-sm text-muted-foreground">Viet thu kanji len khung nay de luyen tay va ghi nho bo cuc.</p>
        </div>
        <Button className="rounded-2xl" onClick={clearCanvas} variant="outline">
          <Eraser className="mr-2 h-4 w-4" />
          Xoa net
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        width={520}
        height={520}
        className="w-full rounded-[20px] border border-sky-100 bg-white touch-none"
        onMouseDown={(event) => startDrawing(event.clientX, event.clientY)}
        onMouseMove={(event) => draw(event.clientX, event.clientY)}
        onMouseUp={() => setDrawing(false)}
        onMouseLeave={() => setDrawing(false)}
        onTouchEnd={() => setDrawing(false)}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          if (touch) {
            draw(touch.clientX, touch.clientY);
          }
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) {
            startDrawing(touch.clientX, touch.clientY);
          }
        }}
      />
    </div>
  );
};

export default KanjiPracticeCanvas;
