import { redirect } from "next/navigation";

// Where Auth.js sends failed sign-ins (pages in auth.js), with ?error=<type>.
// AccessDenied: a GitHub account other than ALLOWED_GITHUB_ID tried to sign in.
export default async function AuthError({ searchParams }) {
  const { error } = await searchParams;
  if (!error) redirect("/"); // pages.signIn: there's no separate sign-in page

  return (
    <>
      <header className="header">
        <h1>skyview</h1>
      </header>
      <p className="notice error">
        {error === "AccessDenied"
          ? "Access denied. Please view the site as a visitor."
          : "Sign-in failed. Please try again later."}
      </p>
      <form action="/">
        <button type="submit" className="primary">Return to skyview home</button>
      </form>
    </>
  );
}
