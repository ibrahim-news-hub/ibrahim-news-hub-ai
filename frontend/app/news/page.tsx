import { supabase } from "@/lib/supabase";
import Link from "next/link";
import NewsCard from "@/components/NewsCard";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

type News = {
  id: number | string;
  title: string;
  content: string;
  source?: string | null;
  category?: string | null;
  image_url?: string | null;
  created_at?: string | null;
  published?: boolean | null;
  views?: number | null;
  is_breaking?: boolean | null;
};

const categories = [
  { name: "Duka", value: "All", icon: "📰" },
  { name: "Najeriya", value: "Najeriya", icon: "🇳🇬" },
  { name: "Duniya", value: "Duniya", icon: "🌍" },
  { name: "Technology", value: "Technology", icon: "🤖" },
  { name: "Kasuwanci", value: "Kasuwanci", icon: "💰" },
  { name: "Wasanni", value: "Wasanni", icon: "⚽" },
  { name: "Viral", value: "Viral", icon: "🔥" },
  { name: "General", value: "General", icon: "📰" },
];

function categoryLabel(category?: string | null) {
  const item = categories.find((cat) => cat.value === category);

  return item
    ? `${item.icon} ${item.name}`
    : `📰 ${category || "General"}`;
}

export default async function NewsPage({ searchParams }: Props) {
  const params = await searchParams;

  const q = params.q?.trim() || "";
  const category = params.category || "All";

  let query = supabase
    .from("news")
    .select(
      "id,title,content,source,category,image_url,created_at,published,views,is_breaking"
    )
    .eq("published", true)
    .order("id", { ascending: false });

  if (category !== "All") {
    query = query.eq("category", category);
  }

  if (q) {
    const safeQuery = q.replace(/,/g, " ");

    query = query.or(
      `title.ilike.%${safeQuery}%,content.ilike.%${safeQuery}%`
    );
  }

  const { data: news, error } = await query;

  const articles = (news || []) as News[];

  const featured = articles[0];
  const remaining = articles.slice(1);

  return (
    <main className="site-main">
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "30px 18px 70px",
        }}
      >
        {/* HEADER */}
        <header style={{ marginBottom: 30 }}>
          <h1
            className="section-title"
            style={{
              fontSize: "clamp(32px, 7vw, 52px)",
              lineHeight: 1.1,
              margin: "0 0 8px",
              fontWeight: 900,
            }}
          >
            📰 Duk Labarai
          </h1>

          <p
            className="news-card-text"
            style={{
              fontSize: 18,
              margin: 0,
            }}
          >
            Sabbin labarai daga IBRAHIM SANI NEWS
          </p>

          <div
            style={{
              height: 5,
              background: "#e31b23",
              borderRadius: 10,
              marginTop: 18,
            }}
          />
        </header>

        {/* SEARCH */}
        <form
          method="GET"
          action="/news"
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 22,
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="🔎 Nemo labari..."
            style={{
              flex: "1 1 250px",
              minWidth: 0,
              padding: "15px 16px",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 17,
              boxSizing: "border-box",
              outline: "none",
              background: "var(--card)",
              color: "var(--foreground)",
            }}
          />

          {category !== "All" && (
            <input
              type="hidden"
              name="category"
              value={category}
            />
          )}

          <button
            type="submit"
            style={{
              padding: "14px 22px",
              border: "none",
              borderRadius: 12,
              background: "#111827",
              color: "#fff",
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🔎 Bincika
          </button>
        </form>

        {/* CATEGORIES */}
        <div
          style={{
            display: "flex",
            gap: 9,
            overflowX: "auto",
            paddingBottom: 12,
            marginBottom: 30,
          }}
        >
          {categories.map((cat) => {
            const active = category === cat.value;

            const href =
              cat.value === "All"
                ? q
                  ? `/news?q=${encodeURIComponent(q)}`
                  : "/news"
                : q
                  ? `/news?category=${encodeURIComponent(
                      cat.value
                    )}&q=${encodeURIComponent(q)}`
                  : `/news?category=${encodeURIComponent(
                      cat.value
                    )}`;

            return (
              <Link
                key={cat.value}
                href={href}
                className={
                  active
                    ? "category-pill category-pill-active"
                    : "category-pill"
                }
              >
                {cat.icon} {cat.name}
              </Link>
            );
          })}
        </div>

        {/* RESULT INFO */}
        <div
          className="news-card-text"
          style={{
            marginBottom: 22,
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          {q
            ? `🔎 Sakamakon bincike: "${q}"`
            : category !== "All"
              ? `📂 ${categoryLabel(category)}`
              : "📰 Sabbin labarai"}

          {" • "}

          {articles.length} labari
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              padding: 18,
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: 14,
              marginBottom: 25,
              fontWeight: 600,
            }}
          >
            ⚠️ An samu kuskure wajen karanta labarai.
          </div>
        )}

        {/* EMPTY */}
        {articles.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 55 }}>🔎</div>

            <h2
              className="section-title"
              style={{
                fontSize: 28,
                margin: "15px 0 8px",
              }}
            >
              Ba a samu labari ba
            </h2>

            <p
              className="news-card-text"
              style={{
                fontSize: 17,
              }}
            >
              Gwada wani suna, kalma ko category.
            </p>

            <Link
              href="/news"
              style={{
                display: "inline-block",
                marginTop: 15,
                padding: "12px 18px",
                background: "#e31b23",
                color: "#fff",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              ← Duba Duk Labarai
            </Link>
          </div>
        ) : (
          <>
            {/* FEATURED STORY */}
            {featured && (
              <section style={{ marginBottom: 40 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 15,
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      height: 35,
                      background: "#e31b23",
                      borderRadius: 5,
                    }}
                  />

                  <h2
                    className="section-title"
                    style={{
                      margin: 0,
                      fontSize: 30,
                    }}
                  >
                    ⭐ Top Story
                  </h2>
                </div>

                <NewsCard
                  item={featured}
                  lang="ha"
                  featured
                />
              </section>
            )}

            {/* MORE STORIES */}
            {remaining.length > 0 && (
              <section>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      height: 32,
                      background: "#e31b23",
                      borderRadius: 5,
                    }}
                  />

                  <h2
                    className="section-title"
                    style={{
                      margin: 0,
                      fontSize: 28,
                    }}
                  >
                    📰 Ƙarin Labarai
                  </h2>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 24,
                  }}
                >
                  {remaining.map((item) => (
                    <NewsCard
                      key={item.id}
                      item={item}
                      lang="ha"
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
