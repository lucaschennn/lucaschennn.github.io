import { requireOwner, signIn, signOut } from "@/auth";
import { cachedForVisitors, getHead, getRegistry, GitHubError } from "@/lib/github";
import Editor from "./editor";

const VISITOR_NOTICE = "Welcome to skyview, the LucasChenPhoto portfolio editor and deploy pipeline! You won't be able to update the portfolio, but you can explore, preview, and edit freely.";

async function readRegistry() {
  const head = await getHead();
  return { head, files: await getRegistry(head) };
}

export default async function Home() {
  const owner = await requireOwner();

  let head, files, error;
  try {
    ({ head, files } = await (owner ? readRegistry() : cachedForVisitors("registry", readRegistry)));
  } catch (e) {
    if (!(e instanceof GitHubError)) throw e;
    error = e.message;
  }

  return (
    <>
      <header className="header">
        <h1>skyview</h1>
        {owner ? (
          <form action={async () => { "use server"; await signOut(); }}>
            <span className="muted">{owner.user.name}</span>{" "}
            <button type="submit">Sign out</button>
          </form>
        ) : (
          <form action={async () => { "use server"; await signIn("github"); }}>
            <button type="submit">Sign in with GitHub</button>
          </form>
        )}
      </header>
      {!owner && <p className="notice visitor">{VISITOR_NOTICE}</p>}
      {error ? (
        <p className="notice error">Can't read the registry from GitHub: {error}</p>
      ) : (
        <Editor head={head} files={files} visitor={!owner} />
      )}
    </>
  );
}
