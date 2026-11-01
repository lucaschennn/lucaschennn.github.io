// Server-only GitHub access for the site repo. Uses GITHUB_REPO_TOKEN, never the user's token.
// GITHUB_API_URL is only set by the e2e tests, to point at a fake GitHub (e2e/fake-github.mjs).
const API = process.env.GITHUB_API_URL ?? "https://api.github.com";
const REPO = "lucaschennn/lucaschennn.github.io";
export const BRANCH = "v2";
const WORKFLOW = "deploy.yml";
export const REGISTRY_FILES = {
  portfolio: "src/assets/portfolio.json",
  published: "src/assets/published.json",
  galleries: "src/assets/galleries.json",
};

// What usually causes each status for this token, so errors say what to do.
const HINTS = {
  401: "GITHUB_REPO_TOKEN is invalid, expired or revoked. Create a new one and update it in Vercel.",
  403: "GITHUB_REPO_TOKEN lacks a permission (Contents read/write, Deployments read, Actions read), or the API rate limit was hit.",
  404: "GITHUB_REPO_TOKEN can't see the repo, or the path doesn't exist. Check the token's repository access.",
};

export class GitHubError extends Error {
  constructor(status, path) {
    super(`GitHub API ${status} on ${path}.${HINTS[status] ? ` ${HINTS[status]}` : ""}`);
    this.status = status;
  }
}

async function gh(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API}/repos/${REPO}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_REPO_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body && { "Content-Type": "application/json" }),
    },
    body: body && JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new GitHubError(res.status, path);
  return res.json();
}

export async function getHead() {
  const branch = await gh(`/branches/${BRANCH}`);
  return branch.commit.sha;
}

// The three registry files at a commit. blobSha lets publish detect whether a file changed since load.
export async function getRegistry(sha) {
  const entries = await Promise.all(
    Object.entries(REGISTRY_FILES).map(async ([key, path]) => {
      const file = await gh(`/contents/${path}?ref=${sha}`);
      const text = Buffer.from(file.content, "base64").toString("utf8");
      return [key, { path, blobSha: file.sha, data: JSON.parse(text) }];
    }),
  );
  return Object.fromEntries(entries);
}

// Most recent github-pages deployment whose latest status is success: the commit that is live.
async function getLiveDeployment() {
  const deployments = await gh(`/deployments?environment=github-pages&per_page=10`);
  for (const d of deployments) {
    const [latest] = await gh(`/deployments/${d.id}/statuses?per_page=1`);
    if (latest?.state === "success") return { sha: d.sha, url: latest.environment_url };
  }
  return null;
}

// live: HEAD is deployed. pending: pushed, no workflow run yet. deploying: run in progress.
// failed: the run for HEAD failed or was cancelled.
export async function getDeployStatus() {
  const [head, live] = await Promise.all([getHead(), getLiveDeployment()]);
  const base = { head, liveSha: live?.sha ?? null, liveUrl: live?.url ?? null };
  if (live?.sha === head) return { ...base, state: "live" };

  const { workflow_runs: runs } = await gh(
    `/actions/workflows/${WORKFLOW}/runs?branch=${BRANCH}&head_sha=${head}&per_page=1`,
  );
  const run = runs[0];
  if (!run) return { ...base, state: "pending" };
  const runInfo = { runUrl: run.html_url };
  if (run.status !== "completed") return { ...base, ...runInfo, state: "deploying" };
  // A successful run whose deployment isn't reported yet is still finishing.
  if (run.conclusion === "success") return { ...base, ...runInfo, state: "deploying" };
  return { ...base, ...runInfo, state: "failed" };
}

// Same formatting as the files in the repo (4-space indent, no trailing newline),
// so an untouched file serializes byte-for-byte identically.
export const serialize = (data) => JSON.stringify(data, null, 4);

export class PublishRefused extends Error {
  constructor(reason, message) {
    super(message);
    this.reason = reason;
  }
}

// Commits the changed registry files to v2 as one commit on top of the current HEAD.
// baseBlobShas: the blob shas the draft was based on. Refuses (PublishRefused) if a
// deploy isn't live, if any registry file changed on v2 since the draft was loaded,
// or if v2 moves while committing.
export async function publishRegistry({ baseBlobShas, files, summary }) {
  const status = await getDeployStatus();
  if (status.state !== "live") {
    throw new PublishRefused("deploy", `The live site doesn't match v2 yet (${status.state}). Try again once it's live.`);
  }

  const head = status.head;
  const current = await getRegistry(head);
  const changedOnV2 = Object.keys(REGISTRY_FILES).filter((k) => current[k].blobSha !== baseBlobShas?.[k]);
  if (changedOnV2.length) {
    throw new PublishRefused("changed", `Changed on v2 since you loaded it: ${changedOnV2.join(", ")}.`);
  }

  const changes = Object.keys(REGISTRY_FILES)
    .filter((k) => k in files && serialize(files[k]) !== serialize(current[k].data))
    .map((k) => ({ path: REGISTRY_FILES[k], mode: "100644", type: "blob", content: serialize(files[k]) }));
  if (!changes.length) throw new PublishRefused("empty", "Nothing to publish.");

  const headCommit = await gh(`/git/commits/${head}`);
  const tree = await gh(`/git/trees`, { method: "POST", body: { base_tree: headCommit.tree.sha, tree: changes } });
  const names = changes.map((c) => c.path.split("/").pop().replace(".json", ""));
  const message = [`skyview: update ${names.join(", ")}`, "", ...summary].join("\n").trim();
  const commit = await gh(`/git/commits`, {
    method: "POST",
    body: {
      message,
      tree: tree.sha,
      parents: [head],
      author: { name: "skyview", email: "skyview@users.noreply.github.com" },
    },
  });

  // Not forced: if v2 moved since `head`, GitHub rejects this (422) instead of overwriting.
  try {
    await gh(`/git/refs/heads/${BRANCH}`, { method: "PATCH", body: { sha: commit.sha, force: false } });
  } catch (e) {
    if (e instanceof GitHubError && e.status === 422) {
      throw new PublishRefused("changed", "v2 moved while publishing. Nothing was published; reload and try again.");
    }
    throw e;
  }
  return { sha: commit.sha, url: commit.html_url };
}
