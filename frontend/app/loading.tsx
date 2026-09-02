export default function Loading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        padding: "30px 20px 60px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div
          className="skeleton"
          style={{
            height: 42,
            width: "45%",
            borderRadius: 10,
            marginBottom: 25,
          }}
        />

        <div
          className="skeleton"
          style={{
            height: 300,
            borderRadius: 18,
            marginBottom: 30,
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="news-card"
              style={{ padding: 0 }}
            >
              <div
                className="skeleton"
                style={{
                  height: 190,
                }}
              />

              <div style={{ padding: 18 }}>
                <div
                  className="skeleton"
                  style={{
                    height: 14,
                    width: "35%",
                    borderRadius: 5,
                    marginBottom: 14,
                  }}
                />

                <div
                  className="skeleton"
                  style={{
                    height: 22,
                    width: "90%",
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                />

                <div
                  className="skeleton"
                  style={{
                    height: 15,
                    width: "75%",
                    borderRadius: 5,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
