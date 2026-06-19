import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium [transition:background-color_var(--dur-press)_var(--ease-out),transform_var(--dur-press)_var(--ease-out)] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[#8EF67C] text-onyx hover:bg-[#6CD45A] font-semibold shadow-sm",
  secondary:
    "bg-onyx text-white hover:bg-black",
  ghost:
    "border border-border bg-surface text-ink hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  href: string;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}
