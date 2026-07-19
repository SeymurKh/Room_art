"use client";

import { Trash2 } from "lucide-react";

export function DeleteButton({ itemName }: { itemName: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(`Delete "${itemName}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
      className="grid size-8 place-items-center border border-black/40 text-[#11100e] transition hover:border-red-400 hover:text-red-600"
      aria-label={`Delete ${itemName}`}
      title={`Delete ${itemName}`}
    >
      <Trash2 size={14} />
    </button>
  );
}