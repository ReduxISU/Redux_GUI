import React from "react";

export default function ContributorCard({ name, role, contributions, github, image }) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #7c3aed",
        borderRadius: "12px",
        padding: "16px",
        color: "#e5e7eb",
        maxWidth: "320px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img
          src={image}
          alt={name}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "2px solid #7c3aed",
          }}
        />
        <div>
          <h3 style={{ margin: 0 }}>{name}</h3>
          <p style={{ color: "#a78bfa", margin: 0 }}>{role}</p>
        </div>
      </div>

      <div style={{ marginTop: "12px" }}>
        <strong>Contributions:</strong>
        <ul>
          {contributions.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      <a
        href={github}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#c4b5fd", textDecoration: "none" }}
      >
        View GitHub Profile ↗
      </a>
    </div>
  );
}
