"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ margin: 0, background: "#09090b", color: "#fff", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>Something went wrong</p>
          <h1 style={{ fontSize: 24, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", marginBottom: 16 }}>Unexpected Error</h1>
          <button
            onClick={reset}
            style={{ padding: "10px 24px", background: "#fff", color: "#000", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
