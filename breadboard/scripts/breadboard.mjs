#!/usr/bin/env node
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  realpathSync,
  statSync,
} from "node:fs";
import { dirname, resolve, relative, isAbsolute, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const skill = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const usage = `Usage:
  node scripts/breadboard.mjs render DEFINITION [--out INDEX_HTML] [--root REPO]
  node scripts/breadboard.mjs check DEFINITION [--out INDEX_HTML] [--root REPO]
  node scripts/breadboard.mjs record-sources DEFINITION [--root REPO] [--source PATH ...]

Root defaults to cwd. Output defaults to index.html beside DEFINITION.
Only record-sources updates reviewed hashes. No command fetches remote sources.
Exit 0 means mapped bytes match, 1 means invalid/drift/stale, 2 means unknown.
Render writes draft artifacts even when source status is unknown or drifted.`;
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const inside = (root, path) => {
  const part = relative(root, path);
  return (
    part === "" ||
    (!part.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) &&
      part !== ".." &&
      !isAbsolute(part))
  );
};

function canonicalPath(path) {
  let ancestor = path;
  while (!existsSync(ancestor)) {
    const parent = dirname(ancestor);
    if (parent === ancestor) break;
    ancestor = parent;
  }
  return resolve(realpathSync(ancestor), relative(ancestor, path));
}

function confined(root, path) {
  const canonical = canonicalPath(path);
  if (!inside(root, canonical))
    throw new Error(`Path or symlink target escapes --root: ${path}`);
  return canonical;
}

function repositoryPath(root, path) {
  if (
    typeof path !== "string" ||
    !path ||
    isAbsolute(path) ||
    /[\\\x00-\x1f?#]/.test(path) ||
    path.split("/").some((part) => !part || part === "." || part === "..")
  )
    throw new Error(`Source path must be repository-relative: ${String(path)}`);
  return confined(root, resolve(root, path));
}

function localLink(root, output, url) {
  if (url.startsWith("https://")) return undefined;
  const raw = url.split(/[?#]/, 1)[0];
  if (!raw) return undefined;
  let path;
  try {
    path = decodeURIComponent(raw);
  } catch {
    throw new Error(`Invalid URL encoding: ${url}`);
  }
  if (/[\\\x00-\x1f]/.test(path) || isAbsolute(path) || path.startsWith("/"))
    throw new Error(`Unsafe local source URL: ${url}`);
  return confined(root, resolve(dirname(output), path));
}

function verifyVendor() {
  const provenance = JSON.parse(
    readFileSync(resolve(skill, "references/provenance.json"), "utf8"),
  );
  if (!Array.isArray(provenance.files))
    throw new Error("Vendor provenance needs a files array");
  const required = [
    "assets/unity/viewer.template.html",
    "assets/unity/interactions.mjs",
  ];
  for (const path of required) {
    const entries = provenance.files.filter((entry) => entry.path === path);
    if (entries.length !== 1)
      throw new Error(`Missing or duplicate vendor provenance: ${path}`);
  }
  for (const entry of provenance.files) {
    const path = repositoryPath(realpathSync(skill), entry.path);
    if (
      !/^[a-f0-9]{64}$/.test(entry.sha256) ||
      digest(readFileSync(path)) !== entry.sha256
    )
      throw new Error(`Vendor integrity mismatch: ${entry.path}`);
  }
}

function sourceRecords(definition, root, output) {
  const records = [];
  for (const [viewId, view] of Object.entries(definition.views)) {
    for (const node of view.nodes) {
      const requirements = view.requirements
        .filter((item) =>
          [...item.blocks, ...(item.contextBlocks ?? [])].includes(node.id),
        )
        .map((item) => item.id);
      for (const source of node.sources) {
        if (typeof source.label !== "string" || !source.label.trim())
          throw new Error(`${viewId}: ${node.id} source needs a label`);
        if (
          source.role !== undefined &&
          !["code", "intent", "verification", "model", "evidence"].includes(
            source.role,
          )
        )
          throw new Error(`${viewId}: ${node.id} source has an invalid role`);
        for (const field of ["revision", "symbol"]) {
          if (
            source[field] !== undefined &&
            (typeof source[field] !== "string" || !source[field].trim())
          )
            throw new Error(
              `${viewId}: ${node.id} source ${field} must be text`,
            );
        }
        if (
          source.sha256 !== undefined &&
          !/^[a-f0-9]{64}$/.test(source.sha256)
        )
          throw new Error(
            `${viewId}: ${node.id} source sha256 must be a lowercase SHA-256 digest`,
          );
        const file =
          source.path === undefined
            ? undefined
            : repositoryPath(root, source.path);
        const link = localLink(root, output, source.url);
        if (file && link && file !== link)
          throw new Error(
            `${viewId}: ${node.id} source link and mapped path name different files`,
          );
        records.push({
          source,
          file,
          link,
          view: viewId,
          block: node.id,
          requirements,
        });
      }
    }
  }
  return records;
}

function inspectSources(records) {
  const issues = [];
  let known = 0;
  for (const { source, file, link, view, block, requirements } of records) {
    const context = {
      view,
      block,
      requirements,
      url: source.url,
      ...(source.path === undefined ? {} : { path: source.path }),
    };
    const unknown = (reason) =>
      issues.push({ kind: "unknown", ...context, reason });
    if (link && (!existsSync(link) || !statSync(link).isFile()))
      unknown("Local source link target is missing or is not a file");
    if (!file) {
      unknown("No mapped local path; remote sources are not fetched");
      continue;
    }
    if (!existsSync(file) || !statSync(file).isFile()) {
      unknown("Mapped source is missing or is not a file");
      continue;
    }
    if (!source.sha256) {
      unknown("Mapped source has no reviewed sha256");
      continue;
    }
    const actual = digest(readFileSync(file));
    if (actual !== source.sha256)
      issues.push({
        kind: "drift",
        ...context,
        reason: "Mapped source bytes changed",
        expected: source.sha256,
        actual,
      });
    else known++;
  }
  return { known, issues };
}

function parseArgs(args) {
  if (!args.length || args.includes("--help") || args.includes("-h"))
    return { help: true };
  const [command, definition, ...rest] = args;
  if (
    !["render", "check", "record-sources"].includes(command) ||
    !definition ||
    definition.startsWith("--")
  )
    throw new Error(usage);
  const options = {
    command,
    definition: resolve(definition),
    root: process.cwd(),
    sources: [],
  };
  const seen = new Set();
  for (let index = 0; index < rest.length; index++) {
    const flag = rest[index],
      value = rest[++index];
    if (
      !["--root", "--out", "--source"].includes(flag) ||
      !value ||
      value.startsWith("--")
    )
      throw new Error(`Invalid argument: ${flag}`);
    if (flag !== "--source" && seen.has(flag))
      throw new Error(`Repeated option: ${flag}`);
    seen.add(flag);
    if (flag === "--root") options.root = resolve(value);
    if (flag === "--out") options.output = resolve(value);
    if (flag === "--source") options.sources.push(value);
  }
  if (command !== "record-sources" && options.sources.length)
    throw new Error("--source is only valid with record-sources");
  if (command === "record-sources" && options.output)
    throw new Error("--out is only valid with render or check");
  options.output ??= resolve(dirname(options.definition), "index.html");
  options.root = realpathSync(options.root);
  if (!statSync(options.root).isDirectory())
    throw new Error("--root must be a directory");
  if (
    basename(options.output) === "breadboard-contract.md" ||
    options.definition === options.output ||
    options.definition ===
      resolve(dirname(options.output), "breadboard-contract.md")
  )
    throw new Error(
      "Output artifacts must not overwrite the definition or each other",
    );
  return options;
}

async function run(options) {
  const { command, definition: definitionPath, root, output } = options;
  verifyVendor();
  const { validateDefinition, renderBoard } = await import("./renderer.mjs");
  const definition = validateDefinition(
    JSON.parse(readFileSync(definitionPath, "utf8")),
  );
  const records = sourceRecords(definition, root, output);
  for (const [viewId, view] of Object.entries(definition.views)) {
    for (const story of view.stories) {
      for (const check of story.checks ?? []) {
        const record = records.find(
          (r) =>
            r.view === viewId &&
            r.source.role === "verification" &&
            r.source.url === check.url,
        );
        const file = record.file ?? record.link;
        if (
          file &&
          (!existsSync(file) ||
            !statSync(file).isFile() ||
            !readFileSync(file, "utf8").includes(check.test))
        )
          throw new Error(
            `${viewId}/${story.id}: named check "${check.test}" not found in ${check.url}`,
          );
      }
    }
  }
  const destinations = [
    output,
    resolve(dirname(output), "breadboard-contract.md"),
  ].map(canonicalPath);
  const circular = new Set([canonicalPath(definitionPath), ...destinations]);
  if (records.some(({ file }) => file && circular.has(file)))
    throw new Error(
      "Source baselines cannot reference their definition or generated artifacts",
    );
  const inputs = new Set([
    canonicalPath(definitionPath),
    ...records.flatMap(({ file, link }) => [file, link].filter(Boolean)),
  ]);
  if (
    command !== "record-sources" &&
    destinations.some(
      (path) => inputs.has(path) || inside(realpathSync(skill), path),
    )
  )
    throw new Error(
      "Output artifacts must not overwrite source inputs or the skill bundle",
    );
  let recorded = [];
  if (command === "record-sources") {
    const requested = new Set(options.sources);
    for (const path of requested) {
      repositoryPath(root, path);
      if (!records.some(({ source }) => source.path === path))
        throw new Error(`Selected source has no mapping: ${path}`);
    }
    const selected = records.filter(
      ({ source }) =>
        source.path && (!requested.size || requested.has(source.path)),
    );
    if (
      selected.some(({ file }) => !existsSync(file) || !statSync(file).isFile())
    )
      throw new Error(
        "Selected sources must exist as files before recording reviewed bytes",
      );
    for (const { source, file } of selected)
      source.sha256 = digest(readFileSync(file));
    recorded = [...new Set(selected.map(({ source }) => source.path))];
    if (recorded.length)
      writeFileSync(definitionPath, `${JSON.stringify(definition, null, 2)}\n`);
  }
  const { known, issues } = inspectSources(records);
  const artifacts = [];
  if (command !== "record-sources") {
    const template = readFileSync(
      resolve(skill, "assets/unity/viewer.template.html"),
      "utf8",
    );
    const interactions = readFileSync(
      resolve(skill, "assets/unity/interactions.mjs"),
      "utf8",
    );
    const contract = readFileSync(
      resolve(skill, "references/viewer-contract.md"),
      "utf8",
    );
    const expected = new Map([
      [output, renderBoard(definition, output, template, interactions)],
      [resolve(dirname(output), "breadboard-contract.md"), contract],
    ]);
    for (const [path, content] of expected) {
      if (command === "render") {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, content);
        artifacts.push({ path, status: "written" });
      } else {
        const matches =
          existsSync(path) && readFileSync(path, "utf8") === content;
        artifacts.push({ path, status: matches ? "match" : "stale" });
        if (!matches)
          issues.push({
            kind: "drift",
            path,
            reason: "Generated artifact is missing, stale or locally edited",
          });
      }
    }
  }
  const drift = issues.filter((issue) => issue.kind === "drift").length;
  const unknown = issues.filter((issue) => issue.kind === "unknown").length;
  return {
    exit: drift ? 1 : unknown ? 2 : 0,
    report: {
      command,
      status: drift
        ? "drift"
        : unknown
          ? command === "render"
            ? "draft"
            : "unknown"
          : "match",
      definition: definitionPath,
      root,
      output,
      sources: {
        references: records.length,
        known,
        drift: issues.filter((issue) => issue.kind === "drift" && issue.block)
          .length,
        unknown,
      },
      recorded,
      artifacts,
      issues,
    },
  };
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) console.log(usage);
  else {
    const result = await run(options);
    console.log(JSON.stringify(result.report));
    process.exitCode = result.exit;
  }
} catch (error) {
  console.log(
    JSON.stringify({
      status: "invalid",
      issues: [{ kind: "invalid", reason: error.message }],
    }),
  );
  process.exitCode = 1;
}
