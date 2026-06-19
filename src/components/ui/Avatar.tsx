export function Avatar({
  iniciales,
  size = 36,
}: {
  iniciales: string;
  size?: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-onyx font-semibold text-primary"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {iniciales || "?"}
    </span>
  );
}
