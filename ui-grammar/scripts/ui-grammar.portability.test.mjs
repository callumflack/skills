import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  globSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(scriptDirectory, "..");
const portableFilePattern = /\.(?:json|md|mjs|ts|tsx|yaml)$/;
const observedRootPattern = /Observed root: Orientation/;
const adoptingProductPatterns = [
  /\bUnity\b/i,
  /\bVana\b/i,
  /apps\/(?:web|desktop|mobile|account)/,
  /App Permissions/i,
  /MCP Approval/i,
  /Settings Sources/i,
  /surface-capture/i,
  /Personal Server/i,
  /permissionCount/,
];

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
      // Keep looking for an owning React package with TypeScript installed.
    }
  }
  throw new Error(
    "Portability tests require one repository package with TypeScript installed"
  );
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function copyPortableSkill(adopterRoot, typeScriptOwner) {
  const copiedSkillRoot = path.join(adopterRoot, "tools/ui-grammar");
  cpSync(skillRoot, copiedSkillRoot, { recursive: true });
  const typeScriptPackage = createRequire(typeScriptOwner).resolve(
    "typescript/package.json"
  );
  const typeScriptDirectory = path.dirname(typeScriptPackage);
  const adopterModules = path.join(adopterRoot, "node_modules");
  mkdirSync(adopterModules, { recursive: true });
  symlinkSync(typeScriptDirectory, path.join(adopterModules, "typescript"));
  return import(
    pathToFileURL(path.join(copiedSkillRoot, "scripts/ui-grammar-registry.mjs"))
      .href
  );
}

function createGenericFixture(directory, packageJson) {
  const sourceDirectory = path.join(directory, "src");
  mkdirSync(sourceDirectory, { recursive: true });
  writeFileSync(
    path.join(sourceDirectory, "panel.tsx"),
    "export function Panel() { return <section />; }\n"
  );
  writeFileSync(
    path.join(sourceDirectory, "orientation.tsx"),
    'import { Panel } from "./panel";\nexport function Orientation() { return <Panel />; }\n'
  );
  writeFileSync(
    path.join(directory, "catalog.ts"),
    'export const entries = [{ id: "profile" }];\n'
  );

  const grammar = {
    actionMatrix: [
      {
        actions: ["continue"],
        decision: "The complete collection can continue.",
        ruleIds: ["complete-collection-continues"],
        when: { itemsCount: 2, stateKind: "ready" },
      },
    ],
    actions: { continue: "Continue" },
    designSystem: {
      components: [],
      forbiddenConsumerProps: [],
      module: "example-design-system",
    },
    observedRelations: [],
    repositoryRoot: ".",
    requiredSlots: [],
    rules: [
      {
        because: "the collection is complete",
        id: "complete-collection-continues",
        modality: "must",
        object: "the next step",
        owner: "src/panel.tsx",
        relation: "expose",
        subject: "Panel",
        under: "a complete collection",
        witnesses: [
          {
            anchor: "function Panel",
            path: "src/panel.tsx",
          },
        ],
      },
    ],
    scan: {
      packageJson,
      renderRoots: [],
      sources: ["src/panel.tsx"],
    },
    stackTemplate: ["Panel"],
    states: { ready: { kind: "ready" } },
    surface: {
      id: "account.profile",
      intent: "review-profile",
      owner: "src/panel.tsx",
      renderRoot: "Panel",
    },
    version: 1,
  };
  const request = {
    items: ["first", "second"],
    job: "Review a profile",
    state: "ready",
    surface: "account.profile",
  };
  writeJson(path.join(directory, "grammar.json"), grammar);
  writeJson(path.join(directory, "request.json"), request);

  return {
    cases: [
      {
        id: "complete",
        request: "request.json",
      },
    ],
    entry: {
      export: "Panel",
      file: "src/panel.tsx",
      packageJson,
    },
    grammar: "grammar.json",
    id: "account.profile",
  };
}

test("compiles product-neutral collections without a summary fallback", async () => {
  const adopterRoot = mkdtempSync(path.join(tmpdir(), "ui-grammar-portable-"));
  try {
    const typeScriptOwner = findTypeScriptOwner(
      findRepositoryRoot(scriptDirectory)
    );
    const packageRoot = path.join(adopterRoot, "packages/product");
    mkdirSync(packageRoot, { recursive: true });
    const packageJson = path.join(packageRoot, "package.json");
    writeJson(packageJson, { name: "synthetic-adopter", private: true });
    writeJson(path.join(packageRoot, "tsconfig.json"), {
      compilerOptions: { jsx: "preserve", moduleResolution: "bundler" },
    });
    createGenericFixture(packageRoot, packageJson);
    const { bootstrapEntry, compileStack, formatStack } =
      await copyPortableSkill(packageRoot, typeScriptOwner).then(
        async (registryModule) => ({
          ...registryModule,
          ...(await import(
            pathToFileURL(
              path.join(packageRoot, "tools/ui-grammar/scripts/ui-grammar.mjs")
            ).href
          )),
        })
      );
    const bootstrap = bootstrapEntry(
      path.join(packageRoot, "src/orientation.tsx"),
      {
        exportName: "Orientation",
        packageJson,
      }
    );
    assert.equal(bootstrap.root.name, "Orientation");
    assert.deepEqual(bootstrap.traversedFiles, [
      "src/orientation.tsx",
      "src/panel.tsx",
    ]);
    const result = compileStack(
      path.join(packageRoot, "grammar.json"),
      path.join(packageRoot, "request.json")
    );

    assert.equal(result.actionRule.when.itemsCount, 2);
    assert.deepEqual(result.actionRule.actions, ["continue"]);
    assert.equal(typeof formatStack(result), "string");
  } finally {
    rmSync(adopterRoot, { force: true, recursive: true });
  }
});

test("accepts absent evidence and a non-capture evidence adapter", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "ui-grammar-registry-"));
  try {
    const typeScriptOwner = findTypeScriptOwner(
      findRepositoryRoot(scriptDirectory)
    );
    const packageJson = path.join(directory, "package.json");
    writeJson(packageJson, { name: "evidence-adopter", private: true });
    const { checkFlowRegistry, formatInspection, inspectFlow } =
      await copyPortableSkill(directory, typeScriptOwner);
    const flow = createGenericFixture(directory, packageJson);
    const registryPath = path.join(directory, "registry.json");
    writeJson(registryPath, {
      flows: [flow],
      repositoryRoot: ".",
      version: 1,
    });
    assert.equal(checkFlowRegistry(registryPath).passed, true);

    writeFileSync(
      path.join(directory, "src/default-panel.tsx"),
      "export default function DefaultPanel() { return <section />; }\n"
    );
    flow.entry = {
      export: "default",
      file: "src/default-panel.tsx",
      packageJson,
    };
    writeJson(registryPath, {
      flows: [flow],
      repositoryRoot: ".",
      version: 1,
    });
    assert.equal(checkFlowRegistry(registryPath).passed, true);
    flow.entry = {
      export: "Panel",
      file: "src/panel.tsx",
      packageJson,
    };

    flow.entry.export = "MissingPanel";
    writeJson(registryPath, {
      flows: [flow],
      repositoryRoot: ".",
      version: 1,
    });
    const staleExport = checkFlowRegistry(registryPath);
    assert.equal(staleExport.passed, false);
    assert.ok(
      staleExport.checks.some(
        (check) => check.label === "account.profile entry export" && !check.pass
      )
    );
    flow.entry.export = "Panel";

    flow.entry.export = "";
    writeJson(registryPath, {
      flows: [flow],
      repositoryRoot: ".",
      version: 1,
    });
    const missingExport = checkFlowRegistry(registryPath);
    assert.equal(missingExport.passed, false);
    assert.ok(
      missingExport.checks.some(
        (check) =>
          check.label === "account.profile entry export" &&
          check.detail === "missing export"
      )
    );
    flow.entry.export = "Panel";

    writeFileSync(
      path.join(directory, "catalog-ids.mjs"),
      'process.stdout.write(JSON.stringify({ version: 1, ids: ["profile.complete"] }));\n'
    );

    flow.renderEvidence = {
      ownerId: "profile",
      target: "visual-catalog",
    };
    writeJson(registryPath, {
      evidenceTargets: {
        "visual-catalog": {
          ownerAnchorTemplate: 'id: "{{id}}"',
          ownerCommandTemplate: "node catalog.mjs --entry {{id}}",
          caseCommandTemplate: "node catalog.mjs --only {{id}}",
          source: "catalog.ts",
          evidenceIdsCommand: [process.execPath, "catalog-ids.mjs"],
        },
      },
      flows: [flow],
      repositoryRoot: ".",
      version: 1,
    });
    assert.equal(checkFlowRegistry(registryPath).passed, true);
    assert.equal(
      inspectFlow("account.profile", { registryPath }).renderEvidence
        .registered,
      true
    );

    flow.cases[0].renderEvidenceIds = ["profile.missing"];
    writeJson(registryPath, {
      evidenceTargets: {
        "visual-catalog": {
          evidenceIdsCommand: [process.execPath, "catalog-ids.mjs"],
          ownerAnchorTemplate: 'id: "{{id}}"',
          ownerCommandTemplate: "node catalog.mjs --entry {{id}}",
          caseCommandTemplate: "node catalog.mjs --only {{id}}",
          source: "catalog.ts",
        },
      },
      flows: [flow],
      repositoryRoot: ".",
      version: 1,
    });
    const staleEvidenceId = checkFlowRegistry(registryPath);
    assert.equal(staleEvidenceId.passed, false);
    assert.ok(
      staleEvidenceId.checks.some(
        (check) =>
          check.label === "account.profile/complete rendered evidence ids" &&
          check.detail === "unknown ids: profile.missing"
      )
    );
    flow.cases[0].renderEvidenceIds = ["profile.complete"];
    writeJson(registryPath, {
      evidenceTargets: {
        "visual-catalog": {
          evidenceIdsCommand: [process.execPath, "catalog-ids.mjs"],
          ownerAnchorTemplate: 'id: "{{id}}"',
          ownerCommandTemplate: "node catalog.mjs --entry {{id}}",
          caseCommandTemplate: "node catalog.mjs --only {{id}}",
          source: "catalog.ts",
        },
      },
      flows: [flow],
      repositoryRoot: ".",
      version: 1,
    });

    writeFileSync(
      path.join(directory, "catalog-ids.mjs"),
      'process.stdout.write("not-json");\n'
    );
    const malformedAdapter = checkFlowRegistry(registryPath);
    assert.equal(malformedAdapter.passed, false);
    assert.ok(
      malformedAdapter.checks.some(
        (check) =>
          check.label === "account.profile/complete evidence id adapter" &&
          !check.pass
      )
    );
    writeFileSync(
      path.join(directory, "catalog-ids.mjs"),
      "process.exit(1);\n"
    );
    const failingAdapter = checkFlowRegistry(registryPath);
    assert.equal(failingAdapter.passed, false);
    assert.ok(
      failingAdapter.checks.some(
        (check) =>
          check.label === "account.profile/complete evidence id adapter" &&
          !check.pass &&
          check.detail.startsWith("adapter failed:")
      )
    );
    writeFileSync(
      path.join(directory, "catalog-ids.mjs"),
      'process.stdout.write(JSON.stringify({ version: 1, ids: ["profile.complete"] }));\n'
    );
    const orientation = inspectFlow("src/orientation.tsx", { registryPath });
    assert.equal(orientation.configured, false);
    assert.equal(orientation.bootstrap.root.name, "Orientation");
    assert.equal(orientation.exportName, "Orientation");
    assert.match(formatInspection(orientation), observedRootPattern);

    const copiedRegistryCli = path.join(
      directory,
      "tools/ui-grammar/scripts/ui-grammar-registry.mjs"
    );
    const orientationCli = spawnSync(
      process.execPath,
      [copiedRegistryCli, "inspect", registryPath, "src/orientation.tsx"],
      { encoding: "utf8" }
    );
    assert.equal(orientationCli.status, 0, orientationCli.stderr);
    assert.match(orientationCli.stdout, observedRootPattern);

    flow.cases = undefined;
    writeJson(registryPath, {
      evidenceTargets: {
        "visual-catalog": {
          evidenceIdsCommand: [process.execPath, "catalog-ids.mjs"],
          ownerAnchorTemplate: 'id: "{{id}}"',
          ownerCommandTemplate: "node catalog.mjs --entry {{id}}",
          source: "catalog.ts",
        },
      },
      flows: [flow],
      repositoryRoot: ".",
      version: 1,
    });
    const invalidCases = checkFlowRegistry(registryPath);
    assert.equal(invalidCases.passed, false);
    assert.ok(
      invalidCases.checks.some(
        (check) =>
          check.label === "account.profile cases" &&
          check.detail === "must be a non-empty array"
      )
    );
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("contains no adopting-product knowledge", () => {
  const thisTest = fileURLToPath(import.meta.url);
  const leaks = globSync("**/*", {
    cwd: skillRoot,
    exclude: ["**/node_modules/**"],
  })
    .map((relativePath) => path.join(skillRoot, relativePath))
    .filter((filePath) => filePath !== thisTest)
    .filter((filePath) => portableFilePattern.test(filePath))
    .flatMap((filePath) => {
      const source = readFileSync(filePath, "utf8");
      return adoptingProductPatterns
        .filter((pattern) => pattern.test(source))
        .map((pattern) => `${path.relative(skillRoot, filePath)}: ${pattern}`);
    });

  assert.deepEqual(leaks, []);
});
