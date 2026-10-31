// Server-only GitHub access for the site repo. Uses GITHUB_REPO_TOKEN, never the user's token.
const REPO = "lucaschennn/lucaschennn.github.io";
export const BRANCH = "v2";
const WORKFLOW = "deploy.yml";
export const REGISTRY_FILES = {
  portfolio: "src/assets/portfolio.json",
  published: "src/assets/published.json",
  galleries: "src/assets/galleries.json",
};

export class GitHubError extends Error {
  constructor(status, path) {
    super(`GitHub API ${status} on ${path}`);
    this.status = status;
  }
}

async function gh(path) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_REPO_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
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
