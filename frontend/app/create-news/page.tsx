"use client";

import { useState } from "react";

export default function CreateNews() {
  const [headline, setHeadline] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [category, setCategory] = useState("General");
  const [imageUrl, setImageUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [news, setNews] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateNews() {
    if (!headline.trim() || !sourceText.trim()) {
      setNews("Da fatan za a cika taken labari da bayanin labari.");
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
          category,
          imageUrl,
          published,
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

      <p style={{ color: "#666", marginBottom: "25px" }}>
        Ƙirƙiri sabon labari ta amfani da Ibrahim News Hub AI.
      </p>

      <input
        type="text"
        placeholder="Shigar da taken labari..."
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "18px",
          marginBottom: "15px",
          boxSizing: "border-box",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "16px",
          marginBottom: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          background: "#fff",
        }}
      >
        <option value="General">📰 General</option>
        <option value="Najeriya">🇳🇬 Najeriya</option>
        <option value="Duniya">🌍 Duniya</option>
        <option value="Technology">🤖 Technology</option>
        <option value="Kasuwanci">💰 Kasuwanci</option>
        <option value="Wasanni">⚽ Wasanni</option>
        <option value="Viral">🔥 Viral</option>
      </select>

      <input
        type="text"
        placeholder="Image URL — misali https://..."
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "16px",
          marginBottom: "15px",
          boxSizing: "border-box",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      />

      <textarea
        placeholder="Liƙa cikakken bayanin labari a nan..."
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        rows={10}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "16px",
          marginBottom: "15px",
          boxSizing: "border-box",
          border: "1px solid #ddd",
          borderRadius: "8px",
          resize: "vertical",
        }}
      />

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
          fontSize: "16px",
        }}
      >
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Publish News
      </label>

      <button
        onClick={generateNews}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px",
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
            background: "#fff",
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
