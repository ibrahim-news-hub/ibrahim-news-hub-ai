import Link from "next/link";
import { supabase } from "@/lib/supabase";
import NewsCard from "@/components/NewsCard";

export const dynamic = "force-dynamic";

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
  { name: "Najeriya", value: "Nigeria", icon: "🇳🇬" },
  { name: "Duniya", value: "World", icon: "🌍" },
  { name: "Siyasa", value: "Politics", icon: "🏛️" },
  { name: "Kasuwanci", value: "Business", icon: "💰" },
  { name: "Fasaha", value: "Technology", icon: "🤖" },
  { name: "Wasanni", value: "Sports", icon: "⚽" },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const hausa = params?.lang === "ha";

  const { data, error } = await supabase
    .from("news")
    .select(
      "id,title,content,source,category,image_url,created_at,published,views,is_breaking"
    )
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const news = (data || []) as News[];

  const featured = news[0];
  const latest = news.slice(1);

  const t = {
    brand: "Ibrahim News Hub AI",

    tagline: hausa
      ? "Gaskiya • Sauri • Sahihanci"
      : "Truth • Speed • Credibility",

    home: hausa ? "Gida" : "Home",

    allNews: hausa
      ? "Dukkan Labarai"
      : "All News",

    search: hausa
      ? "Nemo Labari"
      : "Search News",

    breaking: hausa
      ? "LABARI MAI ZAFI"
      : "BREAKING NEWS",

    featured: hausa
      ? "Babban Labari"
      : "Top Story",

    latest: hausa
      ? "Sabbin Labarai"
      : "Latest News",

    categories: hausa
      ? "Rukunin Labarai"
      : "Categories",

    noNews: hausa
      ? "Babu labarai a halin yanzu."
      : "No news available at the moment.",

    error: hausa
      ? "An samu matsala wajen ɗauko labarai."
      : "There was a problem loading the news.",
  };

  return (
    <main className="site-main">

      {/* =========================
          TOP HEADER
      ========================= */}
      <header
        style={{
          background: "#0b1220",
          color: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 3px 15px rgba(0,0,0,.18)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 15,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#fff",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 32 }}>📰</span>

            <span>
              <strong
                style={{
                  fontSize: 22,
                  display: "block",
                }}
              >
                {t.brand}
              </strong>

              <small style={{ color: "#cbd5e1" }}>
                {t.tagline}
              </small>
            </span>
          </Link>

          <nav
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link href="/" style={navStyle}>
              {t.home}
            </Link>

            <Link href="/news" style={navStyle}>
              {t.allNews}
            </Link>

            <Link href="/admin" style={navStyle}>
              ⚙️ Admin
            </Link>

            <Link
              href={hausa ? "/" : "/?lang=ha"}
              style={{
                ...navStyle,
                background: "#dc1e2b",
                borderRadius: 7,
              }}
            >
              {hausa ? "English" : "Hausa"}
            </Link>
          </nav>
        </div>
      </header>

      {/* =========================
          BREAKING NEWS BAR
      ========================= */}
      <div
        style={{
          background: "#dc1e2b",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            minHeight: 48,
            display: "flex",
            alignItems: "center",
            gap: 15,
            padding: "0 20px",
          }}
        >
          <strong
            style={{
              background: "#0b1220",
              padding: "8px 12px",
              borderRadius: 5,
              whiteSpace: "nowrap",
              fontSize: 13,
            }}
          >
            ⚡ {t.breaking}
          </strong>

          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: 700,
            }}
          >
            {featured?.title ||
              (hausa
                ? "Ku kasance tare da Ibrahim News Hub AI domin sabbin labarai."
                : "Stay with Ibrahim News Hub AI for the latest news.")}
          </div>
        </div>
      </div>

      {/* =========================
          SEARCH + CATEGORIES
      ========================= */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "22px 20px 10px",
        }}
      >
        <form
          action="/news"
          method="get"
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <input
            name="q"
            type="search"
            placeholder={t.search}
            style={{
              flex: 1,
              minWidth: 0,
              padding: "14px 16px",
              border: "1px solid var(--border)",
              borderRadius: 9,
              fontSize: 16,
              outline: "none",
              background: "var(--card)",
              color: "var(--foreground)",
            }}
          />

          <button
            type="submit"
            style={{
              border: 0,
              background: "#dc1e2b",
              color: "#fff",
              padding: "0 20px",
              borderRadius: 9,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            🔎
          </button>
        </form>

        <div
          style={{
            display: "flex",
            gap: 9,
            overflowX: "auto",
            paddingBottom: 8,
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.value}
              href={`/news?category=${encodeURIComponent(
                cat.value
              )}`}
              className="category-pill"
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "10px 20px 50px",
        }}
      >

        {/* SECTION TITLE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "12px 0 18px",
          }}
        >
          <h2
            className="section-title"
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 900,
            }}
          >
            🔥 {t.featured}
          </h2>

          <Link
            href="/news"
            className="section-link"
          >
            {t.allNews} →
          </Link>
        </div>

        {/* =========================
            FEATURED STORY
        ========================= */}
        {featured ? (
          <div
            style={{
              marginBottom: 35,
            }}
          >
            <NewsCard
              item={featured}
              lang={hausa ? "ha" : "en"}
              featured
            />
          </div>
        ) : (
          <div className="empty-state">
            {error ? t.error : t.noNews}
          </div>
        )}

        {/* =========================
            LATEST NEWS
        ========================= */}
        {latest.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2
                className="section-title"
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 900,
                }}
              >
                📰 {t.latest}
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 20,
              }}
            >
              {latest.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  lang={hausa ? "ha" : "en"}
                />
              ))}
            </div>
          </>
        )}

        {/* DATABASE ERROR */}
        {error && (
          <div
            style={{
              marginTop: 25,
              padding: 15,
              borderRadius: 10,
              background: "#fee2e2",
              color: "#991b1b",
              fontWeight: 700,
            }}
          >
            ⚠️ {t.error}
          </div>
        )}
      </section>

      {/* =========================
          FOOTER
      ========================= */}
      <footer
        style={{
          background: "#0b1220",
          color: "#fff",
          marginTop: 20,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "35px 20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 25,
              fontWeight: 900,
            }}
          >
            📰 Ibrahim News Hub AI
          </div>

          <p
            style={{
              color: "#cbd5e1",
              margin: "8px 0 20px",
            }}
          >
            {t.tagline}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 15,
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={footerLink}>
              {t.home}
            </Link>

            <Link href="/news" style={footerLink}>
              {t.allNews}
            </Link>

            <Link href="/admin" style={footerLink}>
              Admin
            </Link>
          </div>

          <p
            style={{
              color: "#94a3b8",
              fontSize: 13,
              marginTop: 25,
            }}
          >
            © {new Date().getFullYear()} Ibrahim News Hub AI.
            All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

const navStyle = {
  color: "#fff",
  textDecoration: "none",
  padding: "8px 10px",
  fontWeight: 700,
  fontSize: 14,
};

const footerLink = {
  color: "#cbd5e1",
  textDecoration: "none",
  fontWeight: 700,
};
