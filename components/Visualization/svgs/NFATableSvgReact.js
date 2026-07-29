import React from "react"

export default function NFATableVisualization({ problemData }) {
    if (!problemData || !problemData.rows) {
        return null;
    }

    return (
        <div style={{ padding: "20px" }}>
            <div style={{
                marginBottom: "10px",
                fontFamily: "monospace",
                fontSize: "14px"
            }}>
                <strong>Path {problemData.pathIndex + 1} of {problemData.pathCount}</strong>
                {" — "}
                <span style={{
                    color: problemData.accepted ? "green" : "#c62828",
                    fontWeight: "bold"
                }}>
                    {problemData.accepted ? "Accepted" : "Rejected"}
                </span>
            </div>
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
                        {problemData.rows.map((r, i) => {
                            const isLast = i === problemData.rows.length - 1;
                            return (
                                <tr
                                    key={i}
                                    style={{
                                        backgroundColor: isLast
                                            ? (problemData.accepted ? "lightgreen" : "#fff3cd")
                                            : (r.accepting ? "#e8f5e9" : "white"),
                                        fontWeight: isLast ? "bold" : "normal"
                                    }}
                                >
                                    <td style={tdStyle}>{r.step}</td>
                                    <td style={tdStyle}>{r.symbol}</td>
                                    <td style={tdStyle}>{r.fromState}</td>
                                    <td style={{
                                        ...tdStyle,
                                        outline: isLast ? "4px solid #f0ad00" : "none",
                                        outlineOffset: "-2px"
                                    }}>{r.toState}</td>
                                    <td style={tdStyle}>{r.accepting ? "✅" : ""}</td>
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
