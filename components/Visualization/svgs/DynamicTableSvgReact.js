import React from "react";
import { getColorByKey } from "../constants/VisColorsArray";
import { useThemeMode } from "../../ThemeModeContext";
import { textColors, surfaceColors } from "../../theme";

// Cells/rows with an explicit highlight color (row.color / cellColors) sit on a
// fixed-hex VisColors swatch that doesn't change with theme, so they always use
// this fixed dark text rather than the page's theme-aware textColor -- otherwise
// dark mode's near-white text would go illegible against a light swatch.
const HIGHLIGHTED_TEXT_COLOR = "#111827";

export default function DynamicTableSvgReact({problemData})
{
    const { mode } = useThemeMode();
    const textColor = textColors(mode).heading;
    const surface = surfaceColors(mode);

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
                    fontWeight: "bold",
                    color: textColor
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
                    fontSize: "14px",
                    color: textColor
                }}>
                    <thead>
                        <tr style={{backgroundColor: surface.surfaceAlt, position: "sticky", top: 0}}>
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
                                    backgroundColor: row.color ? getColorByKey(row.color) : surface.surface,
                                    color: row.color ? HIGHLIGHTED_TEXT_COLOR : undefined,
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
                                                backgroundColor: cellColor ? getColorByKey(cellColor) : "inherit",
                                                color: cellColor ? HIGHLIGHTED_TEXT_COLOR : undefined
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
