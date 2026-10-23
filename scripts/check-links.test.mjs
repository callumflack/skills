import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const checker = join(dirname(fileURLToPath(import.meta.url)), "check-links.sh");
const runtimes = [
  ".claude/skills",
  ".codex/skills",
  ".cursor/skills",
  ".pi/agent/skills",
];
function fixture(t) {
  const home = mkdtempSync(join(tmpdir(), "skill links test "));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  const repo = join(home, "authored repo");
  const payload = join(home, "agents repo/.agents");
  const registry = join(home, ".agents/skills");
  mkdirSync(join(repo, "scripts"), { recursive: true });
  mkdirSync(join(repo, "authored"));
  mkdirSync(join(payload, "skills/scrawl"), { recursive: true });
  copyFileSync(checker, join(repo, "scripts/check-links.sh"));
  writeFileSync(join(repo, "authored/SKILL.md"), "authored content\n");
  writeFileSync(
    join(payload, "skills/scrawl/SKILL.md"),
    "preserved scrawl content\n",
  );
  symlinkSync(payload, join(home, ".agents"));
  symlinkSync(join(repo, "authored"), join(registry, "authored"));
  for (const runtime of runtimes) {
    mkdirSync(join(home, runtime), { recursive: true });
    for (const name of ["authored", "scrawl"]) {
      symlinkSync(join(registry, name), join(home, runtime, name));
    }
  }
  return {
    home,
    repo,
    registry,
    replace(name, target) {
      const link = join(home, ".claude/skills", name);
      rmSync(link);
      if (target !== null) symlinkSync(target, link);
    },
    run() {
      return spawnSync("bash", [join(repo, "scripts/check-links.sh")], {
        env: { ...process.env, HOME: home },
        encoding: "utf8",
      });
    },
  };
}

const cases = [
  ["absolute canonical links", true, () => {}],
  [
    "relative canonical links",
    true,
    (f) => {
      for (const runtime of runtimes) {
        const link = join(f.home, runtime, "scrawl");
        rmSync(link);
        symlinkSync(relative(dirname(link), join(f.registry, "scrawl")), link);
      }
    },
  ],
  [
    "physical canonical registry path",
    true,
    (f) =>
      f.replace("scrawl", join(f.home, "agents repo/.agents/skills/scrawl")),
  ],
  [
    "wrong directory with identical skill content",
    false,
    (f) => {
      mkdirSync(join(f.home, "other/scrawl"), { recursive: true });
      copyFileSync(
        join(f.registry, "scrawl/SKILL.md"),
        join(f.home, "other/scrawl/SKILL.md"),
      );
      f.replace("scrawl", join(f.home, "other/scrawl"));
    },
  ],
  [
    "direct authored source bypassing the registry",
    false,
    (f) => f.replace("authored", join(f.repo, "authored")),
  ],
  [
    "dangling runtime link",
    false,
    (f) => f.replace("scrawl", "../../missing/scrawl"),
  ],
  ["missing runtime link", false, (f) => f.replace("scrawl", null)],
];
for (const [name, valid, prepare] of cases) {
  test(`link checker ${valid ? "accepts" : "rejects"} ${name}`, (t) => {
    const f = fixture(t);
    prepare(f);
    const result = f.run();
    assert.equal(result.status === 0, valid, result.stderr || result.stdout);
    if (!valid)
      assert.match(result.stderr, /runtime skill (?:is not a symlink|target)/);
    assert.equal(
      readFileSync(join(f.registry, "scrawl/SKILL.md"), "utf8"),
      "preserved scrawl content\n",
    );
  });
}
