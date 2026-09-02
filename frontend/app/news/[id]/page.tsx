import ShareButton from "./ShareButton";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export const dynamic = "force-dynamic";

export default async function NewsArticlePage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const query = await searchParams;

  const isHausa = query.lang === "ha";

  // GET ARTICLE
  const { data: article, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !article) {
    notFound();
  }

  // INCREMENT VIEW COUNT
  const { error: viewError } = await supabase.rpc(
    "increment_news_views",
    {
      news_id: Number(id),
    }
  );

  if (!viewError) {
    article.views = Number(article.views || 0) + 1;
  }

  const text = {
    back: isHausa
      ? "← Komawa Duk Labarai"
      : "← Back to All News",

    breaking: isHausa
      ? "DA ƊUMI-ƊUMI"
      : "BREAKING NEWS",

    source: isHausa
      ? "Bayanan Asali"
      : "Source",

    home: isHausa
      ? "Gida"
      : "Home",

    allNews: isHausa
      ? "Duk Labarai"
      : "All News",

    language: isHausa
      ? "🇬🇧 English"
      : "🇳🇬 Hausa",

    views: isHausa
      ? "Karatu"
      : "Views",

    video: isHausa
      ? "VIDEO"
      : "VIDEO",
  };

  const formattedViews = Number(
    article.views || 0
  ).toLocaleString("en-US");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f6f8",
        color: "#111827",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: "1250px",
            margin: "0 auto",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "#111827",
            }}
          >
            <div
              style={{
                fontSize: "26px",
                fontWeight: "900",
              }}
            >
              📰 IBRAHIM SANI NEWS
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              Truth • Speed • Accuracy
            </div>
          </Link>

          <Link
            href={
              isHausa
                ? `/news/${id}?lang=en`
                : `/news/${id}?lang=ha`
            }
            style={{
              border: "1px solid #d1d5db",
              padding: "9px 13px",
              borderRadius: "7px",
              textDecoration: "none",
              color: "#111827",
              fontWeight: "800",
              background: "#fff",
            }}
          >
            {text.language}
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav
          style={{
            borderTop: "1px solid #f0f0f0",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              maxWidth: "1250px",
              margin: "0 auto",
              padding: "12px 20px",
              display: "flex",
              gap: "25px",
              whiteSpace: "nowrap",
              fontWeight: "800",
            }}
          >
            <Link
              href={
                isHausa
                  ? "/?lang=ha"
                  : "/"
              }
              style={navStyle}
            >
              🏠 {text.home}
            </Link>

            <Link
              href={
                isHausa
                  ? "/news?lang=ha"
                  : "/news"
              }
              style={navStyle}
            >
              📰 {text.allNews}
            </Link>
          </div>
        </nav>
      </header>

      {/* BREAKING BAR */}
      <div
        style={{
          background: "#d71920",
          color: "#fff",
        }}
      >
        <div
          style={{
            maxWidth: "1250px",
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontWeight: "900",
          }}
        >
          <span
            style={{
              background: "#fff",
              color: "#d71920",
              padding: "6px 10px",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            🔴 {text.breaking}
          </span>

          <span style={{ fontSize: "14px" }}>
            IBRAHIM SANI NEWS
          </span>
        </div>
      </div>

      {/* ARTICLE */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "30px 20px 60px",
        }}
      >
        <Link
          href={
            isHausa
              ? "/news?lang=ha"
              : "/news"
          }
          style={{
            display: "inline-block",
            marginBottom: "22px",
            color: "#d71920",
            textDecoration: "none",
            fontWeight: "900",
            fontSize: "16px",
          }}
        >
          {text.back}
        </Link>

        <article
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          {/* VIDEO */}
          {article.video_url && (
            <div
              style={{
                position: "relative",
                background: "#000",
              }}
            >
              <video
                src={article.video_url}
                controls
                playsInline
                preload="metadata"
                style={{
                  width: "100%",
                  maxHeight: "560px",
                  display: "block",
                  background: "#000",
                }}
              />

              <span
                style={{
                  position: "absolute",
                  top: "15px",
                  left: "15px",
                  background: "#d71920",
                  color: "#fff",
                  padding: "7px 11px",
                  borderRadius: "5px",
                  fontSize: "12px",
                  fontWeight: "900",
                }}
              >
                ▶ {text.video}
              </span>
            </div>
          )}

          {/* IMAGE */}
          {!article.video_url &&
            article.image_url && (
              <img
                src={article.image_url}
                alt={article.title}
                style={{
                  width: "100%",
                  height:
                    "clamp(240px, 50vw, 520px)",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}

          <div
            style={{
              padding:
                "clamp(22px, 5vw, 42px)",
            }}
          >
            {/* CATEGORY */}
            <div
              style={{
                display: "inline-block",
                background: "#fee2e2",
                color: "#b91c1c",
                padding: "7px 12px",
                borderRadius: "5px",
                fontSize: "13px",
                fontWeight: "900",
                marginBottom: "16px",
              }}
            >
              📰 {article.category || "General"}
            </div>

            {/* BREAKING BADGE */}
            {article.is_breaking && (
              <div
                style={{
                  display: "inline-block",
                  marginLeft: "8px",
                  background: "#d71920",
                  color: "#fff",
                  padding: "7px 12px",
                  borderRadius: "5px",
                  fontSize: "13px",
                  fontWeight: "900",
                  marginBottom: "16px",
                }}
              >
                🔴 {text.breaking}
              </div>
            )}

            {/* TITLE */}
            <h1
              style={{
                fontSize:
                  "clamp(30px, 5vw, 52px)",
                lineHeight: "1.12",
                margin: "0 0 18px",
                fontWeight: "900",
                letterSpacing: "-1px",
              }}
            >
              {article.title}
            </h1>

            {/* ARTICLE META */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px 18px",
                marginBottom: "28px",
                paddingBottom: "18px",
                borderBottom:
                  "1px solid #e5e7eb",
                color: "#6b7280",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              <span>
                👁️ {formattedViews}{" "}
                {text.views}
              </span>

              {article.created_at && (
                <span>
                  📅{" "}
                  {new Date(
                    article.created_at
                  ).toLocaleDateString(
                    "ha-NG",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </span>
              )}

              {article.source && (
                <span>
                  📰 {article.source}
                </span>
              )}
            </div>

            {/* CONTENT */}
            <div
              style={{
                fontSize: "19px",
                lineHeight: "1.9",
                color: "#374151",
                whiteSpace: "pre-wrap",
              }}
            >
              {article.content}
            </div>

            {/* SOURCE */}
            {article.source && (
              <div
                style={{
                  marginTop: "38px",
                  padding: "20px",
                  background: "#f3f4f6",
                  borderLeft:
                    "5px solid #d71920",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontWeight: "900",
                    marginBottom: "8px",
                  }}
                >
                  📌 {text.source}
                </div>

                <div
                  style={{
                    color: "#4b5563",
                    lineHeight: "1.7",
                    wordBreak: "break-word",
                  }}
                >
                  {article.source}
                </div>
              </div>
            )}

            {/* BACK BUTTON */}
            <Link
              href={
                isHausa
                  ? "/news?lang=ha"
                  : "/news"
              }
              style={{
                display: "inline-block",
                marginTop: "32px",
                background: "#d71920",
                color: "#fff",
                padding: "13px 20px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "900",
              }}
            >
              {text.back}
            </Link>
          </div>

          {/* SHARE */}
          <ShareButton title={article.title} />
        </article>
      </div>

      {/* FOOTER */}
      <footer
        style={{
          background: "#111827",
          color: "#fff",
          padding: "35px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "21px",
            fontWeight: "900",
          }}
        >
          📰 IBRAHIM SANI NEWS
        </div>

        <p
          style={{
            color: "#d1d5db",
            margin: "8px 0",
          }}
        >
          Gaskiya • Sauri • Sahihanci
        </p>

        <p
          style={{
            color: "#9ca3af",
            fontSize: "13px",
            margin: 0,
          }}
        >
          © {new Date().getFullYear()}{" "}
          IBRAHIM SANI NEWS
        </p>
      </footer>
    </main>
  );
}

const navStyle = {
  color: "#111827",
  textDecoration: "none",
};
