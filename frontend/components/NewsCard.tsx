"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  lang?: string;
  featured?: boolean;
};

const languageNames: Record<string, string> = {
  ha: "Hausa",
  en: "English",
  yo: "Yorùbá",
  ig: "Igbo",
  kr: "Kanuri",
  ar: "Arabic",
  fr: "French",
  es: "Spanish",
  pt: "Portuguese",
  "pt-br": "Brazilian Portuguese",
  sw: "Kiswahili",
  mnk: "Mandinka",
  ff: "Fulfulde",
  ro: "Romanian",
  ru: "Russian",
  uk: "Ukrainian",
  vi: "Vietnamese",
  km: "Khmer",
  zh: "Simplified Chinese",
  "zh-tw": "Traditional Chinese",
  hy: "Armenian",
  fa: "Persian",
};

function shortText(text: string, length = 150) {
  const clean = text?.replace(/\s+/g, " ").trim() || "";

  return clean.length > length
    ? clean.slice(0, length) + "..."
    : clean;
}

function formatDate(date?: string | null, lang = "ha") {
  if (!date) return "";

  try {
    const locales: Record<string, string> = {
      ha: "ha-NG",
      en: "en-US",
      yo: "yo-NG",
      ig: "ig-NG",
      ar: "ar-SA",
      fr: "fr-FR",
      es: "es-ES",
      pt: "pt-PT",
      "pt-br": "pt-BR",
      sw: "sw-TZ",
      ru: "ru-RU",
      uk: "uk-UA",
      vi: "vi-VN",
      zh: "zh-CN",
      "zh-tw": "zh-TW",
      fa: "fa-IR",
      ro: "ro-RO",
      hy: "hy-AM",
    };

    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";

    const months: Record<string, string[]> = {
      ha: ["Jan", "Fab", "Mar", "Afr", "May", "Yun", "Yul", "Agu", "Sat", "Okt", "Nuw", "Dis"],
      en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    };

    const monthList = months[lang] || months.en;
    return `${d.getUTCDate()} ${monthList[d.getUTCMonth()]}, ${d.getUTCFullYear()}`;
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

  return (
    source
      .replace(/^https?:\/\/[^/]+/i, "")
      .split(" — ")[0]
      .trim() || "IBRAHIM SANI NEWS"
  );
}

export default function NewsCard({
  item,
  lang = "ha",
  featured = false,
}: NewsCardProps) {
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content || "");
  const [translating, setTranslating] = useState(false);

  const languageName = languageNames[lang] || "English";

  useEffect(() => {
    let cancelled = false;

    async function translateNews() {
      if (lang === "ha" || lang === "en") {
        setTitle(item.title);
        setContent(item.content || "");
        return;
      }

      setTranslating(true);

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: languageName,
            title: item.title,
            content: item.content || "",
          }),
        });

        const data = await response.json();

        if (!cancelled && data.success) {
          setTitle(data.title || item.title);
          setContent(data.content || item.content || "");
        }
      } catch (error) {
        console.error("Translation error:", error);
      } finally {
        if (!cancelled) {
          setTranslating(false);
        }
      }
    }

    translateNews();

    return () => {
      cancelled = true;
    };
  }, [lang, item.title, item.content, languageName]);

  const breakingText =
    lang === "en"
      ? "BREAKING"
      : lang === "ha"
        ? "DA ƊUMI-ƊUMI"
        : "BREAKING";

  const readMore =
    lang === "en"
      ? "Read more →"
      : lang === "ha"
        ? "Karanta cikakken labari →"
        : "Read more →";

  const sourceText = getSource(item.source);

  return (
    <Link
      href={`/news/${item.id}?lang=${encodeURIComponent(lang)}`}
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
              alt={title}
              className="news-card-image"
              loading="lazy"
            />
          ) : (
            <div className="news-card-placeholder">
              <span>📰</span>
              <strong>IBRAHIM SANI NEWS</strong>
            </div>
          )}

          {/* VIDEO */}
          {item.video_url && (
            <span className="video-badge">
              ▶ VIDEO
            </span>
          )}

          {/* BREAKING */}
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
            {translating ? "..." : title}
          </h3>

          {content && (
            <p className="news-card-text">
              {translating
                ? "..."
                : shortText(
                    content,
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
                📅 {formatDate(item.created_at, lang)}
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
