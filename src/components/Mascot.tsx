export function Mascot({ size = 96, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      role="img"
      aria-label="FindBack 우산 마스코트"
      className={className}
    >
      {/* canopy */}
      <path
        d="M8 44C8 24.67 25.79 9 48 9s40 15.67 40 35H8Z"
        fill="var(--color-sky-deep, #8fcbe8)"
      />
      <path
        d="M8 44c0 4.5 4 8 8.5 8s8.5-3.5 8.5-8 4-8 8.5-8 8.5 3.5 8.5 8 4 8 8.5 8 8.5-3.5 8.5-8 4-8 8.5-8 8.5 3.5 8.5 8 4 8 8.5 8V44H8Z"
        fill="var(--color-sky, #cfe8f7)"
      />
      {/* pole */}
      <rect x="46" y="44" width="4" height="34" rx="2" fill="var(--color-navy, #1c2b4a)" />
      {/* handle hook */}
      <path
        d="M50 78c0 4.418-3.582 8-8 8"
        stroke="var(--color-navy, #1c2b4a)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* eyes */}
      <circle cx="38" cy="30" r="3" fill="var(--color-navy, #1c2b4a)" />
      <circle cx="58" cy="30" r="3" fill="var(--color-navy, #1c2b4a)" />
      {/* blush */}
      <circle cx="30" cy="36" r="3" fill="var(--color-coral, #ff6f5e)" opacity="0.6" />
      <circle cx="66" cy="36" r="3" fill="var(--color-coral, #ff6f5e)" opacity="0.6" />
      {/* smile */}
      <path
        d="M42 36c2 3 10 3 12 0"
        stroke="var(--color-navy, #1c2b4a)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
