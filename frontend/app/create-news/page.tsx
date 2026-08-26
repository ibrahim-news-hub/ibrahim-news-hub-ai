"use client";

import { useState } from "react";

export default function CreateNews() {
  const [headline, setHeadline] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [news, setNews] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateNews() {
    setLoading(true);
    setNews("");

    try {
      const res = await fetch("/api/write-news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          headline,
          sourceText,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setNews(
          data.details
            ? `${data.error}\n\nDetails: ${data.details}\nCode: ${
                data.code || "N/A"
              }`
            : data.error || "An samu kuskure."
        );
      } else {
        setNews(data.article || "Ba a samu labari ba.");
      }
    } catch (error) {
      console.error(error);
      setNews("An samu matsala wajen haɗawa da server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h1>📰 Create News</h1>

      <input
        type="text"
        placeholder="Shigar da taken labari..."
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "18px",
          marginBottom: "20px",
          boxSizing: "border-box",
        }}
      />

      <textarea
        placeholder="Liƙa cikakken bayanin labari a nan..."
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        rows={8}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          marginBottom: "20px",
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={generateNews}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          background: loading ? "#94a3b8" : "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate News"}
      </button>

      {news && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h2>Generated News</h2>

          <p
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "1.8",
            }}
          >
            {news}
          </p>
        </div>
      )}
    </main>
  );
}
