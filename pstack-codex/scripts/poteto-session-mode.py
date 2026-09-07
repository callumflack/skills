#!/usr/bin/env python3

import json
import os
import re
import shlex
import sys
import tempfile
import uuid
from pathlib import Path
from typing import Any, Literal


ModeState = Literal["active", "inactive"]

HOOK_NAME = "pstack-codex Poteto session mode"
INACTIVE_CONTEXT = (
    "Poteto Mode is inactive for this Codex thread. This overrides any earlier Poteto Mode "
    "activation in the conversation. Do not apply it unless the user explicitly invokes it again."
)


def poteto_skill_path() -> Path:
    configured = os.environ.get("PSTACK_CODEX_PLUGIN")
    plugin = Path(configured).expanduser() if configured else Path.home() / "plugins" / "pstack"
    return plugin / "skills" / "poteto-mode" / "SKILL.md"


def active_context() -> str:
    return (
        "Poteto Mode is active for this Codex thread. Treat this as an explicit invocation on this "
        f"turn. Read Poteto Mode from {poteto_skill_path()} and apply it with the pstack-codex skill. "
        "Do not use the removed flat-registry path at ~/.agents/skills/poteto-mode/SKILL.md. Route "
        "each new task through Poteto's playbook matching. The mode remains active until the user opts out."
    )

SLASH_INVOCATION = re.compile(r"(?im)^\s*/poteto-mode(?:\s|$)")
SKILL_INVOCATION = re.compile(r"(?i)(?<![\w-])\$poteto-mode(?:\s|$)")
SKILL_LINK_INVOCATION = re.compile(
    r"(?i)\[(?:\$pstack:|\$)?poteto mode\]\([^\n)]*/poteto-mode/SKILL\.md\)"
)
DEACTIVATION = re.compile(
    r"(?im)^\s*(?:/poteto-mode|\$poteto-mode)\s+(?:off|disable|stop|exit)\b"
)


def codex_home() -> Path:
    configured = os.environ.get("CODEX_HOME")
    return Path(configured).expanduser() if configured else Path.home() / ".codex"


def parse_session_id(raw: Any) -> str | None:
    if not isinstance(raw, str):
        return None
    try:
        return str(uuid.UUID(raw))
    except ValueError:
        return None


def requested_state(prompt: str) -> ModeState | None:
    if DEACTIVATION.search(prompt):
        return "inactive"
    if (
        SLASH_INVOCATION.search(prompt)
        or SKILL_INVOCATION.search(prompt)
        or SKILL_LINK_INVOCATION.search(prompt)
    ):
        return "active"
    return None


def state_path(session_id: str) -> Path:
    return codex_home() / "pstack-codex" / "session-modes" / f"{session_id}.json"


def read_state(path: Path) -> ModeState | None:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return None
    state = value.get("state") if isinstance(value, dict) else None
    return state if state in ("active", "inactive") else None


def write_state(path: Path, state: ModeState) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    temporary = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            json.dump({"state": state}, handle, separators=(",", ":"))
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def hook_output(state: ModeState) -> dict[str, Any]:
    context = active_context() if state == "active" else INACTIVE_CONTEXT
    return {
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": context,
        }
    }


def run_hook() -> int:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        return 0

    if not isinstance(payload, dict):
        return 0
    session_id = parse_session_id(payload.get("session_id"))
    prompt = payload.get("prompt")
    if session_id is None or not isinstance(prompt, str):
        return 0

    path = state_path(session_id)
    next_state = requested_state(prompt)
    if next_state is not None:
        try:
            write_state(path, next_state)
        except OSError:
            return 0

    state = next_state or read_state(path)
    if state is not None:
        print(json.dumps(hook_output(state), separators=(",", ":")))
    return 0


def hook_registration() -> dict[str, Any]:
    command = f"python3 {shlex.quote(str(Path(__file__).resolve()))} hook"
    return {
        "hooks": [
            {
                "type": "command",
                "command": command,
            }
        ]
    }


def is_our_registration(group: Any) -> bool:
    if not isinstance(group, dict):
        return False
    hooks = group.get("hooks")
    if not isinstance(hooks, list):
        return False
    for hook in hooks:
        if not isinstance(hook, dict) or hook.get("type") != "command":
            continue
        command = hook.get("command")
        if not isinstance(command, str):
            continue
        try:
            arguments = shlex.split(command)
        except ValueError:
            continue
        if arguments and arguments[-1] == "hook" and any(
            Path(argument).name == Path(__file__).name for argument in arguments[:-1]
        ):
            return True
    return False


def write_json_atomically(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    temporary = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            json.dump(value, handle, indent=2)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def install_hook() -> int:
    path = codex_home() / "hooks.json"
    try:
        root = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    except (json.JSONDecodeError, OSError) as error:
        print(f"Cannot read {path}: {error}", file=sys.stderr)
        return 1

    if not isinstance(root, dict):
        print(f"Cannot update {path}: root must be a JSON object", file=sys.stderr)
        return 1
    hooks = root.setdefault("hooks", {})
    if not isinstance(hooks, dict):
        print(f"Cannot update {path}: hooks must be a JSON object", file=sys.stderr)
        return 1
    groups = hooks.setdefault("UserPromptSubmit", [])
    if not isinstance(groups, list):
        print(f"Cannot update {path}: UserPromptSubmit must be a JSON array", file=sys.stderr)
        return 1

    registration = hook_registration()
    matches = [index for index, group in enumerate(groups) if is_our_registration(group)]
    if len(matches) == 1 and groups[matches[0]] == registration:
        print(f"Already installed {HOOK_NAME} in {path}")
        return 0
    if matches:
        first = matches[0]
        groups[first] = registration
        for index in reversed(matches[1:]):
            del groups[index]
    else:
        groups.append(registration)

    try:
        write_json_atomically(path, root)
    except OSError as error:
        print(f"Cannot write {path}: {error}", file=sys.stderr)
        return 1
    print(f"Installed {HOOK_NAME} in {path}")
    return 0


def main() -> int:
    command = sys.argv[1] if len(sys.argv) > 1 else "hook"
    if command == "hook":
        return run_hook()
    if command == "install":
        return install_hook()
    print(f"Usage: {Path(sys.argv[0]).name} [hook|install]", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
