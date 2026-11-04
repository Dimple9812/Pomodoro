export default function Logo({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ff-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#ff-logo)" />
      <circle cx="32" cy="34" r="16" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="5" />
      <path d="M32 18 A16 16 0 1 1 16.8 39" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <path d="M32 34 L32 26" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="34" r="3" fill="#fff" />
    </svg>
  );
}
