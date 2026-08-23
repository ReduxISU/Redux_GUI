import React from "react";
import { getColorByKey } from "../constants/VisColorsArray";

export default function DynamicTableSvgReact({problemData})
{
    if(!problemData || !problemData.rows || !problemData.columns)
        return null;

    const {title, columns, rows} = problemData;

    return (
        <div style={{padding: "20px"}}>
            {title && (
                <div style={{
                    marginBottom: "10px",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    fontWeight: "bold"
                }}>
                    {title}
                </div>
            )}
            {/* Capped height with a sticky header: traces (a DFA run, a long Dijkstra table)
                can be far taller than the visualization pane, and scrolling one out of view
                loses the column labels that make the rows readable. */}
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
                        <tr style={{backgroundColor: "#f0f0f0", position: "sticky", top: 0}}>
                            {columns.map(col => (
                                <th key={col.key} style={thStyle}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr
                                key={row.id ?? rowIndex}
                                style={{
                                    backgroundColor: row.color ? getColorByKey(row.color) : "white",
                                    fontWeight: row.color ? "bold" : "normal"
                                }}
                            >
                                {columns.map(col => {
                                    const cellColor = row.cellColors?.[col.key];
                                    return (
                                        <td
                                            key={col.key}
                                            style={{
                                                ...tdStyle,
                                                backgroundColor: cellColor ? getColorByKey(cellColor) : "inherit"
                                            }}
                                        >
                                            {row.cells?.[col.key] ?? "-"}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
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
    textAlign: "center"
};
