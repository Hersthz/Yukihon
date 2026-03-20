import { CSSProperties, useEffect, useState } from "react";

interface Snowflake {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  drift: number; // horizontal drift amount
}

interface SnowEffectProps {
  count?: number;
  className?: string;
}

const SnowEffect = ({ count = 30, className = "" }: SnowEffectProps) => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const newSnowflakes: Snowflake[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 12 + Math.random() * 18,
      size: 1.5 + Math.random() * 4,
      opacity: 0.15 + Math.random() * 0.35,
      drift: -20 + Math.random() * 40,
    }));
    setSnowflakes(newSnowflakes);
  }, [count]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-[1] ${className}`}>
      {snowflakes.map((flake) => (
        (() => {
          const flakeStyle: CSSProperties & { "--snow-drift": string } = {
            left: `${flake.left}%`,
            top: "-10px",
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            "--snow-drift": `${flake.drift}px`,
          };

          return (
        <div
          key={flake.id}
          className="absolute animate-snow-fall"
          style={flakeStyle}
        >
          <div
            className="rounded-full bg-white/90"
            style={{
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              boxShadow: `0 0 ${flake.size * 2}px rgba(255,255,255,${flake.opacity * 0.5})`,
            }}
          />
        </div>
          );
        })()
      ))}
    </div>
  );
};

export default SnowEffect;
