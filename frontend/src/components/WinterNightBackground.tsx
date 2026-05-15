import { useEffect, useMemo, useState } from "react";

interface DecorativeOrb {
  id: number;
  left: number;
  top: number;
  size: number;
  color: string;
}

interface WinterNightBackgroundProps {
  snowCount?: number;
  sparkleCount?: number;
  showAurora?: boolean;
  intensity?: "light" | "normal" | "intense";
  className?: string;
}

const palette = ["#ffd9cf", "#c9f0ff", "#caffca", "#e8dcff"];

const WinterNightBackground = ({
  snowCount = 0,
  sparkleCount = 6,
  intensity = "normal",
  className = "",
}: WinterNightBackgroundProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const orbs = useMemo<DecorativeOrb[]>(() => {
    const multiplier = intensity === "light" ? 0.8 : intensity === "intense" ? 1.35 : 1;
    const count = Math.max(4, Math.min(Math.round((sparkleCount + snowCount * 0.2) * multiplier), 12));

    return Array.from({ length: count }, (_, index) => ({
      id: index,
      left: 4 + Math.random() * 88,
      top: 4 + Math.random() * 82,
      size: 140 + Math.random() * 180,
      color: palette[index % palette.length],
    }));
  }, [intensity, snowCount, sparkleCount]);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`pointer-events-none fixed inset-0 overflow-hidden ${className}`} style={{ zIndex: 0 }}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffaf4_0%,#fff5ed_40%,#f8f0e8_100%)]" />
      <div className="absolute inset-0 opacity-70 bg-noise" />

      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full blur-[110px]"
          style={{
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: orb.color,
            opacity: 0.38,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.55),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.4),transparent_32%)]" />
    </div>
  );
};

export default WinterNightBackground;
