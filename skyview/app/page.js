import { requireUser, signIn, signOut } from "@/auth";

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

  return (
    <form action={async () => { "use server"; await signOut(); }}>
      <h1>Hello, {session.user.name}</h1>
      <button type="submit">Sign out</button>
    </form>
  );
}
