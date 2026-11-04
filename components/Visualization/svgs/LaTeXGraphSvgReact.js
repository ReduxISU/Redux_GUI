import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import { Box, Card, CircularProgress, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useThemeMode } from "../../ThemeModeContext";
import { textColors } from "../../theme";

// Longest server error text kept in the failure message.
const MAX_ERROR_TEXT = 200;

// Says what went wrong with a render-tikz call: the HTTP status and the server's error text, no
// answer at all, or an answer that could not be read.
function describeTikzFailure(response, result) {
  let text = typeof result?.error === "string" ? result.error.trim() : "";
  if (text.length > MAX_ERROR_TEXT) text = `${text.slice(0, MAX_ERROR_TEXT)}…`;
  const status = `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`;
  return text ? `${status}: ${text}` : status;
}

// The same card the other picture states (components/Visualization/svgs/No_Viz_SVG.js) use.
const CARD_SX = { bgcolor: "primary.lGray", boxShadow: 1, borderRadius: 2, p: 2, minWidth: 300 };

function escapeLatexText(str) {
  const escaped = String(str).replace(
    /[\\{}%$&#_^~]/g,
    (c) =>
      ({
        "\\": "\\textbackslash{}",
        "{": "\\{",
        "}": "\\}",
        "%": "\\%",
        $: "\\$",
        "&": "\\&",
        "#": "\\#",
        _: "\\_",
        "^": "\\^{}",
        "~": "\\~{}",
      })[c],
  );

  // node-tikzjax (pdfTeX under the hood) can't typeset a raw Unicode 'ε'
  // glyph as plain text -- it fails the render outright. $\epsilon$ (LaTeX
  // math mode) is the one non-ASCII case we actually need to support here,
  // so swap it in after the generic escaping above (which leaves 'ε'
  // untouched, since it's not in the escaped character set).
  return escaped.replace(/ε/g, "$\\epsilon$");
}

function safeNodeId(id) {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error("Invalid node id");
  }
  return id;
}

function safeColor(c, fallback = "black") {
  return /^[a-zA-Z]+$/.test(c) ? c : fallback;
}

function safeNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

function LaTeXGraphSvgReact({ problemData }) {
  const [svgHtml, setSvgHtml] = useState("");
  const [loading, setLoading] = useState(false);
  // What went wrong when the drawing failed, else null.
  const [failure, setFailure] = useState(null);
  const { mode } = useThemeMode();
  const colors = textColors(mode);

  useEffect(() => {
    if (!problemData) return;

    // Set by the cleanup when problemData or mode changes, so a slow answer for the old input
    // can't overwrite the picture (or the error) for the new one.
    let ignore = false;

    // Node fill/outline stay white-on-black regardless of theme -- each node is
    // its own self-contained "chip" that's legible either way. Only elements
    // drawn directly on the transparent page canvas (edges, arrow tips, and the
    // unboxed self-loop weight label) need to flip for dark mode, since those
    // otherwise render as black-on-black against a dark page background.
    const lineColor = mode === "dark" ? "white" : "black";

    function seededRandom(seed) {
      let value = seed;
      return function () {
        value = (value * 16807) % 2147483647;
        return (value - 1) / 2147483646;
      };
    }

    async function processGraph() {
      setLoading(true);
      setFailure(null);

      const rand = seededRandom(12345);

      const nodes = (problemData.nodes || []).map((n) => ({
        ...n,
        x: rand() * 10,
        y: rand() * 10,
        vx: 0,
        vy: 0,
      }));

      const links = problemData.links || [];

      const iterations = 200;
      const repulsion = 0.4;
      const springLength = 2.0;
      const springStrength = 0.1;

      for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist2 = dx * dx + dy * dy + 0.01;
            const force = repulsion / dist2;
            nodes[i].vx -= force * dx;
            nodes[i].vy -= force * dy;
            nodes[j].vx += force * dx;
            nodes[j].vy += force * dy;
          }
        }

        for (const link of links) {
          const source = nodes.find((n) => n.id === link.source);
          const target = nodes.find((n) => n.id === link.target);
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
          const force = springStrength * (dist - springLength);
          source.vx += (force * dx) / dist;
          source.vy += (force * dy) / dist;
          target.vx -= (force * dx) / dist;
          target.vy -= (force * dy) / dist;
        }

        for (const node of nodes) {
          node.x += node.vx * 0.1;
          node.y += node.vy * 0.1;
          node.vx *= 0.85;
          node.vy *= 0.85;
        }
      }

      let nodeDefs = "\\begin{scope}[every node/.style={circle,draw,line width=1.2pt}]\n";

      nodes.forEach((node) => {
        const id = safeNodeId(node.id);
        const outline = safeColor(node.outline, "black");
        const label = escapeLatexText(node.name);

        const isSolution = node.accept_state === "true";
        const fill = safeColor(node.color, "white");
        const extraStyles = isSolution ? "double" : "";

        nodeDefs +=
          `    \\node[fill=${fill},draw=${outline},${extraStyles}] (${id}) ` +
          `at (${safeNumber(node.x).toFixed(2)},${safeNumber(-node.y).toFixed(2)}) ` +
          `{${label}};\n`;
      });

      nodeDefs += "\\end{scope}\n\n";

      let edgeDefs = `\\begin{scope}[>={stealth[${lineColor}]}]\n`;

      // FIX 1: Use a canonical (sorted) key so A->B and B->A are treated as the
      // same pair for bend detection, preventing overlapping parallel edges.
      const usedEdges = Object.create(null);

      // FIX 4: Only emit the invisible start node when at least one initial node exists.
      const hasInitial = nodes.some((n) => n.initial === "true");
      if (hasInitial) {
        edgeDefs += `    \\node[draw=none] (start) at (-1,0) {};\n`;
        nodes.forEach((node) => {
          if (node.initial === "true") {
            const id = safeNodeId(node.id);
            edgeDefs +=
              `    \\path[draw=${lineColor},very thick] ` +
              `([xshift=-2em]${id}.west) edge[->] (${id}.west);\n`;
          }
        });
      }

      links.forEach((link) => {
        const src = safeNodeId(link.source);
        const tgt = safeNodeId(link.target);
        const color = safeColor(link.color, lineColor);

        const arrow = link.directed === true ? "->" : "-";
        const style = link.dashed === true ? "dashed" : "";

        const weight =
          link.weighted === true
            ? ` node[midway, fill=white, inner sep=2pt] {${escapeLatexText(link.weight)}}`
            : "";

        const loopWeight =
          link.weighted === true
            ? ` node[text=${lineColor}] {${escapeLatexText(link.weight)}}`
            : "";

        if (src === tgt) {
          const node = nodes.find((n) => n.id === src);
          // FIX 2: Added parentheses to fix operator precedence bug.
          const nearbyEdges = links.filter(
            (l) => l.source === src || (l.target === src && l.source !== src),
          );

          let counts = { right: 0, left: 0, above: 0, below: 0 };

          nearbyEdges.forEach((e) => {
            const otherId = e.source === src ? e.target : e.source;
            const otherNode = nodes.find((n) => n.id === otherId);

            if (otherNode.initial === "true") {
              if (otherNode.x > node.x) counts.right++;
            } else {
              if (otherNode.x > node.x) counts.right++;
              else counts.left++;
            }

            if (otherNode.y > node.y) counts.above++;
            else counts.below++;
          });

          const side = Object.entries(counts).sort((a, b) => a[1] - b[1])[0][0];

          edgeDefs +=
            `    \\path[draw=${color},very thick,>={Stealth[${lineColor}]}] ` +
            `(${src}) edge[${arrow},loop ${side}${style ? "," + style : ""}]${loopWeight} (${src});\n`;
          return;
        }

        // FIX 1: Canonical key — sort so (A,B) and (B,A) share a counter.
        const canonicalKey = [src, tgt].sort().join("--");
        usedEdges[canonicalKey] = (usedEdges[canonicalKey] || 0) + 1;

        const bend =
          usedEdges[canonicalKey] > 1 ? `bend right=${20 * usedEdges[canonicalKey]}` : "";

        const options = [arrow, bend, style].filter(Boolean).join(",");

        edgeDefs +=
          `    \\path[draw=${color},very thick,>={Stealth[${lineColor}]}] ` +
          `(${src}) edge[${options}]${weight} (${tgt});\n`;
      });

      edgeDefs += "\\end{scope}\n";

      const tikz = `\\begin{tikzpicture}\n${nodeDefs}${edgeDefs}\\end{tikzpicture}`;

      let response;
      try {
        response = await fetch("/api/render-tikz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tikzBody: tikz }),
        });
      } catch (err) {
        throw Object.assign(new Error("render-tikz got no answer"), {
          detail: `No answer from the server (${err?.message || String(err)}).`,
        });
      }

      let result;
      try {
        result = await response.json();
      } catch (err) {
        throw Object.assign(new Error("render-tikz answer unreadable"), {
          detail: `HTTP ${response.status}: the answer could not be read (${err?.message || String(err)}).`,
        });
      }
      if (!response.ok || !result?.success) {
        throw Object.assign(new Error(result?.error ?? "TikZ render failed"), {
          detail: describeTikzFailure(response, result),
        });
      }
      return result.svg;
    }

    // A failed render used to leave the pane blank with no message (issue #389); show an error
    // instead, and drop the previous picture so it can't pass for this one.
    processGraph()
      .then((svg) => {
        if (!ignore) setSvgHtml(svg);
      })
      .catch((err) => {
        if (ignore) return;
        console.error("TikZ picture failed to draw:", err);
        setSvgHtml("");
        setFailure(err?.detail ?? `${err?.name ?? "Error"}: ${err?.message ?? String(err)}`);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [problemData, mode]);

  return (
    <div
      style={{
        display: "inline-block",
        alignItems: "center",
        minHeight: "400px",
        width: "100%",
      }}
    >
      {/* Show "Loading..." while drawing instead of a blank space. */}
      {loading ? (
        <Box role="status">
          <Card variant="outlined" sx={CARD_SX}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <CircularProgress size={28} />
              <Typography
                variant="h4"
                component="p"
                style={{ color: colors.heading, fontWeight: "normal" }}
              >
                Loading...
              </Typography>
            </Box>
          </Card>
        </Box>
      ) : failure ? (
        <Box role="alert">
          <Card variant="outlined" sx={CARD_SX}>
            <ErrorOutlineIcon fontSize="large"></ErrorOutlineIcon>
            <Typography
              variant="h4"
              component="p"
              style={{ color: colors.heading, fontWeight: "normal", textAlign: "center" }}
            >
              Failed to Visualize
            </Typography>
            <Typography
              variant="body2"
              style={{ color: colors.body, textAlign: "center", marginTop: 8 }}
            >
              TikZ drawing (the render-tikz request) failed for this Graph LaTeX picture.
            </Typography>
            <Typography
              variant="body2"
              style={{ color: colors.body, textAlign: "center", overflowWrap: "anywhere" }}
            >
              {failure}
            </Typography>
          </Card>
        </Box>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
      )}
    </div>
  );
}

export default LaTeXGraphSvgReact;
