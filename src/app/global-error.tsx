"use client";

import { useEffect } from "react";

/**
 * Layout ӨӨРӨӨ унасан үеийн сүүлчийн хамгаалалт.
 *
 * Энэ файл `<html>`, `<body>`-г ӨӨРӨӨ гаргана — учир нь root layout
 * ажиллаагүй байж болно. Тиймээс сайтын фонт, загвар ч ачаалагдахгүй
 * байж болзошгүй тул хэв маягийг шууд бичсэн.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Ноцтой алдаа:", error);
  }, [error]);

  return (
    <html lang="mn">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f2f1ed",
          color: "#111110",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              margin: 0,
            }}
          >
            Алдаа гарлаа
          </h1>

          <p style={{ marginTop: "1rem", color: "#6b6862", fontSize: "0.875rem" }}>
            Сайт түр зуур ажиллахгүй байна. Дахин оролдоно уу.
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 2rem",
              background: "#111110",
              color: "#f2f1ed",
              border: "none",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: "0.6875rem",
            }}
          >
            Дахин оролдох
          </button>

          {error.digest && (
            <p style={{ marginTop: "2rem", color: "#6b6862", fontSize: "0.75rem" }}>
              Алдааны код: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
