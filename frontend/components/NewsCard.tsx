import Link from "next/link";

type NewsItem = {
  id: number | string;
  title: string;
  content?: string | null;
  source?: string | null;
  category?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  created_at?: string | null;
  views?: number | null;
  is_breaking?: boolean | null;
};

type NewsCardProps = {
  item: NewsItem;
  lang?: "ha" | "en";
  featured?: boolean;
};

function shortText(text: string, length = 150) {
  const clean = text?.replace(/\s+/g, " ").trim() || "";

  return clean.length > length
    ? clean.slice(0, length) + "..."
    : clean;
}

function formatDate(date?: string | null) {
  if (!date) return "";

  try {
    return new Date(date).toLocaleDateString("ha-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function formatViews(views?: number | null) {
  const value = Number(views || 0);

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toString();
}

function getSource(source?: string | null) {
  if (!source) return "IBRAHIM SANI NEWS";

  return source
    .replace(/^https?:\/\/[^/]+/i, "")
    .split(" — ")[0]
    .trim() || "IBRAHIM SANI NEWS";
}

export default function NewsCard({
  item,
  lang = "ha",
  featured = false,
}: NewsCardProps) {
  const breakingText =
    lang === "en" ? "BREAKING" : "DA ƊUMI-ƊUMI";

  const readMore =
    lang === "en" ? "Read more →" : "Karanta cikakken labari →";

  const sourceText = getSource(item.source);

  return (
    <Link
      href={`/news/${item.id}`}
      className={`news-card-link ${
        featured ? "news-card-featured" : ""
      }`}
    >
      <article className="news-card">
        {/* MEDIA */}
        <div className="news-card-media">
          {item.video_url ? (
            <video
              src={item.video_url}
              className="news-card-image"
              muted
              playsInline
              preload="metadata"
            />
          ) : item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="news-card-image"
              loading="lazy"
            />
          ) : (
            <div className="news-card-placeholder">
              <span>📰</span>
              <strong>IBRAHIM SANI NEWS</strong>
            </div>
          )}

          {/* VIDEO BADGE */}
          {item.video_url && (
            <span className="video-badge">
              ▶ VIDEO
            </span>
          )}

          {/* BREAKING BADGE */}
          {item.is_breaking && (
            <span className="breaking-badge">
              🔴 {breakingText}
            </span>
          )}

          {/* CATEGORY */}
          {item.category && (
            <span className="news-card-category">
              {item.category}
            </span>
          )}
        </div>

        {/* CONTENT */}
        <div className="news-card-body">
          <h3 className="news-card-title">
            {item.title}
          </h3>

          {item.content && (
            <p className="news-card-text">
              {shortText(
                item.content,
                featured ? 230 : 130
              )}
            </p>
          )}

          {/* META */}
          <div className="news-meta">
            <span title="Views">
              👁️ {formatViews(item.views)}
            </span>

            {item.created_at && (
              <span title="Date">
                📅 {formatDate(item.created_at)}
              </span>
            )}

            <span
              title="Source"
              className="news-source"
            >
              📰 {sourceText}
            </span>
          </div>

          {/* READ MORE */}
          <span className="news-read-more">
            {readMore}
          </span>
        </div>
      </article>
    </Link>
  );
}
