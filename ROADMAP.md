# OPCHAIN — Complete Build Roadmap
## Zero Features Left Behind

> Every task listed here must be completed. This document is the single source of truth
> for what "done" means for the OPCHAIN project.

---

## How to Read This Document

- **Each phase builds on the previous.** Do not start Phase 2 until Phase 1 is fully checked.
- **Backend task always precedes its Frontend task.** Build the API, then the UI that consumes it.
- **"Done" means:** code written + manually verified working + no broken imports/routes.
- Track progress by checking off boxes as tasks complete.

---

## Phase Overview

| Phase | Name | Goal | Key Deliverable |
|-------|------|------|----------------|
| **1** | Core Foundation | Solve the top 3 pain points | A runnable, usable tool in Docker |
| **2** | Collaboration & Polish | Multi-operator + professional output | Real-time sync + full report formats |
| **3** | Power Features | The features that make OPCHAIN exceptional | D3 graphs + full search + dark mode |
| **4** | Community Features | Community ecosystem | CLI tool + tool integrations |

---

---

# PHASE 1 — Core Foundation
### Goal: A single-operator, fully functional pentest operations center in one Docker container.

---

## 1.0 — Project Scaffold & Dev Environment

- [ ] **1.0.1** Create root project directory structure:
  ```
  opchain/
  ├── backend/
  ├── frontend/
  ├── docker/
  ├── docker-compose.yml
  ├── README.md
  └── LICENSE (MIT)
  ```
- [ ] **1.0.2** Initialize Python project in `backend/` — `pyproject.toml` or `requirements.txt`
- [ ] **1.0.3** Initialize React + Vite + TypeScript project in `frontend/`
- [ ] **1.0.4** Install and confirm core backend dependencies:
  - `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `alembic`, `python-jose[cryptography]`,
    `passlib[bcrypt]`, `python-multipart`, `aiofiles`, `pydantic-settings`
- [ ] **1.0.5** Install and confirm core frontend dependencies:
  - `react`, `react-router-dom`, `axios`, `zustand`, `tailwindcss`, `@headlessui/react`,
    `react-dropzone`, `@tanstack/react-query`
- [ ] **1.0.6** Configure TailwindCSS in the frontend project
- [ ] **1.0.7** Set up ESLint + Prettier for frontend
- [ ] **1.0.8** Create `.env.example` with all required environment variables documented
- [ ] **1.0.9** Create `.gitignore` covering Python, Node, and Docker artifacts
- [ ] **1.0.10** Verify `uvicorn main:app --reload` starts without errors (empty FastAPI app)
- [ ] **1.0.11** Verify `vite dev` starts without errors (empty React app)

---

## 1.1 — Backend: Database & Core Setup

- [ ] **1.1.1** Create `backend/core/config.py` — Pydantic Settings class reading from env:
  - `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`
  - `DATABASE_URL` (defaults to `sqlite:///./data/opchain.db`)
  - `EVIDENCE_STORAGE_PATH` (defaults to `./data/evidence/`)
  - `FIRST_RUN_ADMIN_PASSWORD`
- [ ] **1.1.2** Create `backend/core/database.py`:
  - SQLAlchemy engine creation with SQLite
  - `SessionLocal` factory
  - `Base` declarative base
  - `get_db()` dependency function
  - Ensure WAL mode is enabled for SQLite (concurrent reads)
- [ ] **1.1.3** Create `backend/main.py` — FastAPI app entry:
  - App instantiation with title, version, description
  - CORS middleware (allow all origins in dev, configurable in prod)
  - Static file mount for evidence files
  - `startup` event: create DB tables + run first-run admin seeding
  - Include all routers (stub imports are fine at this step)
- [ ] **1.1.4** Set up Alembic for migrations:
  - `alembic init alembic`
  - Configure `alembic.ini` to use `DATABASE_URL` from config
  - Configure `env.py` to import all models and use `Base.metadata`
- [ ] **1.1.5** Verify database file is created on startup and tables are created

---

## 1.2 — Backend: Data Models

- [ ] **1.2.1** Create `backend/models/operator.py`:
  - Fields: `id (UUID PK)`, `username (unique)`, `display_name`, `password_hash`,
    `role (enum: admin/operator)`, `created_at`
- [ ] **1.2.2** Create `backend/models/engagement.py`:
  - Fields: `id (UUID PK)`, `name`, `client_name`, `start_date`, `end_date`,
    `status (enum: Planning/Active/Completed/Archived)`, `description`, `created_at`, `updated_at`
  - Relationships: `operators`, `scope_items`, `oplog_entries`, `findings`
- [ ] **1.2.3** Create `backend/models/scope.py` — `ScopeItem`:
  - Fields: `id (UUID PK)`, `engagement_id (FK)`, `value`, `type (enum: in_scope/out_of_scope)`, `notes`
- [ ] **1.2.4** Create `backend/models/oplog.py` — `OPLOGEntry`:
  - Fields: `id (UUID PK)`, `engagement_id (FK)`, `operator_id (FK)`, `timestamp (auto UTC)`,
    `target`, `action_type (enum)`, `command_action (text)`, `outcome (enum)`,
    `mitre_technique_id`, `notes`, `is_internal_only (bool, default False)`, `created_at`
  - Action type enum: `Recon / Initial Access / Execution / Persistence / Privilege Escalation /
    Lateral Movement / Collection / Exfiltration / Social Engineering / Physical`
  - Outcome enum: `Success / Failed / Partial / Blocked`
- [ ] **1.2.5** Create `backend/models/evidence.py` — `Evidence`:
  - Fields: `id (UUID PK)`, `engagement_id (FK)`, `oplog_entry_id (FK, nullable)`,
    `finding_id (FK, nullable)`, `filename`, `file_type (enum: image/text/xml/other)`,
    `file_path`, `label (enum)`, `description`, `uploaded_at`
  - Label enum: `access-proof / credential / loot / screenshot / scan-output / artifact / exploit-output`
- [ ] **1.2.6** Create `backend/models/finding.py` — Two models:
  - `FindingTemplate` (library): `id`, `title`, `severity (enum)`, `cvss_score`, `cvss_vector`,
    `description (text)`, `impact (text)`, `remediation (text)`, `references (JSON list)`,
    `mitre_techniques (JSON list)`, `cwe_id`, `tags (JSON list)`, `is_custom (bool)`, `created_at`
  - `EngagementFinding`: `id`, `engagement_id (FK)`, `template_id (FK, nullable)`,
    `title`, `severity`, `cvss_score`, `description`, `impact`, `remediation`,
    `status (enum: Open/Remediated/Accepted/False Positive)`, `created_at`
  - Severity enum: `Critical / High / Medium / Low / Informational`
- [ ] **1.2.7** Create `backend/models/mitre.py` — `MITRETechnique`:
  - Fields: `id (T-code string PK)`, `name`, `tactic`, `description`, `url`
- [ ] **1.2.8** Create `backend/models/__init__.py` — import all models for Alembic detection
- [ ] **1.2.9** Generate and run first Alembic migration — verify all tables created correctly
- [ ] **1.2.10** Create association table for `Engagement ↔ Operator` (many-to-many)

---

## 1.3 — Backend: Pydantic Schemas

- [ ] **1.3.1** Create `backend/schemas/operator.py`:
  - `OperatorCreate`, `OperatorUpdate`, `OperatorOut`, `OperatorLogin`
- [ ] **1.3.2** Create `backend/schemas/engagement.py`:
  - `EngagementCreate`, `EngagementUpdate`, `EngagementOut`, `EngagementSummary`
- [ ] **1.3.3** Create `backend/schemas/scope.py`:
  - `ScopeItemCreate`, `ScopeItemBulkCreate`, `ScopeItemOut`, `ScopeCheckRequest`, `ScopeCheckResult`
- [ ] **1.3.4** Create `backend/schemas/oplog.py`:
  - `OPLOGEntryCreate`, `OPLOGEntryUpdate`, `OPLOGEntryOut`, `OPLOGFilter`
- [ ] **1.3.5** Create `backend/schemas/evidence.py`:
  - `EvidenceOut`, `EvidenceUpdate`, `EvidenceMetadata`
- [ ] **1.3.6** Create `backend/schemas/finding.py`:
  - `FindingTemplateCreate`, `FindingTemplateUpdate`, `FindingTemplateOut`
  - `EngagementFindingCreate`, `EngagementFindingUpdate`, `EngagementFindingOut`
- [ ] **1.3.7** Create `backend/schemas/mitre.py`:
  - `MITRETechniqueOut`, `MITRETacticOut`
- [ ] **1.3.8** Create `backend/schemas/auth.py`:
  - `Token`, `TokenData`

---

## 1.4 — Backend: Authentication System

- [ ] **1.4.1** Create `backend/core/security.py`:
  - `hash_password(password)` using bcrypt
  - `verify_password(plain, hashed)`
  - `create_access_token(data, expires_delta)` using python-jose JWT
  - `decode_token(token)` → returns `TokenData`
- [ ] **1.4.2** Create `backend/core/dependencies.py`:
  - `get_current_operator(token, db)` — JWT validation dependency
  - `require_admin(current_operator)` — role check dependency
- [ ] **1.4.3** Create `backend/routers/auth.py`:
  - `POST /api/auth/login` — validate credentials, return JWT token
  - `POST /api/auth/logout` — (stateless JWT; return success, client discards token)
  - `GET /api/auth/me` — return current operator info
- [ ] **1.4.4** First-run seeding logic in `main.py` startup:
  - Check if any admin operator exists
  - If not, create admin with `FIRST_RUN_ADMIN_PASSWORD` from env
- [ ] **1.4.5** Test: login with correct credentials returns token
- [ ] **1.4.6** Test: protected routes reject requests without valid token
- [ ] **1.4.7** Test: protected routes reject expired tokens

---

## 1.5 — Backend: Engagement API

- [ ] **1.5.1** Create `backend/routers/engagements.py`:
  - `GET /api/engagements` — list all (summary data only, no nested relations)
  - `POST /api/engagements` — create new engagement, auto-assign creating operator
  - `GET /api/engagements/{id}` — full engagement detail with relations
  - `PUT /api/engagements/{id}` — update fields
  - `DELETE /api/engagements/{id}` — set status to Archived (soft delete)
- [ ] **1.5.2** Operator assignment endpoints (within engagement router):
  - `POST /api/engagements/{id}/operators/{operator_id}` — add operator to engagement
  - `DELETE /api/engagements/{id}/operators/{operator_id}` — remove operator
- [ ] **1.5.3** Test all 5 CRUD endpoints with valid and invalid data

---

## 1.6 — Backend: Scope API & Scope Checker Service

- [ ] **1.6.1** Create `backend/services/scope_checker.py`:
  - `check_target(target: str, scope_items: list[ScopeItem]) → ScopeCheckResult`
  - Handle: plain IP match, CIDR range check (using `ipaddress` stdlib), wildcard domain match,
    exact domain match, out-of-scope priority (out-of-scope overrides in-scope)
  - Return: `{ status: "in_scope" | "out_of_scope" | "unknown", matched_rule: str | None }`
- [ ] **1.6.2** Create `backend/routers/scope.py`:
  - `GET /api/engagements/{id}/scope` — list all scope items for engagement
  - `POST /api/engagements/{id}/scope` — bulk add scope items (accepts list)
  - `DELETE /api/scope/{item_id}` — remove a scope item
  - `POST /api/scope/check` — validate target against engagement scope (requires `engagement_id` in body)
- [ ] **1.6.3** Test CIDR matching: `10.0.0.5` against `10.0.0.0/24` → in_scope
- [ ] **1.6.4** Test wildcard domain: `sub.acme.com` against `*.acme.com` → in_scope
- [ ] **1.6.5** Test out-of-scope priority: IP in both in-scope CIDR and explicit out-of-scope → out_of_scope
- [ ] **1.6.6** Test unknown: target with no matching rule → unknown

---

## 1.7 — Backend: OPLOG API

- [ ] **1.7.1** Create `backend/routers/oplog.py`:
  - `GET /api/engagements/{id}/oplog` — list entries with optional query filters:
    - `?operator_id=`, `?action_type=`, `?outcome=`, `?mitre_technique_id=`, `?search=` (text)
  - `POST /api/engagements/{id}/oplog` — create entry (auto-set timestamp + operator from JWT)
  - `GET /api/oplog/{entry_id}` — single entry detail
  - `PUT /api/oplog/{entry_id}` — update entry (only by owning operator or admin)
  - `DELETE /api/oplog/{entry_id}` — delete entry
- [ ] **1.7.2** On OPLOG entry create: run scope check on `target` field automatically,
      attach scope status to response (do not block — just inform)
- [ ] **1.7.3** Test: create entry with all fields populated
- [ ] **1.7.4** Test: filter by action_type returns only matching entries
- [ ] **1.7.5** Test: operator can only update/delete their own entries (unless admin)

---

## 1.8 — Backend: Evidence API

- [ ] **1.8.1** Create evidence storage directory on startup if not exists
- [ ] **1.8.2** Create `backend/routers/evidence.py`:
  - `POST /api/engagements/{id}/evidence` — multipart file upload:
    - Save file to `EVIDENCE_STORAGE_PATH/{engagement_id}/{uuid}_{filename}`
    - Detect file type from extension/mime
    - Store metadata in DB
    - Return evidence record with `EV-{sequence_number}` display ID
  - `GET /api/engagements/{id}/evidence` — list all evidence, filterable by type/label/linked status
  - `PUT /api/evidence/{ev_id}` — update metadata (label, description, oplog link, finding link)
  - `DELETE /api/evidence/{ev_id}` — delete DB record + remove file from disk
  - `GET /api/evidence/{ev_id}/file` — stream file to client
- [ ] **1.8.3** Generate sequential `EV-XXXX` display IDs per engagement (not UUID — human readable)
- [ ] **1.8.4** Test: upload PNG returns valid evidence record
- [ ] **1.8.5** Test: upload and link to an OPLOG entry
- [ ] **1.8.6** Test: delete evidence removes file from disk

---

## 1.9 — Backend: Finding Library API

- [ ] **1.9.1** Create `backend/data/default_findings.json` — full 80+ pre-loaded findings data:
  - Web Application (18 findings)
  - Network / Infrastructure (12 findings)
  - Active Directory / Windows (15 findings)
  - Cloud (7 findings)
  - Authentication (6 findings)
  - Social Engineering (5 findings)
  - (Additional miscellaneous to reach 80+)
  - Each finding: title, severity, cvss_score, cvss_vector, description, impact, remediation,
    references, mitre_techniques, cwe_id, tags
- [ ] **1.9.2** Seed finding library on first run (check if library is empty before seeding)
- [ ] **1.9.3** Create `backend/routers/findings.py` — Library endpoints:
  - `GET /api/findings` — list library findings, filterable by severity/tag/search
  - `POST /api/findings` — create custom finding in library
  - `PUT /api/findings/{id}` — update library finding
  - `DELETE /api/findings/{id}` — delete library finding (block if referenced by engagements)
- [ ] **1.9.4** Engagement finding endpoints (same file):
  - `GET /api/engagements/{id}/findings` — list findings added to engagement
  - `POST /api/engagements/{id}/findings` — add finding to engagement:
    - If `template_id` provided: clone template data into new `EngagementFinding`
    - If no `template_id`: create standalone finding from scratch
  - `PUT /api/engagements/{id}/findings/{finding_id}` — edit engagement finding (does not affect library)
  - `DELETE /api/engagements/{id}/findings/{finding_id}` — remove from engagement
- [ ] **1.9.5** Test: seed runs, 80+ findings present in library
- [ ] **1.9.6** Test: clone finding from library to engagement, edit it, confirm library unchanged

---

## 1.10 — Backend: MITRE ATT&CK Data

- [ ] **1.10.1** Obtain MITRE ATT&CK Enterprise JSON dataset (STIX format from mitre.org)
        and convert to simplified format: `[{ id, name, tactic, description, url }]`
- [ ] **1.10.2** Save as `backend/data/mitre_techniques.json`
- [ ] **1.10.3** Seed MITRE data into DB on startup (check if empty before seeding)
- [ ] **1.10.4** Create `backend/routers/mitre.py`:
  - `GET /api/mitre/techniques` — list/search techniques (`?q=` for search, `?tactic=` for filter)
  - `GET /api/mitre/tactics` — list all distinct tactics
  - `GET /api/mitre/techniques/{id}` — single technique detail
- [ ] **1.10.5** Test: search `?q=kerberos` returns Kerberoasting and related techniques

---

## 1.11 — Backend: Report Generator (Markdown)

- [ ] **1.11.1** Create `backend/services/report_generator.py`:
  - `generate_markdown(engagement_id, options, db) → str`
  - Assemble sections in order:
    1. Cover Page (client, engagement name, dates, classification)
    2. Executive Summary (placeholder fields for operator to fill)
    3. Findings Summary Table (severity, title, status — sorted Critical→Info)
    4. Detailed Findings (description, impact, evidence list, remediation, references)
    5. OPLOG Appendix (full timestamped log, redact `is_internal_only` entries if `external_safe=True`)
    6. Scope Reference (in-scope and out-of-scope lists)
  - Use Jinja2 templates for clean separation of content and format
- [ ] **1.11.2** Create Jinja2 template: `backend/templates/report.md.j2`
- [ ] **1.11.3** Create `backend/routers/reports.py`:
  - `POST /api/engagements/{id}/report/generate` — trigger generation, return report metadata
  - `GET /api/engagements/{id}/report/md` — download Markdown report
- [ ] **1.11.4** Test: generate markdown report for a populated engagement
- [ ] **1.11.5** Test: `is_internal_only` entries excluded when `external_safe=True`

---

## 1.12 — Backend: Operator Management API

- [ ] **1.12.1** Create `backend/routers/operators.py`:
  - `GET /api/operators` — list all operators (admin only)
  - `POST /api/operators` — create new operator (admin only)
  - `PUT /api/operators/{id}` — update display name or role (admin only)
  - `PUT /api/operators/{id}/password` — change own password (any operator) or any password (admin)
  - `DELETE /api/operators/{id}` — deactivate operator (admin only)
- [ ] **1.12.2** Test: non-admin cannot access admin-only endpoints

---

## 1.13 — Frontend: Project Structure & Routing

- [ ] **1.13.1** Configure `vite.config.ts` with API proxy (`/api` → `http://localhost:8000`)
- [ ] **1.13.2** Create `frontend/src/api/client.ts` — Axios instance:
  - Base URL from env
  - Request interceptor: attach JWT token from localStorage
  - Response interceptor: on 401, clear token + redirect to login
- [ ] **1.13.3** Create API modules (one file per resource):
  - `api/auth.ts`, `api/engagements.ts`, `api/oplog.ts`, `api/scope.ts`,
    `api/evidence.ts`, `api/findings.ts`, `api/mitre.ts`, `api/reports.ts`, `api/operators.ts`
- [ ] **1.13.4** Create `frontend/src/store/` — Zustand stores:
  - `authStore.ts` — current operator, token, login/logout actions
  - `engagementStore.ts` — active engagement, engagement list
  - `uiStore.ts` — sidebar state, active page, dark mode (stub for now)
- [ ] **1.13.5** Set up React Router v6 with routes:
  - `/login` → `LoginPage`
  - `/` → redirect to `/dashboard`
  - `/dashboard` → `DashboardPage` (protected)
  - `/oplog` → `OPLOGPage` (protected)
  - `/scope` → `ScopePage` (protected)
  - `/evidence` → `EvidencePage` (protected)
  - `/findings` → `FindingsPage` (protected)
  - `/attack-path` → `AttackPathPage` (protected)
  - `/report` → `ReportPage` (protected)
  - `/settings` → `SettingsPage` (protected)
- [ ] **1.13.6** Create `ProtectedRoute` component — redirect to login if no token
- [ ] **1.13.7** Create persistent `AppLayout` component:
  - Left sidebar (fixed width)
  - Main content area (scrollable)
  - Top bar with active engagement name + operator info

---

## 1.14 — Frontend: App Layout & Sidebar

- [ ] **1.14.1** Create `components/Sidebar.tsx`:
  - OPCHAIN logo + version
  - Engagement switcher dropdown (lists all engagements, click to set active)
  - Nav links with active state highlighting:
    Dashboard / OPLOG / Scope / Evidence / Findings / Attack Path / Report / Settings
  - Current operator display name + role badge at bottom
  - Logout button
- [ ] **1.14.2** Create `components/EngagementSwitcher.tsx`:
  - Dropdown listing all engagements with status badge
  - "New Engagement" button opens create modal
  - Active engagement highlighted
- [ ] **1.14.3** Create `components/CreateEngagementModal.tsx`:
  - Fields: name, client name, start date, end date, description
  - On submit: POST to API, update store, switch to new engagement

---

## 1.15 — Frontend: Login Page

- [ ] **1.15.1** Create `pages/LoginPage.tsx`:
  - Username + password fields
  - Submit calls `POST /api/auth/login`
  - On success: store token in localStorage + authStore, redirect to `/dashboard`
  - On failure: show error message
  - No header/sidebar — standalone centered layout
  - OPCHAIN branding

---

## 1.16 — Frontend: OPLOG Page

- [ ] **1.16.1** Create `components/OPLOGForm.tsx` — the OPLOG entry form:
  - Target input — text field, real-time scope validation indicator (color dot: green/red/yellow)
    (calls `POST /api/scope/check` on blur or after 500ms debounce)
  - Action type — styled dropdown (enum values)
  - Command/Action — textarea with Markdown support indicator (not rendered, just monospace)
  - Outcome — dropdown
  - MITRE technique — searchable dropdown (calls `GET /api/mitre/techniques?q=` as user types,
    shows T-code + name in results, stores T-code)
  - Notes — optional textarea
  - Submit button + keyboard shortcut (Enter when form is filled)
  - Tab order: Target → Action Type → Command → Outcome → MITRE → Notes → Submit
- [ ] **1.16.2** Create `components/ScopeIndicator.tsx`:
  - Small colored dot + tooltip showing scope status
  - Green = in_scope, Red = out_of_scope, Yellow = unknown
  - Shows matched rule in tooltip
- [ ] **1.16.3** Create `components/OPLOGTimeline.tsx`:
  - Chronological list of entries (newest first option + oldest first toggle)
  - Each entry card shows: timestamp, operator name, target (with scope indicator), action type badge,
    command (truncated, expand on click), outcome badge, MITRE T-code chip, evidence count
  - Color coding by action type (each type gets a distinct left border color)
  - Click entry to expand full detail
- [ ] **1.16.4** Create `components/OPLOGFilterBar.tsx`:
  - Filter chips: All / by operator / by action type / by outcome / by MITRE technique
  - Search input (full text across target, command, notes)
  - Clear all filters button
- [ ] **1.16.5** Create `pages/OPLOGPage.tsx`:
  - Top: `OPLOGForm` (always visible, sticky)
  - Middle: `OPLOGFilterBar`
  - Bottom: `OPLOGTimeline`
  - On form submit: POST to API, prepend new entry to timeline without full reload
- [ ] **1.16.6** Evidence quick-attach from OPLOG entry: "Attach Evidence" button on each entry
        opens file picker, uploads and links evidence in one action

---

## 1.17 — Frontend: Scope Page

- [ ] **1.17.1** Create `pages/ScopePage.tsx`
- [ ] **1.17.2** Create `components/ScopeImport.tsx`:
  - Large textarea: paste CIDRs, IPs, domains (one per line)
  - Radio: "In Scope" / "Out of Scope"
  - Optional notes field
  - Parse and POST bulk create to API
  - File upload option: accept `.txt` file, parse same format
- [ ] **1.17.3** Create `components/ScopeList.tsx`:
  - Separate lists for In-Scope and Out-of-Scope items
  - Color-coded entries (green/red)
  - Delete button per item (with confirm)
  - Item count badges on each section header
- [ ] **1.17.4** Create `components/ScopeChecker.tsx`:
  - Standalone input box: "Check any target"
  - On submit: calls scope check API
  - Shows result with color + matched rule explanation
- [ ] **1.17.5** Export scope button: download scope list as `.txt`

---

## 1.18 — Frontend: Evidence Page (Basic Upload)

- [ ] **1.18.1** Create `components/EvidenceUploadZone.tsx`:
  - Drag-and-drop zone (using react-dropzone)
  - Click to browse fallback
  - After file selection: show metadata form (label dropdown, description text, link to OPLOG entry optional)
  - POST upload with metadata
  - Progress indicator during upload
- [ ] **1.18.2** Create `components/EvidenceCard.tsx`:
  - Image evidence: shows thumbnail
  - Text/XML evidence: shows file icon + filename
  - Displays: `EV-XXXX` ID, label badge, filename, upload date
  - Linked OPLOG entry / finding chip (if linked)
  - Download button, Delete button
- [ ] **1.18.3** Create `pages/EvidencePage.tsx`:
  - Top: `EvidenceUploadZone`
  - Body: grid of `EvidenceCard` components
  - Filter bar: by type (image/text/xml), by label, by linked status (linked/unlinked)
  - "Unlinked Evidence" section highlighted — evidence not yet attached to entry or finding

---

## 1.19 — Frontend: Findings Page

- [ ] **1.19.1** Create `components/FindingCard.tsx`:
  - Severity badge (color coded: Critical=red, High=orange, Medium=yellow, Low=blue, Info=gray)
  - Title, CWE ID, MITRE technique chips, tags
  - "Add to Engagement" button (for library view)
  - "Edit" / "Clone" buttons
- [ ] **1.19.2** Create `components/FindingDetail.tsx` — slide-over panel:
  - Full description (Markdown rendered)
  - Impact section
  - Remediation section
  - References list (clickable links)
  - CVSS score display + vector string
  - Evidence attached (for engagement findings)
  - Edit inline for engagement findings
- [ ] **1.19.3** Create `components/FindingSearchBar.tsx`:
  - Text search input
  - Severity filter (multi-select chips)
  - Tag filter
  - MITRE technique filter
- [ ] **1.19.4** Create `pages/FindingsPage.tsx` with two tabs:
  - **Tab 1: Finding Library** — search/browse `FindingCard` grid, add to engagement
  - **Tab 2: Engagement Findings** — findings added to active engagement,
    with status (Open/Remediated/Accepted/False Positive), evidence count, edit
- [ ] **1.19.5** "Create Custom Finding" form (modal):
  - All finding fields (title, severity, description, impact, remediation, references, MITRE, CWE, tags)
  - Save to library or directly to engagement

---

## 1.20 — Frontend: Dashboard Page (Basic)

- [ ] **1.20.1** Create `pages/DashboardPage.tsx`:
  - Engagement summary card: name, client, status badge, start/end dates
  - Stats row: OPLOG entry count, finding count (by severity), evidence count
  - Recent OPLOG entries: last 10 entries in compact list
  - Quick-add OPLOG button (opens OPLOGForm in modal or navigates to /oplog)
  - Findings severity breakdown — simple horizontal bar (CSS only, no chart lib yet)

---

## 1.21 — Frontend: Settings Page (Basic)

- [ ] **1.21.1** Create `pages/SettingsPage.tsx` with sections:
  - **Engagements**: list all, create new, archive, view detail
  - **Operators**: list all (admin view), create new operator, change password
  - **System**: version display, database location, evidence path

---

## 1.22 — Docker: Single Container Build

- [ ] **1.22.1** Create `docker/Dockerfile`:
  - Multi-stage build:
    - Stage 1 (node): build frontend, output to `/app/frontend/dist`
    - Stage 2 (python): install backend deps, copy built frontend
  - Single-stage final image based on `python:3.11-slim`
  - Frontend static files served by FastAPI `StaticFiles` mount
  - Expose port 8080
  - ENTRYPOINT: `entrypoint.sh`
- [ ] **1.22.2** Create `docker/entrypoint.sh`:
  - Create data directories if not exist (`/app/data/`, `/app/data/evidence/`)
  - Run Alembic migrations (`alembic upgrade head`)
  - Start uvicorn on `0.0.0.0:8080`
- [ ] **1.22.3** Create `docker-compose.yml`:
  ```yaml
  services:
    opchain:
      build: .
      ports: ["8080:8080"]
      volumes: ["./opchain-data:/app/data"]
      environment:
        - SECRET_KEY=change_this
        - FIRST_RUN_ADMIN_PASSWORD=admin123
  ```
- [ ] **1.22.4** Build and run: `docker-compose up --build`
- [ ] **1.22.5** Verify image size is under 150MB
- [ ] **1.22.6** Verify cold start (from `docker-compose up`) completes in under 5 seconds
- [ ] **1.22.7** Verify login, create engagement, create OPLOG entry, upload evidence — all work in Docker

---

## Phase 1 Exit Criteria

Before moving to Phase 2, all of these must be true:

- [ ] A single `docker-compose up` command starts OPCHAIN on port 8080
- [ ] Login works with the admin account created from env var
- [ ] Create an engagement, add scope, log OPLOG entries, scope indicator colors correctly
- [ ] Upload evidence and link it to an OPLOG entry
- [ ] Browse finding library, add a finding to the engagement
- [ ] Generate a Markdown report that includes findings + OPLOG appendix
- [ ] Internal-only OPLOG entries are excluded from external report export
- [ ] All API endpoints return correct status codes for invalid requests (400/401/403/404)
- [ ] Docker image size < 150MB

---
---

# PHASE 2 — Collaboration & Polish
### Goal: Multi-operator real-time sync + professional report output (HTML + DOCX)

---

## 2.1 — Backend: WebSocket Real-Time OPLOG Sync

- [ ] **2.1.1** Create `backend/services/ws_manager.py` — WebSocket connection manager:
  - `connect(websocket, engagement_id, operator_id)`
  - `disconnect(websocket, engagement_id)`
  - `broadcast_to_engagement(engagement_id, message)` — send to all connected clients in same engagement
  - Track connections: `Dict[engagement_id, Dict[operator_id, WebSocket]]`
- [ ] **2.1.2** Add WebSocket endpoint to `backend/routers/oplog.py`:
  - `WS /ws/engagements/{id}/oplog` — upgrade connection, authenticate via token query param
  - On connect: broadcast `operator:joined` event to engagement room
  - On disconnect: broadcast `operator:left` event
- [ ] **2.1.3** Emit WebSocket events on OPLOG mutations:
  - After `POST /api/engagements/{id}/oplog` → broadcast `oplog:new_entry` with full entry data
  - After `PUT /api/oplog/{entry_id}` → broadcast `oplog:update`
  - After `DELETE /api/oplog/{entry_id}` → broadcast `oplog:delete` with entry ID
- [ ] **2.1.4** Emit `scope:updated` event after scope list changes
- [ ] **2.1.5** Test: two browser sessions on same engagement — entry created in session A appears in session B without refresh

---

## 2.2 — Frontend: WebSocket Client

- [ ] **2.2.1** Create `frontend/src/ws/oplogSocket.ts`:
  - Connect to `WS /ws/engagements/{id}/oplog?token={jwt}`
  - Auto-reconnect on disconnect (exponential backoff, max 5 attempts)
  - Event handler registration: `on('oplog:new_entry', handler)`
  - Connection status tracking: `connected | disconnected | reconnecting`
- [ ] **2.2.2** Integrate socket into `OPLOGTimeline.tsx`:
  - On `oplog:new_entry`: prepend entry to local state (animate in)
  - On `oplog:update`: update matching entry in local state
  - On `oplog:delete`: remove matching entry from local state
  - Show "Live" indicator when connected (pulsing green dot)
- [ ] **2.2.3** On `scope:updated`: refetch scope list in Scope store

---

## 2.3 — Frontend: Operator Presence Indicators

- [ ] **2.3.1** Create `frontend/src/store/presenceStore.ts`:
  - Track online operators per engagement
  - Update on `operator:joined` / `operator:left` WebSocket events
- [ ] **2.3.2** Create `components/OperatorPresence.tsx`:
  - Row of avatar circles in sidebar (operator initials)
  - Tooltip on hover: operator display name, "online now"
  - Count badge if >5 operators ("3 more online")
- [ ] **2.3.3** Add `OperatorPresence` to `Sidebar.tsx`
- [ ] **2.3.4** Each OPLOG entry card: show operator's initials/name clearly

---

## 2.4 — Frontend: Evidence Locker Gallery & Drag-Drop Attach

- [ ] **2.4.1** Upgrade `EvidencePage.tsx` to full gallery view:
  - Grid layout: image thumbnails for images, file-type icons for others
  - Click image: lightbox/modal for full-size view
  - Filter sidebar: by type, by label, by finding link, by OPLOG link
- [ ] **2.4.2** "Unlinked Evidence" section at top — all evidence without any links (attention needed)
- [ ] **2.4.3** Drag-drop attach: drag evidence card onto an OPLOG entry → links them
      (visual drop zones on OPLOG entries when drag is in progress)
- [ ] **2.4.4** Bulk attach tool:
  - Multi-select evidence (checkboxes)
  - "Attach selected to..." → pick OPLOG entry or Finding from dropdown
  - Submit links all selected evidence

---

## 2.5 — Frontend: CVSS v3.1 Calculator

- [ ] **2.5.1** Create `components/CVSSCalculator.tsx`:
  - All 8 CVSS v3.1 base metric dropdowns:
    AV, AC, PR, UI, S, C, I, A (with full label explanations as tooltips)
  - Live CVSS score calculation as metrics change (pure frontend formula — no API call)
  - Score display: numeric + severity label + color bar
  - Auto-generate vector string (`CVSS:3.1/AV:N/AC:L/...`)
  - "Apply to Finding" button — sets score + vector on active finding
- [ ] **2.5.2** Embed `CVSSCalculator` inline in `FindingDetail.tsx` for engagement findings
- [ ] **2.5.3** Test: all metric combinations produce correct scores (verify against NVD calculator for spot checks)

---

## 2.6 — Backend: HTML Report Export

- [ ] **2.6.1** Create Jinja2 HTML template `backend/templates/report.html.j2`:
  - Self-contained single HTML file (all CSS inline, no external CDN dependencies)
  - Professional dark-themed design suitable for client delivery
  - Sections matching Markdown report structure
  - Image evidence embedded as base64 data URIs
  - Findings table with severity color coding
  - OPLOG appendix in monospace table format
- [ ] **2.6.2** Add `generate_html(engagement_id, options, db) → str` to `report_generator.py`
- [ ] **2.6.3** Add `GET /api/engagements/{id}/report/html` endpoint
- [ ] **2.6.4** Test: HTML report opens in browser, images load, all sections present

---

## 2.7 — Backend: DOCX Report Export (Default Template)

- [ ] **2.7.1** Create default DOCX template `backend/templates/opchain_default.docx`:
  - Professional layout with OPCHAIN branding as placeholder
  - Styles defined for: Heading1, Heading2, Heading3, Normal, Code, SeverityCritical,
    SeverityHigh, SeverityMedium, SeverityLow, TableHeader, TableCell
- [ ] **2.7.2** Add `generate_docx(engagement_id, options, db) → bytes` to `report_generator.py`
        using `python-docx`:
  - Apply heading styles from template
  - Insert findings table with proper column widths
  - Embed evidence images inline at correct finding sections
  - Format OPLOG appendix as table
- [ ] **2.7.3** Add `GET /api/engagements/{id}/report/docx` endpoint
- [ ] **2.7.4** Test: DOCX opens in LibreOffice and MS Word without errors, formatting correct

---

## 2.8 — Backend: MITRE ATT&CK Searchable Dropdown (Full Dataset)

- [ ] **2.8.1** Ensure full MITRE ATT&CK Enterprise dataset is seeded (all tactics, all techniques,
      all sub-techniques — approximately 600+ techniques)
- [ ] **2.8.2** Optimize `GET /api/mitre/techniques?q=` query:
  - Use SQLite FTS5 (full-text search) or at minimum `LIKE` with index
  - Return top 20 results ordered by relevance
  - Response includes: `id (T-code)`, `name`, `tactic`, `sub_technique (bool)`
- [ ] **2.8.3** Test: `?q=T1078` returns exact technique; `?q=valid accounts` returns same technique

---

## 2.9 — Frontend: MITRE Technique Searchable Dropdown

- [ ] **2.9.1** Create `components/MITRESearchDropdown.tsx`:
  - Controlled input with debounced search (300ms)
  - Calls `GET /api/mitre/techniques?q={query}`
  - Results dropdown: shows `T1078 — Valid Accounts (Credential Access)` format
  - Keyboard nav: arrow up/down, Enter to select, Escape to close
  - Selected value shows T-code chip with remove button
  - No selection required (nullable field)
- [ ] **2.9.2** Replace plain text MITRE field in `OPLOGForm` with `MITRESearchDropdown`

---

## 2.10 — Backend: OPLOG Export (CSV + JSON)

- [ ] **2.10.1** Add export endpoint to `backend/routers/oplog.py`:
  - `GET /api/engagements/{id}/oplog/export?format=csv` — CSV download
  - `GET /api/engagements/{id}/oplog/export?format=json` — JSON download
  - Both respect `is_internal_only` filter via `?external_safe=true` param
  - CSV columns: timestamp, operator, target, action_type, command_action, outcome, mitre_technique, notes
- [ ] **2.10.2** Frontend: "Export OPLOG" button on `OPLOGPage`:
  - Dropdown: CSV / JSON / External-Safe CSV / External-Safe JSON
  - Triggers download

---

## 2.11 — Backend: Finding Library JSON Import/Export

- [ ] **2.11.1** Add to `backend/routers/findings.py`:
  - `GET /api/findings/export` — export full library as JSON (array of `FindingTemplate` objects)
  - `POST /api/findings/import` — accept JSON body (array), validate schema, insert non-duplicate findings
    - Match duplicates by `title` (case-insensitive) — skip or update (option in request)
- [ ] **2.11.2** Frontend: `SettingsPage.tsx` — Finding Library section:
  - "Export Library" button → downloads JSON
  - "Import Library" button → file picker for JSON, shows preview count, confirm import

---

## 2.12 — Frontend: Attack Path Visualizer — Kill Chain Flow View

- [ ] **2.12.1** Create `components/AttackPathCanvas.tsx` — Kill chain flow view:
  - Column layout: one column per MITRE ATT&CK tactic (in standard kill chain order:
    Recon → Resource Dev → Initial Access → Execution → Persistence → Priv Esc →
    Defense Evasion → Credential Access → Discovery → Lateral Movement → Collection →
    C2 → Exfiltration → Impact)
  - Each column shows OPLOG entries tagged with techniques belonging to that tactic
  - Entry cards: target, action summary, technique T-code chip, timestamp
  - Click entry: shows full OPLOG detail in side panel
  - Drag OPLOG entries between columns to re-assign tactic (updates OPLOG entry)
- [ ] **2.12.2** Create `pages/AttackPathPage.tsx`:
  - Top: view toggle (Kill Chain Flow / Network Graph — network graph is Phase 3)
  - Tabs: one per operator (filter by operator)
  - Full width canvas area
  - Export buttons: SVG / PNG
- [ ] **2.12.3** SVG/PNG export of the kill chain view
- [ ] **2.12.4** Auto-embed this diagram in report when generated

---

## Phase 2 Exit Criteria

- [ ] Two browser sessions on same engagement see each other's OPLOG entries in real time
- [ ] Online operator avatars appear in sidebar
- [ ] Evidence drag-drop attach works
- [ ] CVSS calculator produces correct scores for all metric combos
- [ ] HTML report is a self-contained file that opens in any browser, images embedded
- [ ] DOCX report opens in Word/LibreOffice, all sections formatted correctly
- [ ] MITRE searchable dropdown returns relevant results in under 300ms
- [ ] OPLOG CSV export opens correctly in spreadsheet application
- [ ] Finding library JSON export can be re-imported without errors
- [ ] Kill chain flow view shows OPLOG entries grouped by tactic correctly

---
---

# PHASE 3 — Power Features
### Goal: The features that make OPCHAIN exceptional and production-grade.

---

## 3.1 — Frontend: Attack Path Network Graph View (D3.js)

- [ ] **3.1.1** Install D3.js in frontend: `npm install d3 @types/d3`
- [ ] **3.1.2** Create `components/NetworkGraph.tsx` — D3 force-directed graph:
  - **Nodes**: each unique target in OPLOG is a node (circle)
    - Node color by compromise status (derived from OPLOG outcomes):
      - Gray = scanned/probed only
      - Yellow = partial compromise
      - Red = fully compromised
    - Node size by number of OPLOG actions on that target
    - Node label: IP/hostname
  - **Edges**: directional arrows between targets representing lateral movement
    (Lateral Movement action type creates edges)
  - Force simulation for auto-layout (charge, link, center forces)
  - Zoom + pan
  - Click node: side panel with all OPLOG entries on that target
  - Drag nodes to re-position (pin on drag)
- [ ] **3.1.3** Toggle between Kill Chain Flow view and Network Graph view on `AttackPathPage`
- [ ] **3.1.4** Export network graph as SVG and PNG
- [ ] **3.1.5** Embed network graph in report (auto-detect if lateral movement entries exist)
- [ ] **3.1.6** Test: engagement with pivot chain (A→B→C lateral movement) renders 3 connected nodes

---

## 3.2 — Backend: Custom DOCX Template Upload & Injection

- [ ] **3.2.1** Add template upload endpoint:
  - `POST /api/settings/report-template` — upload branded `.docx` template file
  - Validate it's a valid DOCX (open with python-docx, check no errors)
  - Store as `data/templates/custom_template.docx`
  - `GET /api/settings/report-template` — returns template metadata (name, uploaded date)
  - `DELETE /api/settings/report-template` — revert to default template
- [ ] **3.2.2** Implement DOCX template injection in `report_generator.py`:
  - Open custom template instead of default
  - Find placeholder text markers in template (e.g. `{{FINDINGS_TABLE}}`, `{{OPLOG_APPENDIX}}`)
  - Replace markers with generated content using python-docx
  - Preserve all other template formatting, styles, headers, footers, logos
- [ ] **3.2.3** Define and document the template placeholder format (for users creating their own templates)
- [ ] **3.2.4** Frontend `ReportPage.tsx`:
  - Template selector: "OPCHAIN Default" / "Custom (Uploaded)" radio
  - Upload template button (only visible to admin)
  - Warns if custom template not uploaded
- [ ] **3.2.5** Test: branded template with company logo + placeholders generates report with logo intact

---

## 3.3 — Backend & Frontend: Report Redaction Mode

- [ ] **3.3.1** Ensure `is_internal_only` boolean exists on `OPLOGEntry` model (Phase 1)
- [ ] **3.3.2** Frontend: toggle on each OPLOG entry card — "Internal Only" switch (lock icon)
        PUT to API to update `is_internal_only` flag
- [ ] **3.3.3** Internal-only entries visually distinguished in timeline (e.g. subtle background, lock badge)
- [ ] **3.3.4** Report generation options in `ReportPage.tsx`:
  - "OPLOG in report": All Entries / External-Safe Only (exclude internal) / None
  - When "External-Safe Only": all `is_internal_only=True` entries excluded from OPLOG appendix
- [ ] **3.3.5** Test: mark 3 entries as internal → generate external report → confirm 3 entries absent

---

## 3.4 — Backend: Programmatic Scope Check API (Public Endpoint)

- [ ] **3.4.1** Add scope check endpoint callable without UI (for tool integration):
  - `POST /api/scope/check` — accepts `{ engagement_id, targets: [string] }` (array of targets)
  - Returns `{ results: [{ target, status, matched_rule }] }` for each target
  - Authenticated via JWT (normal auth)
- [ ] **3.4.2** Rate limit this endpoint (10 requests/second per operator) to prevent abuse
- [ ] **3.4.3** Document this endpoint for CLI tool use (Phase 4)
- [ ] **3.4.4** Test: batch check 5 targets, mix of in/out/unknown, get correct results for each

---

## 3.5 — Finding Community Packs

- [ ] **3.5.1** Design community pack JSON format (extension of existing finding JSON schema):
  ```json
  {
    "pack_name": "Active Directory Attack Pack",
    "pack_version": "1.0",
    "pack_author": "...",
    "findings": [ ...FindingTemplate objects... ]
  }
  ```
- [ ] **3.5.2** Create 3 community packs as JSON files (ship with OPCHAIN):
  - `packs/active_directory_pack.json` — all AD/Kerberos/BloodHound findings
  - `packs/cloud_pack.json` — AWS, Azure, GCP misconfiguration findings
  - `packs/owasp_top10_pack.json` — OWASP Top 10 2021 findings with full detail
- [ ] **3.5.3** Pack import endpoint (extend existing import):
  - `POST /api/findings/import/pack` — accepts pack JSON, imports with pack_name tagging
  - Skip duplicates by title match
  - Tag all imported findings with pack name for filtering
- [ ] **3.5.4** Frontend: `SettingsPage.tsx` — Community Packs section:
  - List available built-in packs (name, finding count, installed status)
  - "Install" button per pack → runs import
  - "Import from file" for external community packs
- [ ] **3.5.5** Test: install AD pack → 15+ AD findings appear in library tagged with pack name

---

## 3.6 — Frontend: OPLOG Timeline Visual (Color-Coded)

- [ ] **3.6.1** Upgrade `OPLOGTimeline.tsx` to full visual timeline:
  - Left-side time axis with time markers (HH:MM:SS)
  - Color-coded left border per action type with consistent color palette:
    - Recon = purple, Initial Access = red, Execution = orange,
      Persistence = dark red, Privilege Escalation = yellow,
      Lateral Movement = teal, Collection = blue,
      Exfiltration = green, Social Engineering = pink, Physical = brown
  - Action type legend (color key) shown above timeline
  - Collapsible operator sections (group by operator with toggle)
  - "Jump to time" input — scroll to specific timestamp
- [ ] **3.6.2** Smooth scroll animation when new WebSocket entry arrives
- [ ] **3.6.3** "Compact view" toggle — reduces card height to show more entries at once

---

## 3.7 — Frontend: Engagement Dashboard with Charts

- [ ] **3.7.1** Install chart library — use Recharts (lightweight, React-native):
  `npm install recharts`
- [ ] **3.7.2** Upgrade `DashboardPage.tsx` with real charts:
  - **Donut chart**: Finding severity breakdown (Critical/High/Medium/Low/Info counts)
  - **Bar chart**: OPLOG actions by action type (horizontal bar)
  - **Timeline sparkline**: OPLOG entry count per hour over last 24h
  - **Stat cards**: total OPLOG entries, total findings, evidence items, operators online
- [ ] **3.7.3** Engagement progress indicator:
  - Checklist-style completeness: Scope added? First OPLOG entry? Findings added? Evidence linked? Report generated?
  - Percentage completion bar
- [ ] **3.7.4** Recent activity feed (last 5 entries from any page type — OPLOG, findings, evidence)
- [ ] **3.7.5** Quick action buttons: "New OPLOG Entry", "Add Finding", "Upload Evidence", "Generate Report"

---

## 3.8 — Backend & Frontend: Full-Text Search

- [ ] **3.8.1** Backend: create unified search endpoint:
  - `GET /api/engagements/{id}/search?q={query}` — searches across:
    - OPLOG entries (target, command_action, notes)
    - Findings (title, description, remediation)
    - Evidence (filename, description)
  - Returns grouped results: `{ oplog: [...], findings: [...], evidence: [...] }`
  - Use SQLite FTS5 for performant full-text search, fallback to `LIKE` if FTS unavailable
- [ ] **3.8.2** Frontend: Global search bar in top header (present on all pages):
  - Keyboard shortcut to focus (Ctrl+K / Cmd+K)
  - Results dropdown showing grouped results (OPLOG / Findings / Evidence sections)
  - Click result: navigate to relevant page with entry highlighted
  - Debounce: 300ms after last keystroke before firing request

---

## 3.9 — Frontend: Dark Mode

- [ ] **3.9.1** Configure Tailwind for dark mode: `darkMode: 'class'` in `tailwind.config.js`
- [ ] **3.9.2** Add dark mode toggle in sidebar (moon/sun icon)
- [ ] **3.9.3** Persist preference in localStorage
- [ ] **3.9.4** Apply `dark:` variants to all components and pages:
  - All backgrounds, text colors, borders, shadows
  - Severity badge colors in dark mode
  - Form inputs, dropdowns, modals
  - Charts color palette (Recharts supports theme-aware colors)
  - Code/command areas in OPLOG
- [ ] **3.9.5** Ensure scope indicator colors (green/red/yellow) remain readable in dark mode
- [ ] **3.9.6** Test every page in dark mode — no invisible text or UI elements

---

## Phase 3 Exit Criteria

- [ ] D3 network graph renders from real OPLOG data, nodes connected by lateral movement arrows
- [ ] Drag custom DOCX template (with logo), generate report — logo appears in output
- [ ] Mark entries internal, generate external report — internal entries absent
- [ ] Batch scope check API returns correct results for mixed targets
- [ ] All 3 community packs install without errors
- [ ] Color-coded timeline is readable and updates live
- [ ] Dashboard charts render correctly with real data
- [ ] Search `Ctrl+K` from any page finds results across OPLOG + findings + evidence
- [ ] Dark mode looks professional on every page with no readability issues

---
---

# PHASE 4 — Community Features
### Goal: Tool integrations and community ecosystem that make OPCHAIN the hub of red team ops.

---

## 4.1 — CLI Companion Tool

- [ ] **4.1.1** Create `cli/` directory — separate Python project (`pyproject.toml`)
- [ ] **4.1.2** Install CLI dependencies: `click`, `httpx`, `rich`, `python-dotenv`
- [ ] **4.1.3** Create `cli/opchain.py` — CLI entry point using Click:
  - Global options: `--server` (OPCHAIN URL), `--token` (JWT) or read from `~/.opchain/config.json`
- [ ] **4.1.4** `opchain auth login` — prompt username/password, call login API, save token to config
- [ ] **4.1.5** `opchain auth logout` — clear saved token
- [ ] **4.1.6** `opchain log` — create OPLOG entry:
  ```
  opchain log \
    --target 10.0.0.1 \
    --action lateral-move \
    --technique T1021.001 \
    --command "evil-winrm -i 10.0.0.1 -u admin -p Password123" \
    --outcome success \
    --notes "Lateral move to DC01"
  ```
- [ ] **4.1.7** `opchain log --interactive` — TUI form (using `rich.prompt`) for guided entry
- [ ] **4.1.8** `opchain scope check <target>` — validate target against active engagement scope
- [ ] **4.1.9** `opchain evidence upload <file>` — upload evidence file with optional `--label` and `--link-entry <entry_id>`
- [ ] **4.1.10** `opchain engagement list` — list engagements in table format (rich.table)
- [ ] **4.1.11** `opchain engagement use <name_or_id>` — set active engagement in config
- [ ] **4.1.12** `opchain report generate --format md|html|docx` — trigger report generation + download
- [ ] **4.1.13** Package as installable: `pip install opchain-cli` (PyPI-ready `pyproject.toml`)
- [ ] **4.1.14** Distribute as single binary with PyInstaller for users without Python
- [ ] **4.1.15** Test: full workflow in terminal — login, set engagement, log 5 entries, check scope, generate report

---

## 4.2 — Burp Suite Export Auto-Import

- [ ] **4.2.1** Research Burp Suite XML export format (Issues XML schema)
- [ ] **4.2.2** Create `backend/services/burp_importer.py`:
  - Parse Burp XML: extract issues (name, severity, host, path, request, response, detail)
  - Map Burp severity to OPCHAIN severity (High→High, Medium→Medium, etc.)
  - For each issue: create or match to `FindingTemplate`, add to engagement as `EngagementFinding`
  - Attach raw Burp XML as evidence (label: `scan-output`)
  - Create OPLOG entry summarizing the import (action_type: Recon, outcome: Success)
- [ ] **4.2.3** Add import endpoint: `POST /api/engagements/{id}/import/burp`
  - Accepts multipart file upload (`.xml`)
  - Returns import summary: `{ findings_created, findings_matched, evidence_saved }`
- [ ] **4.2.4** Frontend: `EvidencePage.tsx` or `FindingsPage.tsx` — "Import from Burp Suite" button:
  - File picker (`.xml` only)
  - Shows import summary after processing
  - Lists created/matched findings for review
- [ ] **4.2.5** Test: export a Burp scan result XML, import to OPCHAIN — verify findings created

---

## 4.3 — Nmap XML Auto-Import → Scope Population

- [ ] **4.3.1** Create `backend/services/nmap_importer.py`:
  - Parse Nmap XML output format (hosts, ports, services, OS detection)
  - For each live host: optionally add to scope as in-scope item
  - For each host with open ports: create OPLOG entry (action_type: Recon, outcome: Success)
    with port summary in command_action field
  - Return parsed host list for user to review before scope add
- [ ] **4.3.2** Add import endpoint: `POST /api/engagements/{id}/import/nmap`
  - Accepts multipart upload (`.xml`)
  - Query param `?add_to_scope=true` auto-adds all live hosts to scope
  - Returns: `{ hosts_found, ports_mapped, oplog_entries_created, scope_items_added }`
- [ ] **4.3.3** Frontend: `ScopePage.tsx` — "Import from Nmap XML" button:
  - File picker (`.xml`)
  - Preview: table of discovered hosts with port counts
  - Checkboxes to select which hosts to add to scope
  - "Add Selected to Scope" + "Create OPLOG Entries" actions
- [ ] **4.3.4** Test: import Nmap XML with 10 hosts → 10 scope items added + 10 OPLOG recon entries

---

## 4.4 — BloodHound JSON Path Import → Attack Path

- [ ] **4.4.1** Research BloodHound JSON output format (paths, nodes, edges)
- [ ] **4.4.2** Create `backend/services/bloodhound_importer.py`:
  - Parse BloodHound JSON: extract attack paths (source → intermediate nodes → target)
  - Map each path hop to an OPLOG entry (action_type: Lateral Movement)
  - Map BloodHound edge types to MITRE techniques:
    - `MemberOf` → T1069 (Permission Groups Discovery)
    - `HasSession` → T1563 (Remote Service Session Hijacking)
    - `AdminTo` → T1021 (Remote Services)
    - `DCSync` → T1003.006 (DCSync)
    - etc.
  - Add discovered computer/user nodes as scope items or just targets
- [ ] **4.4.3** Add import endpoint: `POST /api/engagements/{id}/import/bloodhound`
- [ ] **4.4.4** Frontend: `AttackPathPage.tsx` — "Import from BloodHound" button
  - Shows imported path preview in the network graph immediately
- [ ] **4.4.5** Test: BloodHound shortest path export → imported OPLOG entries appear in network graph

---

## 4.5 — Engagement Templates

- [ ] **4.5.1** Create `backend/data/engagement_templates/` — JSON files defining pre-configured engagements:
  - `web_app_assessment.json`
  - `internal_network.json`
  - `ad_assessment.json`
  - `cloud_review.json`
- [ ] **4.5.2** Template schema:
  ```json
  {
    "template_name": "Web Application Assessment",
    "description": "...",
    "default_scope_notes": "Add target domains and IP ranges",
    "recommended_findings": ["SQL Injection", "XSS", "IDOR", "..."],
    "oplog_checklist": [
      "Recon: subdomain enumeration",
      "Recon: port scan",
      "Recon: directory bruteforce",
      ...
    ]
  }
  ```
- [ ] **4.5.3** Add template endpoint: `GET /api/engagement-templates` — list available templates
- [ ] **4.5.4** On engagement creation: optional "Start from template" selection:
  - Pre-loads recommended findings from library into engagement
  - Shows oplog checklist as initial "todo" entries (optional, not blocking)
- [ ] **4.5.5** Frontend: `CreateEngagementModal.tsx` — "Use Template" toggle + template selector
- [ ] **4.5.6** Test: create engagement from AD template → AD findings pre-loaded, checklist shown

---

## 4.6 — Finding Library Contribution Format & Documentation

- [ ] **4.6.1** Write `CONTRIBUTING_FINDINGS.md` — guide for community contributions:
  - JSON schema reference with all fields and valid values
  - How to structure CVSS vectors correctly
  - How to map MITRE techniques
  - Example finding (annotated)
  - How to submit a pack (GitHub PR process)
- [ ] **4.6.2** Create `backend/schemas/finding_pack.py` — strict Pydantic schema for pack validation
- [ ] **4.6.3** CLI command: `opchain findings validate <pack.json>` — validates a pack file locally
        before submission
- [ ] **4.6.4** Add pack validation endpoint: `POST /api/findings/validate` — validate without importing

---

## Phase 4 Exit Criteria

- [ ] `opchain log --target 10.0.0.1 --action recon --technique T1046 --outcome success` creates entry in UI
- [ ] `opchain scope check 192.168.1.1` returns correct scope status from terminal
- [ ] Burp Suite XML import creates findings linked to correct engagement
- [ ] Nmap XML import adds hosts to scope with OPLOG entries
- [ ] BloodHound JSON import creates OPLOG entries that appear in network graph
- [ ] All 4 engagement templates pre-load correctly
- [ ] `opchain findings validate custom_pack.json` correctly validates/rejects pack files

---
---

# Cross-Cutting Concerns (Done Throughout All Phases)

## Security

- [ ] All endpoints require valid JWT (except `/api/auth/login`)
- [ ] Evidence file downloads validate that the requesting operator belongs to the engagement
- [ ] File upload validates file type — reject executable files (`.exe`, `.sh`, `.py`, `.js`, etc.)
- [ ] File size limit on uploads (configurable, default 50MB per file)
- [ ] SQL injection impossible (all queries via SQLAlchemy ORM with parameterized queries)
- [ ] XSS: all Markdown content sanitized before rendering in frontend
- [ ] JWT secret minimum entropy enforced (warn on startup if `SECRET_KEY` is too short)
- [ ] Admin-only operations properly gated with role checks

## Performance

- [ ] SQLite indexes on all FK columns and frequently filtered columns
  (`engagement_id`, `operator_id`, `action_type`, `timestamp`)
- [ ] Evidence files served with proper HTTP caching headers
- [ ] Frontend: route-based code splitting (lazy load each page)
- [ ] Frontend: `OPLOGTimeline` virtualized for engagements with 1000+ entries (react-virtual)
- [ ] API responses paginated where list could grow large (OPLOG entries, evidence)

## Error Handling

- [ ] Backend: consistent error response format `{ detail: string, code: string }`
- [ ] Frontend: global error boundary — uncaught errors show friendly message, not blank screen
- [ ] Network errors show toast notification with retry option
- [ ] Form validation shows inline errors (not just on submit)
- [ ] 404 page for unknown routes

## Documentation

- [ ] `README.md` — Quick start (Docker), login instructions, basic workflow
- [ ] Inline API docs auto-generated by FastAPI at `/docs` (Swagger UI)
- [ ] `CONTRIBUTING.md` — How to contribute code + findings
- [ ] `CHANGELOG.md` — maintained per release

---

# Final Completion Checklist

Before calling OPCHAIN v1.0 "complete", every item across all phases must be checked.
Run through this list as a final audit:

**Core Operations**
- [ ] Login / logout works
- [ ] Create, switch, archive engagements
- [ ] Add scope items (bulk), check any target against scope
- [ ] Create OPLOG entries with all fields populated including MITRE technique
- [ ] Upload evidence and link to OPLOG entries and findings
- [ ] Browse and search finding library
- [ ] Add findings to engagement, edit them, update status
- [ ] Generate report in all 3 formats (MD, HTML, DOCX)

**Collaboration**
- [ ] Two operators on same engagement see real-time OPLOG updates
- [ ] Online operator presence shown in sidebar
- [ ] Internal-only entries excluded from external reports

**Visualization**
- [ ] Attack path kill chain view populated from OPLOG
- [ ] Network graph shows host nodes + lateral movement arrows
- [ ] Dashboard charts show real engagement data

**Integrations**
- [ ] CLI `opchain log` creates entry in UI
- [ ] Burp Suite XML import creates findings
- [ ] Nmap XML import populates scope
- [ ] BloodHound import creates OPLOG path

**Quality**
- [ ] Dark mode on all pages
- [ ] Full-text search works across OPLOG + findings + evidence
- [ ] Docker image under 150MB, starts in under 5 seconds
- [ ] No console errors in browser on any page
- [ ] No 500 errors from any API endpoint under normal use

---

*ROADMAP version 1.0 — OPCHAIN Complete Build Reference*
*No feature left behind.*
