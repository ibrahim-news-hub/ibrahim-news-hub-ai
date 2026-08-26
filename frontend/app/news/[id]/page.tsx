import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

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

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <Link
        href="/news"
        style={{
          display: "inline-block",
          marginBottom: "30px",
          color: "#2563eb",
          fontSize: "20px",
          fontWeight: "bold",
          textDecoration: "none",
        }}
      >
        ← Komawa Duk Labarai
      </Link>

      <article
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "18px",
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {article.image_url && (
          <img
            src={article.image_url}
            alt={article.title}
            style={{
              width: "100%",
              height: "360px",
              objectFit: "cover",
              display: "block",
            }}
          />
        )}

        <div style={{ padding: "30px" }}>
          <div
            style={{
              display: "inline-block",
              background: "#dbeafe",
              color: "#1d4ed8",
              padding: "9px 16px",
              borderRadius: "20px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            📰 {article.category || "General"}
          </div>

          <h1
            style={{
              fontSize: "42px",
              lineHeight: "1.2",
              marginBottom: "25px",
            }}
          >
            {article.title}
          </h1>

          <div
            style={{
              fontSize: "20px",
              lineHeight: "1.9",
              color: "#374151",
              whiteSpace: "pre-wrap",
            }}
          >
            {article.content}
          </div>

          {article.source && (
            <div
              style={{
                marginTop: "35px",
                padding: "20px",
                background: "#f3f4f6",
                borderRadius: "14px",
              }}
            >
              <strong>Source / Bayanan Asali:</strong>

              <p
                style={{
                  marginTop: "10px",
                  lineHeight: "1.7",
                }}
              >
                {article.source}
              </p>
            </div>
          )}

          <Link
            href="/news"
            style={{
              display: "inline-block",
              marginTop: "30px",
              background: "#2563eb",
              color: "#fff",
              padding: "14px 22px",
              borderRadius: "10px",
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
