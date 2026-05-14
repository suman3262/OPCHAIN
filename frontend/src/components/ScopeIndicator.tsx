const COLORS: Record<string, string> = {
  in_scope: "bg-green-500",
  out_of_scope: "bg-red-500",
  unknown: "bg-yellow-500",
};

const LABELS: Record<string, string> = {
  in_scope: "In Scope",
  out_of_scope: "OUT OF SCOPE",
  unknown: "Unknown",
};

export default function ScopeIndicator({ status, rule }: { status: string | null; rule?: string | null }) {
  if (!status) return null;
  return (
    <span title={rule ? `Matched: ${rule}` : LABELS[status] || status} className="inline-flex items-center gap-1">
      <span className={`w-2 h-2 rounded-full ${COLORS[status] || "bg-gray-500"}`} />
      <span className={`text-xs ${status === "out_of_scope" ? "text-red-400 font-bold" : status === "in_scope" ? "text-green-400" : "text-yellow-400"}`}>
        {LABELS[status] || status}
      </span>
    </span>
  );
}
