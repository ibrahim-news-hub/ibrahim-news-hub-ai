"use client";

type Props = {
  title: string;
};

export default function ShareButton({ title }: Props) {
  async function shareNews() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: title,
          url,
        });
      } catch {}
      return;
    }

    copyLink();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("An kwafi link din labarin. ✅");
    } catch {
      alert("An kasa kwafin link.");
    }
  }

  function whatsapp() {
    const text = `${title}\n${window.location.href}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  function facebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        window.location.href
      )}`,
      "_blank"
    );
  }

  function xShare() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
  }

  function telegram() {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(
        window.location.href
      )}&text=${encodeURIComponent(title)}`,
      "_blank"
    );
  }

  return (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
      }}
    >
      <h3
        style={{
          margin: "0 0 15px",
          fontSize: "20px",
          fontWeight: "900",
        }}
      >
        📤 Raba Wannan Labari
      </h3>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <button onClick={shareNews} style={buttonStyle("#111827")}>
          📤 Share
        </button>

        <button onClick={whatsapp} style={buttonStyle("#16a34a")}>
          WhatsApp
        </button>

        <button onClick={facebook} style={buttonStyle("#1877f2")}>
          Facebook
        </button>

        <button onClick={xShare} style={buttonStyle("#000")}>
          𝕏
        </button>

        <button onClick={telegram} style={buttonStyle("#229ed9")}>
          Telegram
        </button>

        <button
          onClick={copyLink}
          style={{
            border: "1px solid #d1d5db",
            background: "#fff",
            color: "#111827",
            padding: "12px 16px",
            borderRadius: "8px",
            fontWeight: "800",
            cursor: "pointer",
          }}
        >
          🔗 Copy Link
        </button>
      </div>
    </div>
  );
}

function buttonStyle(background: string) {
  return {
    border: "none",
    background,
    color: "#fff",
    padding: "12px 16px",
    borderRadius: "8px",
    fontWeight: "800",
    cursor: "pointer",
  };
}
