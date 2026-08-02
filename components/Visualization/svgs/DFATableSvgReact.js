import React from "react"

export default function DFATableVisualization({ problemData }) {
    if (!problemData || !problemData.rows) {
        return null;
    }

    const rows = problemData.rows;
    const lastRow = rows[rows.length - 1];

    return (
        <div style={{ padding: "20px" }}>
            <div style={{
                maxHeight: "400px",
                overflowY: "auto",
                overflowX: "auto",
                border: "1px solid #ccc"
            }}>
                <table style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    fontFamily: "monospace",
                    fontSize: "14px"
                }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f0f0f0", position: "sticky", top: 0 }}>
                            <th style={thStyle}>Step</th>
                            <th style={thStyle}>Symbol</th>
                            <th style={thStyle}>From State</th>
                            <th style={thStyle}>To State</th>
                            <th style={thStyle}>Accepting</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => {
                            const isCurrent = r === lastRow;
                            return (
                                <tr
                                    key={i}
                                    style={{
                                        backgroundColor: isCurrent
                                            ? (r.accepting ? "lightgreen" : "#fff3cd")
                                            : "white",
                                        fontWeight: isCurrent ? "bold" : "normal"
                                    }}
                                >
                                    <td style={tdStyle}>{r.step}</td>
                                    <td style={tdStyle}>{r.symbol}</td>
                                    <td style={tdStyle}>{r.fromState}</td>
                                    <td style={{
                                        ...tdStyle,
                                        outline: isCurrent ? "4px solid #f0ad00" : "none",
                                        outlineOffset: "-2px"
                                    }}>{r.toState}</td>
                                    <td style={tdStyle}>{r.accepting ? "✅" : "❌"}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const thStyle = {
    border: "1px solid #ccc",
    padding: "8px 16px",
    textAlign: "center",
    fontWeight: "bold"
};

const tdStyle = {
    border: "1px solid #ccc",
    padding: "8px 16px",
    textAlign: "center",
    fontSize: "14px"
}
