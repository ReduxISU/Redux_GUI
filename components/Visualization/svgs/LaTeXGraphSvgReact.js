import React, { useEffect, useState, useRef } from "react";

function escapeLatexText(str) {
  return String(str).replace(/[\\{}%$&#_^~]/g, (c) => ({
    "\\": "\\textbackslash{}",
    "{": "\\{",
    "}": "\\}",
    "%": "\\%",
    "$": "\\$",
    "&": "\\&",
    "#": "\\#",
    "_": "\\_",
    "^": "\\^{}",
    "~": "\\~{}",
  }[c]));
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
  const fetchAbortController = useRef(null);
  const isFetching = useRef(false);
  const pendingTikz = useRef(null);

  useEffect(() => {
    // If no data, clear the SVG entirely
    if (!problemData || !problemData.nodes || !problemData.links) {
        setSvgHtml("");
        return;
    }

    let isMounted = true;

    function seededRandom(seed) {
      let value = seed;
      return function () {
        value = (value * 16807) % 2147483647;
        return (value - 1) / 2147483646;
      };
    }

    const rand = seededRandom(12345);

    // --- Layout calculation ---
    const nodes = problemData.nodes.map((n) => ({
      ...n,
      x: rand() * 10,
      y: rand() * 10,
      vx: 0,
      vy: 0,
    }));

    const links = problemData.links;
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
        if (!source || !target) continue;
        
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

      const isSolution = node.color === "solution";
      const fill = isSolution ? "white" : safeColor(node.color, "white");
      const extraStyles = isSolution ? "double" : "";

      nodeDefs +=
        `    \\node[fill=${fill},draw=${outline},${extraStyles}] (${id}) ` +
        `at (${safeNumber(node.x).toFixed(2)},${safeNumber(-node.y).toFixed(2)}) ` +
        `{${label}};\n`;
    });

    nodeDefs += "\\end{scope}\n\n";

    // Fixed typo here: \\begin{scope} instead of \\begin{scope>
    let edgeDefs = "\\begin{scope}[>={stealth[black]}]\n";
    const usedEdges = Object.create(null);

    edgeDefs += `    \\node[draw=none] (start) at (-1,0) {};\n`;

    nodes.forEach((node) => {
      if (node.additional === "initial") {
        const id = safeNodeId(node.id);
        edgeDefs +=
          `    \\path[draw=black,very thick] ` +
          `([xshift=-2em]${id}.west) edge[->] (${id}.west);\n`;
      }
    });

    links.forEach((link) => {
      if (!nodes.find(n => n.id === link.source) || !nodes.find(n => n.id === link.target)) return;

      const src = safeNodeId(link.source);
      const tgt = safeNodeId(link.target);
      const color = safeColor(link.color, "black");

      const arrow = link.directed === true ? "->" : "-";
      const style = link.dashed === true ? "dashed" : "";

      let safeWeightText = escapeLatexText(link.weight || "");
      // Replaced exactly to ensure valid eps string mapping
      safeWeightText = safeWeightText.replace(/\bepsilon\b/g, "eps");

      const weight =
        link.weighted === true
          ? ` node[midway, fill=white, inner sep=2pt] {${safeWeightText}}`
          : "";

      const loopWeight =
        link.weighted === true
          ? ` node {${safeWeightText}}`
          : "";

      if (src === tgt) {
        const node = nodes.find((n) => n.id === src);
        const nearbyEdges = links.filter(l => l.source === src || l.target === src && l.source !== src);

        let counts = { right: 0, left: 0, above: 0, below: 0 };

        nearbyEdges.forEach(e => {
          const otherId = e.source === src ? e.target : e.source;
          const otherNode = nodes.find(n => n.id === otherId);
          if (!otherNode) return;

          if (otherNode.additional === "initial") {
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
          `    \\path[draw=${color},very thick,>={stealth[black]}] ` +
          `(${src}) edge[${arrow},loop ${side}${style ? "," + style : ""}]${loopWeight} (${src});\n`;
        return;
      }

      const key = `${src}->${tgt}`;
      usedEdges[key] = (usedEdges[key] || 0) + 1;

      let bend = "";
      const hasOppositeEdge = links.some((l) => l.source === tgt && l.target === src);

      if (usedEdges[key] > 1) {
          bend = `bend right=${20 * usedEdges[key]}`;
      } else if (hasOppositeEdge) {
          bend = "bend left=15";
      }

      const options = [arrow, bend, style].filter(Boolean).join(",");

      edgeDefs +=
        `    \\path[draw=${color},very thick,>={stealth[black]}] ` +
        `(${src}) edge[${options}]${weight} (${tgt});\n`;
    });

    edgeDefs += "\\end{scope}\n";

    const tikz = `\\begin{tikzpicture}\n${nodeDefs}${edgeDefs}\\end{tikzpicture}`;
    
    // Store latest tikz layout so backend doesn't desync
    pendingTikz.current = tikz;

    const fetchGraph = async () => {
        // Prevent concurrent API calls
        if (isFetching.current) return;
        
        const currentTikz = pendingTikz.current;
        if (!currentTikz) return;

        isFetching.current = true;
        setLoading(true);

        if (fetchAbortController.current) {
            fetchAbortController.current.abort();
        }
        fetchAbortController.current = new AbortController();

        try {
            const response = await fetch("/api/render-tikz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tikzBody: currentTikz }),
                signal: fetchAbortController.current.signal
            });

            // Ensure response is ok before attempting to json parse to avoid crashes
            if (!response.ok) {
                 throw new Error(`Server responded with ${response.status}`);
            }

            const result = await response.json();
            
            if (!isMounted) return; // Discard if unmounted

            if (result.success) {
                setSvgHtml(result.svg);
            } else {
                console.error("render-tikz failure:", result.error);
                setSvgHtml(""); // fallback on error
            }
        } catch (err) {
            if (err.name !== "AbortError" && isMounted) {
                 console.error("Fetch API completely failed:", err);
                 setSvgHtml("");
            }
        } finally {
            if (!isMounted) return;
            isFetching.current = false;
            
            // If the user's problemData created a new Tikz layout while this fetch was active, run it manually now
            if (pendingTikz.current !== currentTikz) {
                 fetchGraph();
            } else {
                 setLoading(false);
            }
        }
    };

    // Throttle slightly to ensure we batch double-renders effectively
    const debounceTimer = setTimeout(() => {
         fetchGraph();
    }, 50);
    
    return () => {
        isMounted = false;
        clearTimeout(debounceTimer);
    };
  }, [problemData]);

  return (
    <div
      style={{
        display: "inline-block",
        alignItems: "center",
        minHeight: "400px",
        width: "100%",
        textAlign: "center"
      }}
    >
      {!loading && svgHtml && (
        <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
      )}
      {loading && (
        <div style={{ padding: "20px" }}>Loading Graph...</div>
      )}
    </div>
  );

}

export default LaTeXGraphSvgReact;
