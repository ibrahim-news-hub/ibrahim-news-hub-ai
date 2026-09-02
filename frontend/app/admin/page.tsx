"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type NewsItem = {
  id: number;
  title: string;
  category: string | null;
  published: boolean;
  image_url: string | null;
  video_url: string | null;
  content: string | null;
  views: number | null;
  is_breaking: boolean | null;
};

const categories = [
  "Nigeria",
  "World",
  "Technology",
  "Business",
  "Sports",
  "General",
];

export default function AdminPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("General");
  const [editImage, setEditImage] = useState("");
  const [editVideo, setEditVideo] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadNews() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("news")
      .select(
        "id,title,category,published,image_url,video_url,content,views,is_breaking"
      )
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setMessage(`An samu kuskure: ${error.message}`);
    } else {
      setNews(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadNews();
  }, []);

  function startEdit(item: NewsItem) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditContent(item.content || "");
    setEditCategory(item.category || "General");
    setEditImage(item.image_url || "");
    setEditVideo(item.video_url || "");
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditCategory("General");
    setEditImage("");
    setEditVideo("");
  }

  async function saveEdit() {
    if (!editingId) return;

    if (!editTitle.trim()) {
      setMessage("⚠️ Ka saka taken labarin.");
      return;
    }

    if (!editContent.trim()) {
      setMessage("⚠️ Ka saka bayanin labarin.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("news")
      .update({
        title: editTitle.trim(),
        content: editContent.trim(),
        category: editCategory,
        image_url: editImage.trim() || null,
        video_url: editVideo.trim() || null,
      })
      .eq("id", editingId);

    setSaving(false);

    if (error) {
      console.error(error);
      setMessage(`❌ An kasa sabunta labari: ${error.message}`);
      return;
    }

    setMessage("✅ An gyara labarin cikin nasara.");
    cancelEdit();
    loadNews();
  }

  async function togglePublished(
    id: number,
    currentStatus: boolean
  ) {
    const { error } = await supabase
      .from("news")
      .update({
        published: !currentStatus,
      })
      .eq("id", id);

    if (error) {
      setMessage(`❌ An kasa canza matsayin labari: ${error.message}`);
      return;
    }

    setMessage("✅ An sabunta matsayin labari.");
    loadNews();
  }

  async function toggleBreaking(
    id: number,
    currentStatus: boolean | null
  ) {
    const { error } = await supabase
      .from("news")
      .update({
        is_breaking: !currentStatus,
      })
      .eq("id", id);

    if (error) {
      setMessage(`❌ An kasa canza Breaking: ${error.message}`);
      return;
    }

    setMessage("✅ An sabunta Breaking status.");
    loadNews();
  }

  async function deleteNews(id: number) {
    const confirmed = window.confirm(
      "Kana tabbatar kana son share wannan labarin?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(`❌ An kasa share labari: ${error.message}`);
      return;
    }

    setMessage("🗑️ An share labari cikin nasara.");
    loadNews();
  }

  function formatViews(value: number | null) {
    const views = Number(value || 0);

    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }

    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }

    return views.toLocaleString();
  }

  const filteredNews = news.filter((item) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      item.title.toLowerCase().includes(query) ||
      (item.category || "").toLowerCase().includes(query)
    );
  });

  const totalViews = news.reduce(
    (total, item) => total + Number(item.views || 0),
    0
  );

  const publishedCount = news.filter(
    (item) => item.published
  ).length;

  const breakingCount = news.filter(
    (item) => item.is_breaking
  ).length;

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "36px",
            }}
          >
            🔐 Admin Dashboard
          </h1>

          <p
            style={{
              color: "#6b7280",
              fontSize: "17px",
              marginBottom: 0,
            }}
          >
            Ibrahim News Hub AI
          </p>
        </div>

        <Link
          href="/create-news"
          style={{
            background: "#dc2626",
            color: "#fff",
            padding: "13px 18px",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ✍️ Create News
        </Link>
      </div>

      {/* NAVIGATION */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <Link
          href="/"
          style={{
            padding: "10px 15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#111827",
            background: "#fff",
          }}
        >
          🏠 Home
        </Link>

        <Link
          href="/news"
          style={{
            padding: "10px 15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#111827",
            background: "#fff",
          }}
        >
          📰 All News
        </Link>

        <Link
          href="/create-news"
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#fff",
            background: "#dc2626",
            fontWeight: "bold",
          }}
        >
          ✍️ Create News
        </Link>

        <Link
          href="/ai-writer"
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#fff",
            background: "#7c3aed",
            fontWeight: "bold",
          }}
        >
          🤖 AI Writer
        </Link>

        <Link
          href="/ai-images"
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#fff",
            background: "#2563eb",
            fontWeight: "bold",
          }}
        >
          🖼️ AI Images
        </Link>

        <Link
          href="/facebook-auto-post"
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#fff",
            background: "#1877f2",
            fontWeight: "bold",
          }}
        >
          📘 Facebook Auto Post
        </Link>

        <Link
          href="/settings"
          style={{
            padding: "10px 15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#111827",
            background: "#fff",
          }}
        >
          ⚙️ Settings
        </Link>

        <button
          onClick={loadNews}
          style={{
            padding: "10px 15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            padding: "20px",
            background: "#111827",
            color: "#fff",
            borderRadius: "12px",
          }}
        >
          <div>📰 Jimillar Labarai</div>
          <strong style={{ fontSize: "28px" }}>
            {news.length}
          </strong>
        </div>

        <div
          style={{
            padding: "20px",
            background: "#15803d",
            color: "#fff",
            borderRadius: "12px",
          }}
        >
          <div>🟢 Published</div>
          <strong style={{ fontSize: "28px" }}>
            {publishedCount}
          </strong>
        </div>

        <div
          style={{
            padding: "20px",
            background: "#dc2626",
            color: "#fff",
            borderRadius: "12px",
          }}
        >
          <div>🔴 Breaking</div>
          <strong style={{ fontSize: "28px" }}>
            {breakingCount}
          </strong>
        </div>

        <div
          style={{
            padding: "20px",
            background: "#2563eb",
            color: "#fff",
            borderRadius: "12px",
          }}
        >
          <div>👁️ Jimillar Views</div>
          <strong style={{ fontSize: "28px" }}>
            {formatViews(totalViews)}
          </strong>
        </div>
      </div>

      {/* SEARCH */}
      <div style={{ marginBottom: "25px" }}>
        <input
          type="search"
          placeholder="🔎 Nemo labari..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            border: "1px solid #d1d5db",
            borderRadius: "10px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* MESSAGE */}
      {message && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            background: "#f3f4f6",
            borderRadius: "10px",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <p
          style={{
            fontSize: "18px",
            textAlign: "center",
          }}
        >
          ⏳ Ana ɗauko labarai...
        </p>
      )}

      {/* EMPTY */}
      {!loading && filteredNews.length === 0 && (
        <div
          style={{
            padding: "30px",
            textAlign: "center",
            border: "1px solid #ddd",
            borderRadius: "12px",
          }}
        >
          <h2>Babu labarai</h2>

          <p>
            {search
              ? "Ba a samu labarin da ya dace da binciken ba."
              : "Har yanzu babu labarin da aka ƙirƙira."}
          </p>
        </div>
      )}

      {/* NEWS LIST */}
      {!loading &&
        filteredNews.map((item) => (
          <article
            key={item.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              marginBottom: "20px",
              padding: "20px",
              background: "#fff",
              boxShadow:
                "0 3px 12px rgba(0,0,0,0.05)",
            }}
          >
            {/* EDIT FORM */}
            {editingId === item.id ? (
              <div>
                <h2 style={{ marginTop: 0 }}>
                  ✏️ Gyara Labari
                </h2>

                <label>
                  <strong>Title</strong>
                </label>

                <input
                  value={editTitle}
                  onChange={(e) =>
                    setEditTitle(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "7px",
                    marginBottom: "15px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    fontSize: "17px",
                  }}
                />

                <label>
                  <strong>Category</strong>
                </label>

                <select
                  value={editCategory}
                  onChange={(e) =>
                    setEditCategory(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "7px",
                    marginBottom: "15px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>

                <label>
                  <strong>Article</strong>
                </label>

                <textarea
                  value={editContent}
                  onChange={(e) =>
                    setEditContent(e.target.value)
                  }
                  rows={12}
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "7px",
                    marginBottom: "15px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    fontSize: "16px",
                    lineHeight: 1.6,
                    resize: "vertical",
                  }}
                />

                <label>
                  <strong>Image URL</strong>
                </label>

                <input
                  value={editImage}
                  onChange={(e) =>
                    setEditImage(e.target.value)
                  }
                  placeholder="https://..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "7px",
                    marginBottom: "15px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />

                <label>
                  <strong>Video URL</strong>
                </label>

                <input
                  value={editVideo}
                  onChange={(e) =>
                    setEditVideo(e.target.value)
                  }
                  placeholder="https://..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "7px",
                    marginBottom: "20px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    style={{
                      background: "#16a34a",
                      color: "#fff",
                      border: "none",
                      padding: "12px 18px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: saving
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {saving
                      ? "⏳ Ana Saving..."
                      : "💾 Save Changes"}
                  </button>

                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    style={{
                      background: "#6b7280",
                      color: "#fff",
                      border: "none",
                      padding: "12px 18px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* IMAGE */}
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      style={{
                        width: "180px",
                        height: "110px",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "180px",
                        height: "110px",
                        borderRadius: "10px",
                        background: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "35px",
                      }}
                    >
                      📰
                    </div>
                  )}

                  {/* CONTENT */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: "250px",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        padding: "6px 10px",
                        borderRadius: "15px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        marginBottom: "10px",
                      }}
                    >
                      {item.category || "General"}
                    </div>

                    {item.is_breaking && (
                      <div
                        style={{
                          display: "inline-block",
                          background: "#fee2e2",
                          color: "#b91c1c",
                          padding: "6px 10px",
                          borderRadius: "15px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          marginLeft: "8px",
                        }}
                      >
                        🔴 BREAKING
                      </div>
                    )}

                    <h2
                      style={{
                        margin: "8px 0 10px",
                        fontSize: "23px",
                      }}
                    >
                      {item.title}
                    </h2>

                    <p
                      style={{
                        color: item.published
                          ? "#15803d"
                          : "#b45309",
                        fontWeight: "bold",
                        marginBottom: "8px",
                      }}
                    >
                      {item.published
                        ? "🟢 Published"
                        : "🟠 Draft / Hidden"}
                    </p>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                      }}
                    >
                      👁️ {formatViews(item.views)} Views
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "20px",
                  }}
                >
                  <button
                    onClick={() => startEdit(item)}
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() =>
                      togglePublished(
                        item.id,
                        item.published
                      )
                    }
                    style={{
                      background: item.published
                        ? "#f59e0b"
                        : "#16a34a",
                      color: "#fff",
                      border: "none",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {item.published
                      ? "🙈 Unpublish"
                      : "📢 Publish"}
                  </button>

                  <button
                    onClick={() =>
                      toggleBreaking(
                        item.id,
                        item.is_breaking
                      )
                    }
                    style={{
                      background: item.is_breaking
                        ? "#7f1d1d"
                        : "#dc2626",
                      color: "#fff",
                      border: "none",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {item.is_breaking
                      ? "⚪ Remove Breaking"
                      : "🔴 Make Breaking"}
                  </button>

                  <button
                    onClick={() =>
                      deleteNews(item.id)
                    }
                    style={{
                      background: "#dc2626",
                      color: "#fff",
                      border: "none",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
    </main>
  );
}
