import { requireUser, signIn, signOut } from "@/auth";
import { getHead, getRegistry } from "@/lib/github";
import StatusBar from "./status-bar";

// Flat arrays (portfolio.json) are one unnamed group.
const groups = (data) => (Array.isArray(data) ? { "": data } : data);

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
  const registry = await getRegistry(head);

  return (
    <>
      <StatusBar />
      <form action={async () => { "use server"; await signOut(); }}>
        <h1>Hello, {session.user.name}</h1>
        <button type="submit">Sign out</button>
      </form>
      <h2>Registry at {head.slice(0, 7)}</h2>
      <ul>
        {Object.entries(registry).map(([key, file]) => (
          <li key={key}>
            <code>{file.path}</code>:{" "}
            {Object.entries(groups(file.data))
              .map(([group, items]) => `${group || key} ${items.length}`)
              .join(", ")}
          </li>
        ))}
      </ul>
    </>
  );
}
