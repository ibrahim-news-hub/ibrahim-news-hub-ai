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

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <Link href="/news">← Komawa Duk Labarai</Link>

      <article style={{ marginTop: "30px" }}>
        <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>
          {article.title}
        </h1>

        <div
          style={{
            fontSize: "18px",
            lineHeight: "1.8",
            whiteSpace: "pre-wrap",
          }}
        >
          {article.content}
        </div>

        {article.source && (
          <div style={{ marginTop: "30px" }}>
            <strong>Source:</strong>
            <p>{article.source}</p>
          </div>
        )}
      </article>
    </main>
  );
}
