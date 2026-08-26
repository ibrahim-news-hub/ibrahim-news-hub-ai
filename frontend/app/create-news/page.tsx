"use client";

import { useState } from "react";

export default function CreateNews() {
  const [headline, setHeadline] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [news, setNews] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateNews() {
    if (!headline.trim()) {
      setNews("Da fatan za ka shigar da taken labari.");
      return;
    }

    if (!sourceText.trim()) {
      setNews("Da fatan za ka shigar da bayanan labarin.");
      return;
    }

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
        if (data.details) {
          setNews(
            `${data.error || "An samu kuskure."}\n\n` +
              `Details: ${data.details}\n` +
              `Code: ${data.code || "N/A"}`
          );
        } else {
          setNews(data.error || "An samu kuskure.");
        }

        return;
      }

      setNews(data.article || "Ba a samu labari ba.");
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
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          marginBottom: "10px",
        }}
      >
        📰 Create News
      </h1>

      <p
        style={{
          color: "#64748b",
          fontSize: "17px",
          marginBottom: "30px",
        }}
      >
        Rubuta ko liƙa bayanan labari, sannan Ibrahim News Hub AI
        zai samar da cikakken labari cikin Hausa.
      </p>

      <label
        style={{
          display: "block",
          fontWeight: "600",
          marginBottom: "8px",
        }}
      >
        Taken Labari
      </label>

      <input
        type="text"
        placeholder="Shigar da taken labari..."
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "18px",
          marginBottom: "22px",
          boxSizing: "border-box",
          border: "1px solid #cbd5e1",
          borderRadius: "10px",
          outline: "none",
        }}
      />

      <label
        style={{
          display: "block",
          fontWeight: "600",
          marginBottom: "8px",
        }}
      >
        Bayanan Labari
      </label>

      <textarea
        placeholder="Liƙa cikakken bayanin labari a nan..."
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        rows={10}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "17px",
          marginBottom: "22px",
          boxSizing: "border-box",
          border: "1px solid #cbd5e1",
          borderRadius: "10px",
          resize: "vertical",
          lineHeight: "1.6",
          outline: "none",
        }}
      />

      <button
        onClick={generateNews}
        disabled={loading}
        style={{
          width: "100%",
          padding: "15px",
          background: loading ? "#94a3b8" : "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          fontSize: "19px",
          fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "⏳ Ana rubuta labari..." : "✨ Generate News"}
      </button>

      {news && (
        <section
          style={{
            marginTop: "30px",
            padding: "24px",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            background: "#fff",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              marginBottom: "18px",
            }}
          >
            📝 Generated News
          </h2>

          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "1.9",
              fontSize: "18px",
              color: "#1e293b",
            }}
          >
            {news}
          </div>
        </section>
      )}
    </main>
  );
}
