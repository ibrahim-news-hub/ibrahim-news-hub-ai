"use client";

import { useState } from "react";

export default function CreateNews() {
  const [headline, setHeadline] = useState("");
  const [news, setNews] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateNews() {
    setLoading(true);

    const res = await fetch("/api/write-news", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ headline }),
    });

    const data = await res.json();
    setNews(data.news || data.message);
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: "700px", margin: "40px auto", padding: "20px" }}>
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
        }}
      />

      <button
        onClick={generateNews}
        style={{
          width: "100%",
          padding: "12px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
        }}
      >
        {loading ? "Generating..." : "Generate News"}
      </button>

      {news && (
        <div style={{ marginTop: "30px" }}>
          <h2>Generated News</h2>
          <p>{news}</p>
        </div>
      )}
    </main>
  );
}

