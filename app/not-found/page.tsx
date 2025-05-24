"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f7efda" }}>
      <h1 style={{ fontSize: "3rem", fontWeight: "bold", color: "#e11d48", marginBottom: "1rem" }}>404 - Page Not Found</h1>
      <p style={{ fontSize: "1.2rem", color: "#333", marginBottom: "2rem" }}>The page you are looking for does not exist or has been moved.</p>
      <Link href="/" style={{ color: "#2563eb", fontWeight: "bold", fontSize: "1.1rem", textDecoration: "underline" }}>
        Back to Home
      </Link>
    </div>
  );
}
