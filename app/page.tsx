"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.75rem",
        backgroundColor: "#F6F7EB",
      }}
    >
      {!session && (
        <button
          onClick={() => signIn("google")}
          style={{
            color: "black",
            background: "white",
            fontWeight: "bold",
            borderRadius: "1rem",
            padding: "0.5rem 3rem",
            cursor: "pointer",
          }}
        >
          Login com Google
        </button>
      )}

      {session && (
        <>
          <p style={{ fontSize: "1.25rem" }}>
            Olá,{" "}
            <span style={{ fontWeight: "bold" }}>{session.user?.name}</span>
          </p>

          {/* <div style={{ textAlign: "center" }}>
            <p>Para fazer requisições logado, copie o seguinte header:</p>
            <p
              style={{
                fontSize: "1.1rem",
                marginTop: "0.4rem",
                maxWidth: 500,
                wordBreak: "break-all",
                border: "1px solid black",
                padding: "0.5rem",
                borderRadius: "1rem",
              }}
            >
              <strong>Cookie:</strong>{" "}
              {cookieHeader ||
                "Cookies não encontrados. Autentique-se e tente novamente."}
            </p>
          </div> */}

          <div
            style={{
              display: "flex",
              gap: "1rem",
            }}
          >
            {/* <button
              onClick={copyHeader}
              disabled={!cookieHeader}
              style={{
                padding: "0.5rem 3rem",
                borderRadius: "1rem",
                fontWeight: "bold",
                background: cookieHeader ? "#1b9c85" : "#ccc",
                color: "white",
                cursor: cookieHeader ? "pointer" : "not-allowed",
              }}
            >
              Copiar
            </button> */}
            <button
              onClick={() => signOut()}
              style={{
                color: "white",
                background: "red",
                fontWeight: "bold",
                borderRadius: "1rem",
                padding: "0.5rem 3rem",
                cursor: "pointer",
              }}
            >
              Sair
            </button>
          </div>
        </>
      )}
    </main>
  );
}
