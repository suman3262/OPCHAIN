# OPCHAIN

### Pentest & Red Team Operations Center

A **lightweight, self-hosted, open-source operations workspace** for offensive security professionals — built for the operator who is tired of running engagements out of Excel sheets, scattered markdown notes, screenshot folders, and reports manually stitched together at 2am.

OPCHAIN sits between your attack tools (Nmap, Burp Suite, Cobalt Strike, BloodHound) and your final client deliverable. Everything you discover during the engagement lands in one place, and at the end you export a professional report assembled from what you logged in real time.

> **Core philosophy:** the best report content is what you capture *during* the engagement, not what you reconstruct the night before the deadline.

**License:** MIT — 100% free, forever.

---

## Why OPCHAIN

These are real, validated pain points across the offensive security community (r/netsec, r/redteamsec, CISA red team advisories, Cobalt/Pentera/BreachLock state-of-pentesting reports):

| Problem | OPCHAIN's answer |
|---|---|
| Operator logs still live in Excel and Google Docs in 2025 | A keyboard-first **OPLOG** purpose-built for live operations |
| Scope violations are caught only after the fact | **Scope Guardian** validates every logged action against CIDR / wildcard / exact rules at entry time |
| Evidence is scattered across `~/screenshots/`, Slack, and OneDrive | Centralized evidence store with stable `EV-XXXX` IDs, type validation, 50MB cap |
| Reports are reconstructed from memory at the deadline | Markdown report generator assembles directly from OPLOG + Findings + Evidence, with a redaction mode for sanitized client copies |
| Junior operators don't know how to write a finding | 57 pre-loaded findings (web / network / AD / cloud / auth / social) + 100 MITRE ATT&CK techniques |

---

## Features

- **OPLOG** — append-only operator log with MITRE ATT&CK tagging and automatic scope checking on every entry
- **Scope Guardian** — CIDR, wildcard, and exact-match scope enforcement
- **Evidence Store** — file upload with type validation and stable evidence IDs
- **Finding Library** — 57 pre-loaded findings across six domains, plus a custom finding builder
- **MITRE ATT&CK Integration** — 100 techniques seeded; attack path view per engagement
- **Report Generator** — Markdown export with redaction mode for client-safe versions
- **Multi-Engagement** — work several active engagements in parallel without context mixing
- **JWT Auth + First-Run Admin Seeding** — single-command bootstrap, configurable via env
- **Single Docker Container** — `docker compose up` and you're running

---

## Tech Stack

**Backend** — FastAPI · SQLAlchemy · SQLite (WAL mode) · Alembic · JWT (python-jose) · Passlib/bcrypt · Jinja2

**Frontend** — React 18 · Vite · TypeScript · TailwindCSS · Zustand · React Router · Axios · React Query

**Deployment** — single multi-stage Docker image (~297MB), `python:3.11-slim` base, served on port 8080

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                  Single Docker Container                │
│                                                         │
│   FastAPI ──────►  SQLite (WAL)                         │
│      │             /app/runtime/opchain.db              │
│      │                                                  │
│      ├──► Static files  ──► React (built dist/)         │
│      │                                                  │
│      ├──► Evidence store ──► /app/runtime/evidence/     │
│      │                                                  │
│      └──► Report renderer (Jinja2 → Markdown)           │
└────────────────────────────────────────────────────────┘
            host ./opchain-data  ◄──► /app/runtime
```

Seed data lives in `backend/seed_data/` (separate from `/app/runtime/`) so the host bind mount cannot shadow shipped defaults.

---

## Domain Model

| Entity | Purpose |
|---|---|
| `Operator` | User account (admin / operator roles), JWT auth |
| `Engagement` | Top-level container — name, client, dates, status |
| `Scope` | In-scope assets per engagement (CIDR / wildcard / exact) |
| `OPLog` | Append-only timestamped action log, tagged with MITRE technique |
| `Evidence` | Uploaded artifacts with `EV-XXXX` stable IDs |
| `Finding` | Vulnerability / observation, optionally linked to evidence |
| `MitreTechnique` | 100 pre-seeded ATT&CK techniques |

---

## Repository Layout

```
OPCHAIN/
├── backend/
│   ├── main.py                 # FastAPI entry
│   ├── core/                   # config, database, security
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic schemas
│   ├── routers/                # API endpoints (auth, oplog, scope, ...)
│   ├── services/               # scope checker, report builder, seeding
│   ├── templates/              # Jinja2 report templates
│   ├── seed_data/              # MITRE techniques + finding library JSON
│   └── alembic/                # DB migrations
├── frontend/
│   └── src/
│       ├── pages/              # Login, Dashboard, OPLOG, Scope, Evidence,
│       │                       # Findings, AttackPath, Report, Settings
│       ├── components/
│       ├── store/              # Zustand stores
│       ├── api/                # Axios clients
│       └── types/
├── docker/
│   ├── Dockerfile
│   └── entrypoint.sh
├── docker-compose.yml
├── ROADMAP.md                  # full 4-phase build plan
└── OPCHAIN_Tool_Document.md    # design spec
```

---

## Quick Start

### With Docker (recommended)

```bash
git clone <repo-url> opchain
cd opchain
docker compose up -d
```

Open <http://localhost:8080> and log in with:

```
username: admin
password: admin123          # change immediately, or set FIRST_RUN_ADMIN_PASSWORD
```

### Development mode

**Backend**

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev        # proxies /api → http://localhost:8000
```

---

## Configuration

All configuration is via environment variables (see `.env.example`):

| Variable | Default | Purpose |
|---|---|---|
| `SECRET_KEY` | *(required in prod)* | JWT signing key |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token lifetime |
| `DATABASE_URL` | `sqlite:///./runtime/opchain.db` | DB connection |
| `EVIDENCE_STORAGE_PATH` | `./runtime/evidence/` | Upload directory |
| `FIRST_RUN_ADMIN_PASSWORD` | `admin123` | Seeded on first boot |

---

## API Surface

All endpoints under `/api/`:

```
POST   /api/auth/login                  → JWT
GET    /api/engagements                 → list / create / update
GET    /api/engagements/{id}/scope      → scope CRUD
GET    /api/engagements/{id}/oplog      → log entries (with scope check on POST)
POST   /api/engagements/{id}/evidence   → multipart upload
GET    /api/findings                    → finding library + per-engagement
GET    /api/mitre/techniques            → ATT&CK catalogue
POST   /api/engagements/{id}/report     → render Markdown report (with ?redact=true)
```

Interactive docs at <http://localhost:8080/docs>.

---

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| **1 — Core Foundation** | OPLOG, Scope Guardian, Evidence, Findings, MITRE, Markdown reports, Docker | ✅ Complete |
| **2 — Collaboration & Polish** | Multi-operator WebSocket sync, CVSS calculator, HTML + DOCX export, D3 attack-path visualizer | ⏳ Planned |
| **3 — Power Features** | Full-text search, saved queries, theming, keyboard command palette | ⏳ Planned |
| **4 — Community** | CLI companion tool, Nmap/Burp/Nuclei importers, plugin hooks | ⏳ Planned |

Full breakdown in [ROADMAP.md](ROADMAP.md).

---

## What OPCHAIN Is Not

- Not a vulnerability scanner — it consumes scanner output, it doesn't replace Nessus/Nuclei
- Not a C2 framework — it logs C2 activity, it doesn't run beacons
- Not an enterprise GRC / compliance suite — it's an operator tool first
- Not multi-tenant SaaS — one team, self-hosted, your data on your disk

---

## License

MIT — see [LICENSE](LICENSE). Use it, fork it, ship it.
