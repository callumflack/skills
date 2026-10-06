import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publication = {
  commit: null,
  remote: null,
  skills: [],
  refreshStatus: "not_attempted",
  verificationStatus: "pending",
  url: "https://www.skills.sh/callumflack/skills",
};
const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
const git = (...args) => run("git", args).trim();
const requireClean = () => {
  if (git("status", "--porcelain", "--untracked-files=normal"))
    throw new Error(
      "Checkout is dirty. Commit or preserve changes before refreshing.",
    );
};
let temporaryDirectory;
process.on("SIGINT", () => {
  process.exitCode = 130;
});
try {
  if (process.argv.length > 2)
    throw new Error("Usage: npm run publication:refresh");
  publication.commit = git("rev-parse", "HEAD");
  requireClean();
  process.stderr.write(run("npm", ["run", "verify"]));
  const remoteUrl = git("remote", "get-url", "origin");
  if (
    !/^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)callumflack\/skills(?:\.git)?$/.test(
      remoteUrl,
    )
  )
    throw new Error("origin must point to callumflack/skills on GitHub.");
  const remoteHead = git("ls-remote", "--symref", "origin", "HEAD");
  const branch = remoteHead.match(/^ref: refs\/heads\/(.+)\tHEAD$/m)?.[1];
  const commit = remoteHead.match(/^([a-f0-9]{40,64})\tHEAD$/m)?.[1];
  if (!branch || !commit)
    throw new Error("Cannot determine the remote default branch and commit.");
  publication.remote = { url: remoteUrl, branch, commit };
  if (publication.commit !== commit)
    throw new Error(
      "HEAD differs from the remote default branch. Refresh only the pushed commit.",
    );
  publication.skills = git("ls-tree", "-r", "--name-only", "HEAD")
    .split("\n")
    .filter((path) => /^[^/]+\/SKILL\.md$/.test(path))
    .map((path) => path.split("/")[0]);
  if (!publication.skills.length)
    throw new Error("No active skills to refresh.");
  requireClean();
  if (git("rev-parse", "HEAD") !== publication.commit)
    throw new Error("HEAD changed during verification. Run the command again.");
  temporaryDirectory = mkdtempSync(join(tmpdir(), "skills-publication-"));
  const env = {
    ...process.env,
    npm_config_cache: join(temporaryDirectory, "npm-cache"),
  };
  delete env.DISABLE_TELEMETRY;
  delete env.CI;
  publication.refreshStatus = "running";
  process.stderr.write(
    run(
      "npx",
      [
        "--yes",
        "skills@latest",
        "add",
        "callumflack/skills",
        "--skill",
        ...publication.skills,
        "--agent",
        "codex",
        "--copy",
        "--yes",
      ],
      { cwd: temporaryDirectory, env },
    ),
  );
  for (const skill of publication.skills) {
    const installed = readFileSync(
      join(temporaryDirectory, ".agents", "skills", skill, "SKILL.md"),
      "utf8",
    );
    const source = run("git", [
      "show",
      `${publication.commit}:${skill}/SKILL.md`,
    ]);
    if (installed !== source)
      throw new Error(
        `Installed content differs from the pushed source for ${skill}.`,
      );
  }
  publication.refreshStatus = "succeeded";
} catch (error) {
  publication.refreshStatus =
    publication.refreshStatus === "running" ? "failed" : "not_attempted";
  publication.error = error.message;
  if (error.stdout) process.stderr.write(error.stdout);
  if (error.stderr) process.stderr.write(error.stderr);
  process.exitCode = 1;
} finally {
  if (temporaryDirectory) {
    try {
      rmSync(temporaryDirectory, { recursive: true, force: true });
    } catch (error) {
      publication.error = [
        publication.error,
        `Temporary cleanup failed: ${error.message}`,
      ]
        .filter(Boolean)
        .join("\n");
      process.exitCode = 1;
    }
  }
  console.log(JSON.stringify(publication, null, 2));
}
