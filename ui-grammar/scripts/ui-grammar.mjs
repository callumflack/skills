#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const interpolationPattern = /{{([^{}#/]+)}}/g;
const collectionLoopPattern = /^(.*){{#([^{}#/]+)}}(.*){{\/\2}}(.*)$/;

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

const bootstrapSchemaVersion = "ui-grammar.bootstrap.v1";
const bootstrapLimitations = [
  "Only statically resolvable ES imports and same-file function components are followed.",
  "Only simple JSX component identifiers are followed across files; member expressions and dynamic component values are reported as unknowns.",
  "Conditions and props are recorded as source text and are not evaluated.",
  "Runtime behavior, rendered layout, and product meaning are not inferred.",
];
const typescriptSourcePattern = /\.tsx?$/;
const simpleComponentIdentifierPattern = /^[A-Z_$][\w$]*$/;
const upperCaseStartPattern = /^[A-Z]/;

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function relativeFile(repositoryRoot, absolutePath) {
  return toPosix(path.relative(repositoryRoot, absolutePath));
}

function findRepositoryRoot(startPath, fallbackRoot) {
  let directory = path.dirname(path.resolve(startPath));
  while (true) {
    if (existsSync(path.join(directory, ".git"))) {
      return directory;
    }
    const parent = path.dirname(directory);
    if (parent === directory) {
      return fallbackRoot ?? path.dirname(path.resolve(startPath));
    }
    directory = parent;
  }
}

function isInside(directory, candidate) {
  const relative = path.relative(directory, candidate);
  return relative === "" || !(relative.startsWith("..") || path.isAbsolute(relative));
}

function sourceLocation(sourceFile, node, repositoryRoot) {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return {
    column: position.character + 1,
    file: relativeFile(repositoryRoot, sourceFile.fileName),
    line: position.line + 1,
  };
}

function hasModifier(node, kind) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === kind));
}

function functionLikeInitializer(ts, declaration) {
  const initializer = declaration?.initializer;
  return initializer &&
    (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
    ? initializer
    : null;
}

function findTopLevelFunction(ts, sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name?.text === name) {
      return statement;
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.name.text === name) {
          const node = functionLikeInitializer(ts, declaration);
          if (node) {
            return node;
          }
        }
      }
    }
  }
  return null;
}

function localExportName(ts, sourceFile, exportName) {
  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement) || statement.moduleSpecifier) {
      continue;
    }
    if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) {
        if (element.name.text === exportName) {
          return element.propertyName?.text ?? element.name.text;
        }
      }
    }
  }
  return exportName;
}

function functionFromDefaultExpression(ts, sourceFile, expression) {
  if (ts.isIdentifier(expression)) {
    const node = findTopLevelFunction(ts, sourceFile, expression.text);
    return node ? { name: expression.text, node } : null;
  }
  if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)) {
    return { name: "default", node: expression };
  }
  return null;
}

function findDefaultExportedFunction(ts, sourceFile) {
  for (const statement of sourceFile.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      hasModifier(statement, ts.SyntaxKind.DefaultKeyword)
    ) {
      return { name: statement.name?.text ?? "default", node: statement };
    }
    if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      return functionFromDefaultExpression(ts, sourceFile, statement.expression);
    }
  }
  return null;
}

function variableStatementExportsName(ts, statement, name) {
  return (
    ts.isVariableStatement(statement) &&
    hasModifier(statement, ts.SyntaxKind.ExportKeyword) &&
    statement.declarationList.declarations.some(
      (declaration) =>
        ts.isIdentifier(declaration.name) && declaration.name.text === name,
    )
  );
}

function directlyExportsFunctionName(ts, sourceFile, name) {
  return sourceFile.statements.some(
    (statement) =>
      (ts.isFunctionDeclaration(statement) &&
        statement.name?.text === name &&
        hasModifier(statement, ts.SyntaxKind.ExportKeyword)) ||
      variableStatementExportsName(ts, statement, name),
  );
}

function findExportedFunction(ts, sourceFile, exportName) {
  if (exportName === "default") {
    const defaultExport = findDefaultExportedFunction(ts, sourceFile);
    if (defaultExport) {
      return defaultExport;
    }
  }

  const localName = localExportName(ts, sourceFile, exportName);
  const node = findTopLevelFunction(ts, sourceFile, localName);
  if (!node) {
    return null;
  }
  if (localName !== exportName) {
    return { name: localName, node };
  }
  return directlyExportsFunctionName(ts, sourceFile, localName)
    ? { name: localName, node }
    : null;
}

/** List statically supported component exports without assigning product meaning. */
export function discoverComponentExports(entryPath, options = {}) {
  const absoluteEntry = path.resolve(entryPath);
  const packageJson = path.resolve(options.packageJson ?? "");
  if (!(options.packageJson && existsSync(packageJson))) {
    throw new Error("discoverComponentExports requires an existing packageJson");
  }
  if (!existsSync(absoluteEntry)) {
    throw new Error(`Bootstrap entry does not exist: ${absoluteEntry}`);
  }

  const ts = createRequire(packageJson)("typescript");
  const sourceFile = parseBootstrapSource(ts, absoluteEntry);
  const names = new Set(["default"]);
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      names.add(statement.name.text);
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          names.add(declaration.name.text);
        }
      }
    }
    if (
      ts.isExportDeclaration(statement) &&
      !statement.moduleSpecifier &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const element of statement.exportClause.elements) {
        names.add(element.name.text);
      }
    }
  }
  return [...names]
    .filter((name) => Boolean(findExportedFunction(ts, sourceFile, name)))
    .sort((left, right) => {
      if (left === "default") return -1;
      if (right === "default") return 1;
      return left.localeCompare(right);
    });
}

function pathAliasMatches(specifier, paths = {}) {
  return Object.keys(paths).some((pattern) => {
    const star = pattern.indexOf("*");
    return star === -1
      ? pattern === specifier
      : specifier.startsWith(pattern.slice(0, star)) &&
          specifier.endsWith(pattern.slice(star + 1));
  });
}

function moduleResolution({
  compilerOptions,
  containingFile,
  repositoryRoot,
  specifier,
  ts,
}) {
  const resolved = ts.resolveModuleName(
    specifier,
    containingFile,
    compilerOptions,
    ts.sys,
  ).resolvedModule?.resolvedFileName;
  if (
    resolved &&
    isInside(repositoryRoot, resolved) &&
    !resolved.split(path.sep).includes("node_modules") &&
    typescriptSourcePattern.test(resolved)
  ) {
    return {
      absoluteFile: resolved,
      file: relativeFile(repositoryRoot, resolved),
      kind: "local",
    };
  }
  const isRelative = specifier.startsWith(".") || path.isAbsolute(specifier);
  if (resolved || !(isRelative || pathAliasMatches(specifier, compilerOptions.paths))) {
    return { absoluteFile: null, file: null, kind: "external" };
  }
  return { absoluteFile: null, file: null, kind: "unresolved" };
}

function readCompilerOptions(ts, entryPath) {
  const configPath = ts.findConfigFile(path.dirname(entryPath), ts.sys.fileExists);
  if (!configPath) {
    return { compilerOptions: {}, configPath: null };
  }
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) {
    const message = ts.flattenDiagnosticMessageText(config.error.messageText, "\n");
    throw new Error(`Unable to read ${configPath}: ${message}`);
  }
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    path.dirname(configPath),
    undefined,
    configPath,
  );
  return { compilerOptions: parsed.options, configPath };
}

function parseBootstrapSource(ts, absolutePath) {
  return ts.createSourceFile(
    absolutePath,
    readFileSync(absolutePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    absolutePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function bootstrapImports({ compilerOptions, repositoryRoot, sourceFile, ts }) {
  const entries = [];
  const byLocalName = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) {
      continue;
    }
    const specifier = statement.moduleSpecifier.text;
    const resolved = moduleResolution({
      compilerOptions,
      containingFile: sourceFile.fileName,
      repositoryRoot,
      specifier,
      ts,
    });
    const location = sourceLocation(sourceFile, statement, repositoryRoot);
    const add = (imported, local) => {
      const entry = {
        imported,
        local,
        module: specifier,
        resolution: { file: resolved.file, kind: resolved.kind },
        source: location,
      };
      entries.push(entry);
      if (local) {
        byLocalName.set(local, {
          ...entry,
          absoluteFile: resolved.absoluteFile,
        });
      }
    };
    const clause = statement.importClause;
    if (!clause) {
      add(null, null);
      continue;
    }
    if (clause.name) {
      add("default", clause.name.text);
    }
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) {
        add(element.propertyName?.text ?? element.name.text, element.name.text);
      }
    } else if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
      add("*", clause.namedBindings.name.text);
    }
  }
  return { byLocalName, entries };
}

function bootstrapAncestors(ts, node, stopNode) {
  const ancestors = [];
  let current = node.parent;
  while (current && current !== stopNode) {
    if (ts.isJsxElement(current)) {
      ancestors.push(jsxTagName(current.openingElement));
    } else if (ts.isJsxSelfClosingElement(current)) {
      ancestors.push(jsxTagName(current));
    } else if (ts.isJsxFragment(current)) {
      ancestors.push("Fragment");
    }
    current = current.parent;
  }
  return ancestors;
}

function bootstrapProps(ts, opening) {
  const props = {};
  for (const attribute of opening.attributes.properties) {
    if (ts.isJsxAttribute(attribute)) {
      props[attribute.name.getText()] = literalAttributeValue(ts, attribute);
    } else {
      props[`...${attribute.expression.getText()}`] = "spread";
    }
  }
  return props;
}

function bootstrapNode({ repositoryRoot, root, sourceFile, ts, node }) {
  const isFragment = ts.isJsxFragment(node);
  let opening = node;
  if (isFragment) {
    opening = null;
  } else if (ts.isJsxElement(node)) {
    opening = node.openingElement;
  }
  const ancestors = bootstrapAncestors(ts, node, root.node);
  return {
    ancestors,
    component: isFragment ? "Fragment" : jsxTagName(opening),
    condition: surroundingCondition(ts, node, root.node),
    parent: ancestors[0] ?? null,
    props: isFragment ? {} : bootstrapProps(ts, opening),
    root: root.name,
    source: sourceLocation(sourceFile, node, repositoryRoot),
  };
}

function addBootstrapUnknown(unknowns, kind, detail, source) {
  unknowns.push({ detail, kind, source });
}

function enqueueBootstrapTarget({
  absoluteFile,
  current,
  exportName,
  observed,
  queue,
  target,
  unknowns,
}) {
  const targetKey = `${absoluteFile}#${target.name}`;
  if (current.ancestry.includes(targetKey)) {
    addBootstrapUnknown(
      unknowns,
      "cycle-boundary",
      `${observed.component} closes a static component cycle`,
      observed.source,
    );
    return;
  }
  queue.push({
    absoluteFile,
    ancestry: [...current.ancestry, targetKey],
    exportName,
    ...target,
  });
}

function resolveLocalImportedComponent(context, imported, observed) {
  const destinationSource = context.getSourceFile(imported.absoluteFile);
  const target = findExportedFunction(context.ts, destinationSource, imported.imported);
  if (!target) {
    addBootstrapUnknown(
      context.unknowns,
      "unsupported-component-export",
      `${observed.component} resolves locally but its export is not a supported function component`,
      observed.source,
    );
    return { destination: null, resolution: "local" };
  }
  const destination = {
    export: imported.imported,
    file: imported.resolution.file,
    root: target.name,
  };
  enqueueBootstrapTarget({
    absoluteFile: imported.absoluteFile,
    current: context.current,
    exportName: imported.imported,
    observed,
    queue: context.queue,
    target,
    unknowns: context.unknowns,
  });
  return { destination, resolution: "local" };
}

function resolveImportedComponent(context, imported, observed) {
  if (imported.resolution.kind === "local") {
    return resolveLocalImportedComponent(context, imported, observed);
  }
  if (imported.resolution.kind === "external") {
    addBootstrapUnknown(
      context.unknowns,
      "external-component",
      `${observed.component} is provided by an external module, so traversal stops at that component boundary`,
      observed.source,
    );
  } else {
    addBootstrapUnknown(
      context.unknowns,
      "unresolved-import-component",
      `${observed.component} uses an import that TypeScript could not resolve`,
      observed.source,
    );
  }
  return { destination: null, resolution: imported.resolution.kind };
}

function resolveSameFileComponent(context, observed) {
  const localNode = findTopLevelFunction(
    context.ts,
    context.sourceFile,
    observed.component,
  );
  if (!localNode) {
    addBootstrapUnknown(
      context.unknowns,
      "unresolved-component",
      `${observed.component} has no supported local function or import binding`,
      observed.source,
    );
    return { destination: null, resolution: "unresolved" };
  }
  const target = { name: observed.component, node: localNode };
  const destination = {
    export: null,
    file: context.currentFile,
    root: observed.component,
  };
  enqueueBootstrapTarget({
    absoluteFile: context.current.absoluteFile,
    current: context.current,
    exportName: null,
    observed,
    queue: context.queue,
    target,
    unknowns: context.unknowns,
  });
  return { destination, resolution: "local" };
}

function observeComponentReference(context, observed) {
  if (observed.component === "Fragment") {
    return;
  }
  if (!simpleComponentIdentifierPattern.test(observed.component)) {
    if (upperCaseStartPattern.test(observed.component)) {
      addBootstrapUnknown(
        context.unknowns,
        "unsupported-component-reference",
        `${observed.component} is not a simple JSX identifier`,
        observed.source,
      );
    }
    return;
  }
  const imported = context.importScan.byLocalName.get(observed.component);
  const result = imported
    ? resolveImportedComponent(context, imported, observed)
    : resolveSameFileComponent(context, observed);
  context.renderEdges.push({
    component: observed.component,
    destination: result.destination,
    from: { file: context.currentFile, root: context.current.name },
    resolution: result.resolution,
    source: observed.source,
  });
}

function isBootstrapJsxNode(ts, node) {
  return (
    ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)
  );
}

function observeBootstrapRoot(context) {
  function visit(node) {
    if (isBootstrapJsxNode(context.ts, node)) {
      const observed = bootstrapNode({
        node,
        repositoryRoot: context.repositoryRoot,
        root: context.current,
        sourceFile: context.sourceFile,
        ts: context.ts,
      });
      context.nodes.push(observed);
      if (Object.keys(observed.props).some((key) => key.startsWith("..."))) {
        addBootstrapUnknown(
          context.unknowns,
          "prop-spread",
          `${observed.component} contains a JSX prop spread that is not evaluated`,
          observed.source,
        );
      }
      observeComponentReference(context, observed);
    }
    context.ts.forEachChild(node, visit);
  }
  visit(context.current.node);
}

/** Observe the statically reachable JSX graph rooted at an entry export. */
export function bootstrapEntry(entryPath, options = {}) {
  const absoluteEntry = path.resolve(entryPath);
  const packageJson = path.resolve(options.packageJson ?? "");
  const exportName = options.exportName ?? "default";
  if (!(options.packageJson && existsSync(packageJson))) {
    throw new Error("bootstrapEntry requires an existing packageJson");
  }
  if (!existsSync(absoluteEntry)) {
    throw new Error(`Bootstrap entry does not exist: ${absoluteEntry}`);
  }

  const ts = createRequire(packageJson)("typescript");
  const { compilerOptions, configPath } = readCompilerOptions(ts, absoluteEntry);
  const repositoryRoot = findRepositoryRoot(
    absoluteEntry,
    configPath ? path.dirname(configPath) : path.dirname(packageJson),
  );
  const sourceFiles = new Map();
  const importScans = new Map();
  const imports = [];
  const nodes = [];
  const renderEdges = [];
  const unknowns = [];
  const traversedFiles = new Set();
  const traversedRoots = [];
  const visitedRoots = new Set();

  const getSourceFile = (absoluteFile) => {
    const existing = sourceFiles.get(absoluteFile);
    if (existing) {
      return existing;
    }
    const sourceFile = parseBootstrapSource(ts, absoluteFile);
    sourceFiles.set(absoluteFile, sourceFile);
    return sourceFile;
  };
  const getImports = (sourceFile) => {
    const existing = importScans.get(sourceFile.fileName);
    if (existing) {
      return existing;
    }
    const scan = bootstrapImports({
      compilerOptions,
      repositoryRoot,
      sourceFile,
      ts,
    });
    importScans.set(sourceFile.fileName, scan);
    imports.push(...scan.entries);
    return scan;
  };

  const entrySource = getSourceFile(absoluteEntry);
  const requestedRoot = findExportedFunction(ts, entrySource, exportName);
  if (!requestedRoot) {
    unknowns.push({
      detail: `Export ${exportName} is not a supported function component`,
      kind: "unsupported-export",
      source: {
        column: 1,
        file: relativeFile(repositoryRoot, absoluteEntry),
        line: 1,
      },
    });
  }

  const initialRootKey = requestedRoot ? `${absoluteEntry}#${requestedRoot.name}` : null;
  const queue = requestedRoot
    ? [
        {
          absoluteFile: absoluteEntry,
          ancestry: [initialRootKey],
          exportName,
          ...requestedRoot,
        },
      ]
    : [];
  while (queue.length > 0) {
    const current = queue.shift();
    const rootKey = `${current.absoluteFile}#${current.name}`;
    if (visitedRoots.has(rootKey)) {
      continue;
    }
    visitedRoots.add(rootKey);
    const sourceFile = getSourceFile(current.absoluteFile);
    const importScan = getImports(sourceFile);
    const currentFile = relativeFile(repositoryRoot, current.absoluteFile);
    traversedFiles.add(currentFile);
    traversedRoots.push({
      export: current.exportName ?? null,
      file: currentFile,
      name: current.name,
    });

    observeBootstrapRoot({
      current,
      currentFile,
      getSourceFile,
      importScan,
      nodes,
      queue,
      renderEdges,
      repositoryRoot,
      sourceFile,
      ts,
      unknowns,
    });
  }

  const bySource = (left, right) =>
    left.source.file.localeCompare(right.source.file) ||
    left.source.line - right.source.line ||
    left.source.column - right.source.column ||
    JSON.stringify(left).localeCompare(JSON.stringify(right));
  imports.sort(bySource);
  nodes.sort(bySource);
  renderEdges.sort(bySource);
  unknowns.sort(bySource);
  traversedRoots.sort(
    (left, right) =>
      left.file.localeCompare(right.file) || left.name.localeCompare(right.name),
  );

  return {
    schemaVersion: bootstrapSchemaVersion,
    entry: relativeFile(repositoryRoot, absoluteEntry),
    root: requestedRoot
      ? {
          export: exportName,
          file: relativeFile(repositoryRoot, absoluteEntry),
          name: requestedRoot.name,
        }
      : null,
    tsconfig: configPath ? relativeFile(repositoryRoot, configPath) : null,
    traversedFiles: [...traversedFiles].sort(),
    traversedRoots,
    imports,
    renderEdges,
    nodes,
    unknowns,
    limitations: bootstrapLimitations,
  };
}

function getByPath(value, key) {
  return key.split(".").reduce((current, part) => current?.[part], value);
}

function literalAttributeValue(ts, attribute) {
  if (!attribute.initializer) {
    return true;
  }
  if (ts.isStringLiteral(attribute.initializer)) {
    return attribute.initializer.text;
  }
  if (
    ts.isJsxExpression(attribute.initializer) &&
    attribute.initializer.expression &&
    ts.isStringLiteral(attribute.initializer.expression)
  ) {
    return attribute.initializer.expression.text;
  }
  return attribute.initializer.getText();
}

function jsxTagName(opening) {
  return opening.tagName.getText();
}

function nearestJsxAncestor(ts, node, stopNode) {
  let current = node.parent;
  while (current && current !== stopNode) {
    if (ts.isJsxElement(current)) {
      return jsxTagName(current.openingElement);
    }
    if (ts.isJsxSelfClosingElement(current)) {
      return jsxTagName(current);
    }
    current = current.parent;
  }
  return null;
}

function jsxAncestors(ts, node, stopNode) {
  const ancestors = [];
  let current = node.parent;
  while (current && current !== stopNode) {
    if (ts.isJsxElement(current)) {
      ancestors.push(jsxTagName(current.openingElement));
    } else if (ts.isJsxSelfClosingElement(current)) {
      ancestors.push(jsxTagName(current));
    }
    current = current.parent;
  }
  return [...new Set(ancestors)];
}

function surroundingCondition(ts, node, stopNode) {
  let current = node.parent;
  while (current && current !== stopNode) {
    if (ts.isConditionalExpression(current)) {
      const branch =
        node.pos >= current.whenTrue.pos && node.end <= current.whenTrue.end
          ? "true"
          : "false";
      return `${current.condition.getText()} (${branch} branch)`;
    }
    if (
      ts.isBinaryExpression(current) &&
      current.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
    ) {
      return current.left.getText();
    }
    current = current.parent;
  }
  return null;
}

function findNamedFunction(ts, sourceFile, name) {
  let result = null;
  function visit(node) {
    if (result) {
      return;
    }
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) {
      result = node;
      return;
    }
    if (ts.isVariableDeclaration(node) && node.name.getText() === name) {
      const initializer = node.initializer;
      if (
        initializer &&
        (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
      ) {
        result = initializer;
        return;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return result;
}

function scanSource({ absolutePath, relativePath, rootName, rootNames, ts }) {
  const sourceText = readFileSync(absolutePath, "utf8");
  const sourceFile = ts.createSourceFile(
    absolutePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const imports = [];

  for (const statement of sourceFile.statements) {
    if (!(ts.isImportDeclaration(statement) && statement.importClause)) {
      continue;
    }
    const moduleName = statement.moduleSpecifier.text;
    const clause = statement.importClause;
    if (clause.name) {
      imports.push({
        imported: "default",
        local: clause.name.text,
        module: moduleName,
      });
    }
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        imports.push({
          imported: element.propertyName?.text ?? element.name.text,
          local: element.name.text,
          module: moduleName,
        });
      }
    }
  }

  const roots = rootNames
    .map((name) => ({ name, node: findNamedFunction(ts, sourceFile, name) }))
    .filter((entry) => entry.node);
  if (roots.length === 0) {
    return { imports, nodes: [], rootFound: false };
  }

  const nodes = [];
  function visit(node, root) {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      const location = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const props = {};
      for (const attribute of opening.attributes.properties) {
        if (ts.isJsxAttribute(attribute)) {
          props[attribute.name.getText()] = literalAttributeValue(ts, attribute);
        } else {
          props[`...${attribute.expression.getText()}`] = "spread";
        }
      }
      nodes.push({
        ancestors: jsxAncestors(ts, node, root),
        component: jsxTagName(opening),
        condition: surroundingCondition(ts, node, root),
        file: relativePath,
        line: location.line + 1,
        parent: nearestJsxAncestor(ts, node, root),
        props,
      });
    }
    ts.forEachChild(node, (child) => visit(child, root));
  }
  for (const root of roots) {
    visit(root.node, root.node);
  }
  return {
    imports,
    nodes,
    rootFound: roots.some((root) => root.name === rootName),
  };
}

export function loadContract(contractPath) {
  const absoluteContractPath = path.resolve(contractPath);
  const contract = readJson(absoluteContractPath);
  const repositoryRoot = path.resolve(
    path.dirname(absoluteContractPath),
    contract.repositoryRoot ?? ".",
  );
  const packageJson = path.resolve(repositoryRoot, contract.scan.packageJson);
  const requireFromApp = createRequire(packageJson);
  const ts = requireFromApp("typescript");
  return { absoluteContractPath, contract, repositoryRoot, ts };
}

export function scanContract(contractPath) {
  const { contract, repositoryRoot, ts } = loadContract(contractPath);
  const rootNames = [contract.surface.renderRoot, ...(contract.scan.renderRoots ?? [])];
  const scans = contract.scan.sources.map((relativePath) =>
    scanSource({
      absolutePath: path.resolve(repositoryRoot, relativePath),
      relativePath,
      rootName: contract.surface.renderRoot,
      rootNames,
      ts,
    }),
  );
  return {
    imports: scans.flatMap((scan) => scan.imports),
    nodes: scans.flatMap((scan) => scan.nodes),
    rootFound: scans.some((scan) => scan.rootFound),
    surface: contract.surface,
  };
}

function relationObserved(scan, relation) {
  if (relation.subject === scan.surface.renderRoot) {
    return scan.nodes.some((node) => node.component === relation.object);
  }
  return scan.nodes.some(
    (node) =>
      node.component === relation.object &&
      (node.parent === relation.subject || node.ancestors.includes(relation.subject)),
  );
}

function validateObservedFacts({ add, contract, scan }) {
  add(
    "observed",
    `render root ${contract.surface.renderRoot}`,
    scan.rootFound,
    contract.scan.sources.join(", "),
  );

  for (const component of contract.designSystem.components) {
    const match = scan.imports.find(
      (entry) =>
        entry.module === contract.designSystem.module &&
        (entry.imported === component || entry.local === component),
    );
    add(
      "observed",
      `design-system import ${component}`,
      Boolean(match),
      match ? contract.designSystem.module : "not observed",
    );
  }

  for (const relation of contract.observedRelations) {
    add(
      "observed",
      `${relation.subject} ${relation.relation} ${relation.object}`,
      relationObserved(scan, relation),
      "static JSX ancestry",
    );
  }

  for (const slot of contract.requiredSlots) {
    const node = scan.nodes.find((candidate) => candidate.props["data-slot"] === slot);
    add(
      "observed",
      `slot ${slot}`,
      Boolean(node),
      node ? `${node.file}:${node.line}` : "not observed",
    );
  }

  for (const prop of contract.designSystem.forbiddenConsumerProps ?? []) {
    const offenders = scan.nodes.filter(
      (node) =>
        contract.designSystem.components.includes(node.component) &&
        Object.hasOwn(node.props, prop),
    );
    add(
      "observed",
      `design-system consumers omit ${prop}`,
      offenders.length === 0,
      offenders.length === 0
        ? "no consumer override observed"
        : offenders.map((node) => `${node.file}:${node.line}`).join(", "),
    );
  }
}

function validateDeclaredRules({ add, contract, repositoryRoot }) {
  const declaredRuleIds = new Set(contract.rules.map((rule) => rule.id));
  for (const rule of contract.rules) {
    const missing = [];
    for (const witness of rule.witnesses) {
      const witnessPath = path.resolve(repositoryRoot, witness.path);
      if (!existsSync(witnessPath)) {
        missing.push(`${witness.path} missing`);
        continue;
      }
      const contents = readFileSync(witnessPath, "utf8");
      if (!contents.includes(witness.anchor)) {
        missing.push(`${witness.path} lacks anchor: ${witness.anchor}`);
      }
    }
    add(
      "declared",
      rule.id,
      missing.length === 0,
      missing.length === 0
        ? `${rule.witnesses.length} witness anchor(s) resolved`
        : missing.join("; "),
    );
  }

  for (const [index, actionRule] of contract.actionMatrix.entries()) {
    const ruleIds = actionRule.ruleIds;
    const missingRuleIds = Array.isArray(ruleIds)
      ? ruleIds.filter((ruleId) => !declaredRuleIds.has(ruleId))
      : [];
    const pass =
      Array.isArray(ruleIds) && ruleIds.length > 0 && missingRuleIds.length === 0;
    let detail = "ruleIds must contain at least one declared rule";
    if (pass) {
      detail = ruleIds.join(", ");
    } else if (missingRuleIds.length > 0) {
      detail = `unknown rules: ${missingRuleIds.join(", ")}`;
    }
    add("declared", `action rule ${index + 1} names semantic rules`, pass, detail);
  }
}

export function validateContract(contractPath) {
  const { contract, repositoryRoot } = loadContract(contractPath);
  const scan = scanContract(contractPath);
  const checks = [];
  const add = (kind, label, pass, detail) => checks.push({ detail, kind, label, pass });

  validateObservedFacts({ add, contract, scan });
  validateDeclaredRules({ add, contract, repositoryRoot });

  return {
    checks,
    contract,
    passed: checks.every((check) => check.pass),
    scan,
  };
}

function interpolate(template, context) {
  return template.replace(interpolationPattern, (_, key) => {
    const value = getByPath(context, key.trim());
    return value === undefined || value === null ? "" : String(value);
  });
}

function renderStackTemplate(lines, context) {
  return lines.flatMap((line) => {
    const repeat = line.match(collectionLoopPattern);
    if (!repeat) {
      return [interpolate(line, context)];
    }
    const [, before, collectionPath, body, after] = repeat;
    const collection = getByPath(context, collectionPath.trim());
    if (!Array.isArray(collection)) {
      throw new Error(`Stack collection ${collectionPath.trim()} is not an array`);
    }
    return collection.map((item, index) =>
      interpolate(`${before}${body}${after}`, {
        ...context,
        item,
        index: index + 1,
        label: item,
      }),
    );
  });
}

function ruleMatches(rule, context) {
  return Object.entries(rule.when).every(
    ([key, expected]) => expected === "*" || getByPath(context, key) === expected,
  );
}

export function compileStack(contractPath, requestPath) {
  const { contract } = loadContract(contractPath);
  const request = readJson(path.resolve(requestPath));
  if (request.surface !== contract.surface.id) {
    throw new Error(
      `Request surface ${request.surface} does not match ${contract.surface.id}`,
    );
  }
  const presentation = contract.states[request.state];
  if (!presentation) {
    throw new Error(`Unknown state: ${request.state}`);
  }
  const collectionCounts = Object.fromEntries(
    Object.entries(request)
      .filter(([, value]) => Array.isArray(value))
      .map(([key, value]) => [`${key}Count`, value.length]),
  );
  const baseContext = {
    ...request,
    ...collectionCounts,
    presentation,
    stateKind: presentation.kind,
  };
  const actionRule = contract.actionMatrix.find((rule) => ruleMatches(rule, baseContext));
  if (!actionRule) {
    throw new Error("No action rule matches this request");
  }
  const actionLabels = actionRule.actions.map((action) => {
    const template = contract.actions[action];
    if (!template) {
      throw new Error(`Unknown derived action: ${action}`);
    }
    return interpolate(template, baseContext);
  });
  const context = {
    ...baseContext,
    actionLabels: actionLabels.join(" | "),
  };
  const tree = renderStackTemplate(contract.stackTemplate, context);
  const appliedRuleIds = actionRule.ruleIds;
  if (!(Array.isArray(appliedRuleIds) && appliedRuleIds.length > 0)) {
    throw new Error("Matched action rule must name at least one ruleId");
  }
  const appliedRules = appliedRuleIds.map((ruleId) => {
    const rule = contract.rules.find((candidate) => candidate.id === ruleId);
    if (!rule) {
      throw new Error(`Action rule references unknown rule: ${ruleId}`);
    }
    return rule;
  });
  return {
    actionLabels,
    actionRule,
    appliedRules,
    contract,
    request,
    tree,
  };
}

export function formatValidation(result) {
  const lines = [`# UI Grammar Validation: ${result.contract.surface.id}`, ""];
  for (const kind of ["observed", "declared"]) {
    lines.push(
      `## ${kind === "observed" ? "Observed source facts" : "Declared semantic rules"}`,
      "",
    );
    for (const check of result.checks.filter((item) => item.kind === kind)) {
      lines.push(`- ${check.pass ? "PASS" : "FAIL"} — ${check.label} (${check.detail})`);
    }
    lines.push("");
  }
  lines.push(result.passed ? "Result: PASS" : "Result: FAIL");
  return lines.join("\n");
}

export function formatStack(result) {
  const { actionRule, appliedRules, contract, request, tree } = result;
  const summary = Array.isArray(contract.summaryTemplate)
    ? contract.summaryTemplate.map((line) =>
        interpolate(line, {
          ...request,
          presentation: contract.states[request.state],
        }),
      )
    : [];
  return [
    `# UI Stack: ${contract.surface.id}`,
    "",
    `User job: ${request.job}`,
    `State: ${request.state}`,
    ...summary,
    "",
    "## Derived decision",
    "",
    actionRule.decision,
    `Actions: ${result.actionLabels.join(" | ")}`,
    ...(actionRule.transition ? [`Transition: ${actionRule.transition}`] : []),
    ...(actionRule.effects?.length ? [`Effects: ${actionRule.effects.join("; ")}`] : []),
    "Visual overrides: none",
    "",
    "## Component tree",
    "",
    "```text",
    ...tree,
    "```",
    "",
    "## Rules applied",
    "",
    ...appliedRules.map(
      (rule) =>
        `- ${rule.id}: under ${rule.under}, ${rule.subject} ${rule.modality} ${rule.relation} ${rule.object}.`,
    ),
    "",
    "Every rule above resolves to the witness anchors in the product grammar.",
  ].join("\n");
}

function usage() {
  return [
    "Usage:",
    "  ui-grammar.mjs bootstrap <entry.tsx> --package-json <owning/package.json> [--export <name|default>]",
    "  ui-grammar.mjs validate <grammar.json>",
    "  ui-grammar.mjs scan <grammar.json>",
    "  ui-grammar.mjs stack <grammar.json> <request.json>",
  ].join("\n");
}

function parseBootstrapCliOptions(argumentsAfterEntry) {
  const options = { exportName: "default", packageJson: null };
  for (let index = 0; index < argumentsAfterEntry.length; index += 1) {
    const flag = argumentsAfterEntry[index];
    const value = argumentsAfterEntry[index + 1];
    if (flag === "--package-json" && value) {
      options.packageJson = value;
      index += 1;
    } else if (flag === "--export" && value) {
      options.exportName = value;
      index += 1;
    } else {
      throw new Error(usage());
    }
  }
  if (!options.packageJson) {
    throw new Error(usage());
  }
  return options;
}

function runBootstrapCli(entryPath) {
  const options = parseBootstrapCliOptions(process.argv.slice(4));
  console.log(JSON.stringify(bootstrapEntry(entryPath, options), null, 2));
}

function runValidationCli(contractPath) {
  const result = validateContract(contractPath);
  console.log(formatValidation(result));
  if (!result.passed) {
    process.exitCode = 1;
  }
}

function runStackCli(contractPath, requestPath) {
  if (!requestPath) {
    throw new Error(usage());
  }
  const validation = validateContract(contractPath);
  if (!validation.passed) {
    console.error(formatValidation(validation));
    process.exitCode = 1;
    return;
  }
  console.log(formatStack(compileStack(contractPath, requestPath)));
}

function runCli() {
  const [command, contractPath, requestPath] = process.argv.slice(2);
  if (!(command && contractPath)) {
    throw new Error(usage());
  }
  switch (command) {
    case "scan":
      console.log(JSON.stringify(scanContract(contractPath), null, 2));
      return;
    case "bootstrap":
      runBootstrapCli(contractPath);
      return;
    case "validate":
      runValidationCli(contractPath);
      return;
    case "stack":
      runStackCli(contractPath, requestPath);
      return;
    default:
      throw new Error(usage());
  }
}

const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isCli) {
  try {
    runCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
