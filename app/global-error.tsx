"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const subject = encodeURIComponent("Error Report – IHavePDF");
  const body = encodeURIComponent(
    `Hi IHavePDF Support,\n\nI encountered an error on the website.\n\nError: ${error.message}\n${error.digest ? `Digest: ${error.digest}\n` : ""}Page: ${typeof window !== "undefined" ? window.location.href : ""}\n\nPlease look into this.\n\nThanks`
  );

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#f9fafb" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", margin: "0 0 0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6b7280", maxWidth: "480px", margin: "0 0 2rem", lineHeight: 1.6 }}>
            An unexpected error occurred. You can try again or report this to us so we can fix it.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.6rem 1.4rem",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Try again
            </button>
            <a
              href={`mailto:support@ihavepdf.com?subject=${subject}&body=${body}`}
              style={{
                background: "white",
                color: "#4f46e5",
                border: "1px solid #e0e7ff",
                borderRadius: "0.5rem",
                padding: "0.6rem 1.4rem",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "0.9rem",
              }}
            >
              Report this error
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
