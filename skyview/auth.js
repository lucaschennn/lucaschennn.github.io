import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

// Single-user app: only the GitHub account with this numeric ID may sign in.
const allowedId = () => process.env.ALLOWED_GITHUB_ID;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Only read the public profile; repo access uses GITHUB_REPO_TOKEN, not the user's token.
    GitHub({ authorization: { params: { scope: "read:user" } } }),
  ],
  session: { maxAge: 12 * 60 * 60 },
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
// locks out existing sessions too. Returns the session or null.
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.githubId || session.user.githubId !== allowedId()) return null;
  return session;
}
