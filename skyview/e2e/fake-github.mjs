// A tiny in-memory stand-in for the parts of the GitHub REST API that skyview uses.
//
// Why a fake? skyview's real publish commits to v2, and every push to v2 deploys
// lucaschenphoto.com. Tests must be safe to run any time, so skyview's server is
// started with GITHUB_API_URL pointing here instead (see playwright.config.mjs).
//
// The fake is plain Node (no Playwright). It runs inside the Playwright test process,
// so tests can change its state directly, e.g. `github.pushCommit(...)` to simulate
// someone editing v2 by hand, then check how skyview reacts.
//
// Only the endpoints lib/github.js calls are implemented:
//   GET   /repos/:repo/branches/v2
//   GET   /repos/:repo/contents/:path?ref=:sha
//   GET   /repos/:repo/deployments?environment=github-pages
//   GET   /repos/:repo/deployments/:id/statuses
//   GET   /repos/:repo/actions/workflows/deploy.yml/runs?head_sha=:sha
//   GET   /repos/:repo/git/commits/:sha
//   POST  /repos/:repo/git/trees
//   POST  /repos/:repo/git/commits
//   PATCH /repos/:repo/git/refs/heads/v2

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

export const REPO = "lucaschennn/lucaschennn.github.io";
export const TOKEN = "e2e-fake-token";
export const REGISTRY_PATHS = {
  portfolio: "src/assets/portfolio.json",
  published: "src/assets/published.json",
  galleries: "src/assets/galleries.json",
};

// Git identifies file contents by a "blob sha": sha1 of "blob <size>\0<content>".
// skyview compares these to tell whether a file changed, so the fake computes them
// exactly like git does.
const blobSha = (content) =>
  createHash("sha1").update(`blob ${Buffer.byteLength(content)}\0${content}`).digest("hex");

// Commit and tree shas only need to be unique here, not git-accurate.
let counter = 0;
const newSha = () => createHash("sha1").update(`fake-${++counter}`).digest("hex");

// The registry files as they are in this repo right now: realistic test data.
function realRegistry() {
  const root = new URL("../../", import.meta.url);
  return Object.fromEntries(
    Object.values(REGISTRY_PATHS).map((p) => [p, readFileSync(new URL(p, root), "utf8").replace(/\r\n/g, "\n")]),
  );
}

export class FakeGitHub {
  constructor() {
    this.reset();
  }

  // Back to a known starting point: one commit on v2 holding the real registry
  // files plus one code file, already deployed (status "live"). Called before each test.
  reset() {
    this.token = TOKEN; // requests must send `Bearer ${this.token}`
    this.commits = new Map(); // sha -> { files: {path: content}, parents, message, author }
    this.trees = new Map(); // sha -> { path: content }
    this.deployments = []; // newest first: { id, sha, state }
    this.runs = []; // workflow runs, newest first: { head_sha, status, conclusion, html_url }
    this.requests = []; // log of "METHOD path" seen, handy when debugging a test
    this.raceNextRefUpdate = false;
    this.head = this.#commit({ ...realRegistry(), "src/App.jsx": "// app code\n" }, [], "initial");
    this.deploy(this.head, "success");
  }

  // ---- Helpers for tests: change the "repo" the way people and Actions would ----

  // A push to v2 that changes some files (e.g. a hand edit). With deploy: true it is
  // also deployed successfully, so the live site equals HEAD again.
  pushCommit(changes, { message = "hand edit", deploy = true } = {}) {
    const files = { ...this.commits.get(this.head).files, ...changes };
    this.head = this.#commit(files, [this.head], message);
    if (deploy) this.deploy(this.head, "success");
    return this.head;
  }

  // Records a finished workflow run and (if it succeeded) a deployment for `sha`.
  deploy(sha, state) {
    const conclusion = state === "success" ? "success" : "failure";
    this.runs.unshift({ head_sha: sha, status: "completed", conclusion, html_url: `https://fake/runs/${sha}` });
    if (state === "success") {
      // Like GitHub: the previous successful deployment becomes inactive.
      for (const d of this.deployments) if (d.state === "success") d.state = "inactive";
      this.deployments.unshift({ id: this.deployments.length + 1, sha, state: "success" });
    }
  }

  // A run that has started for HEAD but not finished (status "deploying" in skyview).
  startRun(sha = this.head) {
    this.runs.unshift({ head_sha: sha, status: "in_progress", conclusion: null, html_url: `https://fake/runs/${sha}` });
  }

  // Deploys whatever is at HEAD, as the GitHub Action would after a push.
  deployHead() {
    this.deploy(this.head, "success");
  }

  // Simulates the token being revoked: every request now gets 401.
  revokeToken() {
    this.token = "revoked";
  }

  // The file contents at a commit (default HEAD); JSON files are parsed.
  file(path, sha = this.head) {
    return this.commits.get(sha).files[path];
  }
  json(path, sha = this.head) {
    return JSON.parse(this.file(path, sha));
  }
  headCommit() {
    return this.commits.get(this.head);
  }

  // ---- Internals ----

  #commit(files, parents, message, author = { name: "test" }) {
    const sha = newSha();
    this.commits.set(sha, { files, parents, message, author });
    return sha;
  }

  // Maps one HTTP request to a [status, body] pair.
  handle(method, url, body) {
    const { pathname, searchParams } = url;
    const prefix = `/repos/${REPO}`;
    if (!pathname.startsWith(prefix)) return [404, { message: "Not Found" }];
    const path = pathname.slice(prefix.length);
    let m;

    if (method === "GET" && path === "/branches/v2") {
      return [200, { name: "v2", commit: { sha: this.head } }];
    }
    if (method === "GET" && (m = path.match(/^\/contents\/(.+)$/))) {
      const commit = this.commits.get(searchParams.get("ref"));
      const content = commit?.files[decodeURIComponent(m[1])];
      if (content === undefined) return [404, { message: "Not Found" }];
      return [200, { sha: blobSha(content), encoding: "base64", content: Buffer.from(content).toString("base64") }];
    }
    if (method === "GET" && path === "/deployments") {
      return [200, this.deployments.map(({ id, sha }) => ({ id, sha }))];
    }
    if (method === "GET" && (m = path.match(/^\/deployments\/(\d+)\/statuses$/))) {
      const d = this.deployments.find((x) => x.id === Number(m[1]));
      return [200, d ? [{ state: d.state, environment_url: "https://lucaschenphoto.com/" }] : []];
    }
    if (method === "GET" && path === "/actions/workflows/deploy.yml/runs") {
      const sha = searchParams.get("head_sha");
      return [200, { workflow_runs: this.runs.filter((r) => !sha || r.head_sha === sha) }];
    }
    if (method === "GET" && (m = path.match(/^\/git\/commits\/(\w+)$/))) {
      if (!this.commits.has(m[1])) return [404, { message: "Not Found" }];
      // The commit sha doubles as its tree id; trees are looked up in #treeFiles.
      return [200, { sha: m[1], tree: { sha: `tree-of-${m[1]}` } }];
    }
    if (method === "POST" && path === "/git/trees") {
      const base = this.#treeFiles(body.base_tree);
      const files = { ...base, ...Object.fromEntries(body.tree.map((t) => [t.path, t.content])) };
      const sha = newSha();
      this.trees.set(sha, files);
      return [201, { sha }];
    }
    if (method === "POST" && path === "/git/commits") {
      const sha = this.#commit(this.#treeFiles(body.tree), body.parents, body.message, body.author);
      return [201, { sha, html_url: `https://fake/commit/${sha}` }];
    }
    if (method === "PATCH" && path === "/git/refs/heads/v2") {
      if (this.raceNextRefUpdate) {
        // Someone else pushes in the instant before skyview moves the branch.
        this.raceNextRefUpdate = false;
        this.pushCommit({ "src/App.jsx": "// racing push\n" }, { message: "racing push" });
      }
      // Like GitHub without force: only a fast-forward from the current HEAD is allowed.
      const parents = this.commits.get(body.sha)?.parents ?? [];
      if (!body.force && !parents.includes(this.head)) return [422, { message: "Update is not a fast forward" }];
      this.head = body.sha;
      return [200, { object: { sha: body.sha } }];
    }
    return [404, { message: `Fake GitHub has no route for ${method} ${path}` }];
  }

  #treeFiles(treeSha) {
    if (treeSha?.startsWith("tree-of-")) return this.commits.get(treeSha.slice(8)).files;
    return this.trees.get(treeSha);
  }

  // Starts the HTTP server. Resolves once it's listening.
  listen(port) {
    this.server = createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${port}`);
      this.requests.push(`${req.method} ${url.pathname}`);
      let raw = "";
      for await (const chunk of req) raw += chunk;
      const [status, body] =
        req.headers.authorization === `Bearer ${this.token}`
          ? this.handle(req.method, url, raw ? JSON.parse(raw) : undefined)
          : [401, { message: "Bad credentials" }];
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(body));
    });
    return new Promise((resolve) => this.server.listen(port, resolve));
  }

  close() {
    return new Promise((resolve) => this.server.close(resolve));
  }
}
