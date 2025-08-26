import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: "40px" }}>
        <img src="/images/logo.svg" alt="Daffodil" width="200" height="125" />
      </div>

      <div style={{ marginBottom: "60px" }}>
        <h1
          style={{
            fontSize: "120px",
            fontWeight: "200",
            margin: "0",
            color: "var(--color-primary)",
            fontFamily: "var(--font-santa-catarina)",
            lineHeight: "1",
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            margin: "20px 0",
            color: "#333",
            fontFamily: "var(--font-rothek)",
          }}
        >
          Page Not Found
        </h2>
        <p
          style={{
            fontSize: "16px",
            color: "#666",
            margin: "0",
            fontFamily: "var(--font-rothek)",
            maxWidth: "400px",
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              color: "var(--color-primary)",
              fontSize: "16px",
              fontFamily: "var(--font-rothek)",
              fontWeight: "bold",
              padding: "12px 24px",
              border: "2px solid var(--color-primary)",
              borderRadius: "4px",
              display: "inline-block",
            }}
          >
            Go Home
          </span>
        </Link>
        <Link href="/shop" style={{ textDecoration: "none" }}>
          <span
            style={{
              color: "#333",
              fontSize: "16px",
              fontFamily: "var(--font-rothek)",
              fontWeight: "bold",
              padding: "12px 24px",
              border: "2px solid #333",
              borderRadius: "4px",
              display: "inline-block",
            }}
          >
            Browse Shop
          </span>
        </Link>
      </div>
    </div>
  );
}
