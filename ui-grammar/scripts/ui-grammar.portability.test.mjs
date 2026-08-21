import assert from "node:assert/strict";
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
    "Portability tests require one repository package with TypeScript installed",
  );
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function copyPortableSkill(adopterRoot, typeScriptOwner) {
  const copiedSkillRoot = path.join(adopterRoot, "tools/ui-grammar");
  cpSync(skillRoot, copiedSkillRoot, { recursive: true });
  const typeScriptPackage = createRequire(typeScriptOwner).resolve(
    "typescript/package.json",
  );
  const typeScriptDirectory = path.dirname(typeScriptPackage);
  const adopterModules = path.join(adopterRoot, "node_modules");
  mkdirSync(adopterModules, { recursive: true });
  symlinkSync(typeScriptDirectory, path.join(adopterModules, "typescript"));
  return import(
    pathToFileURL(path.join(copiedSkillRoot, "scripts/ui-grammar.mjs")).href
  );
}

function createGenericFixture(directory, packageJson) {
  const sourceDirectory = path.join(directory, "src");
  mkdirSync(sourceDirectory, { recursive: true });
  writeFileSync(
    path.join(sourceDirectory, "panel.tsx"),
    "export function Panel() { return <section />; }\n",
  );
  writeFileSync(
    path.join(sourceDirectory, "orientation.tsx"),
    'import { Panel } from "./panel";\nexport function Orientation() { return <Panel />; }\n',
  );
  writeFileSync(
    path.join(sourceDirectory, "presentation-panel.tsx"),
    'import { Button as PresentationButton } from "example-presentation";\nexport function PresentationPanel() { return <PresentationButton />; }\n',
  );
  writeFileSync(
    path.join(sourceDirectory, "generic-panel.tsx"),
    'import { Button } from "example-generic";\nexport function GenericPanel() { return <Button className="allowed-here" />; }\n',
  );
  writeFileSync(
    path.join(directory, "catalog.ts"),
    'export const entries = [{ id: "profile" }];\n',
  );
  writeFileSync(
    path.join(directory, "design-system.md"),
    "# Design system\n\nPresentation policy lives here.\n",
  );

  const grammar = {
    actionMatrix: [
      {
        actions: ["continue"],
        decision: "The complete collection can continue.",
        dependsOn: ["itemsCount"],
        ruleIds: ["complete-collection-continues"],
        when: {
          class: "confidential",
          color: "review-state",
          height: "high-priority",
          itemsCount: 2,
          size: "organization",
          stateKind: "ready",
          variant: "renewal",
          width: "full-account",
        },
      },
    ],
    actions: { continue: "Continue" },
    consumerPropChecks: [
      {
        components: ["Button"],
        forbiddenProps: ["style"],
        module: "example-presentation",
        reviewProps: ["className"],
      },
    ],
    implementationConstraints: [
      {
        id: "system-presentation-policy",
        owner: "design-system",
        reference: "design-system.md",
      },
    ],
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
      {
        because: "identity is invariant across review states",
        id: "panel-preserves-identity",
        modality: "must",
        object: "profile identity",
        owner: "src/panel.tsx",
        relation: "preserve",
        subject: "Panel",
        under: "every review state",
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
      renderRoots: ["PresentationPanel", "GenericPanel"],
      sources: [
        "src/panel.tsx",
        "src/presentation-panel.tsx",
        "src/generic-panel.tsx",
      ],
    },
    stackTemplate: ["Panel"],
    states: {
      ready: {
        authority: "complete",
        class: "confidential",
        color: "review-state",
        height: "high-priority",
        kind: "ready",
        size: "organization",
        variant: "renewal",
        visualOwner: "Panel",
        width: "full-account",
      },
    },
    surface: {
      compositionOwner: "Panel",
      id: "account.profile",
      intent: "review-profile",
      owner: "src/panel.tsx",
      renderRoot: "Panel",
      semanticOwner: "profile-review",
    },
    version: 2,
  };
  const request = {
    capabilities: { canContinue: true },
    class: "confidential",
    color: "review-state",
    height: "high-priority",
    items: ["first", "second"],
    job: "Review a profile",
    returnDestination: "profile-index",
    size: "organization",
    state: "ready",
    surface: "account.profile",
    variant: "renewal",
    width: "full-account",
  };
  writeJson(path.join(directory, "grammar.json"), grammar);
  writeJson(path.join(directory, "request.json"), request);
}

test("compiles product-neutral collections without a summary fallback", async () => {
  const adopterRoot = mkdtempSync(path.join(tmpdir(), "ui-grammar-portable-"));
  try {
    const typeScriptOwner = findTypeScriptOwner(
      findRepositoryRoot(scriptDirectory),
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
      await copyPortableSkill(packageRoot, typeScriptOwner);
    const bootstrap = bootstrapEntry(
      path.join(packageRoot, "src/orientation.tsx"),
      {
        exportName: "Orientation",
        packageJson,
      },
    );
    assert.equal(bootstrap.root.name, "Orientation");
    assert.deepEqual(bootstrap.traversedFiles, [
      "src/orientation.tsx",
      "src/panel.tsx",
    ]);
    const result = compileStack(
      path.join(packageRoot, "grammar.json"),
      path.join(packageRoot, "request.json"),
    );

    assert.equal(result.actionRule.when.itemsCount, 2);
    assert.deepEqual(result.actionRule.actions, ["continue"]);
    assert.equal(result.contract.surface.compositionOwner, "Panel");
    assert.deepEqual(
      result.appliedRules.map((rule) => rule.id),
      ["complete-collection-continues"],
    );
    assert.ok(
      !result.appliedRules.some(
        (rule) => rule.id === "system-presentation-policy",
      ),
    );
    assert.equal(typeof formatStack(result), "string");
  } finally {
    rmSync(adopterRoot, { force: true, recursive: true });
  }
});

test("normalizes and compiles the committed grammar version 1 fixture", async () => {
  const adopterRoot = mkdtempSync(path.join(tmpdir(), "ui-grammar-v1-"));
  try {
    const typeScriptOwner = findTypeScriptOwner(
      findRepositoryRoot(scriptDirectory),
    );
    const copiedSkillRoot = path.join(adopterRoot, "tools/ui-grammar");
    await copyPortableSkill(adopterRoot, typeScriptOwner);
    const { compileStack, validateContract } = await import(
      pathToFileURL(path.join(copiedSkillRoot, "scripts/ui-grammar.mjs")).href
    );
    const fixtureRoot = path.join(copiedSkillRoot, "examples/legacy-v1");
    const grammarPath = path.join(fixtureRoot, "grammar.json");
    const validation = validateContract(grammarPath);
    assert.equal(validation.passed, true);
    assert.deepEqual(
      validation.checks
        .filter((check) => check.severity === "warning")
        .map((check) => check.label),
      [
        "grammar version 1 is deprecated",
        "legacy surface lacks compositionOwner",
        "grammar.designSystem is deprecated",
      ],
    );
    const result = compileStack(
      grammarPath,
      path.join(fixtureRoot, "request.json"),
    );
    assert.equal(result.contract.surface.compositionOwner, "Panel");
    assert.equal(result.contract.actionResolution, "first-match");
    assert.deepEqual(result.actionLabels, ["Continue"]);

    const legacyGrammar = JSON.parse(readFileSync(grammarPath, "utf8"));
    writeFileSync(
      path.join(fixtureRoot, "src/panel.tsx"),
      'import { Button } from "example-design-system";\nexport function Panel() { return <Button />; }\n',
    );
    writeJson(grammarPath, {
      ...legacyGrammar,
      designSystem: {
        components: ["Button"],
        forbiddenConsumerProps: ["className"],
        module: "example-design-system",
      },
    });
    const populatedLegacyCheck = validateContract(grammarPath);
    assert.equal(populatedLegacyCheck.passed, true);
    assert.deepEqual(populatedLegacyCheck.contract.consumerPropChecks, [
      {
        components: ["Button"],
        forbiddenProps: ["className"],
        module: "example-design-system",
      },
    ]);
    writeJson(grammarPath, {
      ...legacyGrammar,
      designSystem: {
        components: ["Button"],
        module: "example-design-system",
      },
    });
    const observationOnlyLegacyCheck = validateContract(grammarPath);
    assert.equal(observationOnlyLegacyCheck.passed, true);
    assert.deepEqual(observationOnlyLegacyCheck.contract.consumerPropChecks, [
      {
        components: ["Button"],
        module: "example-design-system",
      },
    ]);
  } finally {
    rmSync(adopterRoot, { force: true, recursive: true });
  }
});

test("separates semantic inputs from rendering mechanisms", async () => {
  const adopterRoot = mkdtempSync(path.join(tmpdir(), "ui-grammar-boundary-"));
  try {
    const typeScriptOwner = findTypeScriptOwner(
      findRepositoryRoot(scriptDirectory),
    );
    const packageJson = path.join(adopterRoot, "package.json");
    writeJson(packageJson, { name: "boundary-adopter", private: true });
    writeJson(path.join(adopterRoot, "tsconfig.json"), {
      compilerOptions: { jsx: "preserve", moduleResolution: "bundler" },
    });
    createGenericFixture(adopterRoot, packageJson);
    const copiedSkillRoot = path.join(adopterRoot, "tools/ui-grammar");
    await copyPortableSkill(adopterRoot, typeScriptOwner);
    const { compileStack, scanContract, validateContract } = await import(
      pathToFileURL(path.join(copiedSkillRoot, "scripts/ui-grammar.mjs")).href
    );
    const grammarPath = path.join(adopterRoot, "grammar.json");
    const requestPath = path.join(adopterRoot, "request.json");
    const originalGrammar = JSON.parse(readFileSync(grammarPath, "utf8"));
    const originalRequest = JSON.parse(readFileSync(requestPath, "utf8"));

    assert.equal(validateContract(grammarPath).passed, true);
    assert.ok(
      scanContract(grammarPath).imports.some(
        (entry) =>
          entry.file === "src/presentation-panel.tsx" &&
          entry.imported === "Button" &&
          entry.local === "PresentationButton" &&
          entry.module === "example-presentation",
      ),
    );
    assert.equal(
      compileStack(grammarPath, requestPath).contract.surface.compositionOwner,
      "Panel",
    );

    writeJson(grammarPath, {
      ...originalGrammar,
      canonicalDesign: "reference",
    });
    const unknownTopLevelKey = validateContract(grammarPath);
    assert.equal(unknownTopLevelKey.passed, false);
    assert.ok(
      unknownTopLevelKey.checks.some((check) =>
        check.detail.includes("grammar.canonicalDesign: unknown key"),
      ),
    );

    writeJson(grammarPath, {
      ...originalGrammar,
      surface: { ...originalGrammar.surface, canonicalDesign: "reference" },
    });
    const unknownSurfaceKey = validateContract(grammarPath);
    assert.equal(unknownSurfaceKey.passed, false);
    assert.ok(
      unknownSurfaceKey.checks.some((check) =>
        check.detail.includes("surface.canonicalDesign: unknown key"),
      ),
    );

    writeJson(grammarPath, {
      ...originalGrammar,
      surface: {
        ...originalGrammar.surface,
        compositionOwner: undefined,
        visualOwner: "Panel",
      },
    });
    const versionTwoOwner = validateContract(grammarPath);
    assert.equal(versionTwoOwner.passed, false);
    assert.ok(
      versionTwoOwner.checks.some((check) =>
        check.detail.includes(
          "surface.compositionOwner: required in grammar version 2",
        ),
      ),
    );

    writeJson(grammarPath, {
      ...originalGrammar,
      designSystem: {},
    });
    const legacyDesignSystem = validateContract(grammarPath);
    assert.equal(legacyDesignSystem.passed, false);
    assert.ok(
      legacyDesignSystem.checks.some((check) =>
        check.detail.includes("grammar.designSystem: unknown key"),
      ),
    );

    writeJson(grammarPath, {
      ...originalGrammar,
      consumerPropChecks: originalGrammar.consumerPropChecks.map((check) => ({
        ...check,
        smellConsumerProps: ["className"],
      })),
    });
    const unknownConsumerPropCheckKey = validateContract(grammarPath);
    assert.equal(unknownConsumerPropCheckKey.passed, false);
    assert.ok(
      unknownConsumerPropCheckKey.checks.some((check) =>
        check.detail.includes(
          "consumerPropChecks[0].smellConsumerProps: unknown key",
        ),
      ),
    );

    writeFileSync(
      path.join(adopterRoot, "src/presentation-panel.tsx"),
      'import { Button as PresentationButton } from "example-presentation";\nexport function PresentationPanel() { return <PresentationButton className="review-me" />; }\n',
    );
    writeJson(grammarPath, originalGrammar);
    const reviewBoundProp = validateContract(grammarPath);
    assert.equal(reviewBoundProp.passed, true);
    assert.ok(
      reviewBoundProp.checks.some(
        (check) =>
          check.label === "configured consumers review className" &&
          check.severity === "warning" &&
          check.detail.includes("src/presentation-panel.tsx"),
      ),
    );
    writeFileSync(
      path.join(adopterRoot, "src/presentation-panel.tsx"),
      'import { Button as PresentationButton } from "example-presentation";\nexport function PresentationPanel() { return <PresentationButton style={{}} />; }\n',
    );
    const forbiddenBoundProp = validateContract(grammarPath);
    assert.equal(forbiddenBoundProp.passed, false);
    assert.ok(
      forbiddenBoundProp.checks.some(
        (check) =>
          check.label === "configured consumers omit style" &&
          check.detail.includes("src/presentation-panel.tsx"),
      ),
    );
    writeFileSync(
      path.join(adopterRoot, "src/presentation-panel.tsx"),
      'import { Button as PresentationButton } from "example-presentation";\nexport function PresentationPanel(props) { return <PresentationButton {...props} />; }\n',
    );
    const spreadBoundProps = validateContract(grammarPath);
    assert.equal(spreadBoundProps.passed, false);
    assert.ok(
      spreadBoundProps.checks.some(
        (check) =>
          check.label === "configured consumers omit style" &&
          check.detail.includes("unresolved JSX spread"),
      ),
    );
    assert.ok(
      spreadBoundProps.checks.some(
        (check) =>
          check.label === "configured consumers review className" &&
          check.severity === "warning" &&
          check.detail.includes("unresolved JSX spread"),
      ),
    );
    writeFileSync(
      path.join(adopterRoot, "src/presentation-panel.tsx"),
      'import { Button as PresentationButton } from "example-presentation";\nexport function PresentationPanel() { return <PresentationButton />; }\n',
    );

    writeJson(grammarPath, {
      ...originalGrammar,
      rules: originalGrammar.rules.map((rule) => ({
        ...rule,
        ownedBy: "stylesheet",
        status: "approved",
        text: "Use the dense class",
      })),
    });
    const freeFormRule = validateContract(grammarPath);
    assert.equal(freeFormRule.passed, false);
    for (const key of ["ownedBy", "status", "text"]) {
      assert.ok(
        freeFormRule.checks.some((check) =>
          check.detail.includes(`rules[0].${key}: unknown key`),
        ),
      );
    }

    writeFileSync(path.join(adopterRoot, "src/panel.css"), ".panel {}\n");
    writeJson(grammarPath, {
      ...originalGrammar,
      scan: {
        ...originalGrammar.scan,
        sources: ["src/panel.tsx", "src/panel.css"],
      },
    });
    const cssSource = validateContract(grammarPath);
    assert.equal(cssSource.passed, false);
    assert.ok(
      cssSource.checks.some(
        (check) =>
          check.label ===
            "scan.sources are unique repository TypeScript sources" &&
          check.detail.includes("src/panel.css: must be .ts or .tsx"),
      ),
    );

    writeJson(grammarPath, {
      ...originalGrammar,
      states: { ready: { kind: "ready", className: "dense" } },
    });
    assert.equal(validateContract(grammarPath).passed, false);

    writeJson(grammarPath, {
      ...originalGrammar,
      actionMatrix: originalGrammar.actionMatrix.map((entry) => ({
        ...entry,
        when: { ...entry.when, density: "compact" },
      })),
    });
    assert.equal(validateContract(grammarPath).passed, false);

    writeJson(grammarPath, originalGrammar);
    for (const field of ["token", "radius", "style"]) {
      const semanticRequest = {
        ...originalRequest,
        [field]: "product-meaning",
      };
      writeJson(requestPath, semanticRequest);
      assert.equal(
        compileStack(grammarPath, requestPath).actionLabels[0],
        "Continue",
      );
    }

    writeJson(requestPath, originalRequest);
    writeJson(grammarPath, {
      ...originalGrammar,
      actionMatrix: originalGrammar.actionMatrix.map((entry) => ({
        ...entry,
        ruleIds: ["system-presentation-policy"],
      })),
    });
    const implementationReference = validateContract(grammarPath);
    assert.equal(implementationReference.passed, false);
    assert.ok(
      implementationReference.checks.some((check) =>
        check.detail.includes(
          "implementation constraints are not semantic rules",
        ),
      ),
    );

    writeJson(grammarPath, {
      ...originalGrammar,
      actionMatrix: [],
      executable: false,
      stackTemplate: [],
    });
    assert.equal(validateContract(grammarPath).passed, true);
    assert.throws(
      () => compileStack(grammarPath, requestPath),
      /Grammar is observational and cannot compile requests/,
    );
  } finally {
    rmSync(adopterRoot, { force: true, recursive: true });
  }
});

test("supports scoped scan evidence, review diagnostics, and additive actions", async () => {
  const adopterRoot = mkdtempSync(path.join(tmpdir(), "ui-grammar-additive-"));
  try {
    const typeScriptOwner = findTypeScriptOwner(
      findRepositoryRoot(scriptDirectory),
    );
    const packageJson = path.join(adopterRoot, "package.json");
    writeJson(packageJson, { name: "additive-adopter", private: true });
    writeJson(path.join(adopterRoot, "tsconfig.json"), {
      compilerOptions: { jsx: "preserve", moduleResolution: "bundler" },
    });
    createGenericFixture(adopterRoot, packageJson);
    const copiedSkillRoot = path.join(adopterRoot, "tools/ui-grammar");
    await copyPortableSkill(adopterRoot, typeScriptOwner);
    const { compileStack, scanContract, validateContract } = await import(
      pathToFileURL(path.join(copiedSkillRoot, "scripts/ui-grammar.mjs")).href
    );
    const grammarPath = path.join(adopterRoot, "grammar.json");
    const requestPath = path.join(adopterRoot, "request.json");
    const grammar = JSON.parse(readFileSync(grammarPath, "utf8"));
    const request = JSON.parse(readFileSync(requestPath, "utf8"));

    const scan = scanContract(grammarPath);
    assert.ok(
      scan.nodes.some(
        (node) =>
          node.component === "PresentationButton" &&
          node.root === "PresentationPanel",
      ),
    );
    assert.ok(
      scan.relationCandidates.some(
        (relation) =>
          relation.root === "PresentationPanel" &&
          relation.subject === "PresentationPanel" &&
          relation.object === "PresentationButton",
      ),
    );

    const additiveGrammar = {
      ...grammar,
      actionResolution: "additive",
      actions: {
        continue: "Continue",
        help: "Get help: {{capabilities.canContinue}}",
      },
      actionMatrix: [
        {
          actions: ["continue"],
          decision: "Ready work can continue.",
          dependsOn: ["stateKind"],
          effects: ["record review"],
          ruleIds: ["complete-collection-continues"],
          transition: "complete",
          when: { stateKind: "ready" },
        },
        {
          actions: ["continue", "help"],
          decision: "A complete collection also exposes help.",
          dependsOn: ["capabilities.canContinue", "itemsCount"],
          effects: ["record review", "offer help"],
          ruleIds: ["panel-preserves-identity"],
          transition: "complete",
          when: { "capabilities.canContinue": true, itemsCount: 2 },
        },
      ],
    };
    writeJson(grammarPath, additiveGrammar);
    const additiveValidation = validateContract(grammarPath);
    assert.equal(additiveValidation.passed, true);
    const additive = compileStack(grammarPath, requestPath);
    assert.deepEqual(additive.actionLabels, ["Continue", "Get help: true"]);
    assert.deepEqual(additive.actionRule.effects, [
      "record review",
      "offer help",
    ]);
    assert.equal(additive.actionRule.transition, "complete");
    assert.equal(additive.actionRules.length, 2);
    assert.deepEqual(
      additive.appliedRules.map((rule) => rule.id),
      ["complete-collection-continues", "panel-preserves-identity"],
    );

    const collectionGrammar = {
      ...grammar,
      actionResolution: "additive",
      actions: {
        create: "Create source",
        open: "Open {{item.label}}",
        reconnect: "Reconnect {{item.label}}",
      },
      actionMatrix: [
        {
          actions: ["open"],
          decision: "{{item.label}} is connected.",
          dependsOn: ["item.status"],
          effects: ["open {{item.id}}"],
          forEach: "sources",
          ruleIds: ["panel-preserves-identity"],
          when: { "item.status": "connected" },
        },
        {
          actions: ["reconnect"],
          decision: "{{item.label}} needs attention.",
          dependsOn: ["item.status"],
          effects: ["reconnect {{item.id}}"],
          forEach: "sources",
          ruleIds: ["panel-preserves-identity"],
          when: { "item.status": "attention" },
        },
        {
          actions: ["create"],
          decision: "Creation remains available.",
          dependsOn: ["stateKind"],
          ruleIds: ["complete-collection-continues"],
          when: { stateKind: "ready" },
        },
      ],
    };
    writeJson(grammarPath, collectionGrammar);
    writeJson(requestPath, {
      ...request,
      sources: [
        { id: "alpha", label: "Alpha", status: "connected" },
        { id: "beta", label: "Beta", status: "attention" },
        { id: "gamma", label: "Gamma", status: "attention" },
        { id: "beta", label: "Beta", status: "attention" },
      ],
    });
    assert.equal(validateContract(grammarPath).passed, true);
    const collectionResult = compileStack(grammarPath, requestPath);
    assert.deepEqual(collectionResult.actionLabels, [
      "Open Alpha",
      "Reconnect Beta",
      "Reconnect Gamma",
      "Create source",
    ]);
    assert.deepEqual(collectionResult.actionRule.effects, [
      "open alpha",
      "reconnect beta",
      "reconnect gamma",
    ]);
    assert.deepEqual(collectionResult.actionRule.decisions, [
      "Alpha is connected.",
      "Beta needs attention.",
      "Gamma needs attention.",
      "Creation remains available.",
    ]);
    assert.deepEqual(collectionResult.actionRule.ruleIds, [
      "panel-preserves-identity",
      "complete-collection-continues",
    ]);
    writeJson(grammarPath, {
      ...collectionGrammar,
      actionResolution: "first-match",
    });
    const unsafeCollectionResolution = validateContract(grammarPath);
    assert.equal(unsafeCollectionResolution.passed, false);
    assert.ok(
      unsafeCollectionResolution.checks.some((check) =>
        check.detail.includes("forEach: requires actionResolution additive"),
      ),
    );

    writeJson(grammarPath, {
      ...grammar,
      actionMatrix: grammar.actionMatrix.map(({ dependsOn, ...rule }) => rule),
    });
    const missingDependencies = validateContract(grammarPath);
    assert.equal(missingDependencies.passed, false);
    assert.ok(
      missingDependencies.checks.some((check) =>
        check.detail.includes("actionMatrix[0].dependsOn: must be an array"),
      ),
    );
    writeJson(grammarPath, {
      ...grammar,
      actionMatrix: grammar.actionMatrix.map((rule) => ({
        ...rule,
        dependsOn: ["capabilities.canContinue"],
      })),
    });
    const undeclaredDependencyGuard = validateContract(grammarPath);
    assert.equal(undeclaredDependencyGuard.passed, false);
    assert.ok(
      undeclaredDependencyGuard.checks.some((check) =>
        check.detail.includes(
          "facts must appear in when: capabilities.canContinue",
        ),
      ),
    );

    writeJson(requestPath, request);

    writeJson(grammarPath, {
      ...additiveGrammar,
      actionMatrix: additiveGrammar.actionMatrix.map((rule, index) =>
        index === 1 ? { ...rule, transition: "support" } : rule,
      ),
    });
    assert.throws(
      () => compileStack(grammarPath, requestPath),
      /Conflicting additive transitions: complete, support/,
    );
  } finally {
    rmSync(adopterRoot, { force: true, recursive: true });
  }
});

test("executes the complete existing-route example", async () => {
  const adopterRoot = mkdtempSync(path.join(tmpdir(), "ui-grammar-example-"));
  try {
    const typeScriptOwner = findTypeScriptOwner(
      findRepositoryRoot(scriptDirectory),
    );
    const { bootstrapEntry, compileStack } = await copyPortableSkill(
      adopterRoot,
      typeScriptOwner,
    );
    const exampleRoot = path.join(
      adopterRoot,
      "tools/ui-grammar/examples/existing-route",
    );
    const bootstrap = bootstrapEntry(
      path.join(exampleRoot, "src/document-route.tsx"),
      {
        exportName: "DocumentRoute",
        packageJson: path.join(exampleRoot, "package.json"),
      },
    );
    assert.deepEqual(
      ["empty", "ready"].map(
        (request) =>
          compileStack(
            path.join(exampleRoot, "grammar.json"),
            path.join(exampleRoot, `requests/${request}.json`),
          ).actionLabels,
      ),
      [["Create document"], ["Create document", "Open Guide"]],
    );
    assert.ok(
      bootstrap.nodes.some(
        (node) =>
          node.root === "DocumentRoute" && node.component === "DocumentScreen",
      ),
    );
  } finally {
    rmSync(adopterRoot, { force: true, recursive: true });
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
