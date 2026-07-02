import { useCallback, useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";

const STROKE_MS = 420;

/**
 * Renders a KanjiVG SVG and animates its strokes in order (each path drawn sequentially via
 * stroke-dashoffset). Stroke-number labels are hidden; a replay button re-runs the animation.
 */
const KanjiStrokeOrder = ({ svg, className }: { svg: string; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  const animate = useCallback(() => {
    const root = ref.current;
    if (!root) return;
    // Hide KanjiVG stroke-number labels.
    root.querySelectorAll("text").forEach((t) => {
      (t as SVGElement).style.display = "none";
    });
    const el = root.querySelector("svg");
    if (el) {
      el.setAttribute("width", "100%");
      el.setAttribute("height", "100%");
    }
    const paths = Array.from(root.querySelectorAll("path")) as SVGPathElement[];
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.stroke = "currentColor";
      p.style.fill = "none";
      p.style.strokeWidth = "4";
      p.style.strokeLinecap = "round";
      p.style.strokeLinejoin = "round";
      p.style.transition = "none";
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });
    // Next frame: draw each stroke in sequence.
    requestAnimationFrame(() => {
      paths.forEach((p, i) => {
        p.style.transition = `stroke-dashoffset ${STROKE_MS}ms ease ${i * STROKE_MS}ms`;
        p.style.strokeDashoffset = "0";
      });
    });
  }, []);

  useEffect(() => {
    animate();
  }, [svg, animate]);

  return (
    <div className={className}>
      <div className="relative mx-auto aspect-square w-40 rounded-2xl border border-border bg-card text-primary">
        {/* Grid guides */}
        <div className="pointer-events-none absolute inset-4 rounded-lg border border-dashed border-border/70" />
        <div className="pointer-events-none absolute left-1/2 top-4 bottom-4 border-l border-dashed border-border/50" />
        <div className="pointer-events-none absolute top-1/2 left-4 right-4 border-t border-dashed border-border/50" />
        <div
          ref={ref}
          className="absolute inset-0 p-2"
          // KanjiVG SVG is self-contained; namespaced kvg: attrs are ignored by the browser.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      <button
        type="button"
        onClick={animate}
        className="mx-auto mt-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Xem lại
      </button>
    </div>
  );
};

export default KanjiStrokeOrder;
