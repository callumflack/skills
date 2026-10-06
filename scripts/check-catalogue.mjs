import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--staged") || args.length > 1) {
  console.error("Usage: node scripts/check-catalogue.mjs [--staged]");
  process.exit(1);
}
const git = (...args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8" });
const snapshot = args.includes("--staged")
  ? {
      paths: git("ls-files", "--cached", "-z").split("\0").filter(Boolean),
      read: (path) => git("show", `:${path}`),
    }
  : {
      paths: readdirSync(root, { withFileTypes: true })
        .filter(
          (entry) =>
            entry.isDirectory() &&
            existsSync(resolve(root, entry.name, "SKILL.md")),
        )
        .map((entry) => `${entry.name}/SKILL.md`),
      read: (path) => readFileSync(resolve(root, path), "utf8"),
    };
const failures = [];
const skills = snapshot.paths
  .filter((path) => /^[^/]+\/SKILL\.md$/.test(path))
  .map((path) => path.split("/")[0]);
const read = snapshot.read;
const catalogue = read("README.md");
const entries = [...catalogue.matchAll(/^- \*\*\[`([^`]+)`\]\(([^)]+)\)/gm)];
const commands = [
  ...catalogue.matchAll(
    /npx skills@latest add callumflack\/skills --skill (\S+)/g,
  ),
].map((match) => match[1]);
const config = JSON.parse(read("skills.sh.json"));
const grouped = [];
for (const group of config.groupings ?? []) {
  if (
    !group.title?.trim() ||
    !Array.isArray(group.skills) ||
    !group.skills.length
  ) {
    failures.push("Invalid or empty website group");
    continue;
  }
  grouped.push(...group.skills);
}
for (const [label, names] of [
  ["README", entries.map((entry) => entry[1])],
  ["install commands", commands],
  ["website groups", grouped],
]) {
  for (const name of skills) {
    if (names.filter((value) => value === name).length !== 1)
      failures.push(`${label}: ${name} must appear exactly once`);
  }
  for (const name of names) {
    if (!skills.includes(name))
      failures.push(`${label}: ${name} is not an active top-level skill`);
  }
}
for (const entry of entries) {
  if (entry[2] !== `${entry[1]}/SKILL.md`)
    failures.push(`Wrong README owner link: ${entry[1]}`);
}
for (const name of skills) {
  const body = read(`${name}/SKILL.md`);
  const frontmatter = body.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (
    !frontmatter ||
    !new RegExp(`^name: ${name}$`, "m").test(frontmatter[1]) ||
    !/^description:\s*\S/m.test(frontmatter[1])
  )
    failures.push(`Invalid skill frontmatter: ${name}`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `ok: ${skills.length} active skills match README, install commands, and website groups`,
  );
}
