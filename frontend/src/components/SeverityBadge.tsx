const CLASSES: Record<string, string> = {
  Critical: "badge-critical",
  High: "badge-high",
  Medium: "badge-medium",
  Low: "badge-low",
  Informational: "badge-informational",
};

export default function SeverityBadge({ severity }: { severity: string }) {
  return <span className={CLASSES[severity] || "badge-informational"}>{severity}</span>;
}
