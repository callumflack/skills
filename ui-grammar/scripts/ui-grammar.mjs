#!/usr/bin/env node

import { existsSync, readFileSync, realpathSync } from "node:fs";
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
const renderingMechanismKeys = new Set([
  "backgroundColor",
  "breakpoint",
  "breakpoints",
  "className",
  "classes",
  "css",
  "density",
  "gap",
  "iconDimensions",
  "iconSize",
  "margin",
  "padding",
  "shadow",
  "styles",
  "tailwind",
]);
const topLevelContractKeys = new Set([
  "mode",
  "actionResolution",
  "actionMatrix",
  "actions",
  "consumerPropChecks",
  "executable",
  "implementationConstraints",
  "observedRelations",
  "repositoryRoot",
  "requiredSlots",
  "rules",
  "scan",
  "stackTemplate",
  "states",
  "summaryTemplate",
  "surface",
  "version",
  "visualReference",
  "vocabulary",
  "composition",
  "specimens",
  "evidence",
]);
const surfaceKeys = new Set([
  "compositionOwner",
  "id",
  "intent",
  "owner",
  "renderRoot",
  "semanticOwner",
  "visualOwner",
]);
const scanKeys = new Set(["packageJson", "renderRoots", "sources"]);
const consumerPropCheckKeys = new Set([
  "components",
  "forbiddenProps",
  "module",
  "reviewProps",
]);
const relationKeys = new Set(["object", "relation", "root", "subject"]);
const semanticRuleKeys = new Set([
  "because",
  "id",
  "modality",
  "object",
  "owner",
  "relation",
  "subject",
  "under",
  "witnesses",
]);
const witnessKeys = new Set(["anchor", "path"]);
const actionRuleKeys = new Set([
  "actions",
  "decision",
  "dependsOn",
  "effects",
  "forEach",
  "ruleIds",
  "transition",
  "when",
]);
const implementationConstraintKeys = new Set(["id", "owner", "reference"]);
const vocabularyKeys = new Set(["name", "components", "primitives", "slots"]);
const componentKeys = new Set(["name", "props", "slots", "owner"]);
const slotKeys = new Set(["name", "required", "owner", "accepts"]);
const compositionKeys = new Set(["root", "relations", "forbidden", "owner"]);
const compositionRelationKeys = new Set(["parent", "slot", "child"]);
const specimenKeys = new Set(["id", "component", "path", "status"]);
const specimenStatuses = new Set(["declared", "implemented"]);
const evidenceKeys = new Set(["kind", "target", "owner", "required"]);
const semanticModalities = new Set(["must", "may", "must-not"]);
const actionResolutions = new Set(["additive", "first-match"]);

function normalizeContractInput(input) {
  const errors = [];
  const warnings = [];
  if (!isRecord(input)) return { contract: input, errors, warnings };
  if (input.version !== 1 && input.version !== 2) {
    errors.push("version: must be 1 or 2");
    return { contract: input, errors, warnings };
  }
  const inferredMode =
    input.mode ??
    (input.actionMatrix || input.stackTemplate ? "flow" : "system");
  if (input.version === 2) {
    if (input.surface?.visualOwner !== undefined) {
      warnings.push({
        detail: "use surface.compositionOwner; rule.owner remains unchanged",
        label: "surface.visualOwner is deprecated",
      });
    }
    const contract = { mode: inferredMode, ...input };
    if (inferredMode === "system") {
      contract.observedRelations ??= [];
      contract.requiredSlots ??= [];
      contract.rules ??= [];
      contract.states ??= {};
      contract.actions ??= {};
      contract.actionMatrix ??= [];
      contract.stackTemplate ??= [];
    }
    return { contract, errors, warnings };
  }

  warnings.push({
    detail: "migrate the grammar to version 2",
    label: "grammar version 1 is deprecated",
  });
  const { designSystem, ...legacyContract } = input;
  const surface = isRecord(input.surface) ? input.surface : {};
  const compositionOwner =
    surface.compositionOwner ?? surface.visualOwner ?? surface.renderRoot;
  if (!surface.compositionOwner) {
    warnings.push({
      detail: surface.visualOwner
        ? "normalized from surface.visualOwner"
        : "normalized from surface.renderRoot",
      label: "legacy surface lacks compositionOwner",
    });
  }

  let consumerPropChecks = input.consumerPropChecks;
  if (designSystem !== undefined) {
    warnings.push({
      detail: "normalized legacy designSystem metadata",
      label: "grammar.designSystem is deprecated",
    });
    if (!isRecord(designSystem)) {
      errors.push("designSystem: must be an object in grammar version 1");
    } else {
      const components = designSystem.components;
      const forbiddenProps = designSystem.forbiddenConsumerProps ?? [];
      if (!Array.isArray(components) || !Array.isArray(forbiddenProps)) {
        errors.push(
          "designSystem: components must be an array and forbiddenConsumerProps must be an array when present in grammar version 1",
        );
      } else if (components.length > 0 || forbiddenProps.length > 0) {
        if (!(typeof designSystem.module === "string" && designSystem.module)) {
          errors.push(
            "designSystem.module: must be a non-empty string when legacy consumer checks are configured",
          );
        } else {
          consumerPropChecks = [
            ...(Array.isArray(consumerPropChecks) ? consumerPropChecks : []),
            {
              components,
              ...(forbiddenProps.length === 0 ? {} : { forbiddenProps }),
              module: designSystem.module,
            },
          ];
        }
      }
    }
  }

  return {
    contract: {
      mode: inferredMode,
      ...legacyContract,
      actionResolution: legacyContract.actionResolution ?? "first-match",
      ...(consumerPropChecks === undefined ? {} : { consumerPropChecks }),
      surface: { ...surface, compositionOwner },
    },
    errors,
    warnings,
  };
}

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
  return (
    relative === "" || !(relative.startsWith("..") || path.isAbsolute(relative))
  );
}

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function addUnknownKeyViolations(value, allowedKeys, boundary, violations) {
  if (!isRecord(value)) return;
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key))
      violations.push(`${boundary}.${key}: unknown key`);
  }
}

function requireRecord(value, boundary, violations) {
  if (!isRecord(value)) {
    violations.push(`${boundary}: must be an object`);
    return false;
  }
  return true;
}

function requireString(value, boundary, violations) {
  if (!(typeof value === "string" && value.length > 0)) {
    violations.push(`${boundary}: must be a non-empty string`);
  }
}

function requireStringArray(
  value,
  boundary,
  violations,
  { nonempty = false } = {},
) {
  if (!Array.isArray(value)) {
    violations.push(`${boundary}: must be an array`);
    return false;
  }
  if (nonempty && value.length === 0)
    violations.push(`${boundary}: must not be empty`);
  value.forEach((item, index) =>
    requireString(item, `${boundary}[${index}]`, violations),
  );
  return true;
}

function structuralViolations(contract, migrationErrors = []) {
  const violations = [...migrationErrors];
  if (!requireRecord(contract, "grammar", violations)) return violations;
  addUnknownKeyViolations(
    contract,
    topLevelContractKeys,
    "grammar",
    violations,
  );
  if (contract.repositoryRoot !== undefined) {
    requireString(contract.repositoryRoot, "repositoryRoot", violations);
  }
  if (contract.mode !== "system" && contract.mode !== "flow") {
    violations.push("mode: must be system or flow");
  }
  if (contract.mode === "system") {
    if (requireRecord(contract.surface, "surface", violations)) {
      addUnknownKeyViolations(
        contract.surface,
        surfaceKeys,
        "surface",
        violations,
      );
      requireString(contract.surface.id, "surface.id", violations);
      requireString(
        contract.surface.renderRoot,
        "surface.renderRoot",
        violations,
      );
      requireString(
        contract.surface.compositionOwner,
        "surface.compositionOwner",
        violations,
      );
    }
    requireString(contract.visualReference, "visualReference", violations);
    if (requireRecord(contract.vocabulary, "vocabulary", violations)) {
      addUnknownKeyViolations(
        contract.vocabulary,
        vocabularyKeys,
        "vocabulary",
        violations,
      );
      requireString(contract.vocabulary.name, "vocabulary.name", violations);
      if (
        !Array.isArray(contract.vocabulary.components) ||
        contract.vocabulary.components.length === 0
      )
        violations.push("vocabulary.components: must be a non-empty array");
      else {
        const names = new Set();
        contract.vocabulary.components.forEach((component, i) => {
          if (typeof component === "string") {
            violations.push(
              `vocabulary.components[${i}]: must be a structured component object`,
            );
            return;
          }
          const b = `vocabulary.components[${i}]`;
          if (!requireRecord(component, b, violations)) return;
          addUnknownKeyViolations(component, componentKeys, b, violations);
          requireString(component.name, `${b}.name`, violations);
          requireString(component.owner, `${b}.owner`, violations);
          if (names.has(component.name))
            violations.push(`${b}.name: duplicate component name`);
          names.add(component.name);
          if (component.props !== undefined && !isRecord(component.props))
            violations.push(`${b}.props: must be an object`);
          else if (component.props)
            for (const [prop, description] of Object.entries(component.props))
              if (typeof description !== "string" || !description)
                violations.push(
                  `${b}.props.${prop}: must be a non-empty semantic description`,
                );
          if (!Array.isArray(component.slots))
            violations.push(`${b}.slots: must be an array`);
          else
            component.slots.forEach((slot, j) => {
              const s = `${b}.slots[${j}]`;
              if (requireRecord(slot, s, violations)) {
                addUnknownKeyViolations(slot, slotKeys, s, violations);
                requireString(slot.name, `${s}.name`, violations);
                requireString(slot.owner, `${s}.owner`, violations);
                if (
                  slot.required !== undefined &&
                  typeof slot.required !== "boolean"
                )
                  violations.push(`${s}.required: must be a boolean`);
                requireStringArray(slot.accepts, `${s}.accepts`, violations);
              }
            });
        });
      }
    }
    if (requireRecord(contract.composition, "composition", violations)) {
      addUnknownKeyViolations(
        contract.composition,
        compositionKeys,
        "composition",
        violations,
      );
      requireString(contract.composition.root, "composition.root", violations);
      if (!Array.isArray(contract.composition.relations))
        violations.push("composition.relations: must be an array");
      if (!Array.isArray(contract.composition.forbidden))
        violations.push("composition.forbidden: must be an array");
      requireString(
        contract.composition.owner,
        "composition.owner",
        violations,
      );
      const components = new Map(
        (contract.vocabulary.components ?? []).map((c) => [c.name, c]),
      );
      if (!components.has(contract.composition.root))
        violations.push(
          `composition.root: unknown component ${contract.composition.root}`,
        );
      const forbidden = new Set(
        (contract.composition.forbidden ?? []).map(
          (r) => `${r.parent}>${r.slot}>${r.child}`,
        ),
      );
      for (const [kind, relations] of [
        ["relations", contract.composition.relations],
        ["forbidden", contract.composition.forbidden],
      ])
        for (const [i, relation] of (relations ?? []).entries()) {
          const b = `composition.${kind}[${i}]`;
          if (!requireRecord(relation, b, violations)) continue;
          addUnknownKeyViolations(
            relation,
            compositionRelationKeys,
            b,
            violations,
          );
          for (const key of ["parent", "slot", "child"])
            requireString(relation[key], `${b}.${key}`, violations);
          const parent = components.get(relation.parent);
          const child = components.get(relation.child);
          if (!parent) violations.push(`${b}.parent: unknown component`);
          if (!child) violations.push(`${b}.child: unknown component`);
          const slot = parent?.slots?.find((s) => s.name === relation.slot);
          if (parent && !slot) violations.push(`${b}.slot: unknown slot`);
          if (slot && !slot.accepts?.includes(relation.child))
            violations.push(`${b}.child: slot does not accept component`);
          if (
            kind === "relations" &&
            forbidden.has(
              `${relation.parent}>${relation.slot}>${relation.child}`,
            )
          )
            violations.push(`${b}: relation is forbidden`);
        }
    }
    if (!Array.isArray(contract.specimens))
      violations.push("specimens: must be an array");
    else {
      const specimenIds = new Set();
      contract.specimens.forEach((item, i) => {
        const b = `specimens[${i}]`;
        if (requireRecord(item, b, violations)) {
          addUnknownKeyViolations(item, specimenKeys, b, violations);
          requireString(item.id, `${b}.id`, violations);
          if (specimenIds.has(item.id))
            violations.push(`${b}.id: duplicate specimen id`);
          specimenIds.add(item.id);
          requireString(item.component, `${b}.component`, violations);
          if (item.path !== undefined)
            requireString(item.path, `${b}.path`, violations);
          if (item.status !== undefined)
            requireString(item.status, `${b}.status`, violations);
          if (!specimenStatuses.has(item.status))
            violations.push(`${b}.status: must be declared or implemented`);
        }
      });
    }
    if (requireRecord(contract.evidence, "evidence", violations)) {
      addUnknownKeyViolations(
        contract.evidence,
        evidenceKeys,
        "evidence",
        violations,
      );
      requireString(contract.evidence.kind, "evidence.kind", violations);
      requireString(contract.evidence.target, "evidence.target", violations);
      requireString(contract.evidence.owner, "evidence.owner", violations);
      if (
        contract.evidence.required !== undefined &&
        typeof contract.evidence.required !== "boolean"
      )
        violations.push("evidence.required: must be a boolean");
    }
    return violations;
  }
  if (contract.version !== 1 && contract.version !== 2) {
    violations.push("version: must be 1 or 2");
  }
  if (
    contract.executable !== undefined &&
    typeof contract.executable !== "boolean"
  ) {
    violations.push("executable: must be a boolean when present");
  }
  if (
    contract.actionResolution !== undefined &&
    !actionResolutions.has(contract.actionResolution)
  ) {
    violations.push("actionResolution: must be additive or first-match");
  }

  if (requireRecord(contract.surface, "surface", violations)) {
    addUnknownKeyViolations(
      contract.surface,
      surfaceKeys,
      "surface",
      violations,
    );
    for (const key of ["id", "renderRoot"]) {
      requireString(contract.surface[key], `surface.${key}`, violations);
    }
    for (const key of [
      "compositionOwner",
      "intent",
      "owner",
      "semanticOwner",
      "visualOwner",
    ]) {
      if (contract.surface[key] !== undefined) {
        requireString(contract.surface[key], `surface.${key}`, violations);
      }
    }
    if (contract.version === 2 && !contract.surface.compositionOwner) {
      violations.push(
        "surface.compositionOwner: required in grammar version 2",
      );
    }
    if (
      contract.surface.compositionOwner &&
      contract.surface.visualOwner &&
      contract.surface.compositionOwner !== contract.surface.visualOwner
    ) {
      violations.push(
        "surface: compositionOwner and deprecated visualOwner must not conflict",
      );
    }
  }

  if (requireRecord(contract.scan, "scan", violations)) {
    addUnknownKeyViolations(contract.scan, scanKeys, "scan", violations);
    requireString(contract.scan.packageJson, "scan.packageJson", violations);
    if (contract.scan.renderRoots !== undefined) {
      requireStringArray(
        contract.scan.renderRoots,
        "scan.renderRoots",
        violations,
      );
    }
    requireStringArray(contract.scan.sources, "scan.sources", violations, {
      nonempty: true,
    });
  }

  if (contract.consumerPropChecks !== undefined) {
    if (!Array.isArray(contract.consumerPropChecks)) {
      violations.push("consumerPropChecks: must be an array");
    } else {
      contract.consumerPropChecks.forEach((check, index) => {
        const boundary = `consumerPropChecks[${index}]`;
        if (!requireRecord(check, boundary, violations)) return;
        addUnknownKeyViolations(
          check,
          consumerPropCheckKeys,
          boundary,
          violations,
        );
        requireString(check.module, `${boundary}.module`, violations);
        requireStringArray(
          check.components,
          `${boundary}.components`,
          violations,
          {
            nonempty: true,
          },
        );
        if (check.forbiddenProps !== undefined) {
          requireStringArray(
            check.forbiddenProps,
            `${boundary}.forbiddenProps`,
            violations,
          );
        }
        if (check.reviewProps !== undefined) {
          requireStringArray(
            check.reviewProps,
            `${boundary}.reviewProps`,
            violations,
          );
        }
        const forbidden = Array.isArray(check.forbiddenProps)
          ? check.forbiddenProps
          : [];
        const review = Array.isArray(check.reviewProps)
          ? check.reviewProps
          : [];
        const overlap = forbidden.filter((prop) => review.includes(prop));
        if (overlap.length > 0) {
          violations.push(
            `${boundary}: props cannot be both forbidden and review-level: ${overlap.join(", ")}`,
          );
        }
      });
    }
  }

  if (!Array.isArray(contract.observedRelations)) {
    violations.push("observedRelations: must be an array");
  } else {
    contract.observedRelations.forEach((relation, index) => {
      const boundary = `observedRelations[${index}]`;
      if (!requireRecord(relation, boundary, violations)) return;
      addUnknownKeyViolations(relation, relationKeys, boundary, violations);
      for (const key of ["object", "relation", "subject"]) {
        requireString(relation[key], `${boundary}.${key}`, violations);
      }
      if (relation.root !== undefined) {
        requireString(relation.root, `${boundary}.root`, violations);
      }
    });
  }
  requireStringArray(contract.requiredSlots, "requiredSlots", violations);

  if (!Array.isArray(contract.rules)) {
    violations.push("rules: must be an array");
  } else {
    contract.rules.forEach((rule, index) => {
      const boundary = `rules[${index}]`;
      if (!requireRecord(rule, boundary, violations)) return;
      addUnknownKeyViolations(rule, semanticRuleKeys, boundary, violations);
      for (const key of semanticRuleKeys) {
        if (!(key === "witnesses" || key === "modality")) {
          requireString(rule[key], `${boundary}.${key}`, violations);
        }
      }
      if (!semanticModalities.has(rule.modality)) {
        violations.push(`${boundary}.modality: must be must, may, or must-not`);
      }
      if (!Array.isArray(rule.witnesses)) {
        violations.push(`${boundary}.witnesses: must be an array`);
      } else {
        if (rule.witnesses.length === 0) {
          violations.push(`${boundary}.witnesses: must not be empty`);
        }
        rule.witnesses.forEach((witness, witnessIndex) => {
          const witnessBoundary = `${boundary}.witnesses[${witnessIndex}]`;
          if (!requireRecord(witness, witnessBoundary, violations)) return;
          addUnknownKeyViolations(
            witness,
            witnessKeys,
            witnessBoundary,
            violations,
          );
          requireString(witness.path, `${witnessBoundary}.path`, violations);
          requireString(
            witness.anchor,
            `${witnessBoundary}.anchor`,
            violations,
          );
        });
      }
    });
  }

  if (!requireRecord(contract.states, "states", violations)) {
    // States keep open product vocabulary once the structural envelope is valid.
  } else {
    for (const [stateName, state] of Object.entries(contract.states)) {
      if (!requireRecord(state, `states.${stateName}`, violations)) continue;
      requireString(state.kind, `states.${stateName}.kind`, violations);
    }
  }
  if (requireRecord(contract.actions, "actions", violations)) {
    for (const [action, label] of Object.entries(contract.actions)) {
      requireString(label, `actions.${action}`, violations);
    }
  }

  if (!Array.isArray(contract.actionMatrix)) {
    violations.push("actionMatrix: must be an array");
  } else {
    contract.actionMatrix.forEach((actionRule, index) => {
      const boundary = `actionMatrix[${index}]`;
      if (!requireRecord(actionRule, boundary, violations)) return;
      addUnknownKeyViolations(actionRule, actionRuleKeys, boundary, violations);
      requireRecord(actionRule.when, `${boundary}.when`, violations);
      requireStringArray(actionRule.actions, `${boundary}.actions`, violations);
      requireString(actionRule.decision, `${boundary}.decision`, violations);
      if (actionRule.forEach !== undefined) {
        requireString(actionRule.forEach, `${boundary}.forEach`, violations);
        if ((contract.actionResolution ?? "first-match") !== "additive") {
          violations.push(
            `${boundary}.forEach: requires actionResolution additive`,
          );
        }
      }
      const requiresDependencies =
        contract.version === 2 && contract.executable !== false;
      if (requiresDependencies) {
        requireStringArray(
          actionRule.dependsOn,
          `${boundary}.dependsOn`,
          violations,
          { nonempty: true },
        );
      } else if (actionRule.dependsOn !== undefined) {
        requireStringArray(
          actionRule.dependsOn,
          `${boundary}.dependsOn`,
          violations,
        );
      }
      if (
        requiresDependencies &&
        Array.isArray(actionRule.dependsOn) &&
        isRecord(actionRule.when)
      ) {
        const missingFacts = actionRule.dependsOn.filter(
          (fact) => !Object.hasOwn(actionRule.when, fact),
        );
        if (missingFacts.length > 0) {
          violations.push(
            `${boundary}.dependsOn: facts must appear in when: ${missingFacts.join(", ")}`,
          );
        }
      }
      requireStringArray(
        actionRule.ruleIds,
        `${boundary}.ruleIds`,
        violations,
        {
          nonempty: true,
        },
      );
      if (actionRule.transition !== undefined) {
        requireString(
          actionRule.transition,
          `${boundary}.transition`,
          violations,
        );
      }
      if (actionRule.effects !== undefined) {
        requireStringArray(
          actionRule.effects,
          `${boundary}.effects`,
          violations,
        );
      }
    });
  }
  requireStringArray(contract.stackTemplate, "stackTemplate", violations);
  if (
    contract.executable !== false &&
    (contract.actionMatrix?.length === 0 ||
      contract.stackTemplate?.length === 0)
  ) {
    violations.push(
      "executable grammars require non-empty actionMatrix and stackTemplate",
    );
  }
  if (
    contract.executable === false &&
    (contract.actionMatrix?.length > 0 || contract.stackTemplate?.length > 0)
  ) {
    violations.push(
      "executable: false cannot declare actionMatrix entries or stackTemplate lines",
    );
  }
  if (contract.summaryTemplate !== undefined) {
    requireStringArray(contract.summaryTemplate, "summaryTemplate", violations);
  }

  if (contract.implementationConstraints !== undefined) {
    if (!Array.isArray(contract.implementationConstraints)) {
      violations.push("implementationConstraints: must be an array");
    } else {
      contract.implementationConstraints.forEach((constraint, index) => {
        const boundary = `implementationConstraints[${index}]`;
        if (!requireRecord(constraint, boundary, violations)) return;
        addUnknownKeyViolations(
          constraint,
          implementationConstraintKeys,
          boundary,
          violations,
        );
        requireString(constraint.id, `${boundary}.id`, violations);
        requireString(constraint.owner, `${boundary}.owner`, violations);
        requireString(
          constraint.reference,
          `${boundary}.reference`,
          violations,
        );
      });
    }
  }
  return violations;
}

function sourceLocation(sourceFile, node, repositoryRoot) {
  const position = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile),
  );
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
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.name.text === name
        ) {
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
      return functionFromDefaultExpression(
        ts,
        sourceFile,
        statement.expression,
      );
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
    throw new Error(
      "discoverComponentExports requires an existing packageJson",
    );
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
  if (
    resolved ||
    !(isRelative || pathAliasMatches(specifier, compilerOptions.paths))
  ) {
    return { absoluteFile: null, file: null, kind: "external" };
  }
  return { absoluteFile: null, file: null, kind: "unresolved" };
}

function readCompilerOptions(ts, entryPath) {
  const configPath = ts.findConfigFile(
    path.dirname(entryPath),
    ts.sys.fileExists,
  );
  if (!configPath) {
    return { compilerOptions: {}, configPath: null };
  }
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) {
    const message = ts.flattenDiagnosticMessageText(
      config.error.messageText,
      "\n",
    );
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
    } else if (
      clause.namedBindings &&
      ts.isNamespaceImport(clause.namedBindings)
    ) {
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
  const target = findExportedFunction(
    context.ts,
    destinationSource,
    imported.imported,
  );
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
    ts.isJsxElement(node) ||
    ts.isJsxSelfClosingElement(node) ||
    ts.isJsxFragment(node)
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
  const { compilerOptions, configPath } = readCompilerOptions(
    ts,
    absoluteEntry,
  );
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

  const initialRootKey = requestedRoot
    ? `${absoluteEntry}#${requestedRoot.name}`
    : null;
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
      left.file.localeCompare(right.file) ||
      left.name.localeCompare(right.name),
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
        (ts.isArrowFunction(initializer) ||
          ts.isFunctionExpression(initializer))
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
        file: relativePath,
        imported: "default",
        local: clause.name.text,
        module: moduleName,
      });
    }
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        imports.push({
          file: relativePath,
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
      const location = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(),
      );
      const props = {};
      for (const attribute of opening.attributes.properties) {
        if (ts.isJsxAttribute(attribute)) {
          props[attribute.name.getText()] = literalAttributeValue(
            ts,
            attribute,
          );
        } else {
          props[`...${attribute.expression.getText()}`] = "spread";
        }
      }
      nodes.push({
        ancestors: jsxAncestors(ts, node, root.node),
        component: jsxTagName(opening),
        condition: surroundingCondition(ts, node, root.node),
        file: relativePath,
        line: location.line + 1,
        parent: nearestJsxAncestor(ts, node, root.node),
        props,
        root: root.name,
      });
    }
    ts.forEachChild(node, (child) => visit(child, root));
  }
  for (const root of roots) {
    visit(root.node, root);
  }
  return {
    imports,
    nodes,
    rootFound: roots.some((root) => root.name === rootName),
  };
}

export function loadContract(contractPath) {
  const absoluteContractPath = path.resolve(contractPath);
  const inputContract = readJson(absoluteContractPath);
  const normalized = normalizeContractInput(inputContract);
  const structureFailures = structuralViolations(
    normalized.contract,
    normalized.errors,
  );
  if (structureFailures.length > 0) {
    throw new Error(
      `Invalid grammar structure: ${structureFailures.join("; ")}`,
    );
  }
  const contract = normalized.contract;
  const repositoryRoot = path.resolve(
    path.dirname(absoluteContractPath),
    contract.repositoryRoot ?? ".",
  );
  const packageJson = path.resolve(
    repositoryRoot,
    contract.scan?.packageJson ?? "package.json",
  );
  let ts;
  if (existsSync(packageJson)) {
    try {
      ts = createRequire(packageJson)("typescript");
    } catch {
      if (contract.mode !== "system" || contract.scan)
        throw new Error("TypeScript is required by the configured scan");
    }
  }
  return {
    absoluteContractPath,
    contract,
    migrationWarnings: normalized.warnings,
    repositoryRoot,
    ts,
  };
}

function inspectScanSources(contract, repositoryRoot) {
  const sources = Array.isArray(contract.scan?.sources)
    ? contract.scan.sources
    : [];
  const realRepositoryRoot = realpathSync(repositoryRoot);
  const seen = new Set();
  return sources.map((relativePath) => {
    if (typeof relativePath !== "string") {
      return {
        absolutePath: null,
        failures: ["must be a path string"],
        relativePath: String(relativePath),
      };
    }
    const absolutePath = path.resolve(repositoryRoot, relativePath);
    const exists = existsSync(absolutePath);
    const sourceIdentity = exists ? realpathSync(absolutePath) : absolutePath;
    const duplicate = seen.has(sourceIdentity);
    seen.add(sourceIdentity);
    const failures = [];
    if (duplicate) failures.push("duplicate source");
    if (
      !isInside(repositoryRoot, absolutePath) ||
      (exists && !isInside(realRepositoryRoot, sourceIdentity))
    ) {
      failures.push("outside repository root");
    }
    if (!typescriptSourcePattern.test(relativePath))
      failures.push("must be .ts or .tsx");
    if (!exists) failures.push("missing");
    return { absolutePath, failures, relativePath };
  });
}

function scanLoadedContract({ contract, repositoryRoot, ts }, sourcePaths) {
  const rootNames = [
    contract.surface.renderRoot,
    ...(contract.scan.renderRoots ?? []),
  ];
  const scans = sourcePaths.map((relativePath) =>
    scanSource({
      absolutePath: path.resolve(repositoryRoot, relativePath),
      relativePath,
      rootName: contract.surface.renderRoot,
      rootNames,
      ts,
    }),
  );
  const nodes = scans.flatMap((scan) => scan.nodes);
  const relationCandidates = [];
  const candidateKeys = new Set();
  const addCandidate = (candidate) => {
    const key = `${candidate.root}\0${candidate.subject}\0${candidate.relation}\0${candidate.object}`;
    if (candidateKeys.has(key)) return;
    candidateKeys.add(key);
    relationCandidates.push(candidate);
  };
  for (const node of nodes) {
    if (!upperCaseStartPattern.test(node.component)) continue;
    addCandidate({
      object: node.component,
      relation: "renders",
      root: node.root,
      source: { file: node.file, line: node.line },
      subject: node.root,
    });
    if (node.parent && upperCaseStartPattern.test(node.parent)) {
      addCandidate({
        object: node.component,
        relation: "renders",
        root: node.root,
        source: { file: node.file, line: node.line },
        subject: node.parent,
      });
    }
  }
  return {
    imports: scans.flatMap((scan) => scan.imports),
    nodes,
    relationCandidates,
    rootFound: scans.some((scan) => scan.rootFound),
    surface: contract.surface,
  };
}

export function scanContract(contractPath) {
  const loaded = loadContract(contractPath);
  if (loaded.contract.mode === "system" && !loaded.contract.scan)
    return emptyScan(loaded.contract);
  const inspected = inspectScanSources(loaded.contract, loaded.repositoryRoot);
  const invalid = inspected.filter((source) => source.failures.length > 0);
  if (invalid.length > 0) {
    throw new Error(
      `Invalid scan.sources: ${invalid
        .map(
          (source) => `${source.relativePath} (${source.failures.join(", ")})`,
        )
        .join("; ")}`,
    );
  }
  return scanLoadedContract(
    loaded,
    inspected.map((source) => source.relativePath),
  );
}

function relationObserved(scan, relation) {
  if (!relation.root && relation.subject === scan.surface.renderRoot) {
    return scan.nodes.some((node) => node.component === relation.object);
  }
  return scan.nodes.some(
    (node) =>
      node.component === relation.object &&
      (!relation.root || node.root === relation.root) &&
      (node.root === relation.subject ||
        node.parent === relation.subject ||
        node.ancestors.includes(relation.subject)),
  );
}

function validateObservedFacts({ add, contract, scan, warn }) {
  add(
    "observed",
    `render root ${contract.surface.renderRoot}`,
    scan.rootFound,
    contract.scan.sources.join(", "),
  );

  for (const check of contract.consumerPropChecks ?? []) {
    const bindings = scan.imports.filter(
      (entry) =>
        entry.module === check.module &&
        check.components.some(
          (component) =>
            entry.imported === component || entry.local === component,
        ),
    );
    for (const component of check.components) {
      const match = bindings.find(
        (entry) => entry.imported === component || entry.local === component,
      );
      add(
        "observed",
        `consumer-prop check observes ${component}`,
        Boolean(match),
        match ? `${match.file} imports ${check.module}` : "not observed",
      );
    }

    const bindingKeys = new Set(
      bindings.map((entry) => `${entry.file}\0${entry.local}`),
    );
    const checkedConsumers = scan.nodes.filter((node) =>
      bindingKeys.has(`${node.file}\0${node.component}`),
    );
    const spreadConsumers = checkedConsumers.filter((node) =>
      Object.keys(node.props).some((prop) => prop.startsWith("...")),
    );
    const offendersFor = (prop) =>
      checkedConsumers.filter((node) => Object.hasOwn(node.props, prop));
    const locations = (nodes) =>
      nodes
        .map((node) => `${node.file}:${node.line} (${node.root})`)
        .join(", ");
    for (const prop of check.forbiddenProps ?? []) {
      const offenders = offendersFor(prop);
      const pass = offenders.length === 0 && spreadConsumers.length === 0;
      const detail = [];
      if (offenders.length > 0) detail.push(`direct: ${locations(offenders)}`);
      if (spreadConsumers.length > 0) {
        detail.push(`unresolved JSX spread: ${locations(spreadConsumers)}`);
      }
      add(
        "observed",
        `configured consumers omit ${prop}`,
        pass,
        pass
          ? `no ${check.module} consumer override observed`
          : detail.join("; "),
      );
    }
    for (const prop of check.reviewProps ?? []) {
      const offenders = offendersFor(prop);
      if (offenders.length > 0 || spreadConsumers.length > 0) {
        const detail = [];
        if (offenders.length > 0)
          detail.push(`direct: ${locations(offenders)}`);
        if (spreadConsumers.length > 0) {
          detail.push(`unresolved JSX spread: ${locations(spreadConsumers)}`);
        }
        warn(`configured consumers review ${prop}`, detail.join("; "));
      }
    }
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
    const node = scan.nodes.find(
      (candidate) => candidate.props["data-slot"] === slot,
    );
    add(
      "observed",
      `slot ${slot}`,
      Boolean(node),
      node ? `${node.file}:${node.line}` : "not observed",
    );
  }
}

function validateReviewDiagnostics({ contract, warn }) {
  contract.actionMatrix.forEach((actionRule, index) => {
    const whenFacts = new Set(Object.keys(actionRule.when));
    const omittedFacts = (actionRule.dependsOn ?? []).filter(
      (fact) => !whenFacts.has(fact),
    );
    if (omittedFacts.length > 0) {
      warn(
        `action rule ${index + 1} depends on facts absent from when`,
        omittedFacts.join(", "),
      );
    }
  });
}

function validateDeclaredRules({ add, contract, repositoryRoot }) {
  const declaredRuleIds = new Set(contract.rules.map((rule) => rule.id));
  const implementationConstraints = Array.isArray(
    contract.implementationConstraints,
  )
    ? contract.implementationConstraints
    : [];
  const implementationConstraintIds = new Set(
    implementationConstraints.map((constraint) => constraint.id),
  );
  const seenImplementationConstraintIds = new Set();
  const invalidImplementationConstraints = [];
  if (
    contract.implementationConstraints !== undefined &&
    !Array.isArray(contract.implementationConstraints)
  ) {
    invalidImplementationConstraints.push("must be an array");
  }
  implementationConstraints.forEach((constraint, index) => {
    if (!(constraint && typeof constraint === "object")) {
      invalidImplementationConstraints.push(`${index + 1}: must be an object`);
      return;
    }
    if (!(typeof constraint.id === "string" && constraint.id.length > 0)) {
      invalidImplementationConstraints.push(`${index + 1}: missing id`);
    } else if (seenImplementationConstraintIds.has(constraint.id)) {
      invalidImplementationConstraints.push(`${constraint.id}: duplicate id`);
    } else if (declaredRuleIds.has(constraint.id)) {
      invalidImplementationConstraints.push(
        `${constraint.id}: also a semantic rule`,
      );
    }
    seenImplementationConstraintIds.add(constraint.id);
    if (!(
      typeof constraint.owner === "string" && constraint.owner.length > 0
    )) {
      invalidImplementationConstraints.push(
        `${constraint.id ?? index + 1}: missing owner`,
      );
    }
    if (!(
      typeof constraint.reference === "string" &&
      constraint.reference.length > 0
    )) {
      invalidImplementationConstraints.push(
        `${constraint.id ?? index + 1}: missing reference`,
      );
    }
  });
  add(
    "declared",
    "implementation constraints reference owning doctrine",
    invalidImplementationConstraints.length === 0,
    invalidImplementationConstraints.length === 0
      ? `${implementationConstraints.length} reference(s)`
      : invalidImplementationConstraints.join("; "),
  );
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
    const implementationRuleIds = Array.isArray(ruleIds)
      ? ruleIds.filter((ruleId) => implementationConstraintIds.has(ruleId))
      : [];
    const missingRuleIds = Array.isArray(ruleIds)
      ? ruleIds.filter(
          (ruleId) =>
            !declaredRuleIds.has(ruleId) &&
            !implementationConstraintIds.has(ruleId),
        )
      : [];
    const pass =
      Array.isArray(ruleIds) &&
      ruleIds.length > 0 &&
      implementationRuleIds.length === 0 &&
      missingRuleIds.length === 0;
    let detail = "ruleIds must contain at least one declared rule";
    if (pass) {
      detail = ruleIds.join(", ");
    } else if (implementationRuleIds.length > 0) {
      detail = `implementation constraints are not semantic rules: ${implementationRuleIds.join(", ")}`;
    } else if (missingRuleIds.length > 0) {
      detail = `unknown rules: ${missingRuleIds.join(", ")}`;
    }
    add(
      "declared",
      `action rule ${index + 1} names semantic rules`,
      pass,
      detail,
    );
  }
}

function renderingMechanismViolations(value, boundary, violations = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      renderingMechanismViolations(item, `${boundary}[${index}]`, violations),
    );
    return violations;
  }
  if (!(value && typeof value === "object")) {
    return violations;
  }
  for (const [key, child] of Object.entries(value)) {
    const childBoundary = `${boundary}.${key}`;
    if (renderingMechanismKeys.has(key)) {
      violations.push(childBoundary);
    }
    renderingMechanismViolations(child, childBoundary, violations);
  }
  return violations;
}

function semanticBoundaryViolations(contract) {
  return [
    ...renderingMechanismViolations(contract.states, "states"),
    ...contract.actionMatrix.flatMap((rule, index) =>
      renderingMechanismViolations(rule.when, `actionMatrix[${index}].when`),
    ),
  ];
}

function emptyScan(contract) {
  return {
    imports: [],
    nodes: [],
    relationCandidates: [],
    rootFound: false,
    surface: contract?.surface,
  };
}

export function validateContract(contractPath) {
  const inputContract = readJson(path.resolve(contractPath));
  const normalized = normalizeContractInput(inputContract);
  const contract = normalized.contract;
  const checks = [];
  const add = (kind, label, pass, detail) =>
    checks.push({ detail, kind, label, pass });
  const warn = (label, detail) =>
    checks.push({
      detail,
      kind: "review",
      label,
      pass: false,
      severity: "warning",
    });
  const structureFailures = structuralViolations(contract, normalized.errors);
  add(
    "structural",
    contract.mode === "system"
      ? "grammar uses the System composition contract"
      : "grammar uses the Flow contract",
    structureFailures.length === 0,
    structureFailures.length === 0
      ? "known structural keys and required value types"
      : structureFailures.join("; "),
  );
  if (structureFailures.length > 0) {
    return {
      checks,
      contract,
      passed: false,
      scan: emptyScan(contract),
    };
  }

  for (const warning of normalized.warnings) {
    warn(warning.label, warning.detail);
  }

  const loaded = loadContract(contractPath);
  const { repositoryRoot } = loaded;
  if (
    contract.mode === "system" &&
    !/^https?:\/\//.test(contract.visualReference)
  ) {
    const referencePath = path.resolve(
      repositoryRoot,
      contract.visualReference,
    );
    add(
      "evidence",
      "system visual reference",
      isInside(repositoryRoot, referencePath) && existsSync(referencePath),
      "repository reference resolved",
    );
  }

  const inspectedSources =
    contract.mode === "system" && contract.scan === undefined
      ? []
      : inspectScanSources(contract, repositoryRoot);
  add(
    "observed",
    "scan.sources are unique repository TypeScript sources",
    (contract.mode === "system" && contract.scan === undefined) ||
      (inspectedSources.length > 0 &&
        inspectedSources.every((source) => source.failures.length === 0)),
    inspectedSources.length === 0
      ? contract.mode === "system" && contract.scan === undefined
        ? "optional for system grammars"
        : "scan.sources must be a non-empty array"
      : inspectedSources
          .filter((source) => source.failures.length > 0)
          .map(
            (source) => `${source.relativePath}: ${source.failures.join(", ")}`,
          )
          .join("; ") || `${inspectedSources.length} source(s) accepted`,
  );
  const validSources = inspectedSources
    .filter((source) => source.failures.length === 0)
    .map((source) => source.relativePath);
  const scan =
    validSources.length > 0
      ? scanLoadedContract(loaded, validSources)
      : emptyScan(contract);

  if (contract.mode === "system" && contract.scan === undefined) {
    add(
      "observed",
      "system grammar scan",
      true,
      "optional for greenfield system grammars",
    );
  } else {
    validateObservedFacts({ add, contract, scan, warn });
  }
  validateDeclaredRules({ add, contract, repositoryRoot });
  if (contract.mode === "system") {
    const specimens = new Map(
      contract.specimens.map((item) => [item.id, item]),
    );
    const target = specimens.get(contract.evidence.target);
    const proven = target?.status === "implemented";
    if (!target)
      add(
        "evidence",
        "system evidence target",
        false,
        `unknown specimen target: ${contract.evidence.target}`,
      );
    else if (
      proven &&
      (!target.path ||
        !isInside(repositoryRoot, path.resolve(repositoryRoot, target.path)) ||
        !existsSync(path.resolve(repositoryRoot, target.path)))
    )
      add(
        "evidence",
        "system evidence target",
        false,
        "implemented specimen requires an existing repository path",
      );
    else
      add(
        "evidence",
        "system evidence target",
        true,
        target.status === "implemented"
          ? "implemented specimen path resolved (not rendered proof)"
          : "declared specimen (not rendered proof)",
      );
  }
  validateReviewDiagnostics({ contract, warn });
  const boundaryViolations = semanticBoundaryViolations(contract);
  add(
    "declared",
    "semantic state and action conditions omit rendering mechanisms",
    boundaryViolations.length === 0,
    boundaryViolations.length === 0
      ? "semantic keys only"
      : `rendering mechanism keys: ${boundaryViolations.join(", ")}`,
  );

  return {
    checks,
    contract,
    passed: checks.every((check) => check.pass || check.severity === "warning"),
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
      throw new Error(
        `Stack collection ${collectionPath.trim()} is not an array`,
      );
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
    ([key, expected]) =>
      expected === "*" || getByPath(context, key) === expected,
  );
}

export function isExecutableContract(contract) {
  return contract.mode !== "system" && contract.executable !== false;
}

function uniqueInOrder(values) {
  return [...new Set(values)];
}

function actionRuleMatches(rule, context) {
  if (!rule.forEach) {
    return ruleMatches(rule, context) ? [{ context, rule }] : [];
  }
  const collection = getByPath(context, rule.forEach);
  if (!Array.isArray(collection)) {
    throw new Error(`Action rule forEach ${rule.forEach} is not an array`);
  }
  return collection
    .map((item, index) => ({
      context: { ...context, index: index + 1, item },
      rule,
    }))
    .filter((match) => ruleMatches(rule, match.context));
}

function resolveActionRules(contract, context) {
  const matches = contract.actionMatrix.flatMap((rule) =>
    actionRuleMatches(rule, context),
  );
  if (matches.length === 0) {
    throw new Error("No action rule matches this request");
  }
  if ((contract.actionResolution ?? "first-match") === "first-match") {
    const match = matches[0];
    const actionLabels = match.rule.actions.map((action) => {
      const template = contract.actions[action];
      if (!template) throw new Error(`Unknown derived action: ${action}`);
      return interpolate(template, match.context);
    });
    return {
      actionLabels,
      actionRule: match.rule,
      actionRules: [match.rule],
    };
  }

  const actionEntries = matches.flatMap((match) =>
    match.rule.actions.map((action) => {
      const template = contract.actions[action];
      if (!template) throw new Error(`Unknown derived action: ${action}`);
      return { action, label: interpolate(template, match.context) };
    }),
  );
  const uniqueActionEntries = [];
  const seenLabels = new Set();
  for (const entry of actionEntries) {
    if (seenLabels.has(entry.label)) continue;
    seenLabels.add(entry.label);
    uniqueActionEntries.push(entry);
  }
  const transitions = uniqueInOrder(
    matches
      .filter((match) => match.rule.transition)
      .map((match) => interpolate(match.rule.transition, match.context)),
  );
  if (transitions.length > 1) {
    throw new Error(
      `Conflicting additive transitions: ${transitions.join(", ")}`,
    );
  }
  const decisions = uniqueInOrder(
    matches.map((match) => interpolate(match.rule.decision, match.context)),
  );
  const actionRule = {
    actions: uniqueActionEntries.map((entry) => entry.action),
    decision: decisions.join(" "),
    decisions,
    effects: uniqueInOrder(
      matches.flatMap((match) =>
        (match.rule.effects ?? []).map((effect) =>
          interpolate(effect, match.context),
        ),
      ),
    ),
    resolution: "additive",
    ruleIds: uniqueInOrder(matches.flatMap((match) => match.rule.ruleIds)),
    transition: transitions[0],
    when: matches.map((match) => match.rule.when),
  };
  return {
    actionLabels: uniqueActionEntries.map((entry) => entry.label),
    actionRule,
    actionRules: matches.map((match) => match.rule),
  };
}

export function compileStack(contractPath, requestPath) {
  const { contract } = loadContract(contractPath);
  if (!isExecutableContract(contract)) {
    throw new Error("Grammar is observational and cannot compile requests");
  }
  const request = readJson(path.resolve(requestPath));
  const boundaryViolations = [
    ...semanticBoundaryViolations(contract),
    ...renderingMechanismViolations(request, "request"),
  ];
  if (boundaryViolations.length > 0) {
    throw new Error(
      `Semantic inputs cannot name rendering mechanisms: ${boundaryViolations.join(", ")}`,
    );
  }
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
  const { actionLabels, actionRule, actionRules } = resolveActionRules(
    contract,
    baseContext,
  );
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
    actionRules,
    appliedRules,
    contract,
    request,
    tree,
  };
}

export function formatValidation(result) {
  const surfaceId = result.contract?.surface?.id ?? "invalid contract";
  const lines = [`# UI Grammar Validation: ${surfaceId}`, ""];
  for (const kind of [
    "structural",
    "observed",
    "declared",
    "evidence",
    "review",
  ]) {
    const kindChecks = result.checks.filter((item) => item.kind === kind);
    if (kindChecks.length === 0) continue;
    const heading = {
      declared: "Declared semantic rules",
      observed: "Observed source facts",
      review: "Review diagnostics",
      structural:
        result.contract?.mode === "system"
          ? "System composition structure"
          : "Flow contract structure",
      evidence: "Evidence references",
    }[kind];
    lines.push(`## ${heading}`, "");
    for (const check of kindChecks) {
      const status =
        check.severity === "warning" ? "WARN" : check.pass ? "PASS" : "FAIL";
      lines.push(`- ${status} — ${check.label} (${check.detail})`);
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
    ...(actionRule.effects?.length
      ? [`Effects: ${actionRule.effects.join("; ")}`]
      : []),
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
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isCli) {
  try {
    runCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
