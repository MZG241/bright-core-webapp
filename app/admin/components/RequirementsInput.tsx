"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
};

export function RequirementsInput({ value, onChange, error }: Props) {
  const [input, setInput] = useState("");

  const items: string[] = Array.isArray(value) ? value : [];

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) {
      setInput("");
      return;
    }
    onChange([...items, trimmed]);
    setInput("");
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
    if (e.key === "Backspace" && input === "" && items.length > 0) {
      remove(items.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-stretch gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="e.g. 5+ years of React experience"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={add}
          disabled={!input.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {items.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {items.map((req, i) => (
            <li
              key={`${req}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-100 pl-3 pr-1.5 py-1 text-xs font-medium text-brand-700"
            >
              <span className="truncate max-w-[220px]">{req}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="inline-flex cursor-pointer items-center justify-center h-4 w-4 rounded-full text-brand-600 hover:bg-brand-200"
                aria-label={`Remove ${req}`}
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-[11px] text-slate-400">
        Press Enter to add. Backspace on empty input removes the last one.
      </p>
    </div>
  );
}