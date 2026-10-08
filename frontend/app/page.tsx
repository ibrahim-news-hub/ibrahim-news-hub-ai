import Link from "next/link";
import { supabase } from "@/lib/supabase";
import NewsCard from "@/components/NewsCard";
import LanguageSelector from "@/components/LanguageSelector";
import { getTranslations } from "@/lib/translations";

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

type Language = [string, string];
const languages: Language[] = [
  ["ha", "Hausa 🇳🇬"],
  ["en", "English 🇬🇧"],
  ["ar", "العربية 🇸🇦"],
  ["kr", "Kanuri 🇳🇬"],
  ["yo", "Yorùbá 🇳🇬"],
  ["ig", "Igbo 🇳🇬"],
  ["fr", "Français 🇫🇷"],
  ["es", "Español 🇪🇸"],
  ["pt", "Português 🇵🇹"],
  ["pt-br", "Português do Brasil 🇧🇷"],
  ["sw", "Kiswahili 🇹🇿"],
  ["mnk", "Mandinka"],
  ["ff", "Fulfulde"],
  ["ro", "Română 🇷🇴"],
  ["ru", "Русский 🇷🇺"],
  ["uk", "Українська 🇺🇦"],
  ["vi", "Tiếng Việt 🇻🇳"],
  ["km", "ភាសាខ្មែរ"],
  ["zh", "简体中文 🇨🇳"],
  ["zh-tw", "繁體中文 🇹🇼"],
  ["hy", "Հայերեն"],
  ["fa", "فارسی"],
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const lang = params?.lang || "ha";
  const hausa = lang === "ha";
  const t = getTranslations(lang);

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
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 15,
            flexWrap: "wrap",
          }}
        >
          {/* LOGO */}
          <Link
            href={`/?lang=${encodeURIComponent(lang)}`}
            style={{
              color: "#fff",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src="/ibrahim-sani-news-logo.png"
              alt="IBRAHIM SANI NEWS"
              style={{
                width: 120,
                height: 78,
                objectFit: "contain",
                display: "block",
              }}
            />
          </Link>

          {/* NAVIGATION */}
          <nav
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link href={`/?lang=${encodeURIComponent(lang)}`} style={navStyle}>
              {t.home}
            </Link>

            <Link href={`/news?lang=${encodeURIComponent(lang)}`} style={navStyle}>
              {t.allNews}
            </Link>

            <Link href={`/admin?lang=${encodeURIComponent(lang)}`} style={navStyle}>
              ⚙️ {t.admin}
            </Link>

            {/* LANGUAGE SELECTOR */}
            <LanguageSelector
              languages={languages}
              currentLang={lang}
              label={t.language}
            />
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
                ? "Ku kasance tare da IBRAHIM SANI NEWS domin sabbin labarai."
                : "Stay with IBRAHIM SANI NEWS for the latest news.")}
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
              href={`/news?category=${encodeURIComponent(cat.value)}&lang=${encodeURIComponent(lang)}`}
              className="category-pill"
            >
              {cat.icon} {t.categories[cat.value as keyof typeof t.categories]}
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

          <Link href={`/news?lang=${encodeURIComponent(lang)}`} className="section-link">
            {t.allNews} →
          </Link>
        </div>

        {/* FEATURED STORY */}
        {featured ? (
          <div style={{ marginBottom: 35 }}>
            <NewsCard
              item={featured}
              lang={lang}
              featured
            />
          </div>
        ) : (
          <div className="empty-state">
            {error ? t.error : t.noNews}
          </div>
        )}

        {/* LATEST NEWS */}
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
                  lang={lang}
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
            📰 IBRAHIM SANI NEWS
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
            <Link href={`/?lang=${encodeURIComponent(lang)}`} style={footerLink}>
              {t.home}
            </Link>

            <Link href={`/news?lang=${encodeURIComponent(lang)}`} style={footerLink}>
              {t.allNews}
            </Link>

            <Link href={`/admin?lang=${encodeURIComponent(lang)}`} style={footerLink}>
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
            © {new Date().getFullYear()} IBRAHIM SANI NEWS. All rights
            reserved.
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
