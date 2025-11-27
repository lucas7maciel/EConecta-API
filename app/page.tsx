"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main>
      {!session ? (
        <button onClick={() => signIn("google")}>Login com Google</button>
      ) : (
        <>
          <p>Olá, {session.user?.name}</p>
          <button onClick={() => signOut()}>Sair</button>
        </>
      )}
    </main>
  );
}
