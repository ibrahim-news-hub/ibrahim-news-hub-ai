"use client";

import { useState } from "react";

type Props = {
  language: string;
  title: string;
  content: string;
};

export default function TranslateButton({
  language,
  title,
  content,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [translated, setTranslated] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [error, setError] = useState("");

  async function translate() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          title,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "An samu kuskure wajen fassara."
        );
      }

      setTranslated({
        title: data.title || title,
        content: data.content || content,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An samu kuskure wajen fassara."
      );
    } finally {
      setLoading(false);
    }
  }

  if (translated) {
    return (
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          <strong style={{ color: "#166534" }}>
            🌐 {language}
          </strong>

          <button
            type="button"
            onClick={() => setTranslated(null)}
            style={{
              border: "1px solid #d1d5db",
              background: "#fff",
              padding: "8px 12px",
              borderRadius: "7px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ↩️ Original
          </button>
        </div>

        <h2
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            lineHeight: "1.2",
            margin: "0 0 18px",
            fontWeight: 900,
          }}
        >
          {translated.title}
        </h2>

        <div
          style={{
            fontSize: "18px",
            lineHeight: "1.9",
            whiteSpace: "pre-wrap",
            color: "#374151",
          }}
        >
          {translated.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "30px" }}>
      <button
        type="button"
        onClick={translate}
        disabled={loading}
        style={{
          border: 0,
          background: "#166534",
          color: "#fff",
          padding: "12px 18px",
          borderRadius: "8px",
          cursor: loading ? "wait" : "pointer",
          fontWeight: 900,
          fontSize: "15px",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading
          ? "⏳ Ana fassara..."
          : `🌐 Fassara zuwa ${language}`}
      </button>

      {error && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
