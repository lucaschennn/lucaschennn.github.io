import { requireOwner } from "@/auth";
import { GitHubError, PublishRefused, publishRegistry } from "@/lib/github";

const KEYS = ["portfolio", "published", "galleries"];

// Body: { baseBlobShas, files: { [key]: data }, summary: string[] }.
export async function POST(request) {
  const session = await requireOwner();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  const files = Object.fromEntries(KEYS.filter((k) => body?.files?.[k] !== undefined).map((k) => [k, body.files[k]]));
  const summary = Array.isArray(body?.summary)
    ? body.summary.filter((s) => typeof s === "string").slice(0, 50).map((s) => s.slice(0, 200))
    : [];

  try {
    return Response.json(await publishRegistry({ baseBlobShas: body?.baseBlobShas, files, summary }));
  } catch (e) {
    if (e instanceof PublishRefused) return Response.json({ error: e.message, reason: e.reason }, { status: 409 });
    if (e instanceof GitHubError) return Response.json({ error: e.message }, { status: 502 });
    throw e;
  }
}
