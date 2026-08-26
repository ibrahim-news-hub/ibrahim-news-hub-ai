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
    <main style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <h1>📰 Duk Labarai</h1>

      {news?.length === 0 && (
        <p>Babu wani labari a cikin database.</p>
      )}

      {news?.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          <h2>{item.title}</h2>

          <p>{item.content.substring(0, 200)}...</p>

          <Link href={`/news/${item.id}`}>
            Karanta Cikakken Labari →
          </Link>
        </div>
      ))}
    </main>
  );
}
