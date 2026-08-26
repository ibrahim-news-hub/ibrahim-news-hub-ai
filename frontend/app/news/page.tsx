import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("id", { ascending: false });

  console.log("NEWS:", news);
  console.log("ERROR:", error);

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "42px",
          marginBottom: "10px",
        }}
      >
        📰 Duk Labarai
      </h1>

      <p
        style={{
          fontSize: "20px",
          color: "#6b7280",
          marginBottom: "25px",
        }}
      >
        Sabbin labarai daga Ibrahim News Hub AI
      </p>

      <div
        style={{
          height: "4px",
          background: "#2563eb",
          marginBottom: "35px",
        }}
      />

      {error && (
        <p style={{ color: "red" }}>
          An samu kuskure wajen karanta labarai.
        </p>
      )}

      {!news || news.length === 0 ? (
        <p>Babu wani labari da aka wallafa.</p>
      ) : (
        news.map((item) => (
          <article
            key={item.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "18px",
              marginBottom: "25px",
              overflow: "hidden",
              boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
              background: "#fff",
            }}
          >
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.title}
                style={{
                  width: "100%",
                  height: "260px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}

            <div style={{ padding: "25px" }}>
              <div
                style={{
                  display: "inline-block",
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  padding: "8px 14px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                  marginBottom: "15px",
                }}
              >
                📰 {item.category || "General"}
              </div>

              <h2
                style={{
                  fontSize: "30px",
                  lineHeight: "1.25",
                  marginBottom: "15px",
                }}
              >
                {item.title}
              </h2>

              <p
                style={{
                  fontSize: "18px",
                  lineHeight: "1.7",
                  color: "#4b5563",
                }}
              >
                {item.content
                  ? `${item.content.substring(0, 300)}...`
                  : "Babu bayanin labari."}
              </p>

              <Link
                href={`/news/${item.id}`}
                style={{
                  display: "inline-block",
                  marginTop: "15px",
                  background: "#2563eb",
                  color: "#fff",
                  padding: "14px 22px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "17px",
                }}
              >
                Karanta Cikakken Labari →
              </Link>
            </div>
          </article>
        ))
      )}
    </main>
  );
}
