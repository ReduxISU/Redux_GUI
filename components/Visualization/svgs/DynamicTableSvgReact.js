import React from "react";
import { getColorByKey } from "../constants/VisColorsArray";

export default function DynamicTableSvgReact({problemData})
{
    if(!problemData || !problemData.rows || !problemData.columns)
        return null;

    const {columns, rows} = problemData;

    return (
        <div style={{padding: "20px", overflowX: "auto"}}>
            <table style={{
                borderCollapse: "collapse",
                width: "100%",
                fontFamily: "monospace",
                fontSize: "14px",
                border: "1px solid #ccc"
            }}>
                <thead>
                    <tr style={{backgroundColor: "#f0f0f0"}}>
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