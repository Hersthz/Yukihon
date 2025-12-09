import { useEffect, useState } from "react";

interface Snowflake {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

interface SnowEffectProps {
  count?: number;
  className?: string;
}

const SnowEffect = ({ count = 40, className = "" }: SnowEffectProps) => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const newSnowflakes: Snowflake[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 12,
      size: 2 + Math.random() * 6,
      opacity: 0.3 + Math.random() * 0.5,
    }));
    setSnowflakes(newSnowflakes);
  }, [count]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-snow-fall"
          style={{
            left: `${flake.left}%`,
            top: "-20px",
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
          }}
        >
          <div
            className="rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            style={{
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default SnowEffect;
