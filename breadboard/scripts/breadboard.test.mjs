import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
  rmSync,
  symlinkSync,
  cpSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const skill = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = resolve(skill, "scripts/breadboard.mjs");

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "breadboard-cli-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "source"));
  mkdirSync(join(root, "map"));
  writeFileSync(
    join(root, "source/submit.mjs"),
    'export const result = "saved";\n',
  );
  writeFileSync(
    join(root, "source/intent.md"),
    "Save the submitted request.\n",
  );
  const source = {
    url: "../source/submit.mjs?inspect=1#submit",
    label: "Submission handler",
    role: "code",
    path: "source/submit.mjs",
  };
  const definition = {
    metadata: {
      headingHtml: "Save a request",
      sourcesHtml: "<p>Local synthetic workflow.</p>",
      eyebrow: "Workflow review",
      defaultView: "save",
      requirementsIntro: "The request is retained.",
      questionsIntro: "Unresolved behavior.",
      views: {
        save: {
          label: "Save",
          query: "",
          title: "Save a request",
          headingHtml: "Save a request",
          frameHtml:
            '<h2 id="frame-title">Submit and retain</h2><p>A local workflow.</p>',
          initial: { kind: "story", id: "S1" },
        },
      },
    },
    views: {
      save: {
        layout: { columns: 1 },
        groups: [
          {
            id: "app",
            row: 0,
            col: 0,
            title: "App",
            runtime: "Submit and retain",
            nodes: ["U1", "D1"],
          },
        ],
        nodes: [
          {
            id: "U1",
            kind: "ui",
            title: "Submit request",
            detail: "The person submits a request.",
            sources: [source],
          },
          {
            id: "D1",
            kind: "store",
            title: "Saved request",
            detail: "The App retains the request.",
            sources: [
              {
                url: "../source/intent.md#outcome",
                label: "Desired outcome",
                role: "intent",
                path: "source/intent.md",
              },
            ],
          },
        ],
        edges: [{ id: "E1", a: "U1", b: "D1", label: "Save the request" }],
        stories: [
          {
            id: "all",
            name: "All wiring",
            description: "Every action",
            edges: ["E1"],
          },
          {
            id: "S1",
            name: "Save request",
            description: "Submit and retain the request.",
            steps: [
              { text: "Submit the request and retain it.", edges: ["E1"] },
            ],
            gap: "Persistence after reload has no executable check.",
            edges: ["E1"],
          },
        ],
        requirements: [
          {
            id: "R1",
            title: "Retain the submitted request",
            status: "Source inspected",
            detail: "The submitted request remains available.",
            blocks: ["U1", "D1"],
            flow: ["U1", "D1"],
          },
        ],
        questions: [],
      },
    },
  };
  const path = join(root, "map/breadboard.json");
  const save = () =>
    writeFileSync(path, `${JSON.stringify(definition, null, 2)}\n`);
  save();
  return { root, definition, path, save, output: join(root, "map/index.html") };
}

function run(f, command, flags = [], entry = cli) {
  const result = spawnSync(
    process.execPath,
    [entry, command, f.path, "--root", f.root, ...flags],
    { cwd: f.root, encoding: "utf8" },
  );
  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.stderr, "");
  return { code: result.status, report: JSON.parse(result.stdout) };
}

function snapshot(root) {
  const files = {};
  function visit(path) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const child = join(path, entry.name);
      if (entry.isDirectory()) visit(child);
      else
        files[relative(root, child)] = {
          bytes: readFileSync(child).toString("base64"),
          mtime: statSync(child).mtimeMs,
        };
    }
  }
  visit(root);
  return files;
}

test("render is deterministic, preserves authored links and check does not write", (t) => {
  const f = fixture(t);
  const initial = run(f, "record-sources");
  assert.equal(initial.code, 0, JSON.stringify(initial.report));
  assert.equal(run(f, "render").code, 0);
  const html = readFileSync(f.output, "utf8");
  assert.ok(html.startsWith("<!doctype html>"));
  assert.ok(html.includes("../source/submit.mjs?inspect=1#submit"));
  assert.equal(run(f, "render").code, 0);
  assert.equal(readFileSync(f.output, "utf8"), html);
  const before = snapshot(f.root);
  assert.equal(run(f, "check").code, 0);
  assert.deepEqual(snapshot(f.root), before);
});

test("source mutations identify affected requirement and never refresh hashes implicitly", (t) => {
  const f = fixture(t);
  run(f, "record-sources");
  run(f, "render");
  const baseline = readFileSync(f.path, "utf8");
  writeFileSync(
    join(f.root, "source/submit.mjs"),
    'export const result = "queued";\n',
  );
  const checked = run(f, "check");
  assert.equal(checked.code, 1);
  const issue = checked.report.issues.find(
    (item) => item.path === "source/submit.mjs",
  );
  assert.equal(issue.kind, "drift");
  assert.equal(issue.view, "save");
  assert.equal(issue.block, "U1");
  assert.deepEqual(issue.requirements, ["R1"]);
  assert.equal(run(f, "render").code, 1);
  assert.equal(readFileSync(f.path, "utf8"), baseline);
  assert.equal(
    run(f, "record-sources", ["--source", "source/submit.mjs"]).code,
    0,
  );
  assert.notEqual(readFileSync(f.path, "utf8"), baseline);
  assert.equal(run(f, "check").code, 1);
  assert.equal(run(f, "render").code, 0);
  assert.equal(run(f, "check").code, 0);
});

test("edited generated HTML and contract are stale artifacts", (t) => {
  const f = fixture(t);
  run(f, "record-sources");
  run(f, "render");
  writeFileSync(f.output, "<p>locally edited output</p>\n");
  writeFileSync(
    join(f.root, "map/breadboard-contract.md"),
    "A changed contract.\n",
  );
  const before = snapshot(f.root);
  const result = run(f, "check");
  assert.equal(result.code, 1);
  assert.equal(
    result.report.artifacts.filter((artifact) => artifact.status === "stale")
      .length,
    2,
  );
  assert.deepEqual(snapshot(f.root), before);
});

test("unknown sources render drafts, and drift takes precedence while listing both", (t) => {
  const f = fixture(t);
  f.definition.views.save.nodes[1].sources = [
    { url: "https://example.com/spec", label: "Remote intent", role: "intent" },
  ];
  f.save();
  assert.equal(run(f, "render").code, 2);
  const baseline = run(f, "record-sources");
  assert.equal(baseline.code, 2);
  assert.equal(baseline.report.sources.known, 1);
  assert.equal(baseline.report.sources.unknown, 1);
  assert.equal(run(f, "render").report.status, "draft");
  const checked = run(f, "check");
  assert.equal(checked.code, 2);
  assert.equal(checked.report.status, "unknown");
  writeFileSync(join(f.root, "source/submit.mjs"), "changed\n");
  const drift = run(f, "check");
  assert.equal(drift.code, 1);
  assert.ok(drift.report.issues.some((issue) => issue.kind === "drift"));
  assert.ok(drift.report.issues.some((issue) => issue.kind === "unknown"));
});

test("missing mapped sources and unreviewed hashes are unknown", (t) => {
  const f = fixture(t);
  const unreviewed = run(f, "render");
  assert.equal(unreviewed.code, 2);
  assert.ok(
    unreviewed.report.issues.some(
      (issue) =>
        issue.kind === "unknown" &&
        issue.block === "U1" &&
        issue.path === "source/submit.mjs",
    ),
  );
  assert.equal(run(f, "record-sources").code, 0);
  assert.equal(run(f, "render").code, 0);
  rmSync(join(f.root, "source/submit.mjs"));
  const missing = run(f, "check");
  assert.equal(missing.code, 2);
  assert.ok(
    missing.report.issues.some(
      (issue) =>
        issue.kind === "unknown" &&
        issue.block === "U1" &&
        issue.path === "source/submit.mjs",
    ),
  );
});

test("dangling runtime wires and geometry overrides fail before artifacts are written", (t) => {
  const f = fixture(t);
  assert.equal(run(f, "record-sources").code, 0);
  for (const mutate of [
    () => {
      f.definition.views.save.edges[0].b = "ABSENT";
    },
    () => {
      f.definition.views.save.edges[0].b = "D1";
      f.definition.views.save.nodes[0].x = 20;
    },
  ]) {
    mutate();
    f.save();
    const result = run(f, "render");
    assert.equal(result.code, 1);
    assert.equal(result.report.status, "invalid");
    assert.equal(readdirSync(join(f.root, "map")).length, 1);
  }
});

test("unsafe schemes and links escaping root are rejected", (t) => {
  const f = fixture(t);
  const source = f.definition.views.save.nodes[0].sources[0];
  assert.equal(run(f, "record-sources").code, 0);
  delete source.path;
  for (const url of [
    "file:///tmp/a",
    "//example.com/a",
    "/tmp/a",
    "javascript:alert(1)",
    "data:text/plain,x",
    "../../outside.mjs",
    "../%2e%2e/../outside.mjs",
  ]) {
    source.url = url;
    f.save();
    const result = run(f, "render");
    assert.equal(result.code, 1, url);
    assert.equal(result.report.status, "invalid", url);
    assert.equal(readdirSync(join(f.root, "map")).length, 1);
  }
});

test("source mappings and link symlinks cannot read files outside root", (t) => {
  const f = fixture(t);
  const outside = mkdtempSync(join(tmpdir(), "breadboard-outside-"));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  writeFileSync(join(outside, "private.mjs"), "outside\n");
  symlinkSync(outside, join(f.root, "source/escape"));
  const source = f.definition.views.save.nodes[0].sources[0];
  source.path = "source/escape/private.mjs";
  source.url = "https://example.com/source";
  f.save();
  const before = readFileSync(f.path, "utf8");
  assert.equal(run(f, "record-sources").code, 1);
  assert.equal(readFileSync(f.path, "utf8"), before);
  delete source.path;
  source.url = "../source/escape/private.mjs";
  f.save();
  const escaped = run(f, "render");
  assert.equal(escaped.code, 1);
  assert.equal(escaped.report.status, "invalid");
  assert.equal(readdirSync(join(f.root, "map")).length, 1);
});

test("explicit source subset records only selected references", (t) => {
  const f = fixture(t);
  const result = run(f, "record-sources", ["--source", "source/submit.mjs"]);
  assert.equal(result.code, 2);
  assert.deepEqual(result.report.recorded, ["source/submit.mjs"]);
  const recorded = JSON.parse(readFileSync(f.path, "utf8"));
  assert.match(
    recorded.views.save.nodes[0].sources[0].sha256,
    /^[a-f0-9]{64}$/,
  );
  assert.equal(recorded.views.save.nodes[1].sources[0].sha256, undefined);
  const before = readFileSync(f.path, "utf8");
  assert.equal(
    run(f, "record-sources", ["--source", "source/no-mapping.mjs"]).code,
    1,
  );
  assert.equal(readFileSync(f.path, "utf8"), before);
});

test("a local source link must open the file whose bytes were reviewed", (t) => {
  const f = fixture(t);
  const source = f.definition.views.save.nodes[0].sources[0];
  source.url = "../source/intent.md";
  f.save();
  const before = readFileSync(f.path, "utf8");
  const result = run(f, "record-sources");
  assert.equal(result.code, 1);
  assert.equal(result.report.status, "invalid");
  assert.equal(readFileSync(f.path, "utf8"), before);
});

test("a source baseline cannot hash the map or its generated output", (t) => {
  const f = fixture(t);
  const source = f.definition.views.save.nodes[0].sources[0];
  for (const filename of [
    "breadboard.json",
    "index.html",
    "breadboard-contract.md",
  ]) {
    if (filename !== "breadboard.json")
      writeFileSync(join(f.root, "map", filename), "existing artifact\n");
    source.path = `map/${filename}`;
    source.url = filename;
    f.save();
    const before = snapshot(f.root);
    const result = run(f, "record-sources");
    assert.equal(result.code, 1);
    assert.equal(result.report.status, "invalid");
    assert.deepEqual(snapshot(f.root), before);
  }
});

test("vendor byte changes fail before rendering", (t) => {
  const f = fixture(t);
  const copy = join(f.root, "copied-skill");
  cpSync(skill, copy, { recursive: true });
  assert.equal(
    run(f, "record-sources", [], join(copy, "scripts/breadboard.mjs")).code,
    0,
  );
  writeFileSync(
    join(copy, "assets/unity/interactions.mjs"),
    "export const BREADBOARD = {};\n",
  );
  const result = run(f, "render", [], join(copy, "scripts/breadboard.mjs"));
  assert.equal(result.code, 1);
  assert.equal(result.report.status, "invalid");
  assert.equal(readdirSync(join(f.root, "map")).length, 1);
});

test("output destinations cannot overwrite a local link without a source mapping", (t) => {
  const f = fixture(t);
  assert.equal(run(f, "record-sources").code, 0);
  delete f.definition.views.save.nodes[0].sources[0].path;
  f.save();
  const path = join(f.root, "source/submit.mjs");
  const before = readFileSync(path, "utf8");
  const result = run(f, "render", ["--out", path]);
  assert.equal(result.code, 1);
  assert.equal(result.report.status, "invalid");
  assert.equal(readFileSync(path, "utf8"), before);
});

test("a story cannot highlight a wire outside its path or link an unverified check", (t) => {
  const f = fixture(t);
  const story = f.definition.views.save.stories[1];
  story.steps = [{ text: "Save the request.", edges: ["missing"] }];
  f.save();
  assert.equal(run(f, "check").code, 1);
  story.steps[0].edges = ["E1"];
  story.checks = [
    {
      url: "../source/submit.mjs?inspect=1#submit",
      test: "export const result",
      covers: "Checks the submission result.",
    },
  ];
  f.save();
  assert.equal(run(f, "check").code, 1);
  f.definition.views.save.nodes[0].sources[0].role = "verification";
  f.save();
  run(f, "record-sources");
  assert.equal(run(f, "render").code, 0);
});

test("a story must give a path and a verification disposition before delivery", (t) => {
  const f = fixture(t);
  const story = f.definition.views.save.stories[1];
  const steps = story.steps;
  delete story.steps;
  f.save();
  assert.equal(run(f, "check").code, 1);
  story.steps = steps;
  story.gap = " ";
  f.save();
  assert.equal(run(f, "check").code, 1);
  delete story.gap;
  story.checks = [
    {
      url: "../source/submit.mjs?inspect=1#submit",
      test: "renamed check",
      covers: "Submission survives reload.",
    },
  ];
  f.definition.views.save.nodes[0].sources[0].role = "verification";
  f.save();
  assert.match(
    run(f, "check").report.issues[0].reason,
    /named check.*not found/,
  );
  story.checks[0].test = "export const result";
  f.save();
  assert.equal(run(f, "record-sources").code, 0);
  assert.equal(run(f, "render").code, 0);
  assert.equal(run(f, "check").code, 0);
});

test("a story selecting several wires cannot hide them all in one step", (t) => {
  const f = fixture(t);
  const view = f.definition.views.save;
  view.edges.push({
    id: "E2",
    a: "D1",
    b: "U1",
    label: "Return the saved value",
    data: true,
  });
  for (const story of view.stories) story.edges.push("E2");
  view.stories[1].steps[0].edges.push("E2");
  f.save();
  assert.match(run(f, "render").report.issues[0].reason, /steps must describe/);
  view.stories[1].steps = [
    { text: "Submit the value.", edges: ["E1"] },
    { text: "Read the saved value.", edges: ["E2"] },
  ];
  f.save();
  assert.equal(run(f, "record-sources").code, 0);
  assert.equal(run(f, "render").code, 0);
});
