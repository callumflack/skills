import { compileFunction } from "node:vm";
import { BREADBOARD } from "../assets/unity/interactions.mjs";

// Derived from Unity scripts/breadboards.mjs. Provenance records the reviewed upstream bytes.
const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const inlineJson = (value) =>
  JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");
const safeSourceUrl = (url) => {
  if (typeof url !== "string" || !url || /[\\\x00-\x20]/.test(url))
    return false;
  if (url.startsWith("https://")) {
    try {
      return (
        new URL(url).protocol === "https:" && Boolean(new URL(url).hostname)
      );
    } catch {
      return false;
    }
  }
  return !url.startsWith("/") && !/^[a-z][a-z0-9+.-]*:/i.test(url);
};

export function validateDefinition(definition) {
  const { metadata, views } = definition;
  if (
    !metadata?.views?.[metadata.defaultView] ||
    !views?.[metadata.defaultView]
  )
    throw new Error("A registered default view is required");
  for (const value of [
    metadata.headingHtml,
    metadata.sourcesHtml,
    ...Object.values(metadata.views).flatMap((view) => [
      view.headingHtml,
      view.frameHtml,
    ]),
  ]) {
    if (
      typeof value !== "string" ||
      /<(?:script|style|link|iframe)\b|\bon\w+\s*=|\bstyle\s*=|javascript:/i.test(
        value,
      )
    )
      throw new Error(
        "Board content cannot supply scripts, styles or event handlers",
      );
  }
  if (Object.keys(metadata.views).length !== Object.keys(views).length)
    throw new Error("View metadata and content must agree");
  const queries = new Set();
  for (const [name, view] of Object.entries(views)) {
    const presentation = metadata.views[name];
    if (!presentation || queries.has(presentation.query))
      throw new Error(`${name}: missing or duplicate view route`);
    queries.add(presentation.query);
    if (
      !Number.isInteger(view.layout?.columns) ||
      view.layout.columns < 1 ||
      Object.keys(view.layout).some((key) => key !== "columns")
    )
      throw new Error(
        `${name}: board layout may choose columns only; spacing belongs to the shared contract`,
      );
    const ids = new Set(view.nodes.map((node) => node.id));
    if (ids.size !== view.nodes.length)
      throw new Error(`${name}: duplicate block IDs`);
    const reviewIds = new Set(
      [...view.requirements, ...view.questions].map((item) => item.id),
    );
    if (reviewIds.size !== view.requirements.length + view.questions.length)
      throw new Error(`${name}: duplicate review IDs`);
    const members = new Set(),
      cells = new Set(),
      groupIds = new Set();
    for (const group of view.groups) {
      const cell = `${group.row}:${group.col}`;
      if (
        !group.id ||
        groupIds.has(group.id) ||
        !Number.isInteger(group.row) ||
        group.row < 0 ||
        !Number.isInteger(group.col) ||
        group.col < 0 ||
        group.col >= view.layout.columns ||
        cells.has(cell)
      )
        throw new Error(`${name}: invalid lane`);
      groupIds.add(group.id);
      cells.add(cell);
      if (group.after) {
        const previous = view.groups
          .slice(0, view.groups.indexOf(group))
          .find((candidate) => candidate.id === group.after);
        if (
          !previous ||
          previous.col !== group.col ||
          previous.row >= group.row
        )
          throw new Error(`${name}: invalid preceding lane`);
      }
      if (!group.nodes?.length) throw new Error(`${name}: empty lane`);
      for (const id of group.nodes) {
        if (!ids.has(id) || members.has(id))
          throw new Error(`${name}: invalid lane membership`);
        members.add(id);
      }
    }
    if (members.size !== ids.size)
      throw new Error(`${name}: every block needs exactly one lane`);
    for (const node of view.nodes) {
      if (
        !view.requirements.some(
          (item) =>
            item.blocks.includes(node.id) ||
            item.contextBlocks?.includes(node.id),
        )
      )
        throw new Error(`${name}: ${node.id} has no requirement`);
      if (
        !["ui", "code", "store"].includes(node.kind) ||
        ["x", "y", "w", "h", "style", "className"].some((key) => key in node)
      )
        throw new Error(
          `${name}: canvas cards must be runtime actions or data; geometry belongs to the shared viewer`,
        );
      if (
        !node.sources?.length ||
        node.sources.some((source) => !safeSourceUrl(source.url))
      )
        throw new Error(`${name}: blocks need reviewed source links`);
    }
    const edgeIds = new Set(view.edges.map((edge) => edge.id));
    if (edgeIds.size !== view.edges.length)
      throw new Error(`${name}: duplicate wire IDs`);
    for (const edge of view.edges) {
      if (edge.note)
        throw new Error(
          `${name}: proof/review note wires belong in collapsed evidence`,
        );
      if (edge.label !== undefined && typeof edge.label !== "string")
        throw new Error(
          `${name}: wire descriptions must be text, without legacy coordinates`,
        );
      if (
        !ids.has(edge.a) ||
        !ids.has(edge.b) ||
        ["start", "end", "route"].some((key) => key in edge)
      )
        throw new Error(
          `${name}: wire endpoints must name blocks; routing belongs to the viewer`,
        );
    }
    if (
      new Set(view.stories.map((story) => story.id)).size !==
      view.stories.length
    )
      throw new Error(`${name}: duplicate story ID`);
    for (const story of view.stories) {
      if (story.id !== "all" || story.steps !== undefined) {
        if (
          !Array.isArray(story.steps) ||
          story.steps.length < (new Set(story.edges).size > 1 ? 2 : 1) ||
          story.steps.some(
            (step) =>
              typeof step?.text !== "string" ||
              !step.text.trim() ||
              !Array.isArray(step.edges) ||
              !step.edges.length ||
              step.edges.some((id) => !story.edges.includes(id)),
          ) ||
          story.edges.some(
            (id) => !story.steps.some((step) => step.edges.includes(id)),
          )
        )
          throw new Error(
            `${name}: ${story.id} steps must describe and cover selected wires`,
          );
      }
      if (story.id === "all") {
        if (
          story.checks !== undefined ||
          story.gap !== undefined ||
          story.check !== undefined
        )
          throw new Error(
            `${name}: All wiring is an overview, not a verification story`,
          );
        if (
          edgeIds.size !== new Set(story.edges).size ||
          story.edges.some((id) => !edgeIds.has(id))
        )
          throw new Error(`${name}: All wiring must select every wire`);
      } else {
        const filled = (value) => typeof value === "string" && !!value.trim();
        if (story.check !== undefined)
          throw new Error(
            `${name}/${story.id}: replace check with checks containing test names and coverage`,
          );
        if (story.checks !== undefined && !Array.isArray(story.checks))
          throw new Error(`${name}/${story.id}: checks must be an array`);
        if (
          (story.gap !== undefined && !filled(story.gap)) ||
          (!story.checks?.length && !filled(story.gap))
        )
          throw new Error(
            `${name}/${story.id}: provide named checks or explain the specific verification gap`,
          );
        for (const check of story.checks ?? []) {
          if (
            !filled(check?.test) ||
            !filled(check?.covers) ||
            !view.nodes.some((node) =>
              node.sources.some(
                (source) =>
                  source.role === "verification" && source.url === check.url,
              ),
            )
          )
            throw new Error(
              `${name}/${story.id}: each check needs a declared verification source, exact test name and coverage`,
            );
        }
      }
      if ("focus" in story || story.edges.some((id) => !edgeIds.has(id)))
        throw new Error(
          `${name}: stories select wires, never a cropped camera subset`,
        );
    }
    for (const item of [...view.requirements, ...view.questions]) {
      if (
        "focus" in item ||
        !item.blocks?.length ||
        [...item.blocks, ...(item.contextBlocks ?? [])].some(
          (id) => !ids.has(id),
        )
      )
        throw new Error(`${name}: invalid review selection`);
      if (
        item.questions?.some(
          (id) => !view.questions.some((question) => question.id === id),
        )
      )
        throw new Error(`${name}: ${item.id} has an unknown gap`);
      if (item.flow?.some((id) => !item.blocks.includes(id)))
        throw new Error(
          `${name}: ${item.id} flow is outside its linked blocks`,
        );
      for (const step of item.walkthrough ?? [])
        if (step.blocks.some((id) => !ids.has(id)))
          throw new Error(
            `${name}: ${item.id} walkthrough has an unknown block`,
          );
      for (let index = 1; index < (item.flow?.length ?? 0); index++) {
        if (
          !view.edges.some(
            (edge) =>
              edge.a === item.flow[index - 1] && edge.b === item.flow[index],
          )
        )
          throw new Error(`${name}: ${item.id} has a disconnected flow`);
      }
    }
    for (const requirement of view.requirements) {
      if (requirement.issues?.length || requirement.questions?.length)
        throw new Error(
          `${name}: requirement proof/admin links belong in collapsed evidence or product decisions`,
        );
      const linked = new Set([
        ...requirement.blocks,
        ...(requirement.contextBlocks ?? []),
      ]);
      const reached = new Set([requirement.blocks[0]]);
      let previousSize;
      do {
        previousSize = reached.size;
        for (const edge of view.edges) {
          if (!linked.has(edge.a) || !linked.has(edge.b)) continue;
          if (reached.has(edge.a)) reached.add(edge.b);
          if (reached.has(edge.b)) reached.add(edge.a);
        }
      } while (reached.size !== previousSize);
      if (reached.size !== linked.size)
        throw new Error(
          `${name}: requirement cards must form a connected runtime flow`,
        );
      for (const step of requirement.walkthrough ?? [])
        if (step.blocks.some((id) => !linked.has(id)))
          throw new Error(
            `${name}: walkthrough cards must belong to their runtime flow`,
          );
    }
    for (const node of view.nodes)
      if (!view.edges.some((edge) => edge.a === node.id || edge.b === node.id))
        throw new Error(
          `${name}: canvas cards must participate in runtime wiring`,
        );
    const initial = presentation.initial;
    const choices =
      initial?.kind === "story" ? view.stories : view.requirements;
    if (!choices.some((choice) => choice.id === initial?.id))
      throw new Error(`${name}: unknown initial selection`);
  }
  return definition;
}

export function validateViewerSource(template) {
  const css = template.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  for (const [selector, variable] of [
    [".node.dimmed", "--inactive-card-opacity"],
    [".wire.dimmed", "--inactive-wire-opacity"],
    [".wire.context.dimmed", "--inactive-context-opacity"],
  ]) {
    const declarations = new Map();
    for (const rule of rules.filter((rule) =>
      rule[1].split(",").some((part) => part.trim() === selector),
    )) {
      for (const item of rule[2].split(";")) {
        const colon = item.indexOf(":");
        if (colon > 0)
          declarations.set(
            item.slice(0, colon).trim(),
            item.slice(colon + 1).trim(),
          );
      }
    }
    if (
      declarations.get("opacity") !== `var(${variable})` ||
      declarations.get("display") === "none" ||
      declarations.get("visibility") === "hidden"
    )
      throw new Error(`${selector} must stay visible and use shared dimming`);
  }
  for (const value of Object.values(BREADBOARD.dimming))
    if (!(value > 0 && value < 1))
      throw new Error("Inactive opacity must be between zero and one");
}

export function renderBoard(definition, output, template, interactionSource) {
  validateDefinition(definition);
  validateViewerSource(template);
  const { metadata, views } = definition;
  const initial = metadata.views[metadata.defaultView];
  const data = Object.fromEntries(
    Object.entries(views).map(([name, view]) => [
      name,
      {
        ...view,
        layout: { ...BREADBOARD.layout, columns: view.layout.columns },
      },
    ]),
  );
  const filename = output.split("/").at(-1);
  const replacements = {
    TITLE: escapeHtml(initial.title),
    EYEBROW: escapeHtml(metadata.eyebrow),
    HEADING: initial.headingHtml,
    NAVIGATION: Object.entries(metadata.views)
      .map(
        ([key, view]) =>
          `<a data-view="${escapeHtml(key)}" href="${filename}${view.query ? `?flow=${encodeURIComponent(view.query)}` : ""}">${escapeHtml(view.label)}</a>`,
      )
      .join("\n"),
    FRAME: initial.frameHtml,
    REQUIREMENTS_INTRO: escapeHtml(metadata.requirementsIntro),
    QUESTIONS_INTRO: escapeHtml(metadata.questionsIntro),
    SOURCES: metadata.sourcesHtml,
    METADATA: inlineJson(metadata),
    DATA: inlineJson(data),
    INTERACTION_MODULE: interactionSource.replace(/^export /gm, ""),
    CARD_OPACITY: BREADBOARD.dimming.card,
    WIRE_OPACITY: BREADBOARD.dimming.wire,
    CONTEXT_OPACITY: BREADBOARD.dimming.contextWire,
    LANE_PADDING: BREADBOARD.layout.lanePadding,
  };
  const result = template.replace(/@@([A-Z_]+)@@/g, (match, key) => {
    if (!(key in replacements))
      throw new Error(`Unknown shared template slot: ${key}`);
    return replacements[key];
  });
  compileFunction(
    result.match(/<script type="module">([\s\S]*?)<\/script>/)[1],
  );
  return result;
}
