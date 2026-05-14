import { useState, useEffect, useRef } from "react";
import { mitreAPI } from "../api";
import type { MITRETechnique } from "../types";

interface Props {
  value: string | null;
  onChange: (tid: string | null) => void;
}

export default function MITRESearch({ value, onChange }: Props) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<MITRETechnique[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MITRETechnique | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!query || selected) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const r = await mitreAPI.search(query);
      setResults(r.data.slice(0, 15));
      setOpen(true);
    }, 300);
  }, [query]);

  const pick = (t: MITRETechnique) => {
    setSelected(t);
    setQuery(`${t.id} — ${t.name}`);
    onChange(t.id);
    setOpen(false);
    setResults([]);
  };

  const clear = () => {
    setSelected(null);
    setQuery("");
    onChange(null);
  };

  return (
    <div className="relative">
      <div className="flex gap-1">
        <input
          className="input flex-1"
          placeholder="Search MITRE technique (e.g. T1078 or kerberoast)"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
          onFocus={() => { if (results.length) setOpen(true); }}
        />
        {selected && <button className="btn-secondary px-2 text-xs" onClick={clear}>✕</button>}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded mt-1 max-h-64 overflow-y-auto shadow-xl">
          {results.map((t) => (
            <div
              key={t.id}
              className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm"
              onMouseDown={() => pick(t)}
            >
              <span className="text-sky-400 font-mono">{t.id}</span>
              <span className="text-gray-200 ml-2">{t.name}</span>
              <span className="text-gray-500 text-xs ml-2">({t.tactic})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
