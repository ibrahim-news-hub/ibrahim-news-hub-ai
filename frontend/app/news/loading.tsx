export default function Loading() {
  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "30px 18px 70px",
      }}
    >
      <div
        className="skeleton"
        style={{
          width: "45%",
          height: 45,
          borderRadius: 10,
          marginBottom: 15,
        }}
      />

      <div
        className="skeleton"
        style={{
          width: "70%",
          height: 20,
          borderRadius: 6,
          marginBottom: 30,
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="news-card">
            <div
              className="skeleton"
              style={{
                height: 220,
              }}
            />

            <div style={{ padding: 21 }}>
              <div
                className="skeleton"
                style={{
                  width: "30%",
                  height: 14,
                  borderRadius: 5,
                  marginBottom: 14,
                }}
              />

              <div
                className="skeleton"
                style={{
                  width: "95%",
                  height: 24,
                  borderRadius: 5,
                  marginBottom: 12,
                }}
              />

              <div
                className="skeleton"
                style={{
                  width: "80%",
                  height: 16,
                  borderRadius: 5,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
