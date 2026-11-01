import { requireOwner } from "@/auth";
import { getHead, getRegistry, GitHubError } from "@/lib/github";

// The three registry files at v2 HEAD, plus the HEAD sha they were read at.
export async function GET() {
  const session = await requireOwner();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    const head = await getHead();
    return Response.json({ head, files: await getRegistry(head) });
  } catch (e) {
    if (e instanceof GitHubError) return Response.json({ error: e.message }, { status: 502 });
    throw e;
  }
}
