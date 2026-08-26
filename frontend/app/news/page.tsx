export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function NewsPage() {
  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .order("id", { ascending: false });

  console.log("NEWS:", news);
  console.log("ERROR:", error);

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "30px",
          borderBottom: "2px solid #2563eb",
          paddingBottom: "15px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            margin: 0,
            color: "#111827",
          }}
        >
          📰 Duk Labarai
        </h1>

        <p
          style={{
            color: "#6b7280",
            marginTop: "8px",
          }}
        >
          Sabbin labarai daga Ibrahim News Hub AI
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "15px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          An samu matsala wajen karanta labarai daga database.
        </div>
      )}

      {/* Empty */}
      {!error && (!news || news.length === 0) && (
        <div
          style={{
            padding: "30px",
            textAlign: "center",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
          }}
        >
          <h2>📭 Babu labarai tukuna</h2>
          <p>Ka je Create News domin ƙirƙirar sabon labari.</p>

          <Link
            href="/create-news"
            style={{
              display: "inline-block",
              marginTop: "10px",
              padding: "12px 20px",
              background: "#2563eb",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            ➕ Create News
          </Link>
        </div>
      )}

      {/* News List */}
      <div>
        {news?.map((item) => {
          const cleanContent = (item.content || "")
            .replace(/\*\*/g, "")
            .trim();

          const preview =
            cleanContent.length > 250
              ? cleanContent.substring(0, 250) + "..."
              : cleanContent;

          return (
            <article
              key={item.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "20px",
                marginBottom: "20px",
                background: "#ffffff",
                boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
              }}
            >
              {/* Category */}
              <div
                style={{
                  display: "inline-block",
                  padding: "5px 10px",
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                📰 LABARAI
              </div>

              {/* Title */}
              <h2
                style={{
                  fontSize: "23px",
                  lineHeight: "1.4",
                  margin: "5px 0 12px",
                  color: "#111827",
                }}
              >
                {item.title}
              </h2>

              {/* Preview */}
              <p
                style={{
                  color: "#4b5563",
                  lineHeight: "1.8",
                  marginBottom: "18px",
                }}
              >
                {preview}
              </p>

              {/* Read More */}
              <Link
                href={`/news/${item.id}`}
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  background: "#2563eb",
                  color: "#ffffff",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Karanta Cikakken Labari →
              </Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
