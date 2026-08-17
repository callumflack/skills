import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, globSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrapEntry } from "./ui-grammar.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const fixtureRoot = path.resolve(scriptDirectory, "../examples/bootstrap");
const entry = path.join(fixtureRoot, "src/route.tsx");

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
    "Bootstrap tests require one repository package with TypeScript installed"
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
    ].map(repositoryRelative)
  );
  assert.ok(
    first.imports.some(
      (entry) =>
        entry.local === "LocalPanel" && entry.resolution.kind === "local"
    )
  );
  assert.ok(
    first.imports.some(
      (entry) =>
        entry.local === "Button" && entry.resolution.kind === "external"
    )
  );
  assert.ok(
    first.renderEdges.some(
      (edge) => edge.component === "LocalPanel" && edge.resolution === "local"
    )
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
    first.unknowns.some((unknown) => unknown.kind === "external-component")
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
    []
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
    { encoding: "utf8" }
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
    { encoding: "utf8" }
  );
  assert.equal(namedResult.status, 0, namedResult.stderr);
  assert.equal(JSON.parse(namedResult.stdout).root.name, "LocalPanel");
});
