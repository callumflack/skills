import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  globSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  bootstrapEntry,
  compileStack,
  isExecutableContract,
  scanContract,
  validateContract,
} from "./ui-grammar.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const fixtureRoot = path.resolve(scriptDirectory, "../examples/bootstrap");
const entry = path.join(fixtureRoot, "src/route.tsx");
const systemGrammar = path.resolve(
  scriptDirectory,
  "../examples/system-default/grammar.json",
);

test("validates the complete System/default fixture as a non-executable composition contract", () => {
  const result = validateContract(systemGrammar);
  assert.equal(result.passed, true, JSON.stringify(result.checks));
  assert.equal(isExecutableContract(result.contract), false);
  assert.equal(result.contract.composition.relations.length, 3);
  assert.throws(
    () => compileStack(systemGrammar, systemGrammar),
    /cannot compile/,
  );
  const cli = spawnSync(
    process.execPath,
    [
      path.resolve(scriptDirectory, "ui-grammar.mjs"),
      "validate",
      systemGrammar,
    ],
    { encoding: "utf8" },
  );
  assert.equal(cli.status, 0, cli.stderr);
  assert.match(cli.stdout, /System composition structure/);
  assert.match(cli.stdout, /Evidence references/);
  assert.match(cli.stdout, /system evidence target/);
});

test("rejects malformed System vocabulary, relations, slots, evidence, and statuses", () => {
  const root = mkdtempSync(path.join(tmpdir(), "ui-grammar-system-negative-"));
  const outsideRoot = mkdtempSync(
    path.join(tmpdir(), "ui-grammar-system-outside-"),
  );
  try {
    const base = JSON.parse(readFileSync(systemGrammar, "utf8"));
    writeFileSync(path.join(root, "reference.md"), "# Test reference\n");
    const outsideSpecimen = path.join(outsideRoot, "outside.tsx");
    writeFileSync(outsideSpecimen, "export const Outside = () => null;\n");

    const validFile = path.join(root, "valid.json");
    writeFileSync(validFile, JSON.stringify(base));
    assert.equal(
      validateContract(validFile).passed,
      true,
      "negative fixture baseline must be valid",
    );

    const cases = [
      [
        "bare component",
        { vocabulary: { ...base.vocabulary, components: ["Button"] } },
      ],
      [
        "unknown component",
        { composition: { ...base.composition, root: "Missing" } },
      ],
      [
        "unknown slot",
        {
          composition: {
            ...base.composition,
            relations: [{ ...base.composition.relations[0], slot: "missing" }],
          },
        },
      ],
      [
        "forbidden relation",
        {
          composition: {
            ...base.composition,
            forbidden: [
              ...base.composition.forbidden,
              base.composition.relations[0],
            ],
          },
        },
      ],
      [
        "missing evidence target",
        { evidence: { ...base.evidence, target: "missing" } },
      ],
      [
        "invalid status",
        { specimens: [{ ...base.specimens[0], status: "proven" }] },
      ],
      [
        "unknown relation key",
        {
          composition: {
            ...base.composition,
            relations: [{ ...base.composition.relations[0], extra: true }],
          },
        },
      ],
      [
        "wrong slot required",
        {
          vocabulary: {
            ...base.vocabulary,
            components: base.vocabulary.components.map((c) =>
              c.name === "ActionRow"
                ? {
                    ...c,
                    slots: c.slots.map((s) => ({ ...s, required: "yes" })),
                  }
                : c,
            ),
          },
        },
      ],
      [
        "unknown slot key",
        {
          vocabulary: {
            ...base.vocabulary,
            components: base.vocabulary.components.map((c) =>
              c.name === "ActionRow"
                ? { ...c, slots: c.slots.map((s) => ({ ...s, extra: true })) }
                : c,
            ),
          },
        },
      ],
      [
        "duplicate component",
        {
          vocabulary: {
            ...base.vocabulary,
            components: [
              ...base.vocabulary.components,
              base.vocabulary.components[0],
            ],
          },
        },
      ],
      [
        "duplicate specimen",
        { specimens: [...base.specimens, base.specimens[0]] },
      ],
      [
        "implemented missing path",
        {
          specimens: [
            {
              ...base.specimens[0],
              status: "implemented",
              path: "missing.tsx",
            },
          ],
        },
      ],
      [
        "implemented outside path",
        {
          specimens: [
            {
              ...base.specimens[0],
              status: "implemented",
              path: path.relative(root, outsideSpecimen),
            },
          ],
        },
      ],
    ];
    for (const [label, change] of cases) {
      const file = path.join(root, `${label.replaceAll(" ", "-")}.json`);
      writeFileSync(file, JSON.stringify({ ...base, ...change }));
      assert.equal(validateContract(file).passed, false, label);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outsideRoot, { recursive: true, force: true });
  }
});

test("System scan is honest when no scan is configured", () => {
  const result = scanContract(systemGrammar);
  assert.deepEqual(result.nodes, []);
});

function findRepositoryRoot(startDirectory) {
  let directory = startDirectory;
  while (true) {
    if (existsSync(path.join(directory, ".git"))) {
      return directory;
    }
    const parent = path.dirname(directory);
    if (parent === directory) {
      throw new Error("Could not find the repository root");
    }
    directory = parent;
  }
}

function findTypeScriptOwner(repositoryRoot) {
  const packageJsonPaths = globSync("**/package.json", {
    cwd: repositoryRoot,
    exclude: ["**/.git/**", "**/node_modules/**"],
  }).sort();
  for (const relativePath of packageJsonPaths) {
    const packageJsonPath = path.join(repositoryRoot, relativePath);
    try {
      createRequire(packageJsonPath).resolve("typescript");
      return packageJsonPath;
    } catch {
      // This package does not provide the compiler required by bootstrap.
    }
  }
  throw new Error(
    "Bootstrap tests require one repository package with TypeScript installed",
  );
}

const repositoryRoot = findRepositoryRoot(scriptDirectory);
const packageJson = findTypeScriptOwner(repositoryRoot);

function repositoryRelative(filePath) {
  return path.relative(repositoryRoot, filePath).split(path.sep).join("/");
}

function allKeys(value, keys = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      allKeys(item, keys);
    }
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      keys.push(key);
      allKeys(child, keys);
    }
  }
  return keys;
}

test("bootstraps a deterministic observational route grammar", () => {
  const first = bootstrapEntry(entry, { packageJson });
  const second = bootstrapEntry(entry, { packageJson });

  assert.deepEqual(second, first);
  assert.equal(first.schemaVersion, "ui-grammar.bootstrap.v1");
  assert.equal(first.root.name, "SyntheticRoute");
  assert.deepEqual(
    first.traversedFiles,
    [
      path.join(fixtureRoot, "src/local-panel.tsx"),
      path.join(fixtureRoot, "src/route.tsx"),
    ].map(repositoryRelative),
  );
  assert.ok(
    first.imports.some(
      (entry) =>
        entry.local === "LocalPanel" && entry.resolution.kind === "local",
    ),
  );
  assert.ok(
    first.imports.some(
      (entry) =>
        entry.local === "Button" && entry.resolution.kind === "external",
    ),
  );
  assert.ok(
    first.renderEdges.some(
      (edge) => edge.component === "LocalPanel" && edge.resolution === "local",
    ),
  );
  const panel = first.nodes.find((node) => node.component === "LocalPanel");
  assert.equal(panel.root, "SyntheticRoute");
  assert.equal(panel.parent, "main");
  assert.deepEqual(panel.ancestors, ["main"]);
  assert.equal(panel.condition, "showPanel");
  assert.deepEqual(panel.props, {
    "...{ testMarker: true }": "spread",
    enabled: "{showPanel}",
    label: "Continue",
  });
  assert.ok(panel.source.line > 0);
  assert.ok(panel.source.column > 0);
  assert.ok(first.unknowns.some((unknown) => unknown.kind === "prop-spread"));
  assert.ok(
    first.unknowns.some((unknown) => unknown.kind === "external-component"),
  );

  const forbidden = new Set([
    "accessibility",
    "actions",
    "geometry",
    "intent",
    "owner",
    "rules",
    "semantic",
    "states",
  ]);
  assert.deepEqual(
    allKeys(first).filter((key) => forbidden.has(key)),
    [],
  );
});

test("prints the same bootstrap JSON through the CLI", () => {
  const expected = bootstrapEntry(entry, { packageJson });
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(new URL("./ui-grammar.mjs", import.meta.url)),
      "bootstrap",
      entry,
      "--package-json",
      packageJson,
    ],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), expected);

  const namedResult = spawnSync(
    process.execPath,
    [
      fileURLToPath(new URL("./ui-grammar.mjs", import.meta.url)),
      "bootstrap",
      path.join(fixtureRoot, "src/local-panel.tsx"),
      "--package-json",
      packageJson,
      "--export",
      "LocalPanel",
    ],
    { encoding: "utf8" },
  );
  assert.equal(namedResult.status, 0, namedResult.stderr);
  assert.equal(JSON.parse(namedResult.stdout).root.name, "LocalPanel");
});
