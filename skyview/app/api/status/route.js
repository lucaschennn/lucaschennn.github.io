import { requireOwner } from "@/auth";
import { cachedForVisitors, getDeployStatus, GitHubError } from "@/lib/github";

// Open to visitors (the tour shows the status bar), who get the shared cached read.
export async function GET() {
  const owner = await requireOwner();
  try {
    return Response.json(await (owner ? getDeployStatus() : cachedForVisitors("status", getDeployStatus)));
  } catch (e) {
    if (e instanceof GitHubError) return Response.json({ error: e.message }, { status: 502 });
    throw e;
  }
}
