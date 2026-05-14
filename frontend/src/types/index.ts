export interface Operator {
  id: string;
  username: string;
  display_name: string;
  role: "admin" | "operator";
  created_at: string;
}

export interface Engagement {
  id: string;
  name: string;
  client_name: string;
  start_date: string | null;
  end_date: string | null;
  status: "Planning" | "Active" | "Completed" | "Archived";
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScopeItem {
  id: string;
  engagement_id: string;
  value: string;
  type: "in_scope" | "out_of_scope";
  notes: string | null;
}

export interface MITRETechnique {
  id: string;
  name: string;
  tactic: string;
  description: string | null;
  url: string | null;
}

export interface OPLOGEntry {
  id: string;
  engagement_id: string;
  operator: { id: string; display_name: string; username: string };
  timestamp: string;
  target: string;
  action_type: string;
  command_action: string;
  outcome: string;
  mitre_technique_id: string | null;
  mitre_technique: MITRETechnique | null;
  notes: string | null;
  is_internal_only: boolean;
  created_at: string;
  scope_status: string | null;
}

export interface Evidence {
  id: string;
  engagement_id: string;
  oplog_entry_id: string | null;
  finding_id: string | null;
  display_id: string | null;
  filename: string;
  file_type: "image" | "text" | "xml" | "other";
  label: string | null;
  description: string | null;
  uploaded_at: string;
}

export interface FindingTemplate {
  id: string;
  title: string;
  severity: string;
  cvss_score: number | null;
  cvss_vector: string | null;
  description: string | null;
  impact: string | null;
  remediation: string | null;
  references: string[];
  mitre_techniques: string[];
  cwe_id: string | null;
  tags: string[];
  is_custom: boolean;
  created_at: string;
}

export interface EngagementFinding {
  id: string;
  engagement_id: string;
  template_id: string | null;
  title: string;
  severity: string;
  cvss_score: number | null;
  cvss_vector: string | null;
  description: string | null;
  impact: string | null;
  remediation: string | null;
  references: string[];
  mitre_techniques: string[];
  cwe_id: string | null;
  status: string;
  created_at: string;
}

export const ACTION_TYPES = [
  "Recon",
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Lateral Movement",
  "Collection",
  "Exfiltration",
  "Social Engineering",
  "Physical",
] as const;

export const OUTCOMES = ["Success", "Failed", "Partial", "Blocked"] as const;
export const SEVERITIES = ["Critical", "High", "Medium", "Low", "Informational"] as const;

export const ACTION_COLORS: Record<string, string> = {
  Recon: "border-purple-500",
  "Initial Access": "border-red-500",
  Execution: "border-orange-500",
  Persistence: "border-red-800",
  "Privilege Escalation": "border-yellow-500",
  "Lateral Movement": "border-teal-500",
  Collection: "border-blue-500",
  Exfiltration: "border-green-500",
  "Social Engineering": "border-pink-500",
  Physical: "border-amber-700",
};

export const OUTCOME_COLORS: Record<string, string> = {
  Success: "text-green-400",
  Failed: "text-red-400",
  Partial: "text-yellow-400",
  Blocked: "text-gray-400",
};
