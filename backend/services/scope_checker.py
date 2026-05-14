import fnmatch
import ipaddress
from typing import Optional


def check_target(target: str, scope_items: list) -> dict:
    """
    Returns {"status": "in_scope"|"out_of_scope"|"unknown", "matched_rule": str|None}
    Out-of-scope rules take priority over in-scope rules.
    """
    out_match = _match_against_list(target, [s for s in scope_items if s.type == "out_of_scope"])
    if out_match:
        return {"status": "out_of_scope", "matched_rule": out_match}

    in_match = _match_against_list(target, [s for s in scope_items if s.type == "in_scope"])
    if in_match:
        return {"status": "in_scope", "matched_rule": in_match}

    return {"status": "unknown", "matched_rule": None}


def _match_against_list(target: str, items: list) -> Optional[str]:
    for item in items:
        if _matches(target, item.value):
            return item.value
    return None


def _matches(target: str, rule: str) -> bool:
    # Exact match
    if target == rule:
        return True

    # Try CIDR match
    try:
        network = ipaddress.ip_network(rule, strict=False)
        addr = ipaddress.ip_address(target)
        if addr in network:
            return True
    except ValueError:
        pass

    # Wildcard domain match (e.g. *.acme.com)
    if rule.startswith("*."):
        base = rule[2:]
        if target == base or target.endswith("." + base):
            return True

    # fnmatch glob
    if fnmatch.fnmatch(target, rule):
        return True

    return False
