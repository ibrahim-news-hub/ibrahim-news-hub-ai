"use client";

import { useState } from "react";

export default function AIImagesPage() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function generateImage() {
    if (!prompt.trim()) {
      setError("Da fatan ka rubuta bayanin hoton da kake so.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setImage("");

    try {
      const response = await fetch("/api/ai-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "An samu matsala wajen samar da hoto."
        );
      }

      setImage(data.image);
      setMessage(data.message || "An samar da hoton cikin nasara.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An samu kuskuren da ba a zata ba."
      );
    } finally {
      setLoading(false);
    }
  }

  function downloadImage() {
    if (!image) return;

    const link = document.createElement("a");
    link.href = image;
    link.download = `ISN-AI-Image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "24px 16px",
        color: "#111827",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          background: "#fff",
          padding: 24,
          borderRadius: 18,
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <a
          href="/admin"
          style={{
            color: "#dc2626",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← Komawa Admin
        </a>

        <h1
          style={{
            fontSize: 30,
            lineHeight: 1.3,
            marginTop: 24,
            marginBottom: 8,
          }}
        >
          🖼️ ISN AI Images
        </h1>

        <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
          Ƙirƙiri hoto da AI, a saka tambarin Ibrahim Sani News,
          sannan ka sauke hoton.
        </p>

        <label
          htmlFor="image-prompt"
          style={{
            display: "block",
            fontWeight: 700,
            marginTop: 24,
            marginBottom: 10,
          }}
        >
          Bayanin hoton da kake so
        </label>

        <textarea
          id="image-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Misali: Hoton kasuwar zamani a Zaria, masu saye da sayarwa, hasken safe, salo na ƙwararrun hotunan labarai..."
          maxLength={2000}
          rows={6}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: 14,
            borderRadius: 12,
            border: "1px solid #d1d5db",
            fontSize: 16,
            lineHeight: 1.6,
            resize: "vertical",
          }}
        />

        <p
          style={{
            textAlign: "right",
            color: "#6b7280",
            fontSize: 13,
          }}
        >
          {prompt.length}/2000
        </p>

        <button
          onClick={generateImage}
          disabled={loading || !prompt.trim()}
          style={{
            width: "100%",
            border: "none",
            borderRadius: 12,
            padding: "16px 20px",
            background:
              loading || !prompt.trim() ? "#9ca3af" : "#dc2626",
            color: "#fff",
            fontWeight: 800,
            fontSize: 17,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "⏳ Ana samar da hoto..." : "✨ Samar da Hoto da AI"}
        </button>

        {error && (
          <div
            role="alert"
            style={{
              marginTop: 20,
              padding: 14,
              borderRadius: 10,
              background: "#fee2e2",
              color: "#991b1b",
              lineHeight: 1.6,
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <p
            style={{
              marginTop: 20,
              padding: 14,
              borderRadius: 10,
              background: "#dcfce7",
              color: "#166534",
            }}
          >
            ✅ {message}
          </p>
        )}

        {image && (
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 22 }}>Hoton da aka samar</h2>

            <img
              src={image}
              alt="Hoton AI mai tambarin Ibrahim Sani News"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
              }}
            />

            <button
              onClick={downloadImage}
              style={{
                width: "100%",
                marginTop: 16,
                padding: 15,
                border: "none",
                borderRadius: 12,
                background: "#166534",
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              ⬇️ Sauke Hoton
            </button>
          </section>
        )}

        <p
          style={{
            marginTop: 24,
            fontSize: 13,
            color: "#6b7280",
            lineHeight: 1.7,
          }}
        >
          Wannan kayan aikin yana samar da hotuna ne kawai.
          Ba ya wallafa labarai ko aika bayanai zuwa Make.com.
          Ka tabbatar hotunan da za ka yi amfani da su a labarai
          ba su yaudari masu karatu game da ainihin abin da ya faru ba.
        </p>
      </div>
    </main>
  );
}
