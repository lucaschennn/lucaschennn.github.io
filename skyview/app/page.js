import { requireUser, signIn, signOut } from "@/auth";
import { getHead, getRegistry } from "@/lib/github";
import StatusBar from "./status-bar";
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

  const head = await getHead();
  const files = await getRegistry(head);

  return (
    <>
      <header className="header">
        <h1>skyview</h1>
        <form action={async () => { "use server"; await signOut(); }}>
          <span className="muted">{session.user.name}</span>{" "}
          <button type="submit">Sign out</button>
        </form>
      </header>
      <StatusBar />
      <Editor head={head} files={files} />
    </>
  );
}
