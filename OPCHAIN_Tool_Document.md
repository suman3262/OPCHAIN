# OPCHAIN
## Pentest & Red Team Operations Center
### Tool Documentation — Build Reference v1.0

---

## Table of Contents

1. [What Is OPCHAIN](#what-is-opchain)
2. [The Problem OPCHAIN Solves](#the-problem-opchain-solves)
3. [Features](#features)
4. [Feature Deep Dive — What Each Feature Solves](#feature-deep-dive)
5. [Where We Win](#where-we-win)
6. [What OPCHAIN Is NOT](#what-opchain-is-not)
7. [Tech Stack](#tech-stack)
8. [Data Models](#data-models)
9. [UI Structure & Pages](#ui-structure--pages)
10. [API Endpoints](#api-endpoints)
11. [Deployment](#deployment)
12. [Pre-loaded Content](#pre-loaded-content)
13. [Build Phases (MVP Roadmap)](#build-phases-mvp-roadmap)

---

## What Is OPCHAIN

OPCHAIN is a **lightweight, self-hosted, open-source Pentest and Red Team Operations Center** built for offensive security professionals who are tired of managing engagements with Excel spreadsheets, scattered markdown files, desktop screenshot folders, and manually written reports.

It is a **single Docker container** (under 150MB) that gives individual pentesters and small red teams a unified operational workspace — from the first scan of an engagement to the final client report.

OPCHAIN sits between your attack tools (Nmap, Burp Suite, Cobalt Strike, BloodHound) and your final deliverable (the PDF/Word report). Everything you discover with those tools, you log here. Every action, every finding, every piece of evidence lands in one place — and at the end, you export a professional report automatically assembled from everything you logged during the operation.

**Core philosophy:** *The best report content is what you capture during the engagement, not what you reconstruct at 2am the night before the deadline.*

**License:** MIT — 100% free, forever, community-owned.

---

## The Problem OPCHAIN Solves

These are real, cross-community pain points validated across Reddit (r/netsec, r/redteamsec, r/Pentesting), operator post-mortems, CISA red team advisories, state-of-pentesting reports (Cobalt 2024, Pentera 2024, BreachLock 2024), and GitHub issues across existing tools.

---

### Problem 1 — Operator Logs Are Excel Sheets in 2025

Every serious red team engagement requires an **Operations Log (OPLOG)** — a timestamped, auditable record of every action taken: who did it, on what target, with what technique, and what happened. This is required for:

- **Deconfliction** — Proving to the blue team which activity was you vs. a real attacker (the CISA 2024 red team advisory calls this out as a major failure point in engagements).
- **Legal cover** — Timestamped proof that you operated within the rules of engagement.
- **Reporting** — The OPLOG is the skeleton of every red team report.

What does every team actually use? **A shared Excel sheet. A Google Doc. Manual timestamps in CherryTree.** Nobody has built a fast, frictionless, keyboard-first OPLOG tool designed for live offensive operations.

VECTR exists but is a purple team detection-tracking platform with a complex setup — not a live operator log for fast-moving engagements. No lightweight, free OPLOG tool purpose-built for red teamers exists.

---

### Problem 2 — Scope Violations Are Discovered Too Late

During an active engagement with multiple operators moving fast, someone inevitably touches an out-of-scope host. The scope list lives in a PDF emailed at kickoff. Nobody is cross-referencing it in real time. By the time the mistake is caught, there has been an unauthorized access incident, an emergency call to the client, and sometimes a legal problem.

There is no lightweight tool that **validates targets against the engagement scope before you take action**.

---

### Problem 3 — Evidence Is Total Chaos

Screenshots live in `~/Desktop/engagement/screenshots/`. Command outputs live in terminal history. Burp Suite exports are in a ZIP somewhere. Web request evidence is across 8 browser tabs. Nobody links any of this to a specific finding until report time — when you're hunting through 400 PNG files trying to find the one screenshot that proves you had Domain Admin.

Every pentester does this. Every engagement. The gap between *capturing evidence* and *attaching it to a finding* is where hours disappear.

---

### Problem 4 — The Same Findings Are Written From Scratch Every Time

"SQL Injection allows an attacker to..." has been written 200,000 times by pentesters worldwide. Every team writes the same finding descriptions over and over, slightly differently each time, at varying quality levels. There is no free, shared, team-level finding library with pre-written descriptions, severity, remediation guidance, and CVSS scores. The commercial tools (PlexTrac, Dradis Pro) lock this behind expensive paywalls.

---

### Problem 5 — Multi-Operator Engagements Have No Shared Real-Time View

Two operators working on the same engagement with no shared operational picture. Duplicate work happens. One operator laterally moves to a host that another is actively exploiting. No real-time awareness of what your teammates are doing without constant voice chat or Slack interruptions. Purpose-built, lightweight multi-operator support for live engagements doesn't exist in any free tool.

---

### Problem 6 — Reports Take As Long As The Engagement Itself

The community universally agrees: pentest reporting is the worst part of the job. Operators spend 30–40% of total engagement time on documentation. This is partly because all the tools that help with report output (PwnDoc, SysReptor, APTRS) are *report-first* — you go there at the end and reconstruct what happened. None of them help you capture data *during* the operation in a way that assembles into a report automatically.

---

## Features

OPCHAIN has **6 core features**. Each one maps directly to a documented pain point. No bloat. No features built because they look good in a demo.

| # | Feature | What It Solves |
|---|---------|----------------|
| 1 | **Live OPLOG** | Operator logging, deconfliction, MITRE mapping during ops |
| 2 | **Scope Guardian** | Real-time scope validation before touching targets |
| 3 | **Evidence Locker** | Link artifacts to log entries and findings at capture time |
| 4 | **Finding Library** | Team-shared, pre-written findings — no more copy-paste from old reports |
| 5 | **Attack Path Visualizer** | Auto-generated kill chain diagram from your own OPLOG data |
| 6 | **Report Generator** | One-click export assembling everything you already logged |

---

## Feature Deep Dive

---

### Feature 1 — Live OPLOG (Operator Log)

**The central feature. Everything else connects to it.**

The OPLOG is a real-time, keyboard-first, timestamped log of every action taken during an engagement. It is designed to be used *while* you are operating — not filled in after the fact.

#### Each OPLOG Entry Captures:

| Field | Type | Notes |
|-------|------|-------|
| `timestamp` | Auto-generated | UTC, ISO 8601 format |
| `operator` | Text | Name of the operator |
| `target` | Text | IP, hostname, CIDR, URL, or user |
| `action_type` | Dropdown | Recon / Initial Access / Execution / Persistence / Privilege Escalation / Lateral Movement / Collection / Exfiltration / Social Engineering / Physical |
| `command_action` | Free text (Markdown) | The actual command run, the action taken, or a description |
| `outcome` | Dropdown | Success / Failed / Partial / Blocked |
| `mitre_technique` | Searchable dropdown | Full MITRE ATT&CK technique list (T-code + name, e.g. T1078 – Valid Accounts) |
| `notes` | Free text | Optional additional context |
| `evidence_refs` | File attachment | Links to Evidence Locker entries |

#### OPLOG Behaviors:

- **Real-time sync** — Multi-operator WebSocket sync. All team members on the same engagement see each other's entries appear live without refreshing.
- **Keyboard-first design** — Tab through all fields, press Enter to submit. No mouse required during active ops.
- **Filter and search** — Filter OPLOG by operator, action type, target, outcome, or MITRE technique. Full-text search across all entries.
- **Timeline view** — Chronological view of all actions with color-coding by action type.
- **OPLOG export** — Export the full OPLOG as CSV or JSON at any time.

#### Why This Feature Wins:

VECTR requires you to pre-plan test cases in campaigns before running them. OPCHAIN lets you log anything as it happens, in freeform, in real time. That's how actual engagements work. You don't know what you're going to find before you find it.

---

### Feature 2 — Scope Guardian

**Real-time scope validation. The safety net every engagement needs.**

#### How It Works:

At engagement creation, the operator imports the scope as:
- CIDR ranges (e.g. `10.0.0.0/8`, `192.168.1.0/24`)
- Individual IPs (e.g. `203.0.113.45`)
- Domains and subdomains (e.g. `*.acme.com`, `api.acme.com`)
- Out-of-scope entries (explicit exclusions, e.g. `10.0.0.1` — production DB)

#### Scope Guardian Features:

- **Sidebar scope panel** — Always-visible list of in-scope and out-of-scope targets in the UI.
- **Inline validation** — When you type a target into any OPLOG entry, Scope Guardian instantly color-codes it:
  - 🟢 **Green** — Confirmed in-scope
  - 🔴 **Red** — Out-of-scope — entry is flagged and a warning appears
  - 🟡 **Yellow** — Not defined in scope — proceed with caution
- **Scope check tool** — Standalone input box where you can paste any IP/hostname and instantly check its scope status before opening a terminal.
- **Out-of-scope log** — Any OPLOG entry with a red-flagged target is logged in a separate "scope warnings" list for the engagement record.
- **Export scope** — Export the scope list as plain text or JSON for sharing with the team.

#### Why This Feature Wins:

No other free tool does live, inline scope validation during log entry. Scope lives in a PDF in every team's current workflow. OPCHAIN makes it an active guard, not a passive document.

---

### Feature 3 — Evidence Locker

**Link your artifacts to findings and log entries at the moment you capture them — not hours later.**

#### Supported Evidence Types:

- Screenshots (PNG, JPG, GIF)
- Text outputs (TXT, log files, tool exports)
- Burp Suite exports (XML)
- Nmap output files (XML, grepable)
- Any file (PDF, ZIP, CSV — stored with metadata)

#### Evidence Locker Features:

- **Drag-and-drop upload** — Drop a screenshot directly onto an OPLOG entry or a finding. It's attached instantly.
- **Auto-thumbnail preview** — Image evidence shows a thumbnail. Click to expand.
- **Evidence ID** — Every artifact gets a unique ID (e.g. `EV-0042`) for reference in report text.
- **Labels / Tags** — Tag evidence as: `access-proof` / `credential` / `loot` / `screenshot` / `scan-output` / `artifact` / `exploit-output`
- **Local storage only** — Evidence files are stored on the self-hosted instance. Never touches a cloud service.
- **Evidence viewer** — Browse all evidence for an engagement in a gallery view, filterable by type and tag.
- **Report auto-attach** — When you export a report, all evidence attached to included findings is automatically embedded in the relevant finding sections.

#### Why This Feature Wins:

The gap between "I captured this evidence" and "I need this evidence in the right section of my report" currently costs hours per engagement. OPCHAIN closes that gap by design. Every piece of evidence is linked to the finding it proves, from the moment it's captured.

---

### Feature 4 — Finding Library

**Write it once. Use it forever. Share it across the team.**

A team-managed database of vulnerability findings with pre-written, professional-quality content. OPCHAIN ships pre-loaded with **80+ common findings** covering web application, network, Active Directory, cloud, and social engineering vulnerabilities.

#### Each Finding Contains:

| Field | Description |
|-------|-------------|
| `title` | Short finding name (e.g. "SQL Injection — Authentication Bypass") |
| `severity` | Critical / High / Medium / Low / Informational |
| `cvss_score` | CVSS v3.1 score with inline calculator |
| `cvss_vector` | CVSS v3.1 vector string |
| `description` | Full Markdown description of the vulnerability |
| `impact` | Business impact narrative |
| `remediation` | Step-by-step remediation guidance |
| `references` | CVE numbers, OWASP references, vendor advisories |
| `mitre_techniques` | Associated MITRE ATT&CK technique IDs |
| `cwe_id` | CWE reference number |
| `tags` | Custom team tags for searching |

#### Finding Library Features:

- **Search and filter** — Full-text search by title, tag, severity, CWE, or MITRE technique.
- **Clone and customize** — Clone any finding and customize it for a specific engagement without modifying the base library entry.
- **Add to engagement** — One click adds the finding to the active engagement and prompts for evidence attachment.
- **Team shared** — All operators on an instance share the same finding library. One person updates a remediation, everyone benefits.
- **Import / Export** — Export the library as JSON. Import findings from JSON or CSV for community sharing.
- **Community packs** — Library is structured to accept community-contributed finding packs (e.g. "Active Directory Attack Pack," "OWASP Top 10 Pack," "AWS Misconfiguration Pack").

#### Pre-loaded Finding Categories:

- Web Application (OWASP Top 10 coverage + extras)
- Network / Infrastructure
- Active Directory / Windows
- Authentication & Session Management
- Cloud (AWS, Azure, GCP misconfigurations)
- Social Engineering
- Information Disclosure
- Cryptography

#### Why This Feature Wins:

PlexTrac's finding library is a major selling point of their $400/month platform. OPCHAIN brings this to the community for free, with the entire library being community-extensible and exportable.

---

### Feature 5 — Attack Path Visualizer

**Turn your OPLOG into a kill chain diagram automatically.**

At report time, the most powerful thing you can show a client is exactly how an attacker moved through their environment. Currently everyone draws this manually in draw.io, Visio, or PowerPoint after the engagement. OPCHAIN generates it from the data you already logged.

#### How It Works:

- OPLOG entries tagged with MITRE ATT&CK techniques are automatically grouped into kill chain phases (based on the MITRE ATT&CK tactic they belong to).
- The Attack Path Visualizer shows a **sequential flow diagram** from Initial Access → through Execution, Persistence, Privilege Escalation, Lateral Movement → to the final objective.
- Each node in the diagram is clickable and shows the underlying OPLOG entries that form that step.
- **Network graph view** — For multi-pivot engagements, a node graph shows hosts as circles connected by arrows representing movement between them, colored by compromise status.

#### Output:

- Export as **SVG** (vector, scales to any size)
- Export as **PNG** (for report embedding)
- Automatically embedded in the Report Generator output

#### Why This Feature Wins:

This is the most time-intensive manually-produced element of every enterprise red team report. By generating it from OPLOG data, OPCHAIN eliminates that work entirely while producing a more accurate diagram (because it's derived from what actually happened, not what you remember).

---

### Feature 6 — Report Generator

**One-click export. Professional output. Zero reconstruction.**

At the end of an engagement, OPCHAIN assembles everything you logged into a structured, professional-quality report. Because you captured evidence, wrote findings, and logged your operations *during* the engagement, the report is mostly done before you ever click "Generate."

#### Report Structure:

```
1. Cover Page
   - Client name, engagement name, dates, classification
2. Executive Summary
   - 5-field form: Engagement Overview, Scope, Objectives, Overall Risk Rating, Summary Narrative
3. Findings Summary Table
   - Auto-generated from all findings added to the engagement (severity, title, status)
4. Detailed Findings
   - Auto-assembled from Finding Library entries
   - Each finding: Description, Impact, Evidence (embedded screenshots), Remediation, References
5. Attack Path Diagram
   - Auto-generated from Attack Path Visualizer
6. OPLOG Appendix
   - Full timestamped operations log
7. Scope Reference
   - In-scope and out-of-scope target list
```

#### Export Formats:

| Format | Use Case |
|--------|----------|
| **Markdown** | Version-controlled, Git-friendly |
| **HTML** | Self-contained, single file — email directly to client |
| **DOCX** | Word document — use default OPCHAIN template or upload your own branded `.docx` template |

#### Report Generator Features:

- **Custom template upload** — Upload your firm's branded DOCX template. OPCHAIN injects finding and OPLOG content into your template structure.
- **Finding status filter** — Choose which findings to include: All / Critical+High only / Exclude Informational
- **Redaction mode** — Mark any OPLOG entries as "internal only" — they appear in your copy but not in the client export.
- **Draft mode** — Generate a draft for internal review before producing the final client copy.

#### Why This Feature Wins:

Every existing report-generation tool (PwnDoc, SysReptor) starts at the report and asks you to fill it in. OPCHAIN ends at the report, having already collected everything needed during the operation. The report is a byproduct of good operational practice, not a separate effort.

---

## Where We Win

### The Competition Landscape

| Tool | Free? | Self-Hosted? | Live OPLOG? | Scope Guard? | Finding Library? | Report Gen? | Setup Complexity |
|------|-------|-------------|-------------|--------------|-----------------|-------------|-----------------|
| **OPCHAIN** | ✅ MIT | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | 🟢 1 command |
| PlexTrac | ❌ $$$+ | ❌ SaaS only | ❌ No | ❌ No | ✅ Yes | ✅ Yes | — |
| Dradis Pro | ❌ $$$ | ✅ Yes | ❌ No | ❌ No | ✅ Yes | ✅ Yes | 🔴 Complex |
| VECTR | ✅ CE | ✅ Yes | ❌ Purple only | ❌ No | ❌ No | ⚠️ Limited | 🟡 Docker |
| Reconmap | ✅ Yes | ✅ Yes | ⚠️ Basic | ❌ No | ⚠️ Basic | ✅ Yes | 🔴 6 containers |
| PwnDoc | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ✅ Yes | ✅ Yes | 🟡 Docker |
| SysReptor | ✅ CE | ✅ Yes | ❌ No | ❌ No | ⚠️ Limited | ✅ Yes | 🟡 Docker |
| Faraday | ⚠️ CE | ✅ Yes | ❌ No | ❌ No | ❌ No | ⚠️ Limited | 🔴 Heavy |
| Dradis CE | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No | ⚠️ Limited | 🟡 Ruby |

---

### Our Unfair Advantages

**1. First-mover on live OPLOG for offensive ops (free tier)**
No free tool gives you a real-time, multi-operator, keyboard-first OPLOG designed for live red team engagements. VECTR requires pre-planned campaigns. Everything else is report-first. OPCHAIN is ops-first.

**2. Single container. Zero dependencies.**
`docker-compose up`. Done. No MongoDB. No Java heap. No Nginx configuration. No separate database server. SQLite means your entire engagement database is a single file you can `cp` off the server in one second. Every other platform has a 4–8 step setup guide. OPCHAIN should work for the first person who tries it within 90 seconds.

**3. Operator-native UX, not manager-native UX**
Most security platforms are designed for the person reading the dashboard, not the person running the engagement. OPCHAIN is designed for the hands-on-keyboard operator. Keyboard-first. Fast. No menus to navigate when you're mid-exploit.

**4. Community finding library ecosystem**
By shipping with 80+ pre-loaded findings and making the library import/export format public and simple (JSON), OPCHAIN becomes a community asset. Teams can share finding packs. Individuals can contribute. The library grows without OPCHAIN writing a line of code.

**5. The report is a byproduct of operational discipline**
Every other tool asks you to do extra work to produce a report. OPCHAIN makes report generation the natural result of logging your ops properly. If you used the tool during the engagement, the report is 80% done before you click "Generate."

**6. MIT license — no strings, no future pricing risk**
The community has been burned before by tools that start free and move to paid models. MIT license means OPCHAIN stays free forever. Anyone can fork it. Anyone can contribute. Nobody can take it away.

---

## What OPCHAIN Is NOT

Being clear about boundaries keeps the tool focused and the codebase maintainable.

| What It Is NOT | Why |
|---------------|-----|
| A vulnerability scanner | Nmap, Nessus, Nuclei already exist. Integration > duplication. |
| A C2 framework | Cobalt Strike, Sliver, Havoc do this. OPCHAIN logs what they do. |
| An automated pentest platform | Pentera, HexStrike already exist. OPCHAIN supports human operators. |
| A SIEM or log aggregation platform | ELK, Graylog do this. OPCHAIN logs operator actions, not system events. |
| A purple team detection tracker | VECTR does this well. OPCHAIN is for offensive ops, not purple exercises. |
| A SaaS / cloud product | OPCHAIN is self-hosted. Your engagement data never leaves your server. |

---

## Tech Stack

### Why This Stack

Every technology choice is made for: simplicity of setup, low resource usage, ease of community contribution, and long-term maintainability.

```
Backend:     Python 3.11+ / FastAPI
Database:    SQLite (via SQLAlchemy ORM)
Migrations:  Alembic
Auth:        JWT (self-contained, no external auth provider)
Real-time:   WebSockets (FastAPI native, no Redis required)
Frontend:    React 18 + Vite + TypeScript
Styling:     TailwindCSS
State:       Zustand (lightweight, no Redux complexity)
Charts:      D3.js (for Attack Path Visualizer)
Reports:     python-docx (DOCX), Jinja2 (HTML/Markdown)
Container:   Docker + Docker Compose (single service)
```

### Resource Targets

| Metric | Target |
|--------|--------|
| Docker image size | < 150MB |
| RAM at idle | < 50MB |
| RAM under active use | < 200MB |
| Cold start time | < 5 seconds |
| Simultaneous operators | 1–20 (designed for small teams) |

---

## Data Models

### Core Entities

```
Engagement
├── id (UUID)
├── name (string)
├── client_name (string)
├── start_date (datetime)
├── end_date (datetime)
├── status (Planning / Active / Completed / Archived)
├── description (text)
├── operators[] → Operator
├── scope_items[] → ScopeItem
├── oplog_entries[] → OPLOGEntry
├── findings[] → EngagementFinding
└── created_at / updated_at

ScopeItem
├── id (UUID)
├── engagement_id (FK)
├── value (string — IP, CIDR, domain)
├── type (in_scope / out_of_scope)
└── notes (text)

OPLOGEntry
├── id (UUID)
├── engagement_id (FK)
├── operator_id (FK)
├── timestamp (datetime — auto)
├── target (string)
├── action_type (enum)
├── command_action (text)
├── outcome (enum)
├── mitre_technique_id (string — T-code)
├── notes (text)
├── is_internal_only (bool — redaction flag)
├── evidence_refs[] → Evidence
└── created_at

Evidence
├── id (UUID)
├── engagement_id (FK)
├── oplog_entry_id (FK — nullable)
├── finding_id (FK — nullable)
├── filename (string)
├── file_type (image / text / xml / other)
├── file_path (string — local storage)
├── label (enum — access-proof / credential / screenshot / scan-output / etc.)
├── description (text)
└── uploaded_at

FindingTemplate (Library)
├── id (UUID)
├── title (string)
├── severity (enum)
├── cvss_score (float)
├── cvss_vector (string)
├── description (text — Markdown)
├── impact (text — Markdown)
├── remediation (text — Markdown)
├── references[] (string)
├── mitre_techniques[] (string — T-codes)
├── cwe_id (string)
├── tags[] (string)
├── is_custom (bool)
└── created_at

EngagementFinding (Finding added to an engagement)
├── id (UUID)
├── engagement_id (FK)
├── template_id (FK — nullable, for library-sourced findings)
├── title (string — editable per engagement)
├── severity (enum)
├── cvss_score (float)
├── description (text — Markdown)
├── impact (text)
├── remediation (text)
├── status (Open / Remediated / Accepted / False Positive)
├── evidence_refs[] → Evidence
└── created_at

Operator (User)
├── id (UUID)
├── username (string)
├── display_name (string)
├── password_hash (string)
├── role (admin / operator)
└── created_at
```

---

## UI Structure & Pages

```
App Layout
├── Sidebar (persistent)
│   ├── OPCHAIN logo + active engagement indicator
│   ├── Engagement switcher
│   ├── Nav: Dashboard / OPLOG / Scope / Evidence / Findings / Attack Path / Report
│   └── Active operators list (WebSocket presence)
│
├── /dashboard
│   ├── Engagement summary card
│   ├── OPLOG entry count, finding severity breakdown (donut chart)
│   ├── Recent OPLOG entries (last 10)
│   └── Quick-add OPLOG button
│
├── /oplog
│   ├── OPLOG entry form (top — always visible)
│   │   ├── Target input + real-time scope indicator
│   │   ├── Action type dropdown
│   │   ├── Command/Action text area (Markdown, expandable)
│   │   ├── Outcome dropdown
│   │   ├── MITRE technique search dropdown
│   │   └── Submit button (Enter key)
│   ├── Filter bar (operator / action type / outcome / MITRE / search)
│   └── Timeline log (chronological, live updating)
│
├── /scope
│   ├── Scope import (paste CIDRs, IPs, domains or upload text file)
│   ├── In-scope list (color coded)
│   ├── Out-of-scope list
│   ├── Quick scope checker input
│   └── Export scope button
│
├── /evidence
│   ├── Upload zone (drag and drop)
│   ├── Evidence gallery (filterable by type / tag / linked finding)
│   ├── Unlinked evidence queue (evidence not yet attached to a finding or log entry)
│   └── Bulk attach tool
│
├── /findings
│   ├── Finding Library tab
│   │   ├── Search + filter
│   │   ├── Finding cards (severity badge, title, MITRE tags)
│   │   └── Add to engagement / Edit / Clone
│   └── Engagement Findings tab
│       ├── Findings table (severity, title, status, evidence count)
│       ├── Finding detail panel (edit description, attach evidence)
│       └── CVSS calculator (inline)
│
├── /attack-path
│   ├── Kill chain flow view (MITRE ATT&CK tactic columns)
│   │   └── Drag OPLOG entries into tactic slots
│   ├── Network graph view (host nodes + movement arrows)
│   └── Export SVG / PNG
│
├── /report
│   ├── Executive summary form (5 fields)
│   ├── Findings inclusion checkboxes + filter
│   ├── OPLOG inclusion toggle (all / external-safe only)
│   ├── Template selector (default / upload custom DOCX)
│   └── Export buttons: Markdown / HTML / DOCX
│
└── /settings
    ├── Engagement management (create / archive / delete)
    ├── Operator management (add / remove / change password)
    ├── Finding library management (import / export JSON)
    └── System info (version, data location)
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/login              — JWT login
POST   /api/auth/logout             — Invalidate token
GET    /api/auth/me                 — Current operator info
```

### Engagements
```
GET    /api/engagements             — List all engagements
POST   /api/engagements             — Create engagement
GET    /api/engagements/{id}        — Get engagement detail
PUT    /api/engagements/{id}        — Update engagement
DELETE /api/engagements/{id}        — Archive engagement
```

### Scope
```
GET    /api/engagements/{id}/scope  — List scope items
POST   /api/engagements/{id}/scope  — Add scope item(s) (bulk)
DELETE /api/scope/{item_id}         — Remove scope item
POST   /api/scope/check             — Validate target against scope
```

### OPLOG
```
GET    /api/engagements/{id}/oplog  — List OPLOG entries (with filters)
POST   /api/engagements/{id}/oplog  — Create OPLOG entry
PUT    /api/oplog/{entry_id}        — Update entry
DELETE /api/oplog/{entry_id}        — Delete entry
GET    /api/oplog/{entry_id}        — Get single entry
GET    /api/engagements/{id}/oplog/export — Export OPLOG (CSV/JSON)
WS     /ws/engagements/{id}/oplog   — WebSocket for live sync
```

### Evidence
```
GET    /api/engagements/{id}/evidence     — List evidence
POST   /api/engagements/{id}/evidence     — Upload evidence file
PUT    /api/evidence/{ev_id}             — Update metadata / link
DELETE /api/evidence/{ev_id}             — Delete evidence
GET    /api/evidence/{ev_id}/file        — Download evidence file
```

### Findings
```
GET    /api/findings                 — List finding library (with filters)
POST   /api/findings                 — Create library finding
PUT    /api/findings/{id}            — Update library finding
DELETE /api/findings/{id}            — Delete library finding
GET    /api/findings/export          — Export library as JSON
POST   /api/findings/import          — Import library from JSON

GET    /api/engagements/{id}/findings      — List engagement findings
POST   /api/engagements/{id}/findings      — Add finding to engagement
PUT    /api/engagements/{id}/findings/{id} — Update engagement finding
DELETE /api/engagements/{id}/findings/{id} — Remove finding from engagement
```

### MITRE ATT&CK
```
GET    /api/mitre/techniques         — List all techniques (searchable)
GET    /api/mitre/tactics            — List all tactics
GET    /api/mitre/techniques/{id}    — Get technique detail
```

### Reports
```
POST   /api/engagements/{id}/report/generate — Generate report
GET    /api/engagements/{id}/report/{format} — Download report (md/html/docx)
```

### WebSocket Events
```
oplog:new_entry       — New OPLOG entry created by another operator
oplog:update          — Entry updated
oplog:delete          — Entry deleted
operator:joined       — Another operator connected
operator:left         — Operator disconnected
scope:updated         — Scope list changed
```

---

## Deployment

### Minimum Requirements
- Docker + Docker Compose
- 512MB RAM
- 2GB disk (for evidence files)
- Any OS that runs Docker

### Single-File Deployment

**`docker-compose.yml`**
```yaml
version: '3.8'
services:
  opchain:
    image: opchain/opchain:latest
    ports:
      - "8080:8080"
    volumes:
      - ./opchain-data:/app/data
    environment:
      - SECRET_KEY=change_this_to_a_random_string
      - FIRST_RUN_ADMIN_PASSWORD=admin123
    restart: unless-stopped
```

**Start command:**
```bash
docker-compose up -d
```

Navigate to `http://localhost:8080`. Done.

### Data Storage
- SQLite database: `/app/data/opchain.db` (mapped to host volume)
- Evidence files: `/app/data/evidence/` (mapped to host volume)
- Backup: `cp -r ./opchain-data ./backup-$(date +%Y%m%d)` — complete backup done.

### Self-Build
```bash
git clone https://github.com/opchain/opchain
cd opchain
docker-compose up --build
```

---

## Pre-loaded Content

### MITRE ATT&CK Coverage
OPCHAIN ships with the complete MITRE ATT&CK Enterprise technique list embedded in the database — all tactics, all techniques, all sub-techniques. No internet connection required to search and tag techniques.

### Pre-loaded Findings (80+ on launch)

**Web Application**
- SQL Injection (multiple variants: auth bypass, union-based, blind)
- Cross-Site Scripting (Reflected, Stored, DOM-based)
- Insecure Direct Object Reference (IDOR)
- Broken Access Control
- XML External Entity (XXE) Injection
- Server-Side Request Forgery (SSRF)
- Command Injection
- Path Traversal
- Insecure Deserialization
- Security Misconfiguration (generic + web server variants)
- Sensitive Data Exposure
- Using Components with Known Vulnerabilities
- Broken Authentication
- JWT None Algorithm / Weak Secret
- CORS Misconfiguration
- Open Redirect
- Host Header Injection
- Clickjacking

**Network / Infrastructure**
- SMB Signing Disabled
- RDP Externally Exposed
- Telnet / FTP Enabled
- Default Credentials (network device)
- Unencrypted Services (HTTP, FTP, Telnet in use)
- Unnecessary Open Ports
- SNMP Community String Default
- DNS Zone Transfer Allowed
- Outdated TLS / SSL Configurations
- Self-Signed Certificates in Production
- NFS Share Misconfiguration
- Anonymous FTP Access

**Active Directory / Windows**
- Kerberoastable Service Accounts
- AS-REP Roastable Accounts
- Password Spraying Successful
- NTLM Hash Captured (via Responder)
- Pass-the-Hash Attack Successful
- DCSync Privilege Achieved
- Unconstrained Delegation Configured
- AD Accounts with Non-Expiring Passwords
- Domain Users in Local Admin Group
- Weak Password Policy
- Default Administrator Account Active
- SYSVOL Group Policy Credentials
- BloodHound: Path to Domain Admin Exists
- PrintNightmare (CVE-2021-1675)
- ZeroLogon (CVE-2020-1472)

**Cloud**
- S3 Bucket Public Read/Write
- IAM Overpermissive Role
- EC2 Instance Metadata Service v1 (SSRF Risk)
- Azure Storage Account Public Access
- GCP Service Account Key Exposed
- CloudTrail Logging Disabled
- Security Groups: Unrestricted Ingress

**Authentication**
- Multi-Factor Authentication Bypass
- Weak Password Policy
- Account Enumeration via Login Response
- Password Reset Token Insecure
- Session Token Not Invalidated on Logout
- Credential Stuffing Successful

**Social Engineering**
- Phishing — Credential Capture
- Phishing — Malicious Attachment Execution
- Vishing — Information Disclosure
- Physical Access — Tailgating Successful
- Pretexting — Account Information Disclosed

---

## Build Phases (MVP Roadmap)

### Phase 1 — Core MVP (Build First)
**Goal:** A working tool that solves the top 3 pain points.

- [ ] Backend: FastAPI + SQLite + SQLAlchemy setup
- [ ] Auth system (JWT, admin + operator roles)
- [ ] Engagement CRUD
- [ ] OPLOG create/read/update/delete (single operator)
- [ ] Scope item management + basic scope check
- [ ] Evidence upload + file storage
- [ ] Finding Library (CRUD + pre-loaded findings)
- [ ] Finding → Engagement linking
- [ ] React frontend: OPLOG page (form + timeline)
- [ ] React frontend: Scope page
- [ ] React frontend: Finding Library page
- [ ] Docker single-container build
- [ ] Basic Markdown report export

### Phase 2 — Collaboration & Polish
**Goal:** Multi-operator and professional output.

- [ ] WebSocket real-time OPLOG sync
- [ ] Multi-operator presence indicators
- [ ] Evidence Locker gallery view + drag-drop attach
- [ ] CVSS v3.1 calculator (inline)
- [ ] HTML report export
- [ ] DOCX report export (default template)
- [ ] MITRE ATT&CK technique search dropdown (full dataset loaded)
- [ ] OPLOG export (CSV + JSON)
- [ ] Finding library JSON import/export
- [ ] Attack Path Visualizer (kill chain flow view)

### Phase 3 — Power Features
**Goal:** The features that make OPCHAIN exceptional.

- [ ] Attack Path network graph view (D3.js node graph)
- [ ] Custom DOCX template upload + injection
- [ ] Report redaction mode (internal-only OPLOG entries)
- [ ] Scope check API (programmatic IP/host validation)
- [ ] Finding community packs (AD Pack, Cloud Pack, OWASP Pack)
- [ ] OPLOG timeline visual (color-coded by action type)
- [ ] Engagement dashboard with charts
- [ ] Full-text search across OPLOG + findings
- [ ] Dark mode

### Phase 4 — Community Features
**Goal:** Make OPCHAIN the go-to community platform.

- [ ] CLI companion tool (`opchain log --target 10.0.0.1 --action "lateral-move" --technique T1021.001`)
- [ ] Burp Suite export auto-import
- [ ] Nmap XML auto-import → scope population
- [ ] BloodHound JSON path import → attack path
- [ ] Finding library contribution format + public repo
- [ ] Engagement templates (Web App Assessment, Internal Network, AD Assessment, Cloud Review)

---

## Project Structure (Suggested)

```
opchain/
├── backend/
│   ├── main.py                  — FastAPI app entry
│   ├── core/
│   │   ├── config.py            — Settings (env vars)
│   │   ├── security.py          — JWT auth
│   │   └── database.py          — SQLAlchemy + SQLite setup
│   ├── models/
│   │   ├── engagement.py
│   │   ├── oplog.py
│   │   ├── scope.py
│   │   ├── evidence.py
│   │   ├── finding.py
│   │   └── operator.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── engagements.py
│   │   ├── oplog.py
│   │   ├── scope.py
│   │   ├── evidence.py
│   │   ├── findings.py
│   │   ├── mitre.py
│   │   └── reports.py
│   ├── services/
│   │   ├── scope_checker.py     — IP/CIDR validation logic
│   │   ├── report_generator.py  — Markdown/HTML/DOCX assembly
│   │   └── ws_manager.py        — WebSocket connection manager
│   ├── data/
│   │   ├── mitre_techniques.json — Full ATT&CK dataset
│   │   └── default_findings.json — Pre-loaded finding library
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── OPLOG.tsx
│   │   │   ├── Scope.tsx
│   │   │   ├── Evidence.tsx
│   │   │   ├── Findings.tsx
│   │   │   ├── AttackPath.tsx
│   │   │   ├── Report.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/
│   │   │   ├── OPLOGForm.tsx
│   │   │   ├── ScopeIndicator.tsx
│   │   │   ├── EvidenceLocker.tsx
│   │   │   ├── FindingCard.tsx
│   │   │   ├── AttackPathCanvas.tsx
│   │   │   ├── ReportPreview.tsx
│   │   │   └── OperatorPresence.tsx
│   │   ├── store/               — Zustand state
│   │   ├── hooks/               — Custom React hooks
│   │   ├── api/                 — Axios API client
│   │   └── ws/                  — WebSocket client
│   ├── package.json
│   └── vite.config.ts
│
├── docker/
│   ├── Dockerfile
│   └── entrypoint.sh
├── docker-compose.yml
├── README.md
└── LICENSE                      — MIT
```

---

## Summary

OPCHAIN is a small tool with a clear mission: **make the operational part of pentesting as smooth as the hacking itself**. Every other tool in this space either costs money, requires complex setup, or focuses on report output rather than operational capture.

The community has been asking for this with every shared Excel OPLOG template, every blog post titled "More time to pwn, less time to doc," and every operator who has typed `find ~/Desktop -name "*.png" -newer 2024-01-01` at midnight trying to recover evidence they forgot to save properly.

OPCHAIN solves that. One command to spin up. Log as you operate. Report at the end. MIT license. Free forever.

---

*Document version: 1.0 — Ready for Claude Code build reference*
