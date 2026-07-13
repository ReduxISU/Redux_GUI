import React from "react"

function reconstructFullPath(vertexName, vertices) {
    const prevMap = Object.fromEntries(vertices.map(v => [v.name, v.path]));
    const path = [];
    let current = vertexName;
    while (current != null) {
        path.unshift(current);
        current = prevMap[current];
    }
    return path.join(" \u2192 ");
}

export default function SSSPTableVisualization({problemData}) {
    if(!problemData || !problemData.vertices) {
        return null;
    }

    return (
        <div style={{padding: "20px", overflowX: "auto"}}>
            <table style={{
                borderCollapse: "collapse",
                width: "100%",
                fontFamily: "monospace",
                fontSize: "14px"
            }}>
                <thead>
                    <tr style={{backgroundColor: "#f0f0f0"}}>
                        <th style={thStyle}>Vertex</th>
                        <th style={thStyle}>Known</th>
                        <th style={thStyle}>Cost</th>
                        <th style={thStyle}>Path</th>
                        <th style={thStyle}>Full Path</th>
                    </tr>
                </thead>
                <tbody>
                    {problemData.vertices.map(v => (
                        <tr
                            key={v.name}
                            style={{
                                backgroundColor: v.name === problemData.currentVertex
                                    ? "#fff3cd" : "white",
                                fontWeight: v.name === problemData.currentVertex
                                    ? "bold" : "normal"
                            }}
                        >
                            <td style={{
                                ...tdStyle,
                                outline: v.name === problemData.currentVertex
                                    ? "4px solid #f0ad00" : "none",
                                outlineOffset: "-2px"
                            }}>
                                {v.name}
                            </td>
                            <td style={tdStyle}>{v.known ? "\u2705" : "\u274C"}</td>
                            <td style={tdStyle}>{v.cost}</td>
                            <td style={tdStyle}>{v.path ?? "-"}</td>
                            <td style={{
                                ...tdStyle,
                                backgroundColor: problemData.targetVertex &&
                                                 v.name === problemData.targetVertex &&
                                                 v.known
                                    ? "lightgreen"
                                    : "inherit",
                                outline: problemData.targetVertex &&
                                                 v.name === problemData.targetVertex &&
                                                 v.known
                                    ? "4px solid green"
                                    : "none",
                                outlineOffset: "-2px",
                                fontWeight: problemData.targetVertex &&
                                                 v.name === problemData.targetVertex &&
                                                 v.known
                                    ? "bold" : "normal"
                            }}>{reconstructFullPath(v.name, problemData.vertices)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
    fontSize: "14px",
    border: "1px solid #ccc"
}