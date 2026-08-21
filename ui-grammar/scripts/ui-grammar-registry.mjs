#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  bootstrapEntry,
  compileStack,
  discoverComponentExports,
  formatStack,
  isExecutableContract,
  validateContract,
} from "./ui-grammar.mjs";

const templatePattern = /\{\{([a-zA-Z][a-zA-Z0-9]*)\}\}/g;
const typescriptSourcePattern = /\.tsx?$/;

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function resolveRegistryPath(registryPath) {
  if (!(typeof registryPath === "string" && registryPath.length > 0)) {
    throw new Error("A UI Grammar registry path is required");
  }
  return path.resolve(registryPath);
}

function repositoryPath(registry, relativePath) {
  return path.resolve(registry.repositoryRoot, relativePath);
}

function failureDetail(error) {
  return error instanceof Error ? error.message : String(error);
}

function renderTemplate(template, values) {
  if (!(typeof template === "string" && template.length > 0)) {
    throw new Error("Evidence template must be a non-empty string");
  }
  return template.replace(templatePattern, (_match, key) => {
    if (!Object.hasOwn(values, key)) {
      throw new Error(`Evidence template references unknown value: ${key}`);
    }
    return String(values[key]);
  });
}

export function loadFlowRegistry(registryPath) {
  const absoluteRegistryPath = resolveRegistryPath(registryPath);
  const registry = readJson(absoluteRegistryPath);
  return {
    ...registry,
    registryPath: absoluteRegistryPath,
    repositoryRoot: path.resolve(
      path.dirname(absoluteRegistryPath),
      registry.repositoryRoot,
    ),
  };
}

function addCheck(checks, label, pass, detail) {
  checks.push({ detail, label, pass });
}

function checkRequiredPath(checks, registry, label, relativePath) {
  if (!(typeof relativePath === "string" && relativePath.length > 0)) {
    addCheck(checks, label, false, "missing path");
    return null;
  }
  const absolutePath = repositoryPath(registry, relativePath);
  const pass = existsSync(absolutePath);
  addCheck(
    checks,
    label,
    pass,
    pass ? relativePath : `missing ${relativePath}`,
  );
  return pass ? absolutePath : null;
}

function checkFlowIdentity(checks, registry, flow, grammarPath) {
  try {
    const grammar = readJson(grammarPath);
    addCheck(
      checks,
      `${flow.id} grammar identity`,
      grammar.surface?.id === flow.id,
      grammar.surface?.id ?? "grammar has no surface id",
    );
    const grammarRoot = path.resolve(
      path.dirname(grammarPath),
      grammar.repositoryRoot ?? ".",
    );
    addCheck(
      checks,
      `${flow.id} repository root`,
      grammarRoot === registry.repositoryRoot,
      toPosix(path.relative(registry.repositoryRoot, grammarRoot)) || ".",
    );
  } catch (error) {
    addCheck(
      checks,
      `${flow.id} grammar identity`,
      false,
      failureDetail(error),
    );
  }
}

function checkGrammar(checks, flow, grammarPath) {
  try {
    const validation = validateContract(grammarPath);
    const failures = validation.checks.filter(
      (check) => !check.pass && check.severity !== "warning",
    );
    const warnings = validation.checks.filter(
      (check) => check.severity === "warning",
    );
    addCheck(
      checks,
      `${flow.id} grammar`,
      validation.passed,
      validation.passed
        ? `${validation.checks.length - warnings.length} checks passed${
            warnings.length > 0
              ? `; ${warnings.length} review warning${warnings.length === 1 ? "" : "s"}`
              : ""
          }`
        : failures.map((check) => check.label).join(", "),
    );
  } catch (error) {
    addCheck(checks, `${flow.id} grammar`, false, failureDetail(error));
  }
}

function evidenceTarget(registry, flow) {
  const targetId = flow.renderEvidence?.target;
  return targetId ? registry.evidenceTargets?.[targetId] : null;
}

function evidenceAdapterKey(command) {
  return JSON.stringify(command);
}

function loadEvidenceIds(registry, target, cache) {
  const command = target?.evidenceIdsCommand;
  if (!(Array.isArray(command) && command.length > 0)) {
    return { error: "missing evidenceIdsCommand argv array" };
  }
  if (!command.every((part) => typeof part === "string" && part.length > 0)) {
    return {
      error: "evidenceIdsCommand must contain non-empty string argv values",
    };
  }

  const key = evidenceAdapterKey(command);
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const result = spawnSync(command[0], command.slice(1), {
    cwd: registry.repositoryRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
    shell: false,
    timeout: 30_000,
    windowsHide: true,
  });
  if (result.error) {
    const loaded = {
      error: `adapter execution failed: ${failureDetail(result.error)}`,
    };
    cache.set(key, loaded);
    return loaded;
  }
  if (result.signal) {
    const loaded = { error: `adapter terminated by ${result.signal}` };
    cache.set(key, loaded);
    return loaded;
  }
  if (result.status !== 0) {
    const detail = result.stderr.trim() || `exit ${result.status}`;
    const loaded = { error: `adapter failed: ${detail}` };
    cache.set(key, loaded);
    return loaded;
  }

  try {
    const output = JSON.parse(result.stdout);
    const ids = output?.ids;
    if (!(output?.version === 1 && Array.isArray(ids))) {
      throw new Error("expected JSON object with version 1 and ids array");
    }
    if (!ids.every((id) => typeof id === "string" && id.length > 0)) {
      throw new Error("ids must contain non-empty strings");
    }
    if (new Set(ids).size !== ids.length) {
      throw new Error("ids must be unique");
    }
    const loaded = { ids: new Set(ids) };
    cache.set(key, loaded);
    return loaded;
  } catch (error) {
    const loaded = {
      error: `adapter returned invalid JSON: ${failureDetail(error)}`,
    };
    cache.set(key, loaded);
    return loaded;
  }
}

function hasEvidenceOwner(registry, flow) {
  const reference = flow.renderEvidence;
  const target = evidenceTarget(registry, flow);
  if (!(reference && target)) {
    return false;
  }
  if (!(target.source && target.ownerAnchorTemplate)) {
    return null;
  }
  const sourcePath = repositoryPath(registry, target.source);
  if (!existsSync(sourcePath)) {
    return false;
  }
  try {
    const anchor = renderTemplate(target.ownerAnchorTemplate, {
      id: reference.ownerId,
    });
    return readFileSync(sourcePath, "utf8").includes(anchor);
  } catch {
    return false;
  }
}

function checkEvidenceTemplate(checks, flow, label, template) {
  if (template === undefined) {
    return;
  }
  try {
    const rendered = renderTemplate(template, { id: "example" });
    addCheck(checks, `${flow.id} ${label}`, true, rendered);
  } catch (error) {
    addCheck(checks, `${flow.id} ${label}`, false, failureDetail(error));
  }
}

function checkRenderedEvidenceBridge(checks, registry, flow) {
  const reference = flow.renderEvidence;
  if (!reference) {
    addCheck(checks, `${flow.id} rendered evidence`, true, "not configured");
    return;
  }

  const target = evidenceTarget(registry, flow);
  addCheck(
    checks,
    `${flow.id} evidence target`,
    Boolean(target),
    target ? reference.target : `unknown target ${reference.target}`,
  );
  addCheck(
    checks,
    `${flow.id} evidence owner id`,
    typeof reference.ownerId === "string" && reference.ownerId.length > 0,
    reference.ownerId ?? "missing owner id",
  );
  if (!target) {
    return;
  }

  if (target.source) {
    checkRequiredPath(
      checks,
      registry,
      `${flow.id} evidence source`,
      target.source,
    );
  }
  addCheck(
    checks,
    `${flow.id} evidence owner lookup`,
    !(target.ownerAnchorTemplate && !target.source),
    target.ownerAnchorTemplate
      ? (target.source ?? "anchor template requires a source")
      : "not configured",
  );
  checkEvidenceTemplate(
    checks,
    flow,
    "evidence owner anchor template",
    target.ownerAnchorTemplate,
  );
  checkEvidenceTemplate(
    checks,
    flow,
    "evidence owner command template",
    target.ownerCommandTemplate,
  );
  checkEvidenceTemplate(
    checks,
    flow,
    "evidence case command template",
    target.caseCommandTemplate,
  );
  if (target.ownerAnchorTemplate) {
    const registered = hasEvidenceOwner(registry, flow);
    addCheck(
      checks,
      `${flow.id} evidence owner`,
      registered === true,
      registered
        ? `${reference.target}/${reference.ownerId}`
        : `${reference.ownerId ?? "missing owner id"} is not registered`,
    );
  }
}

function checkCaseEvidence(
  checks,
  registry,
  flow,
  flowCase,
  caseLabel,
  evidenceCache,
) {
  const configuredEvidenceIds = flowCase.renderEvidenceIds ?? [];
  const evidenceIds = Array.isArray(configuredEvidenceIds)
    ? configuredEvidenceIds
    : [];
  const validIds =
    Array.isArray(configuredEvidenceIds) &&
    evidenceIds.every((id) => typeof id === "string" && id.length > 0) &&
    new Set(evidenceIds).size === evidenceIds.length;
  const target = evidenceTarget(registry, flow);
  const inventory =
    evidenceIds.length > 0
      ? loadEvidenceIds(registry, target, evidenceCache)
      : null;
  const unknownIds = inventory?.ids
    ? evidenceIds.filter((id) => !inventory.ids.has(id))
    : [];
  let detail = "must be an array";
  if (Array.isArray(configuredEvidenceIds)) {
    detail = evidenceIds.join(", ") || "none";
    if (inventory?.error) {
      detail = inventory.error;
    } else if (unknownIds.length > 0) {
      detail = `unknown ids: ${unknownIds.join(", ")}`;
    }
  }
  const adapterPasses = evidenceIds.length === 0 || !inventory?.error;
  addCheck(
    checks,
    `${caseLabel} evidence id adapter`,
    adapterPasses,
    evidenceIds.length === 0
      ? "not required"
      : (inventory?.error ?? `${inventory.ids.size} available ids`),
  );
  addCheck(
    checks,
    `${caseLabel} rendered evidence ids`,
    validIds &&
      (evidenceIds.length === 0 || Boolean(target?.caseCommandTemplate)) &&
      adapterPasses &&
      unknownIds.length === 0,
    detail,
  );
}

function checkFlowCases(checks, registry, flow, grammarPath, evidenceCache) {
  const caseIds = new Set();
  for (const flowCase of flow.cases ?? []) {
    const caseLabel = `${flow.id}/${flowCase.id}`;
    const unique = typeof flowCase.id === "string" && !caseIds.has(flowCase.id);
    caseIds.add(flowCase.id);
    addCheck(
      checks,
      `${caseLabel} identity`,
      unique,
      unique ? flowCase.id : "missing or duplicate case id",
    );
    const requestPath = checkRequiredPath(
      checks,
      registry,
      `${caseLabel} request`,
      flowCase.request,
    );
    checkCaseEvidence(
      checks,
      registry,
      flow,
      flowCase,
      caseLabel,
      evidenceCache,
    );
    if (!requestPath) {
      continue;
    }
    try {
      const request = readJson(requestPath);
      addCheck(
        checks,
        `${caseLabel} request identity`,
        request.surface === flow.id,
        request.surface ?? "request has no surface id",
      );
      compileStack(grammarPath, requestPath);
      addCheck(checks, `${caseLabel} compile`, true, "derived a UI stack");
    } catch (error) {
      addCheck(checks, `${caseLabel} compile`, false, failureDetail(error));
    }
  }
}

function checkEntryExport(checks, flow, entryPath, packagePath) {
  if (!(entryPath && packagePath)) {
    if (entryPath || packagePath) {
      addCheck(
        checks,
        `${flow.id} entry export`,
        false,
        "entry and package paths must both resolve",
      );
    }
    return;
  }
  const exportName = flow.entry?.export;
  if (typeof exportName !== "string" || exportName.length === 0) {
    addCheck(checks, `${flow.id} entry export`, false, "missing export");
    return;
  }
  try {
    const bootstrap = bootstrapEntry(entryPath, {
      exportName,
      packageJson: packagePath,
    });
    addCheck(
      checks,
      `${flow.id} entry export`,
      Boolean(bootstrap.root),
      bootstrap.root?.name ?? exportName,
    );
  } catch (error) {
    addCheck(checks, `${flow.id} entry export`, false, failureDetail(error));
  }
}

function checkFlow(checks, registry, flow, evidenceCache) {
  const entryPath = checkRequiredPath(
    checks,
    registry,
    `${flow.id} entry`,
    flow.entry?.file,
  );
  const packagePath = checkRequiredPath(
    checks,
    registry,
    `${flow.id} package`,
    flow.entry?.packageJson,
  );
  const grammarPath = checkRequiredPath(
    checks,
    registry,
    `${flow.id} grammar file`,
    flow.grammar,
  );
  checkEntryExport(checks, flow, entryPath, packagePath);
  checkRenderedEvidenceBridge(checks, registry, flow);
  if (grammarPath) {
    checkFlowIdentity(checks, registry, flow, grammarPath);
    checkGrammar(checks, flow, grammarPath);
    const grammar = readJson(grammarPath);
    const executable = isExecutableContract(grammar);
    const hasCases = Array.isArray(flow.cases) && flow.cases.length > 0;
    addCheck(
      checks,
      `${flow.id} cases`,
      executable ? hasCases : !hasCases,
      executable && hasCases
        ? `${flow.cases.length} case${flow.cases.length === 1 ? "" : "s"}`
        : executable
          ? "executable grammars require a non-empty cases array"
          : hasCases
            ? "non-executable grammars cannot declare compile cases"
            : "not required for a non-executable grammar",
    );
    if (executable && hasCases) {
      checkFlowCases(checks, registry, flow, grammarPath, evidenceCache);
    }
  }
}

export function checkFlowRegistry(registryPath) {
  let registry;
  try {
    registry = loadFlowRegistry(registryPath);
  } catch (error) {
    return {
      checks: [
        {
          detail: failureDetail(error),
          label: "registry",
          pass: false,
        },
      ],
      passed: false,
      registry: null,
    };
  }
  const checks = [];
  const evidenceCache = new Map();
  addCheck(
    checks,
    "registry version",
    registry.version === 1,
    String(registry.version),
  );
  const flows = Array.isArray(registry.flows) ? registry.flows : [];
  addCheck(
    checks,
    "registered flows",
    flows.length > 0,
    `${flows.length} flow${flows.length === 1 ? "" : "s"}`,
  );
  const ids = new Set();
  for (const flow of flows) {
    const unique = typeof flow.id === "string" && !ids.has(flow.id);
    ids.add(flow.id);
    addCheck(
      checks,
      `${flow.id ?? "unknown flow"} identity`,
      unique,
      unique ? flow.id : "missing or duplicate flow id",
    );
    if (unique) {
      checkFlow(checks, registry, flow, evidenceCache);
    }
  }
  return {
    checks,
    passed: checks.every((check) => check.pass),
    registry,
  };
}

function normalizeQueryPath(registry, query) {
  const absolute = path.isAbsolute(query)
    ? path.resolve(query)
    : path.resolve(registry.repositoryRoot, query);
  return toPosix(path.relative(registry.repositoryRoot, absolute));
}

function grammarSources(registry, flow) {
  try {
    return readJson(repositoryPath(registry, flow.grammar)).scan?.sources ?? [];
  } catch {
    return [];
  }
}

export function findFlow(registry, query) {
  const byId = registry.flows.find((flow) => flow.id === query);
  if (byId) {
    return byId;
  }
  const queryPath = normalizeQueryPath(registry, query);
  const matches = registry.flows.filter((flow) => {
    if (flow.entry.file === queryPath) {
      return true;
    }
    if (grammarSources(registry, flow).includes(queryPath)) {
      return true;
    }
    const owner = readJson(repositoryPath(registry, flow.grammar)).surface
      ?.owner;
    return (
      typeof owner === "string" &&
      !owner.includes(" + ") &&
      (queryPath === owner || queryPath.startsWith(`${owner}/`))
    );
  });
  if (matches.length > 1) {
    throw new Error(
      `Ambiguous UI Grammar flow for ${query}: ${matches
        .map((flow) => flow.id)
        .join(", ")}`,
    );
  }
  return matches[0] ?? null;
}

function summarizeUnknowns(unknowns) {
  const counts = new Map();
  for (const unknown of unknowns) {
    counts.set(unknown.kind, (counts.get(unknown.kind) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([kind, count]) => `${kind} (${count})`);
}

function findNearestPackageJson(entryPath) {
  let directory = path.dirname(entryPath);
  while (true) {
    const packageJson = path.join(directory, "package.json");
    if (existsSync(packageJson)) {
      return packageJson;
    }
    const parent = path.dirname(directory);
    if (parent === directory) {
      return null;
    }
    directory = parent;
  }
}

function inspectUnconfiguredEntry(registry, query) {
  const entryPath = path.isAbsolute(query)
    ? path.resolve(query)
    : repositoryPath(registry, query);
  if (!(existsSync(entryPath) && typescriptSourcePattern.test(entryPath))) {
    return { configured: false, query };
  }
  const packageJson = findNearestPackageJson(entryPath);
  if (!packageJson) {
    return { configured: false, entry: query, query };
  }
  try {
    let bootstrap = bootstrapEntry(entryPath, {
      exportName: "default",
      packageJson,
    });
    let exportName = "default";
    let candidateExports = [];
    if (!bootstrap.root) {
      candidateExports = discoverComponentExports(entryPath, { packageJson });
      const namedCandidates = candidateExports.filter(
        (candidate) => candidate !== "default",
      );
      if (namedCandidates.length === 1) {
        exportName = namedCandidates[0];
        bootstrap = bootstrapEntry(entryPath, { exportName, packageJson });
      }
    }
    return {
      bootstrap,
      candidateExports,
      configured: false,
      entry: normalizeQueryPath(registry, entryPath),
      exportName,
      packageJson: normalizeQueryPath(registry, packageJson),
      query,
    };
  } catch (error) {
    return {
      configured: false,
      entry: normalizeQueryPath(registry, entryPath),
      error: failureDetail(error),
      packageJson: normalizeQueryPath(registry, packageJson),
      query,
    };
  }
}

function resolvedEvidence(registry, flow) {
  const reference = flow.renderEvidence;
  const target = evidenceTarget(registry, flow);
  if (!(reference && target)) {
    return null;
  }
  return {
    ownerCommand: target.ownerCommandTemplate
      ? renderTemplate(target.ownerCommandTemplate, {
          id: reference.ownerId,
        })
      : null,
    ownerId: reference.ownerId,
    registered: hasEvidenceOwner(registry, flow),
    source: target.source ?? null,
    target: reference.target,
  };
}

export function inspectFlow(query, options = {}) {
  const check = checkFlowRegistry(options.registryPath);
  if (!check.passed) {
    const failures = check.checks
      .filter((candidate) => !candidate.pass)
      .map((candidate) => `${candidate.label}: ${candidate.detail}`)
      .join("\n");
    throw new Error(`UI Grammar registry is invalid:\n${failures}`);
  }
  const registry = check.registry;
  const flow = findFlow(registry, query);
  if (!flow) {
    return inspectUnconfiguredEntry(registry, query);
  }
  const grammarPath = repositoryPath(registry, flow.grammar);
  const contract = readJson(grammarPath);
  const bootstrap = bootstrapEntry(repositoryPath(registry, flow.entry.file), {
    exportName: flow.entry.export,
    packageJson: repositoryPath(registry, flow.entry.packageJson),
  });
  const renderEvidence = resolvedEvidence(registry, flow);
  const target = evidenceTarget(registry, flow);
  const cases = (flow.cases ?? []).map((flowCase) => {
    const requestPath = repositoryPath(registry, flowCase.request);
    const evidenceIds = Array.isArray(flowCase.renderEvidenceIds)
      ? flowCase.renderEvidenceIds
      : [];
    return {
      ...flowCase,
      renderEvidenceCommands: target?.caseCommandTemplate
        ? evidenceIds.map((id) =>
            renderTemplate(target.caseCommandTemplate, { id }),
          )
        : [],
      result: compileStack(grammarPath, requestPath),
    };
  });
  return {
    bootstrap,
    cases,
    configured: true,
    contract,
    flow,
    registryPath: registry.registryPath,
    renderEvidence,
    unknownSummary: summarizeUnknowns(bootstrap.unknowns),
  };
}

export function formatRegistryCheck(result) {
  const lines = ["# UI Grammar Registry", ""];
  for (const check of result.checks) {
    lines.push(
      `- ${check.pass ? "PASS" : "FAIL"} — ${check.label} (${check.detail})`,
    );
  }
  lines.push("", result.passed ? "Result: PASS" : "Result: FAIL");
  return lines.join("\n");
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: one formatter intentionally branches by receipt section.
export function formatInspection(inspection) {
  if (!inspection.configured) {
    const lines = [
      "# UI Grammar Orientation",
      "",
      `Query: ${inspection.query}`,
      "Configuration: missing",
    ];
    if (inspection.entry) {
      lines.push(`Entry: ${inspection.entry}`);
    }
    if (inspection.bootstrap) {
      const root = inspection.bootstrap.root;
      lines.push(
        `Observed root: ${root?.name ?? "unavailable"}`,
        ...(inspection.exportName
          ? [`Observed export: ${inspection.exportName}`]
          : []),
        `Reachable roots: ${inspection.bootstrap.traversedRoots.length}`,
        `Unknown boundaries: ${inspection.bootstrap.unknowns.length}`,
      );
      if (!root && inspection.candidateExports?.length > 0) {
        lines.push(
          `Candidate exports: ${inspection.candidateExports.join(", ")}`,
        );
      }
    } else if (inspection.error) {
      lines.push(`Bootstrap: ${inspection.error}`);
    }
    lines.push(
      "",
      "No semantic rules were inferred. Configure a flow before compiling a UI stack.",
    );
    return lines.join("\n");
  }
  const { bootstrap, contract, flow, renderEvidence } = inspection;
  const lines = [
    `# UI Grammar Orientation: ${flow.id}`,
    "",
    `Intent: ${contract.surface.intent}`,
    `Owner: ${contract.surface.owner}`,
    `Entry: ${flow.entry.file}#${flow.entry.export}`,
    `Grammar: ${flow.grammar}`,
    `Render root: ${contract.surface.renderRoot}`,
    "",
    "## Source orientation",
    "",
    `Observed root: ${bootstrap.root.name}`,
    `Reachable roots: ${bootstrap.traversedRoots.length}`,
    `Unknown boundaries: ${bootstrap.unknowns.length}`,
    ...(inspection.unknownSummary.length > 0
      ? inspection.unknownSummary.map((summary) => `- ${summary}`)
      : ["- none"]),
  ];
  if (renderEvidence) {
    let registration = "missing";
    if (renderEvidence.registered === null) {
      registration = "not checked";
    } else if (renderEvidence.registered) {
      registration = "registered";
    }
    lines.push(
      "",
      "## Rendered evidence bridge",
      "",
      `Evidence target: ${renderEvidence.target}/${renderEvidence.ownerId} (${registration})`,
    );
    if (renderEvidence.ownerCommand) {
      lines.push(`Rendered evidence command: ${renderEvidence.ownerCommand}`);
    }
  }
  for (const flowCase of inspection.cases) {
    lines.push(
      "",
      `## Case: ${flowCase.id}`,
      "",
      `Request: ${flowCase.request}`,
      ...flowCase.renderEvidenceCommands.map(
        (command) => `Rendered evidence command: ${command}`,
      ),
      "",
      formatStack(flowCase.result),
    );
  }
  return lines.join("\n");
}

export function formatFlowList(registry) {
  const lines = ["# UI Grammar Flows", ""];
  for (const flow of registry.flows) {
    const grammar = readJson(repositoryPath(registry, flow.grammar));
    const evidence = flow.renderEvidence
      ? `evidence ${flow.renderEvidence.target}/${flow.renderEvidence.ownerId}`
      : "evidence not configured";
    lines.push(`- ${flow.id} — ${grammar.surface.intent} — ${evidence}`);
  }
  return lines.join("\n");
}

function usage() {
  return [
    "Usage:",
    "  ui-grammar-registry.mjs validate <grammar.json>",
    "  ui-grammar-registry.mjs list <registry.json>",
    "  ui-grammar-registry.mjs check <registry.json>",
    "  ui-grammar-registry.mjs inspect <registry.json> <flow-id|source-file>",
  ].join("\n");
}

function runCli() {
  const [command, registryPath, query] = process.argv.slice(2);
  if (command === "validate" && registryPath && !query) {
    const result = validateContract(registryPath);
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
    return;
  }
  if (command === "list" && registryPath && !query) {
    console.log(formatFlowList(loadFlowRegistry(registryPath)));
    return;
  }
  if (command === "check" && registryPath && !query) {
    const result = checkFlowRegistry(registryPath);
    console.log(formatRegistryCheck(result));
    if (!result.passed) {
      process.exitCode = 1;
    }
    return;
  }
  if (command === "inspect" && registryPath && query) {
    console.log(formatInspection(inspectFlow(query, { registryPath })));
    return;
  }
  throw new Error(usage());
}

function isCliEntry() {
  if (!process.argv[1]) {
    return false;
  }
  try {
    return (
      realpathSync(process.argv[1]) ===
      realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return (
      path.resolve(process.argv[1]) ===
      path.resolve(fileURLToPath(import.meta.url))
    );
  }
}

const isCli = isCliEntry();

if (isCli) {
  try {
    runCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
