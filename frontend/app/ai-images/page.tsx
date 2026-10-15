"use client";

import { useEffect, useState } from "react";

export default function AIImagesPage() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [styleIndex, setStyleIndex] = useState(0);

  const ISN_STYLE_CYCLE_V1 = [
    {
      name: "Professional News",
      prompt:
        "Create a polished professional international newsroom photograph. Use realistic lighting, a clear subject, balanced composition, natural colors, strong editorial quality, and an original ISN visual identity.",
    },
    {
      name: "Cinematic News",
      prompt:
        "Create a cinematic editorial news visual with dramatic but realistic lighting, atmospheric depth, strong composition, and a serious newsroom mood. Keep events believable and avoid sensationalism.",
    },
    {
      name: "Documentary Realism",
      prompt:
        "Create a realistic documentary-style news photograph with natural lighting, authentic environments, believable people, observational framing, and a credible photojournalistic appearance.",
    },
    {
      name: "News Infographic",
      prompt:
        "Create a clean modern editorial news infographic with a clear visual hierarchy, restrained colors, readable composition, and space for verified information. Never invent statistics, labels, or quotations.",
    },
    {
      name: "Political Editorial",
      prompt:
        "Create a balanced political news editorial visual with professional composition, realistic settings, neutral presentation, and no misleading portrayal of real people or events.",
    },
    {
      name: "Modern Digital News",
      prompt:
        "Create a contemporary digital newsroom visual with refined editorial design, crisp details, thoughtful framing, modern visual storytelling, and professional international news aesthetics.",
    },
  ];

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function chooseImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setError("");
    setMessage("");
    setImage("");

    if (!file) return;

    const isImage =
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|webp|gif|avif|bmp|tiff?)$/i.test(file.name);

    if (!isImage) {
      setError("Da fatan zaɓi fayil ɗin hoto ne kawai.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Hoton ya wuce 10MB. Zaɓi hoto mai ƙaramin girma.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function uploadImage() {
    if (!selectedFile) {
      setError("Da farko, danna Zaɓi Hoto ka zaɓi hoto daga wayarka.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setImage("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/ai-images", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "An kasa sarrafa hoton.");
      }

      setImage(data.image);
      setMessage(data.message || "An sarrafa hoton cikin nasara.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An samu matsalar sadarwa. Ka sake gwadawa."
      );
    } finally {
      setLoading(false);
    }
  }

  async function generateImage() {
    if (!prompt.trim()) {
      setError("Ka rubuta bayanin hoton da kake so kafin ka ci gaba.");
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
          prompt:
            `${prompt.trim()}\n\n` +
            `ISN VISUAL STYLE: ${ISN_STYLE_CYCLE_V1[styleIndex].name}. ` +
            `${ISN_STYLE_CYCLE_V1[styleIndex].prompt}\n\n` +
            "Branding: original Ibrahim Sani News (ISN) identity, " +
            "professional international newsroom quality, deep green, " +
            "white, black and subtle gold where appropriate. " +
            "Do not copy another broadcaster's logo or exact graphic layout. " +
            "Do not invent facts, captions, statistics, or events.",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "An kasa samar da hoton AI.");
      }

      setImage(data.image);
      setMessage(
        `${data.message || "An samar da hoton cikin nasara."} ` +
        `Salon da aka yi amfani da shi: ${ISN_STYLE_CYCLE_V1[styleIndex].name}.`
      );
      setStyleIndex((current) => (current + 1) % ISN_STYLE_CYCLE_V1.length);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An samu matsalar sadarwa. Ka sake gwadawa."
      );
    } finally {
      setLoading(false);
    }
  }

  function downloadImage() {
    if (!image) return;

    const link = document.createElement("a");
    link.href = image;
    link.download = `ISN-Image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 54,
    border: "none",
    borderRadius: 13,
    padding: "14px 18px",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: 16,
    cursor: loading ? "wait" : "pointer",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f6f2",
        color: "#17251c",
        fontFamily: "Arial, Helvetica, sans-serif",
        paddingBottom: 36,
      }}
    >
      <header
        style={{
          background: "linear-gradient(135deg, #073d2b, #116442)",
          color: "#ffffff",
          padding: "24px 18px 30px",
          borderRadius: "0 0 26px 26px",
          boxShadow: "0 8px 24px rgba(7,61,43,0.18)",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <a
            href="/admin"
            style={{
              display: "inline-block",
              color: "#e2f3e8",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 14,
              padding: "8px 0",
            }}
          >
            ← Komawa Admin
          </a>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 22,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                flexShrink: 0,
                borderRadius: 17,
                background: "#ffffff",
                color: "#0b5a39",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 25,
                fontWeight: 900,
                border: "2px solid #d9b75b",
              }}
            >
              ISN
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 5px",
                  color: "#e7cf85",
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: 2,
                }}
              >
                IBRAHIM SANI NEWS
              </p>
              <h1
                style={{
                  fontSize: 29,
                  lineHeight: 1.2,
                  margin: 0,
                  fontWeight: 900,
                }}
              >
                AI Studio
              </h1>
            </div>
          </div>

          <p
            style={{
              color: "#e1eee6",
              lineHeight: 1.7,
              fontSize: 15,
              margin: "18px 0 0",
            }}
          >
            Ɗora hotonka, saka tambarin ISN, ko ƙirƙiri sabon hoto ta AI.
            An tsara shi domin wayarka.
          </p>
        </div>
      </header>

      <div
        style={{
          maxWidth: 760,
          margin: "22px auto 0",
          padding: "0 14px",
          boxSizing: "border-box",
        }}
      >
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e0e8df",
            borderRadius: 19,
            padding: "20px 17px",
            marginBottom: 18,
            boxShadow: "0 5px 18px rgba(20,55,35,0.05)",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: "#e5f4e9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 23,
                flexShrink: 0,
              }}
            >
              🖼️
            </div>
            <div>
              <h2 style={{ fontSize: 20, margin: 0, fontWeight: 900 }}>
                Saka Tambarin ISN
              </h2>
              <p
                style={{
                  color: "#6b786e",
                  margin: "5px 0 0",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                Zaɓi hoto daga wayarka
              </p>
            </div>
          </div>

          <label
            htmlFor="isn-image-file"
            style={{
              display: "block",
              marginTop: 20,
              padding: "22px 12px",
              border: "2px dashed #8eb69a",
              borderRadius: 15,
              background: "#f5faf5",
              textAlign: "center",
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 35,
                marginBottom: 8,
              }}
            >
              📤
            </span>
            <span
              style={{
                display: "block",
                fontSize: 16,
                fontWeight: 800,
                color: "#155b38",
              }}
            >
              {selectedFile ? "An zaɓi hoto ✓" : "Danna nan domin zaɓar hoto"}
            </span>
            <span
              style={{
                display: "block",
                fontSize: 12,
                color: "#68776b",
                marginTop: 8,
                lineHeight: 1.6,
              }}
            >
              JPG, PNG ko WEBP · Iyakar girma 10MB
            </span>
            <input
              id="isn-image-file"
              type="file"
              accept="image/*"
              onChange={chooseImage}
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                opacity: 0,
                overflow: "hidden",
              }}
            />
          </label>

          {selectedFile && (
            <div
              style={{
                background: "#edf7ef",
                padding: 12,
                borderRadius: 10,
                marginTop: 12,
                fontSize: 13,
                overflowWrap: "anywhere",
                color: "#155b38",
              }}
            >
              <strong>Hoton da aka zaɓa:</strong>
              <br />
              {selectedFile.name}
            </div>
          )}

          {preview && (
            <div style={{ marginTop: 16 }}>
              <img
                src={preview}
                alt="Hoton da aka zaɓa"
                style={{
                  display: "block",
                  width: "100%",
                  maxHeight: 380,
                  objectFit: "contain",
                  background: "#f1f3f1",
                  borderRadius: 13,
                  border: "1px solid #e0e8df",
                }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={uploadImage}
            disabled={loading}
            style={{
              ...buttonStyle,
              marginTop: 17,
              background: loading ? "#82978a" : "#11643f",
            }}
          >
            {loading ? "⏳ Ana sarrafa hoton..." : "🟢 Saka Tambarin ISN"}
          </button>

          <p
            style={{
              color: "#78847a",
              fontSize: 12,
              lineHeight: 1.6,
              margin: "12px 0 0",
            }}
          >
            Za a ƙara tambarin ISN a hoton da ka zaɓa.
          </p>
        </section>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "23px 0",
            color: "#738176",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          <div style={{ height: 1, flex: 1, background: "#d9e2d8" }} />
          KO KA ƘIRƘIRI SABON HOTO
          <div style={{ height: 1, flex: 1, background: "#d9e2d8" }} />
        </div>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e0e8df",
            borderRadius: 19,
            padding: "20px 17px",
            marginBottom: 18,
            boxShadow: "0 5px 18px rgba(20,55,35,0.05)",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: "#fff3d9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 23,
                flexShrink: 0,
              }}
            >
              ✨
            </div>
            <div>
              <h2 style={{ fontSize: 20, margin: 0, fontWeight: 900 }}>
                Samar da Hoto ta AI
              </h2>
              <p
                style={{
                  color: "#6b786e",
                  margin: "5px 0 0",
                  fontSize: 13,
                }}
              >
                Bayyana irin hoton da kake buƙata
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              padding: 15,
              borderRadius: 14,
              border: "1px solid #d9e6d9",
              background: "#f2f8f2",
            }}
          >
            <div
              style={{
                color: "#155b38",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1,
              }}
            >
              ISN STYLE CYCLE
            </div>
            <div
              style={{
                marginTop: 7,
                fontSize: 19,
                fontWeight: 900,
                color: "#17251c",
              }}
            >
              {ISN_STYLE_CYCLE_V1[styleIndex].name}
            </div>
            <p
              style={{
                margin: "7px 0 0",
                color: "#68776b",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              Za a yi amfani da wannan salo wajen samar da hoto na gaba.
              Bayan nasara, tsarin zai koma salo na gaba cikin jerin salo shida.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 8,
                marginTop: 14,
              }}
            >
              {ISN_STYLE_CYCLE_V1.map((style, index) => (
                <button
                  key={style.name}
                  type="button"
                  onClick={() => setStyleIndex(index)}
                  disabled={loading}
                  aria-pressed={styleIndex === index}
                  style={{
                    padding: "11px 8px",
                    borderRadius: 10,
                    border: styleIndex === index
                      ? "2px solid #11643f"
                      : "1px solid #d4dfd4",
                    background: styleIndex === index ? "#dff2e4" : "#ffffff",
                    color: "#17251c",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: loading ? "wait" : "pointer",
                    minHeight: 44,
                  }}
                >
                  {styleIndex === index ? "✓ " : ""}
                  {style.name}
                </button>
              ))}
            </div>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 12,
                color: "#68776b",
                lineHeight: 1.6,
              }}
            >
              Zaɓi salon da kake so. Bayan samar da hoto cikin nasara,
              tsarin zai matsa zuwa salon da ke biye.
            </p>
          </div>

          <label
            htmlFor="image-prompt"
            style={{
              display: "block",
              fontWeight: 800,
              marginTop: 20,
              marginBottom: 9,
              fontSize: 14,
            }}
          >
            Bayanin hoton
          </label>

          <textarea
            id="image-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Misali: Hoton kasuwar Zaria, masu saye da sayarwa, hasken safe, salo na ƙwararrun hotunan labarai..."
            maxLength={2000}
            rows={5}
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: 14,
              borderRadius: 13,
              border: "1px solid #d4dfd4",
              background: "#fcfdfb",
              color: "#17251c",
              fontSize: 15,
              lineHeight: 1.7,
              resize: "vertical",
              outlineColor: "#11643f",
            }}
          />

          <div
            style={{
              textAlign: "right",
              fontSize: 12,
              color: "#78847a",
              marginTop: 7,
            }}
          >
            {prompt.length}/2000
          </div>

          <button
            type="button"
            onClick={generateImage}
            disabled={loading}
            style={{
              ...buttonStyle,
              marginTop: 12,
              background: loading ? "#a79b7d" : "#9a701b",
            }}
          >
            {loading ? "⏳ Ana aiki..." : "✨ Samar da Hoto da AI"}
          </button>
          <p
            style={{
              color: "#78847a",
              fontSize: 12,
              lineHeight: 1.6,
              margin: "12px 0 0",
            }}
          >
            Samar da sabon hoto ta AI na buƙatar ingantaccen API key da
            damar amfani da sabis ɗin.
          </p>
        </section>

        {error && (
          <div
            role="alert"
            style={{
              background: "#fff0f0",
              border: "1px solid #f0baba",
              color: "#9d2222",
              padding: 15,
              borderRadius: 13,
              marginBottom: 16,
              lineHeight: 1.7,
              overflowWrap: "anywhere",
            }}
          >
            <strong>⚠️ Akwai matsala</strong>
            <div style={{ marginTop: 5 }}>{error}</div>
          </div>
        )}

        {message && (
          <div
            role="status"
            style={{
              background: "#eaf7ed",
              border: "1px solid #b8dfc0",
              color: "#155b38",
              padding: 15,
              borderRadius: 13,
              marginBottom: 16,
              lineHeight: 1.7,
            }}
          >
            ✅ {message}
          </div>
        )}

        {image && (
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #dce8dc",
              borderRadius: 19,
              padding: 17,
              boxShadow: "0 5px 18px rgba(20,55,35,0.06)",
            }}
          >
            <h2 style={{ margin: "0 0 14px", fontSize: 21 }}>
              🎉 Ga Hotonka!
            </h2>
            <img
              src={image}
              alt="Hoton da aka sarrafa domin Ibrahim Sani News"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                borderRadius: 13,
                border: "1px solid #e0e8df",
              }}
            />
            <button
              type="button"
              onClick={downloadImage}
              style={{
                ...buttonStyle,
                marginTop: 15,
                background: "#155b38",
              }}
            >
              ⬇️ Sauke Hoton zuwa Wayarka
            </button>
          </section>
        )}

        <footer
          style={{
            textAlign: "center",
            color: "#7a877d",
            fontSize: 12,
            lineHeight: 1.8,
            padding: "25px 10px 0",
          }}
        >
          <strong style={{ color: "#155b38" }}>IBRAHIM SANI NEWS</strong>
          <br />
          ISN AI Studio · Ƙirƙira cikin ƙwarewa
          <br />
          Kayan aikin hotuna ne kawai; ba ya wallafa labarai kai tsaye.
        </footer>
      </div>
    </main>
  );
}
