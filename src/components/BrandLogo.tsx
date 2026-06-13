export function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id="m-grad" x1="6" y1="8" x2="42" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b3dff" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      {/* Rounded "M" */}
      <path
        d="M9 33V14c0-3 3.4-4.7 5.8-2.9L24 18l9.2-6.9C35.6 9.3 39 11 39 14v19"
        stroke="url(#m-grad)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Downward chevron under the center */}
      <path
        d="M18 28l6 6 6-6"
        stroke="url(#m-grad)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <BrandLogo size={size} />
      <span className="text-lg font-bold tracking-tight text-ink">Medium</span>
    </div>
  );
}
