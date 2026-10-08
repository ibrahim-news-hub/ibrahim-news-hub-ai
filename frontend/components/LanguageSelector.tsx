"use client";

import { useState } from "react";

type Language = readonly [string, string];

export default function LanguageSelector({
  languages,
  currentLang,
  label,
}: {
  languages: readonly Language[];
  currentLang: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  function selectLanguage(code: string) {
    setOpen(false);
    window.location.href = `/?lang=${encodeURIComponent(code)}`;
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        style={{
          border: 0,
          cursor: "pointer",
          background: "#dc1e2b",
          color: "#fff",
          padding: "10px 14px",
          borderRadius: 7,
          fontWeight: 700,
          whiteSpace: "nowrap",
          fontSize: 14,
        }}
      >
        🌐 {label} ▾
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 90,
            }}
          />

          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              width: 320,
              maxWidth: "90vw",
              maxHeight: 420,
              overflowY: "auto",
              background: "#fff",
              color: "#111827",
              borderRadius: 10,
              padding: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,.25)",
              zIndex: 100,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 4,
            }}
          >
            {languages.map(([code, name]) => (
              <button
                key={code}
                type="button"
                onClick={() => selectLanguage(code)}
                style={{
                  border: 0,
                  background:
                    code === currentLang ? "#f3f4f6" : "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "#111827",
                  padding: "10px 8px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: code === currentLang ? 800 : 500,
                  direction:
                    code === "ar" || code === "fa" ? "rtl" : "ltr",
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
