import { type ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-border bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wide text-muted">
      {children}
    </thead>
  );
}

export function TH({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TR({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={`hover:bg-gray-50/60 ${className}`}>{children}</tr>
  );
}

export function TD({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
