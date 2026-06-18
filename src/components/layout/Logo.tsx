export function Logo({
  compact = false,
  onDark = true,
}: {
  compact?: boolean;
  onDark?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width="26"
        height="26"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        {/* Pluma estilizada de marca */}
        <path
          d="M27 5C18 6 11 11 8 19c-1.3 3.4-1.6 6.2-1.6 6.2l2.1-2.1c.6.3 1.3.5 2 .5 6 0 11-7.4 12-15.6.2-1.6.3-2.6.3-2.6S28.2 4.9 27 5Z"
          fill="#8EF67C"
        />
        <path
          d="M9 24c3-7 8-11 14-13"
          stroke="#2F2E2E"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M6 26l3-3"
          stroke="#8EF67C"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {!compact && (
        <div className="leading-none">
          <span
            className={`text-base font-bold tracking-tight ${
              onDark ? "text-white" : "text-ink"
            }`}
          >
            Plexo<span className="text-[#8EF67C]">Tech</span>
          </span>
        </div>
      )}
    </div>
  );
}
