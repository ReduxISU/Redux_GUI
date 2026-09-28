import React from "react";

export default function PumpSchedulingSvgReact({ problemData }) {
  if (!problemData) return null;

  const { action, metrics, state } = problemData;
  const pumps = state?.pumps ?? [];
  const fillRatio = Math.min(1, Math.max(0, metrics?.tankFillRatio ?? 0));
  const fillPct = Math.round(fillRatio * 100);

  const peakColor = metrics?.isPeakHour ? "#e53935" : "#43a047";
  const peakLabel = metrics?.isPeakHour ? "Peak" : "Off-Peak";

  return (
    <div style={{ fontFamily: "monospace", padding: "16px", maxWidth: "640px", margin: "0 auto" }}>
      {/* Hour / tariff badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <span
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            background: "#1565c0",
            color: "#fff",
            borderRadius: "8px",
            padding: "4px 16px",
          }}
        >
          Hour {metrics?.hour ?? "—"}
        </span>
        <span
          style={{
            fontSize: "1rem",
            fontWeight: "bold",
            background: peakColor,
            color: "#fff",
            borderRadius: "8px",
            padding: "4px 12px",
          }}
        >
          {peakLabel}
        </span>
      </div>

      {/* Action description */}
      {action && (
        <div
          style={{
            marginBottom: "16px",
            padding: "8px 12px",
            background: "#f5f5f5",
            borderLeft: "4px solid #1565c0",
            borderRadius: "4px",
            fontSize: "0.85rem",
          }}
        >
          {action}
        </div>
      )}

      {/* Pump states */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Pump States</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {pumps.map((pump) => (
            <div
              key={pump.name}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                background: pump.isOn ? "#1b5e20" : "#424242",
                color: "#fff",
                minWidth: "100px",
                textAlign: "center",
              }}
            >
              <div style={{ fontWeight: "bold" }}>{pump.name}</div>
              <div style={{ fontSize: "0.8rem" }}>{pump.isOn ? "ON" : "OFF"}</div>
              {pump.isOn && (
                <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>
                  {pump.flowGph} gph · {pump.powerKw} kW
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tank level bar */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
          Tank Level — {metrics?.tankLevel?.toLocaleString() ?? "—"} /{" "}
          {metrics?.tankCapacity?.toLocaleString() ?? "—"} gal ({fillPct}%)
        </div>
        <div
          style={{
            width: "100%",
            height: "28px",
            background: "#e0e0e0",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${fillPct}%`,
              height: "100%",
              background: fillRatio < 0.2 ? "#e53935" : fillRatio > 0.9 ? "#e65100" : "#1565c0",
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      {/* Flow / demand */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
        <Metric label="Flow In" value={`${metrics?.flowIn ?? 0} gph`} />
        <Metric label="Demand" value={`${metrics?.demand ?? 0} gph`} />
        <Metric
          label="Net"
          value={`${((metrics?.flowIn ?? 0) - (metrics?.demand ?? 0)).toFixed(1)} gph`}
        />
      </div>

      {/* Cost */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <Metric label="Hour Cost" value={`$${metrics?.stepCost?.toFixed(4) ?? "—"}`} />
        <Metric
          label="Cumulative Cost"
          value={`$${metrics?.cumulativeCost?.toFixed(4) ?? "—"}`}
          accent
        />
      </div>
    </div>
  );
}

function Metric({ label, value, accent }) {
  return (
    <div
      style={{
        flex: "1",
        minWidth: "120px",
        padding: "10px 14px",
        background: accent ? "#e8f5e9" : "#f5f5f5",
        border: accent ? "1px solid #a5d6a7" : "1px solid #e0e0e0",
        borderRadius: "8px",
      }}
    >
      <div style={{ fontSize: "0.75rem", color: "#757575" }}>{label}</div>
      <div style={{ fontWeight: "bold", fontSize: "1rem" }}>{value}</div>
    </div>
  );
}
