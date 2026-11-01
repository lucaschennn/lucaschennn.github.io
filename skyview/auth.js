import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

// Only the GitHub account with this numeric ID may sign in. Visitors don't sign in.
const allowedId = () => process.env.ALLOWED_GITHUB_ID;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Only read the public profile; repo access uses GITHUB_REPO_TOKEN, not the user's token.
    GitHub({ authorization: { params: { scope: "read:user" } } }),
  ],
  session: { maxAge: 12 * 60 * 60 },
  // Never show Auth.js's built-in pages: its Access Denied page links "Sign in" to a
  // broken URL. Failed sign-ins land on our own page, which links back home.
  pages: { signIn: "/auth-error", error: "/auth-error" },
  callbacks: {
    signIn({ profile }) {
      return String(profile?.id) === allowedId();
    },
    jwt({ token, profile }) {
      if (profile) token.githubId = String(profile.id);
      return token;
    },
    session({ session, token }) {
      session.user.githubId = token.githubId;
      return session;
    },
  },
});

// Re-checks the allowlist on every request, so changing ALLOWED_GITHUB_ID
// demotes existing sessions to visitors too. Returns the owner's session or null.
// Anyone else is a visitor: they can tour with cached reads but never publish.
export async function requireOwner() {
  const session = await auth();
  if (!session?.user?.githubId || session.user.githubId !== allowedId()) return null;
  return session;
}
