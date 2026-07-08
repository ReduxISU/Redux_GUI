import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { getColorByKey } from "../constants/VisColorsArray";

const CIRCUIT_WIDTH = 700;
const CIRCUIT_HEIGHT = 260;
// More top margin so the title and any overlays have breathing room above the first qubit wire.
const CIRCUIT_MARGIN = { top: 80, right: 30, bottom: 40, left: 70 };
const GATE_WIDTH = 44;
const GATE_HEIGHT = 26;

const GATE_PALETTE = {
  oracle: { label: "Oracle", fill: getColorByKey("Purple") || "#AA4499" },
  block: { label: "Block", fill: getColorByKey("Sand") || "#DDCC77" },
  rz: { label: "RZ", fill: getColorByKey("Teal") || "#44AA99" },
  ry: { label: "RY", fill: getColorByKey("Cyan") || "#88CCEE" },
  rx: { label: "RX", fill: getColorByKey("Rose") || "#CC6677" },
  u3: { label: "U3", fill: getColorByKey("Olive") || "#999933" },
  u2: { label: "U2", fill: getColorByKey("Olive") || "#999933" },
  u1: { label: "U1", fill: getColorByKey("Olive") || "#999933" },
};
const GATE_TITLE_MAP = {
  h: "Hadamard",
  x: "Pauli-X",
  y: "Pauli-Y",
  z: "Pauli-Z",
  cx: "CNOT",
  m: "Measurement",
  oracle: "Oracle",
  block: "Block",
  rz: "RZ",
  ry: "RY",
  rx: "RX",
  u1: "U1",
  u2: "U2",
  u3: "U3",
};

// Renders a quantum circuit layout using D3. Supports single-qubit gates (h, x),
// controlled-not (cx), measurements (m), and additional labeled gates (oracle, block,
// rz, ry, u3, etc). If the backend sends an  payload string, we parse it;
// otherwise we assume the fields are present directly.
export default function StandardCircuitSvgReact({
  solve,
  url,
  problemData,
  gadgetMap,
  gadgetsOn,
  useSolutionCircuit = false,
}) {
  const margin = CIRCUIT_MARGIN;
  const ref = useRef(null);

  const parsedData = parseCircuitData(problemData);

  const gatePalette = GATE_PALETTE;
  const gateTitleMap = GATE_TITLE_MAP;

  useEffect(() => {
    if (!parsedData) return;

    const qubits = parsedData.qubits ?? ["q0", "q1"];
    const classical = parsedData.classical ?? [];
    const chosenCircuit = useSolutionCircuit && Array.isArray(parsedData.solutionCircuit) && parsedData.solutionCircuit.length
      ? parsedData.solutionCircuit
      : parsedData.gates ?? [];
    const gates = chosenCircuit;

    const timestepsRaw = gates.map((g, idx) => g.time ?? idx);
    const timesteps = (timestepsRaw.length ? Array.from(new Set(timestepsRaw)) : [0, 1]).sort((a, b) => a - b);

    const qubitSpacing = 64;
    const classicalSpacing = 18;
    const qubitToClassicalGap = classical.length ? 44 : 0;

    const xExtent = margin.left + margin.right + Math.max(timesteps.length - 1, 1) * 80 + GATE_WIDTH * 2;
    const width = Math.max(CIRCUIT_WIDTH, xExtent);

    const qubitBand = Math.max(qubits.length - 1, 0) * qubitSpacing;
    const classicalStart = margin.top + qubitBand + qubitToClassicalGap;
    const classicalHeight = classical.length ? (classical.length - 1) * classicalSpacing : 0;
    const height = Math.max(
      CIRCUIT_HEIGHT,
      classicalStart + classicalHeight + margin.bottom + (classical.length ? 30 : 10)
    );

    const xScale = d3
      .scalePoint()
      .domain(timesteps)
      .range([margin.left, width - margin.right])
      .padding(0.5);

    const yScale = d3
      .scalePoint()
      .domain(qubits.map((_, i) => i))
      .range([margin.top, margin.top + qubitBand])
      .padding(0);

    const classicalYBase = classicalStart;

    d3.select(ref.current).selectChildren().remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g");

    svg
      .append("text")
      .attr("x", margin.left)
      .attr("y", 20)
      .attr("font-size", 16)
      .attr("font-weight", "bold")
      .text(parsedData.title ?? "Quantum Circuit");

    qubits.forEach((q, qi) => {
      const y = yScale(qi);
      svg
        .append("text")
        .attr("x", margin.left - 10)
        .attr("y", y + 4)
        .attr("text-anchor", "end")
        .attr("font-size", 12)
        .text(q);

      svg
        .append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", y)
        .attr("y2", y)
        .attr("stroke", getColorByKey("Edges"));
    });

    const busGroup = svg.append("g").attr("class", "classical-bus");
    if (classical.length) {
      const busY = classicalYBase;
      busGroup
        .append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", busY)
        .attr("y2", busY)
        .attr("stroke", getColorByKey("Edges"))
        .attr("stroke-width", 2);

      busGroup
        .append("text")
        .attr("x", margin.left - 14)
        .attr("y", busY - 10)
        .attr("text-anchor", "end")
        .attr("font-size", 12)
        .text("c");
    }

    const overlays = Array.isArray(parsedData.overlays) ? parsedData.overlays : [];

    overlays.forEach((ov) => {
      const t0 = ov.timeStart ?? ov.time ?? 0;
      const t1 = ov.timeEnd ?? ov.timeStart ?? ov.time ?? t0;

      // if this overlay isn't for the current timesteps, skip
      const xStart = xScale(t0);
      const xEnd = xScale(t1);
      if (xStart == null || xEnd == null) return;

      // span selected targets (default: all qubits)
      const targetNames = Array.isArray(ov.targets) && ov.targets.length ? ov.targets : qubits;
      const idxs = targetNames
        .map((name) => qubits.indexOf(String(name)))
        .filter((idx) => idx >= 0);

      if (!idxs.length) return;

      const minIdx = Math.min(...idxs);
      const maxIdx = Math.max(...idxs);

      const yMin = yScale(minIdx);
      const yMax = yScale(maxIdx);
      if (yMin == null || yMax == null) return;

      // width heuristic for scalePoint: use spacing between first two points, fallback to GATE_WIDTH
      const step =
        timesteps.length >= 2 && xScale(timesteps[0]) != null && xScale(timesteps[1]) != null
          ? Math.abs(xScale(timesteps[1]) - xScale(timesteps[0]))
          : GATE_WIDTH * 2;

      const bandLeft = Math.min(xStart, xEnd) - step / 2;
      const bandRight = Math.max(xStart, xEnd) + step / 2;

      const overlayGroup = svg.append("g").attr("class", "circuit-overlay");

      const overlayTopPad = GATE_HEIGHT + 14;
      const overlayBottomPad = GATE_HEIGHT;
      const overlayTop = Math.max(0, Math.min(yMin, yMax) - overlayTopPad);
      const overlayBottom = Math.max(yMin, yMax) + overlayBottomPad;

      overlayGroup
        .append("rect")
        .attr("x", bandLeft)
        .attr("y", overlayTop)
        .attr("width", bandRight - bandLeft)
        .attr("height", overlayBottom - overlayTop)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("fill", getColorByKey("Purple") || "#AA4499")
        .attr("fill-opacity", 0.12)
        .attr("stroke", getColorByKey("Purple") || "#AA4499")
        .attr("stroke-dasharray", "4,3")
        .attr("stroke-width", 1.5);

      overlayGroup
        .append("text")
        .attr("x", (bandLeft + bandRight) / 2)
        .attr("y", overlayTop + 14)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("font-weight", 700)
        .text(ov.label || "U_f");
    });

    const gateTypesUsed = new Set();
    const qubitName = (idx) => qubits[idx] ?? `q${idx}`;
    const classicalName = (idx) => classical[idx] ?? `c${idx}`;
    const measurementAnchors = new Map(); // classical bit -> { x, name, value }
    const measurementSlots = new Map(); // time -> next slot offset for clustered measurements
    const measurementSpacing = 18; // px spread when multiple measurements share the same time

    const xForMeasurement = (time) => {
      const slot = measurementSlots.get(time) ?? 0;
      measurementSlots.set(time, slot + 1);
      return (xScale(time) ?? margin.left) + slot * measurementSpacing;
    };
    const addTitle = (selection, text) => {
      if (!text) return;
      selection.append("title").text(text);
    };

    gates.forEach((g, i) => {
      const gateType = (g.type || g.label || "").toLowerCase();
      const paletteEntry = gatePalette[gateType];
      if (paletteEntry) gateTypesUsed.add(paletteEntry.label);
      const targets = Array.isArray(g.targets) ? g.targets : (g.target ? [g.target] : []);
      const x = xScale(g.time ?? i);
      if (x == null) return;

      const targetIndices = targets.map((t) => (typeof t === "number" ? t : qubits.indexOf(String(t))));

      if (gateType === "cx" && targetIndices.length >= 2) {
        const controlIdx = targetIndices[0];
        const targetIdx = targetIndices[1];
        const yControl = yScale(controlIdx);
        const yTarget = yScale(targetIdx);
        if (yControl == null || yTarget == null) return;

        const group = svg.append("g").attr("id", g.id ? `id${g.id}` : null);
        group
          .append("line")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", yControl)
          .attr("y2", yTarget)
          .attr("stroke", getColorByKey("Edges"))
          .attr("stroke-width", 2);

        group
          .append("circle")
          .attr("cx", x)
          .attr("cy", yControl)
          .attr("r", 6)
          .attr("fill", getColorByKey("Edges"));

        group
          .append("circle")
          .attr("cx", x)
          .attr("cy", yTarget)
          .attr("r", 10)
          .attr("fill", getColorByKey("Background"))
          .attr("stroke", getColorByKey("Edges"))
          .attr("stroke-width", 2);

        group
          .append("text")
          .attr("x", x)
          .attr("y", yTarget + 4)
          .attr("text-anchor", "middle")
          .attr("font-size", 12)
          .attr("font-weight", "bold")
          .text("+");

        const cxTitle = `${gateTitleMap.cx}: ${qubitName(controlIdx)} → ${qubitName(targetIdx)}`;
        const cxSuffix = g.name || g.id ? ` (${g.name || g.id})` : "";
        addTitle(group, `${cxTitle}${cxSuffix}`);
        return;
      }

      const targetIdx = targetIndices[0];
      const y = yScale(targetIdx);
      if (y == null) return;

      // Multi-target blocks (oracle, block) span min/max target lines
      if ((gateType === "oracle" || gateType === "block") && targetIndices.length >= 1) {
        const minIdx = Math.min(...targetIndices);
        const maxIdx = Math.max(...targetIndices);
        const yMin = yScale(minIdx);
        const yMax = yScale(maxIdx);
        if (yMin != null && yMax != null) {
          const blockGroup = svg.append("g").attr("id", g.id ? `id${g.id}` : null);
          const blockHeight = (yMax - yMin) + GATE_HEIGHT;
          const fill = paletteEntry?.fill || getColorByKey("Background");
          blockGroup
            .append("rect")
            .attr("x", x - GATE_WIDTH / 2)
            .attr("y", yMin - GATE_HEIGHT / 2)
            .attr("width", GATE_WIDTH)
            .attr("height", blockHeight)
            .attr("rx", 6)
            .attr("ry", 6)
            .attr("fill", fill)
            .attr("stroke", getColorByKey("Edges"))
            .attr("stroke-width", 2);

          blockGroup
            .append("text")
            .attr("x", x)
            .attr("y", yMin + (blockHeight / 2))
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .attr("font-weight", "bold")
            .text((paletteEntry?.label || g.label || g.type || "?").toUpperCase());
        const blockTitle = `${(paletteEntry?.label || g.label || g.type || "?")} on ${targetIndices.map(qubitName).join(", ")}`;
        const blockSuffix = g.name || g.id ? ` (${g.name || g.id})` : "";
        addTitle(blockGroup, `${blockTitle}${blockSuffix}`);

          targetIndices.forEach((ti) => {
            const yTarget = yScale(ti);
            if (yTarget != null) {
              blockGroup
                .append("line")
                .attr("x1", margin.left)
                .attr("x2", width - margin.right)
                .attr("y1", yTarget)
                .attr("y2", yTarget)
                .attr("stroke", getColorByKey("Edges"))
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "2,2");
            }
          });
          return;
        }
      }

      if (gateType === "m") {
        const edgeColor = getColorByKey("Edges");
        const timeKey = g.time ?? i;
        const measX = xForMeasurement(timeKey);
        const group = svg.append("g").attr("id", g.id ? `id${g.id}` : null);

        // meter icon at measX
        group.append("path")
          .attr("d", `M ${measX - 10} ${y - 6} Q ${measX} ${y + 10} ${measX + 10} ${y - 6}`)
          .attr("fill", "none").attr("stroke", edgeColor).attr("stroke-width", 2);
        group.append("line")
          .attr("x1", measX - 10).attr("x2", measX + 10)
          .attr("y1", y - 6).attr("y2", y - 6)
          .attr("stroke", edgeColor).attr("stroke-width", 2);
        group.append("circle")
          .attr("cx", measX).attr("cy", y).attr("r", 3).attr("fill", edgeColor);
        group.append("text")
          .attr("x", measX).attr("y", y - 12)
          .attr("text-anchor", "middle").attr("font-size", 12)
          .attr("font-weight", "bold").text("M");

        if (Array.isArray(g.classical) && g.classical.length && classical.length) {
          const classicalIdx = classical.indexOf(g.classical[0]);
          const bitLabel = (() => {
            const bits = parsedData?.metadata?.solutionBits;
            if (Array.isArray(bits)) return bits[classicalIdx];
            if (typeof bits === "string" && bits.length > classicalIdx) return bits[classicalIdx];
            return undefined;
          })();

          // dotted stem to the bus
          group.append("line")
            .attr("x1", measX).attr("x2", measX)
            .attr("y1", y).attr("y2", classicalYBase)
            .attr("stroke", edgeColor).attr("stroke-width", 2.5)
            .attr("stroke-dasharray", "4,3");

          // marker at the bus (label handled in bus ticks)
          group.append("circle")
            .attr("cx", measX).attr("cy", classicalYBase)
            .attr("r", 4).attr("fill", edgeColor)
            .attr("stroke", getColorByKey("Background")).attr("stroke-width", 1);

          if (!measurementAnchors.has(classicalIdx)) {
            measurementAnchors.set(classicalIdx, {
              x: measX,
              name: String(classicalIdx),
              value: bitLabel,
            });
          }
        }
        const measTarget = qubitName(targetIdx);
        const measDest = classicalName(classical.indexOf(g.classical[0]));
        const mTitle = `${gateTitleMap.m}: ${measTarget}${measDest ? ` ƒ+' ${measDest}` : ""}`;
        const mSuffix = g.name || g.id ? ` (${g.name || g.id})` : "";
        addTitle(group, `${mTitle}${mSuffix}`);
        return;
      }

      const label = g.label ?? g.type ?? "?";
      const gateLabel = paletteEntry?.label || label;
      const fill = paletteEntry?.fill || getColorByKey("Background");
      const rotationParam = Array.isArray(g.params) && g.params.length ? `(${g.params.join(",")})` : (g.theta ? `(${g.theta})` : "");
      const displayLabel = ["rz", "ry", "rx"].includes(gateType)
        ? `${gateLabel}${rotationParam}`
        : gateLabel;
      const gateGroup = svg.append("g").attr("id", g.id ? `id${g.id}` : null);

      gateGroup
        .append("rect")
        .attr("x", x - GATE_WIDTH / 2)
        .attr("y", y - GATE_HEIGHT / 2)
        .attr("width", GATE_WIDTH)
        .attr("height", GATE_HEIGHT)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("fill", fill)
        .attr("stroke", getColorByKey("Edges"))
        .attr("stroke-width", 2);

      gateGroup
        .append("text")
        .attr("x", x)
        .attr("y", y + 4)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("font-weight", "bold")
        .text(displayLabel.toUpperCase());
      const titleName = gateTitleMap[gateType] || gateLabel || displayLabel;
      const titleWithParams = ["rz", "ry", "rx"].includes(gateType) ? `${titleName}${rotationParam}` : titleName;
      const gateTitle = `${titleWithParams} on ${qubitName(targetIdx)}`;
      const gateSuffix = g.name || g.id ? ` (${g.name || g.id})` : "";
      addTitle(gateGroup, `${gateTitle}${gateSuffix}`);
    });

    if (classical.length && busGroup) {
      const busY = classicalYBase;
      const edgeColor = getColorByKey("Edges");

      // Only render ticks/labels for measured anchors
      const anchors = Array.from(measurementAnchors.values());

      anchors.forEach(({ x: tx, name, value }) => {
        busGroup
          .append("line")
          .attr("x1", tx)
          .attr("x2", tx)
          .attr("y1", busY - 8)
          .attr("y2", busY + 8)
          .attr("stroke", edgeColor)
          .attr("stroke-width", 1.5);

        busGroup
          .append("text")
          .attr("x", tx)
          .attr("y", busY + 16)
          .attr("text-anchor", "middle")
          .attr("font-size", 11)
          .attr("font-weight", 600)
          .text(name);

        if (value !== undefined) {
          busGroup
            .append("text")
            .attr("x", tx)
            .attr("y", busY + 32)
            .attr("text-anchor", "middle")
            .attr("font-size", 11)
            .text(String(value));
        }
      });
    }

    if (gateTypesUsed.size > 0) {
      const legendY = height - 10;
      const legend = svg.append("g").attr("transform", `translate(${margin.left}, ${legendY})`);
      let offsetX = 0;
      Array.from(gateTypesUsed).forEach((label) => {
        const entry = Object.values(gatePalette).find((p) => p.label === label);
        const color = entry?.fill || getColorByKey("Background");
        legend
          .append("rect")
          .attr("x", offsetX)
          .attr("y", -12)
          .attr("width", 14)
          .attr("height", 12)
          .attr("fill", color)
          .attr("stroke", getColorByKey("Edges"))
          .attr("stroke-width", 1);
        legend
          .append("text")
          .attr("x", offsetX + 18)
          .attr("y", -2)
          .attr("font-size", 11)
          .text(label);
        offsetX += 18 + label.length * 7;
      });
    }
  }, [parsedData, useSolutionCircuit, gatePalette, gateTitleMap, margin.bottom, margin.left, margin.right, margin.top]);

  const oracle = parsedData?.metadata?.oracleType;
  const solution = parsedData?.metadata?.solution;
  const solutionBits = parsedData?.metadata?.solutionBits;
  const iterations = parsedData?.metadata?.iterations;
  const shouldShowSolution = solve || useSolutionCircuit;

  const additionalMetadata = parsedData?.metadata
    ? Object.entries(parsedData.metadata).filter(
      ([key]) => !["oracleType", "solution", "solutionBits", "iterations", "secretString"].includes(key)
    )
    : [];
  const hasSolutionMetadata = shouldShowSolution && (solution || solutionBits || additionalMetadata.length > 0);
  const showMetadataPanel = oracle || typeof iterations !== "undefined" || hasSolutionMetadata;

  return (
    <>
      <div
        style={{
          width: "100%",
          maxHeight: 420,
          overflowX: "auto",
          overflowY: "auto",
          marginRight: 0,
          marginLeft: 0,
          border: "1px solid #e0e0e0",
          borderRadius: 6,
          padding: 4,
        }}
      >
        <div ref={ref} />
      </div>
        {showMetadataPanel && (
          <div
            style={{
              marginTop: 8,
              padding: "12px 16px",
              fontSize: 16,
              lineHeight: 1.4,
              borderLeft: `4px solid ${getColorByKey("Edges")}`,
              background: getColorByKey("Background"),
              maxWidth: "100%",
            }}
          >
            {oracle && (
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                Oracle (ground truth): <span style={{ fontWeight: "normal" }}>{oracle}</span>
              </div>
            )}
            {shouldShowSolution && solution && (
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                Solution (measured result): <span style={{ fontWeight: "normal" }}>{solution}</span>
              </div>
            )}
            {shouldShowSolution && solutionBits && <div>Solution bits: {solutionBits}</div>}
            {typeof iterations !== "undefined" && <div>Iterations: {iterations}</div>}
            {shouldShowSolution && additionalMetadata.map(([k, v]) => (
              <div key={k}>
                {k}: {String(v)}
              </div>
            ))}
          </div>
        )}
    </>
  );
}

function parseCircuitData(data) {
  if (!data) return null;

  if (typeof data === "string") {
    try { data = JSON.parse(data); } catch { return null; }
  }

  if (data && typeof data === "object" && typeof data.payload === "string") {
    try { data = JSON.parse(data.payload); } catch { /* keep original */ }
  }


  if (data && typeof data === "object" && data.d3 && typeof data.d3 === "object") {
    const d3 = data.d3;

    const mergedMeta = {
      ...(d3.metadata || {}),
      ...(data.metadata || {}),
      oracleType: data.metadata?.oracleType ?? d3.metadata?.oracleType,
    };

    // const topLevelSolution = typeof data.solution === "string" ? data.solution.trim() : "";
    // if (topLevelSolution) mergedMeta.result = topLevelSolution;

    return {
      ...d3,
      title: data.title ?? d3.title,
      metadata: mergedMeta,
    };
  }

    // If the payload is a string, try to parse it as JSON
    if (data && typeof data === "object" && typeof data.circuit === "string") {
      const s = data.circuit.trim();
      if (s.startsWith("{") || s.startsWith("[")) {
        try { return JSON.parse(s); } catch { /* ignore */ }
      }
    }

    // Already the direct D3 payload shape
    return data;
}
