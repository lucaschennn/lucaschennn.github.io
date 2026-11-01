import { requireOwner } from "@/auth";

// Template for every skyview API route: check the session on the server first.
export async function GET() {
  const session = await requireOwner();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json({ name: session.user.name, githubId: session.user.githubId });
}
