import { useMemo } from "react";

interface WinterSceneProps {
  isDark: boolean;
  /** Density of falling snow. Default 36. */
  flakes?: number;
}

interface Flake {
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

/**
 * Self-contained winter backdrop: gradient sky (from CSS tokens) + soft orb
 * (sun by day / moon by night) + layered snowy hills + animated snowfall.
 * No external images — pure CSS/SVG so it works offline and respects the theme.
 */
const WinterScene = ({ isDark, flakes = 36 }: WinterSceneProps) => {
  const snow = useMemo<Flake[]>(
    () =>
      Array.from({ length: flakes }).map(() => ({
        left: Math.random() * 100,
        size: 2 + Math.random() * 5,
        duration: 9 + Math.random() * 12,
        delay: -Math.random() * 20,
        drift: (Math.random() - 0.5) * 80,
        opacity: 0.35 + Math.random() * 0.5,
      })),
    [flakes]
  );

  return (
    <div className="winter-scene" aria-hidden="true">
      {/* Soft sun / moon glow */}
      <div className="winter-orb" />

      {/* Layered snowy hills */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        style={{ height: "46vh" }}
        viewBox="0 0 1440 520"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* far ridge */}
        <path
          d="M0 300 L180 220 L360 290 L560 190 L760 280 L980 200 L1200 280 L1440 230 L1440 520 L0 520 Z"
          fill="hsl(var(--w-hill-far))"
          opacity={isDark ? 0.7 : 0.85}
        />
        {/* near ridge */}
        <path
          d="M0 380 L240 320 L460 390 L680 330 L900 400 L1140 340 L1440 400 L1440 520 L0 520 Z"
          fill="hsl(var(--w-hill-near))"
        />
        {/* pine silhouettes on the near ridge */}
        <g fill="hsl(var(--w-hill-far))" opacity={isDark ? 0.85 : 0.5}>
          {[120, 300, 520, 760, 1010, 1260].map((x, i) => {
            const baseY = 360 - (i % 2) * 14;
            return (
              <path
                key={x}
                d={`M${x} ${baseY} l14 26 l-7 0 l10 20 l-9 0 l12 22 l-46 0 l12 -22 l-9 0 l10 -20 l-7 0 Z`}
              />
            );
          })}
        </g>
      </svg>

      {/* Falling snow */}
      {snow.map((f, i) => (
        <span
          key={i}
          className="winter-snowflake animate-snow-fall"
          style={{
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            opacity: f.opacity,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            ["--snow-drift" as string]: `${f.drift}px`,
            boxShadow: isDark ? "0 0 6px hsl(var(--w-snow) / 0.8)" : "none",
          }}
        />
      ))}
    </div>
  );
};

export default WinterScene;
