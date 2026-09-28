// components/Quantum/QuantumCircuitVisualizer.jsx

import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import { getMaxTime } from "./circuitUtils";

export default function QuantumCircuitVisualizer({ circuit }) {
  const svgRef = useRef();

  const [activeCircuit, setActiveCircuit] = useState(circuit);
  const svgWidth = "100%";

  const [gateType, setGateType] = useState("h");
  const [gateQubit, setGateQubit] = useState(0);
  const [gateTime, setGateTime] = useState(0);
  const [gateControl, setGateControl] = useState(0);
  const [gateTarget, setGateTarget] = useState(1);

  const handleJSONImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json.qubits || !Array.isArray(json.gates)) {
          alert("Invalid JSON: Must contain {qubits, gates}");
          return;
        }
        setActiveCircuit(json);
        alert("Circuit imported successfully!");
      } catch {
        alert("Invalid JSON format.");
      }
    };

    reader.readAsText(file);
  };

  function exportJSON() {
    const blob = new Blob([JSON.stringify(activeCircuit, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "circuit.json";
    a.click();
  }

  function addQubit() {
    setActiveCircuit((prev) => ({
      ...prev,
      qubits: prev.qubits + 1,
    }));
  }

  function removeQubit() {
    setActiveCircuit((prev) => {
      if (prev.qubits <= 1) {
        alert("At least 1 qubit required");
        return prev;
      }

      return {
        ...prev,
        qubits: prev.qubits - 1,
        gates: prev.gates.filter(
          (g) =>
            g.qubit !== prev.qubits - 1 &&
            g.control !== prev.qubits - 1 &&
            g.target !== prev.qubits - 1,
        ),
      };
    });
  }

  function resetCircuit() {
    setActiveCircuit({ qubits: 1, gates: [] });
  }

  function addGate() {
    const newGate =
      gateType === "cnot"
        ? {
            type: "cnot",
            control: Number(gateControl),
            target: Number(gateTarget),
            t: Number(gateTime),
          }
        : {
            type: gateType,
            qubit: Number(gateQubit),
            t: Number(gateTime),
          };

    setActiveCircuit((prev) => ({
      ...prev,
      gates: [...prev.gates, newGate],
    }));
  }

  useEffect(() => {
    function drawCircuit(c) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const spacingX = 80;
      const spacingY = 60;
      const maxTime = getMaxTime(c);
      const width = maxTime * spacingX + 200;
      const height = c.qubits * spacingY + 120;

      svg.attr("viewBox", `0 0 ${width} ${height}`).style("width", svgWidth);

      for (let t = 0; t <= maxTime; t++) {
        const x = 100 + spacingX * t;
        svg.append("text").attr("x", x).attr("y", 20).text(`t=${t}`);
        svg
          .append("line")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", 30)
          .attr("y2", height - 30)
          .attr("stroke", "#ddd")
          .attr("stroke-dasharray", "4 4");
      }

      [...Array(c.qubits).keys()].forEach((q) => {
        const y = 60 + q * spacingY;

        svg
          .append("text")
          .attr("x", 20)
          .attr("y", y + 5)
          .text(`q${q}`);

        svg
          .append("line")
          .attr("x1", 60)
          .attr("x2", width - 30)
          .attr("y1", y)
          .attr("y2", y)
          .attr("stroke", "#222")
          .attr("stroke-width", 2);
      });

      c.gates.forEach((g) => {
        const x = 100 + g.t * spacingX;

        if (g.type === "h" || g.type === "x") {
          const y = 60 + g.qubit * spacingY;
          svg
            .append("rect")
            .attr("x", x - 20)
            .attr("y", y - 20)
            .attr("width", 40)
            .attr("height", 40)
            .attr("fill", "white")
            .attr("stroke", "black");

          svg
            .append("text")
            .attr("x", x)
            .attr("y", y + 5)
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .text(g.type.toUpperCase());
        }

        if (g.type === "cnot") {
          const yC = 60 + g.control * spacingY;
          const yT = 60 + g.target * spacingY;

          svg.append("circle").attr("cx", x).attr("cy", yC).attr("r", 7).attr("fill", "black");
          svg
            .append("line")
            .attr("x1", x)
            .attr("x2", x)
            .attr("y1", yC)
            .attr("y2", yT)
            .attr("stroke", "black");

          svg
            .append("circle")
            .attr("cx", x)
            .attr("cy", yT)
            .attr("r", 12)
            .attr("stroke", "black")
            .attr("fill", "white");

          svg
            .append("line")
            .attr("x1", x - 8)
            .attr("x2", x + 8)
            .attr("y1", yT)
            .attr("y2", yT)
            .attr("stroke", "black");

          svg
            .append("line")
            .attr("x1", x)
            .attr("x2", x)
            .attr("y1", yT - 8)
            .attr("y2", yT + 8)
            .attr("stroke", "black");
        }
      });
    }

    drawCircuit(activeCircuit);
  }, [activeCircuit]);

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <h2>Quantum Circuit Visualizer</h2>

      <button onClick={() => document.getElementById("qc-import").click()}>Import JSON</button>
      <input
        id="qc-import"
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleJSONImport}
      />

      <svg ref={svgRef}></svg>

      <br />
      <button onClick={exportJSON}>Export JSON</button>

      <div style={{ marginTop: "20px" }}>
        <h3>Modify Circuit</h3>

        <button onClick={addQubit}>Add Qubit</button>
        <button onClick={removeQubit}>Remove Qubit</button>
        <button onClick={resetCircuit}>Reset</button>

        <div>
          <label>
            Gate Type:{" "}
            <select value={gateType} onChange={(e) => setGateType(e.target.value)}>
              <option value="h">H</option>
              <option value="x">X</option>
              <option value="cnot">CNOT</option>
            </select>
          </label>

          <label>
            Time:{" "}
            <input type="number" value={gateTime} onChange={(e) => setGateTime(e.target.value)} />
          </label>

          {gateType !== "cnot" ? (
            <label>
              Qubit:{" "}
              <input
                type="number"
                value={gateQubit}
                onChange={(e) => setGateQubit(e.target.value)}
              />
            </label>
          ) : (
            <>
              <label>
                Control:{" "}
                <input
                  type="number"
                  value={gateControl}
                  onChange={(e) => setGateControl(e.target.value)}
                />
              </label>

              <label>
                Target:{" "}
                <input
                  type="number"
                  value={gateTarget}
                  onChange={(e) => setGateTarget(e.target.value)}
                />
              </label>
            </>
          )}

          <button onClick={addGate}>Add Gate</button>
        </div>
      </div>
    </div>
  );
}
