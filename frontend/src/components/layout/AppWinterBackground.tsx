import { useMemo } from "react";

interface Flake {
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

/**
 * Calm winter backdrop for the logged-in app — a soft sky gradient with a
 * gentle, low-density snowfall. Mirrors the landing's atmosphere but kept
 * subtle so dense pages stay readable. Pure CSS, fixed behind all content.
 */
const AppWinterBackground = () => {
  const snow = useMemo<Flake[]>(
    () =>
      Array.from({ length: 16 }).map(() => ({
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 14 + Math.random() * 14,
        delay: -Math.random() * 26,
        drift: (Math.random() - 0.5) * 70,
        opacity: 0.18 + Math.random() * 0.34,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 70% at 85% -10%, hsl(213 88% 54% / 0.1), transparent 55%)," +
            "linear-gradient(180deg, hsl(210 64% 93%) 0%, hsl(206 56% 96%) 40%, hsl(210 42% 98%) 100%)",
        }}
      />
      {snow.map((f, i) => (
        <span
          key={i}
          className="animate-snow-fall absolute top-[-12px] rounded-full bg-white"
          style={{
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            opacity: f.opacity,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            ["--snow-drift" as string]: `${f.drift}px`,
          }}
        />
      ))}
    </div>
  );
};

export default AppWinterBackground;
