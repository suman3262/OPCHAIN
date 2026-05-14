import api from "./client";
import type {
  Engagement, OPLOGEntry, ScopeItem, Evidence, FindingTemplate, EngagementFinding, MITRETechnique, Operator
} from "../types";

// Auth
export const authAPI = {
  login: (username: string, password: string) =>
    api.post<{ access_token: string }>("/api/auth/login", { username, password }),
  me: () => api.get<Operator>("/api/auth/me"),
};

// Engagements
export const engagementsAPI = {
  list: () => api.get<Engagement[]>("/api/engagements"),
  get: (id: string) => api.get<Engagement>(`/api/engagements/${id}`),
  create: (data: Partial<Engagement>) => api.post<Engagement>("/api/engagements", data),
  update: (id: string, data: Partial<Engagement>) => api.put<Engagement>(`/api/engagements/${id}`, data),
  archive: (id: string) => api.delete(`/api/engagements/${id}`),
};

// OPLOG
export const oplogAPI = {
  list: (engId: string, params?: Record<string, string>) =>
    api.get<OPLOGEntry[]>(`/api/engagements/${engId}/oplog`, { params }),
  create: (engId: string, data: Partial<OPLOGEntry>) =>
    api.post<OPLOGEntry>(`/api/engagements/${engId}/oplog`, data),
  update: (entryId: string, data: Partial<OPLOGEntry>) =>
    api.put<OPLOGEntry>(`/api/oplog/${entryId}`, data),
  delete: (entryId: string) => api.delete(`/api/oplog/${entryId}`),
};

// Scope
export const scopeAPI = {
  list: (engId: string) => api.get<ScopeItem[]>(`/api/engagements/${engId}/scope`),
  bulkAdd: (engId: string, items: Partial<ScopeItem>[]) =>
    api.post<ScopeItem[]>(`/api/engagements/${engId}/scope`, { items }),
  delete: (itemId: string) => api.delete(`/api/scope/${itemId}`),
  check: (engId: string, target: string) =>
    api.post<{ target: string; status: string; matched_rule: string | null }>("/api/scope/check", {
      engagement_id: engId,
      target,
    }),
};

// Evidence
export const evidenceAPI = {
  list: (engId: string, params?: Record<string, string>) =>
    api.get<Evidence[]>(`/api/engagements/${engId}/evidence`, { params }),
  upload: (engId: string, formData: FormData) =>
    api.post<Evidence>(`/api/engagements/${engId}/evidence`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (evId: string, data: Partial<Evidence>) => api.put<Evidence>(`/api/evidence/${evId}`, data),
  delete: (evId: string) => api.delete(`/api/evidence/${evId}`),
  fileUrl: (evId: string) => `/api/evidence/${evId}/file`,
};

// Findings
export const findingsAPI = {
  listLibrary: (params?: Record<string, string>) =>
    api.get<FindingTemplate[]>("/api/findings", { params }),
  createLibrary: (data: Partial<FindingTemplate>) => api.post<FindingTemplate>("/api/findings", data),
  updateLibrary: (id: string, data: Partial<FindingTemplate>) =>
    api.put<FindingTemplate>(`/api/findings/${id}`, data),
  deleteLibrary: (id: string) => api.delete(`/api/findings/${id}`),
  listEngagement: (engId: string) =>
    api.get<EngagementFinding[]>(`/api/engagements/${engId}/findings`),
  addToEngagement: (engId: string, data: { template_id?: string; title?: string; severity?: string }) =>
    api.post<EngagementFinding>(`/api/engagements/${engId}/findings`, data),
  updateEngagement: (engId: string, fid: string, data: Partial<EngagementFinding>) =>
    api.put<EngagementFinding>(`/api/engagements/${engId}/findings/${fid}`, data),
  deleteEngagement: (engId: string, fid: string) =>
    api.delete(`/api/engagements/${engId}/findings/${fid}`),
};

// MITRE
export const mitreAPI = {
  search: (q: string) => api.get<MITRETechnique[]>(`/api/mitre/techniques`, { params: { q } }),
  tactics: () => api.get<string[]>("/api/mitre/tactics"),
};

// Operators
export const operatorsAPI = {
  list: () => api.get<Operator[]>("/api/operators"),
  create: (data: { username: string; display_name: string; password: string; role: string }) =>
    api.post<Operator>("/api/operators", data),
  changePassword: (id: string, new_password: string) =>
    api.put(`/api/operators/${id}/password`, { new_password }),
  delete: (id: string) => api.delete(`/api/operators/${id}`),
};

// Reports
export const reportsAPI = {
  downloadMd: (engId: string, externalSafe = false) => {
    const url = `/api/engagements/${engId}/report/md?external_safe=${externalSafe}`;
    window.open(url, "_blank");
  },
};
