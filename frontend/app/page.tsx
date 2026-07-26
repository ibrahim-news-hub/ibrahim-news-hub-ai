export default function Home() {
  const btn = {
    display: "block" as const,
    width: "100%",
    padding: "15px",
    marginBottom: "15px",
    fontSize: "18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  };

  return (
    <main
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1>🚀 Ibrahim News Hub AI</h1>

      <p>Professional AI News Dashboard</p>

      <div style={{ marginTop: "30px" }}>
        <button style={btn}>📰 Create News</button>
        <button style={btn}>✍️ AI Writer</button>
        <button style={btn}>🖼️ AI Images</button>
        <button style={btn}>📅 Facebook Auto Post</button>
        <button style={btn}>⚙️ Settings</button>
      </div>
    </main>
  );}
