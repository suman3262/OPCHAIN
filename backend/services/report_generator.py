from datetime import datetime, timezone
from jinja2 import Environment, FileSystemLoader
import os

from models.engagement import Engagement
from models.finding import EngagementFinding
from models.oplog import OPLOGEntry


SEVERITY_ORDER = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3, "Informational": 4}

_jinja_env = None


def _get_jinja():
    global _jinja_env
    if _jinja_env is None:
        templates_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
        _jinja_env = Environment(loader=FileSystemLoader(templates_dir), autoescape=False)
    return _jinja_env


def generate_markdown(engagement: Engagement, db, external_safe: bool = False) -> str:
    findings = sorted(
        db.query(EngagementFinding).filter(EngagementFinding.engagement_id == engagement.id).all(),
        key=lambda f: SEVERITY_ORDER.get(f.severity, 99),
    )

    oplog_entries = db.query(OPLOGEntry).filter(OPLOGEntry.engagement_id == engagement.id)
    if external_safe:
        oplog_entries = oplog_entries.filter(OPLOGEntry.is_internal_only == False)
    oplog_entries = oplog_entries.order_by(OPLOGEntry.timestamp.asc()).all()

    scope_items = engagement.scope_items

    env = _get_jinja()
    template = env.get_template("report.md.j2")
    return template.render(
        engagement=engagement,
        findings=findings,
        oplog_entries=oplog_entries,
        scope_items=scope_items,
        generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        external_safe=external_safe,
    )
