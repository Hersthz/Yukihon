interface WinterMarkProps {
  size?: number;
  className?: string;
}

/** Yukihon snowflake logo mark (pure SVG, themed via currentColor). */
const WinterMark = ({ size = 22, className = "" }: WinterMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2v20" />
    <path d="M12 6l3-2M12 6l-3-2M12 18l3 2M12 18l-3-2" />
    <path d="M3 7l18 10" />
    <path d="M3 7l1 3.6M3 7l3.6-1M21 17l-1-3.6M21 17l-3.6 1" />
    <path d="M21 7L3 17" />
    <path d="M21 7l-3.6-1M21 7l-1 3.6M3 17l3.6 1M3 17l1-3.6" />
  </svg>
);

export default WinterMark;
