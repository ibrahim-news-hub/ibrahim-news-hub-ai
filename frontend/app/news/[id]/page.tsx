export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NewsArticlePage({ params }: Props) {
  const { id } = await params;

  const { data: article, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !article) {
    notFound();
  }

  const content = article.content || "Ba a samu cikakken bayanin wannan labarin ba.";

  return (
    <main
      style={{
        maxWidth: "850px",
        margin: "0 auto",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Back */}
      <Link
        href="/news"
        style={{
          textDecoration: "none",
          color: "#2563eb",
          fontWeight: "bold",
        }}
      >
        ← Komawa Duk Labarai
      </Link>

      <article
        style={{
          marginTop: "30px",
          padding: "25px",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          background: "#ffffff",
          boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
        }}
      >
        {/* Category */}
        <div
          style={{
            display: "inline-block",
            padding: "6px 12px",
            background: "#dbeafe",
            color: "#1d4ed8",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "bold",
            marginBottom: "15px",
          }}
        >
          📰 LABARAI
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "clamp(28px, 6vw, 42px)",
            lineHeight: "1.25",
            margin: "5px 0 25px",
            color: "#111827",
          }}
        >
          {article.title}
        </h1>

        {/* Content */}
        <div
          style={{
            fontSize: "19px",
            lineHeight: "1.9",
            color: "#374151",
            whiteSpace: "pre-wrap",
          }}
        >
          {content.replace(/\*\*/g, "").trim()}
        </div>

        {/* Source */}
        {article.source && (
          <div
            style={{
              marginTop: "35px",
              padding: "15px",
              background: "#f3f4f6",
              borderRadius: "10px",
              color: "#4b5563",
            }}
          >
            <strong>Source / Bayanan Asali:</strong>
            <p style={{ marginBottom: 0 }}>
              {article.source}
            </p>
          </div>
        )}

        {/* Back button */}
        <div style={{ marginTop: "30px" }}>
          <Link
            href="/news"
            style={{
              display: "inline-block",
              padding: "12px 18px",
              background: "#2563eb",
              color: "#ffffff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            ← Duk Labarai
          </Link>
        </div>
      </article>
    </main>
  );
}
