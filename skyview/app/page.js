import { requireUser, signIn, signOut } from "@/auth";
import { getHead, getRegistry, GitHubError } from "@/lib/github";
import Editor from "./editor";

export default async function Home() {
  const session = await requireUser();

  if (!session) {
    return (
      <form action={async () => { "use server"; await signIn("github"); }}>
        <h1>skyview</h1>
        <button type="submit">Sign in with GitHub</button>
      </form>
    );
  }

  let head, files, error;
  try {
    head = await getHead();
    files = await getRegistry(head);
  } catch (e) {
    if (!(e instanceof GitHubError)) throw e;
    error = e.message;
  }

  return (
    <>
      <header className="header">
        <h1>skyview</h1>
        <form action={async () => { "use server"; await signOut(); }}>
          <span className="muted">{session.user.name}</span>{" "}
          <button type="submit">Sign out</button>
        </form>
      </header>
      {error ? (
        <p className="notice error">Can't read the registry from GitHub: {error}</p>
      ) : (
        <Editor head={head} files={files} />
      )}
    </>
  );
}
