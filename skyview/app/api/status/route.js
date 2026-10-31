import { requireUser } from "@/auth";
import { getDeployStatus, GitHubError } from "@/lib/github";

export async function GET() {
  const session = await requireUser();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    return Response.json(await getDeployStatus());
  } catch (e) {
    if (e instanceof GitHubError) return Response.json({ error: e.message }, { status: 502 });
    throw e;
  }
}
