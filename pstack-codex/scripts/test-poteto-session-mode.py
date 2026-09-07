#!/usr/bin/env python3

import importlib.util
import io
import json
import os
import subprocess
import sys
import tempfile
import unittest
import uuid
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch


SCRIPT = Path(__file__).with_name("poteto-session-mode.py")
SPEC = importlib.util.spec_from_file_location("poteto_session_mode", SCRIPT)
assert SPEC and SPEC.loader
MODE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODE)


class PotetoSessionModeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.codex_home = Path(self.temporary.name)
        self.environment = patch.dict(os.environ, {"CODEX_HOME": str(self.codex_home)})
        self.environment.start()

    def tearDown(self) -> None:
        self.environment.stop()
        self.temporary.cleanup()

    def run_hook(self, session_id: str, prompt: str) -> dict | None:
        stdin = io.StringIO(json.dumps({"session_id": session_id, "prompt": prompt}))
        stdout = io.StringIO()
        with patch.object(sys, "stdin", stdin), redirect_stdout(stdout):
            self.assertEqual(MODE.run_hook(), 0)
        output = stdout.getvalue().strip()
        return json.loads(output) if output else None

    def context(self, output: dict) -> str:
        return output["hookSpecificOutput"]["additionalContext"]

    def test_session_lifecycle_and_isolation(self) -> None:
        active_session = str(uuid.uuid4())
        other_session = str(uuid.uuid4())

        self.assertIsNone(self.run_hook(active_session, "ordinary prompt"))
        self.assertIn("is active", self.context(self.run_hook(active_session, "/poteto-mode do it")))
        self.assertIn("is active", self.context(self.run_hook(active_session, "continue")))
        self.assertIsNone(self.run_hook(other_session, "continue"))
        self.assertIn("is inactive", self.context(self.run_hook(active_session, "/poteto-mode off")))
        self.assertIn("is inactive", self.context(self.run_hook(active_session, "continue")))

    def test_explicit_skill_invocations_activate(self) -> None:
        for prompt in (
            "$poteto-mode do it",
            "[$Poteto Mode](/tmp/poteto-mode/SKILL.md) do it",
            "[$pstack:Poteto Mode](/tmp/poteto-mode/SKILL.md) do it",
        ):
            with self.subTest(prompt=prompt):
                self.assertIn("is active", self.context(self.run_hook(str(uuid.uuid4()), prompt)))

    def test_active_context_names_plugin_skill_and_rejects_flat_registry(self) -> None:
        context = self.context(self.run_hook(str(uuid.uuid4()), "/poteto-mode"))

        self.assertIn("/plugins/pstack/skills/poteto-mode/SKILL.md", context)
        self.assertIn("Do not use the removed flat-registry path", context)

    def test_corrupt_state_fails_open(self) -> None:
        session_id = str(uuid.uuid4())
        path = MODE.state_path(session_id)
        path.parent.mkdir(parents=True)
        path.write_text("not json", encoding="utf-8")
        self.assertIsNone(self.run_hook(session_id, "continue"))

    def test_installer_preserves_hooks_and_is_idempotent(self) -> None:
        hook_file = self.codex_home / "hooks.json"
        original = {
            "hooks": {
                "SubagentStart": [
                    {
                        "matcher": "tldraw-offline",
                        "hooks": [{"type": "command", "command": "existing command"}],
                    }
                ]
            }
        }
        hook_file.write_text(json.dumps(original), encoding="utf-8")

        self.assertEqual(MODE.install_hook(), 0)
        first = hook_file.read_text(encoding="utf-8")
        first_inode = hook_file.stat().st_ino
        self.assertEqual(MODE.install_hook(), 0)
        second = hook_file.read_text(encoding="utf-8")

        installed = json.loads(second)
        self.assertEqual(first, second)
        self.assertEqual(hook_file.stat().st_ino, first_inode)
        self.assertEqual(installed["hooks"]["SubagentStart"], original["hooks"]["SubagentStart"])
        self.assertEqual(len(installed["hooks"]["UserPromptSubmit"]), 1)
        self.assertTrue(MODE.is_our_registration(installed["hooks"]["UserPromptSubmit"][0]))

    def test_script_ignores_invalid_input(self) -> None:
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "hook"],
            input="not json",
            text=True,
            capture_output=True,
            check=False,
            env={**os.environ, "CODEX_HOME": str(self.codex_home)},
        )
        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")


if __name__ == "__main__":
    unittest.main()
