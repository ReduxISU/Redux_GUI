import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { getColorByKey } from "../constants/VisColorsArray";

const CIRCUIT_WIDTH = 700;
const CIRCUIT_HEIGHT = 320;
const CIRCUIT_MARGIN = { top: 40, right: 30, bottom: 40, left: 70 };
const GATE_WIDTH = 44;
const GATE_HEIGHT = 26;

// Renders a quantum circuit layout using D3. Supports single-qubit gates (h, x),
// controlled-not (cx), and measurements (m). If the backend sends an API_D3CIRCUIT
// payload string, we parse it; otherwise we assume the fields are present directly.
export default function StandardCircuitSvgReact({
  solve,
  url,
  problemData,
  gadgetMap,
  gadgetsOn,
}) {
  const width = CIRCUIT_WIDTH;
  const height = CIRCUIT_HEIGHT;
  const margin = CIRCUIT_MARGIN;
  const ref = useRef(null);

  const parsedData = parseCircuitData(problemData);

  useEffect(() => {
    if (!parsedData) return;

    const qubits = parsedData.qubits ?? ["q0", "q1"];
    const classical = parsedData.classical ?? [];
    const gates = parsedData.gates ?? [];

    const timestepsRaw = gates.map((g, idx) => g.time ?? idx);
    const timesteps = (timestepsRaw.length ? Array.from(new Set(timestepsRaw)) : [0, 1]).sort((a, b) => a - b);

    const xScale = d3
      .scalePoint()
      .domain(timesteps)
      .range([margin.left, width - margin.right])
      .padding(0.5);

    const yScale = d3
      .scalePoint()
      .domain(qubits.map((_, i) => i))
      .range([margin.top, height - margin.bottom])
      .padding(0.5);

    const classicalY = height - margin.bottom / 2;

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

    classical.forEach((c, ci) => {
        const yC = classicalY + ci * 14;
        svg
            .append("text")
            .attr("x", margin.left - 10)
            .attr("y", yC + 4)
            .attr("text-anchor", "end")
            .attr("font-size", 12)
            .text(c);

        svg
            .append("line")
            .attr("x1", margin.left)
            .attr("x2", width - margin.right)
            .attr("y1", yC)
            .attr("y2", yC)
            .attr("stroke", getColorByKey("Edges"))
            .attr("stroke-dasharray", "4,4");
        });


    gates.forEach((g, i) => {
      const gateType = (g.type || g.label || "").toLowerCase();
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
          .text("+"); //⊕
        return;
      }

      const targetIdx = targetIndices[0];
      const y = yScale(targetIdx);
      if (y == null) return;

      if (gateType === "m") {
        const group = svg.append("g").attr("id", g.id ? `id${g.id}` : null);
        group
          .append("path")
          .attr("d", `M ${x - 10} ${y - 6} Q ${x} ${y + 10} ${x + 10} ${y - 6}`)
          .attr("fill", "none")
          .attr("stroke", getColorByKey("Edges"))
          .attr("stroke-width", 2);
        group
          .append("line")
          .attr("x1", x - 10)
          .attr("x2", x + 10)
          .attr("y1", y - 6)
          .attr("y2", y - 6)
          .attr("stroke", getColorByKey("Edges"))
          .attr("stroke-width", 2);
        group
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 3)
          .attr("fill", getColorByKey("Edges"));

        if (Array.isArray(g.classical) && g.classical.length && classical.length) {
            const classicalIdx = classical.indexOf(g.classical[0]);
            const yClassical = classicalY + (classicalIdx >= 0 ? classicalIdx * 14 : 0);

            group
                .append("line")
                .attr("x1", x)
                .attr("x2", x)
                .attr("y1", y)
                .attr("y2", yClassical)
                .attr("stroke", getColorByKey("Edges"))
                .attr("stroke-width", 1.5)
                .attr("stroke-dasharray", "4,2");

            group
                .append("circle")
                .attr("cx", x)
                .attr("cy", yClassical)
                .attr("r", 2)
                .attr("fill", getColorByKey("Edges"));
            }
        return;
      }

      const label = g.label ?? g.type ?? "?";
      const gateGroup = svg.append("g").attr("id", g.id ? `id${g.id}` : null);

      gateGroup
        .append("rect")
        .attr("x", x - GATE_WIDTH / 2)
        .attr("y", y - GATE_HEIGHT / 2)
        .attr("width", GATE_WIDTH)
        .attr("height", GATE_HEIGHT)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("fill", getColorByKey("Background"))
        .attr("stroke", getColorByKey("Edges"))
        .attr("stroke-width", 2);

      gateGroup
        .append("text")
        .attr("x", x)
        .attr("y", y + 4)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("font-weight", "bold")
        .text(label.toUpperCase());
    });
  }, [parsedData]);

  const oracle = parsedData?.metadata?.oracleType;
  const solution = parsedData?.metadata?.solution;

  return (
    <>
      <div
        ref={ref}
        style={{
          display: "inline-block",
          width: "100%",
          height: "100%",
          marginRight: 0,
          marginLeft: 0,
        }}
      />
      {(oracle || solution) && (
        <div style={{ marginTop: 8, fontSize: 12 }}>
          {oracle ? <div>Oracle: {oracle}</div> : null}
          {solution ? <div>Solution: {solution}</div> : null}
        </div>
      )}
    </>
  );
}

function parseCircuitData(data) {
  if (!data) return null;
  if (typeof data === "object" && data.payload) {
    try {
      return JSON.parse(data.payload);
    } catch {
      return data;
    }
  }
  return data;
}
