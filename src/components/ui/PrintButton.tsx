"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg bg-onyx px-3.5 py-2 text-sm font-medium text-white hover:bg-black"
    >
      ⎙ Imprimir / PDF
    </button>
  );
}
