import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import styles from "./QuantumStyles.module.css";
import { getMaxTime } from "./circuitUtils";

/*
****************************************************************
 QuantumCircuitVisualizer
 - Renders any quantum circuit as SVG using D3
 - Features: Import, Export, Add Gate, Add/Remove Qubit, Reset
 - NEW: User zoom slider + custom width control
 - Fully interactive with hover tooltips + gate selection
******************************************************************
*/

export default function QuantumCircuitVisualizer({ circuit }) {
  const svgRef = useRef();

  // Currently active circuit (imported OR default)
  const [activeCircuit, setActiveCircuit] = useState(circuit);

  // Zoom and width UI controls
  const [svgWidth, setSvgWidth] = useState("100%");
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Gate form inputs
  const [gateType, setGateType] = useState("h");
  const [gateQubit, setGateQubit] = useState(0);
  const [gateTime, setGateTime] = useState(0);
  const [gateControl, setGateControl] = useState(0);
  const [gateTarget, setGateTarget] = useState(1);

  // Selected gate for highlighting
  const [selectedGate, setSelectedGate] = useState(null);

  /*
  ****************************************************************
    Allow user to import JSON file that defines the circuit
  ******************************************************************
  */
  const handleJSONImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);

        if (!json.qubits || !Array.isArray(json.gates)) {
          alert("Invalid JSON: Must contain { qubits, gates }");
          return;
        }

        setActiveCircuit(json);
        setSelectedGate(null);
        alert("Circuit imported successfully!");
      } catch (err) {
        alert("Invalid JSON file format.");
      }
    };

    reader.readAsText(file);
  };

  /*
  ****************************************************************
    Allow user to export PNG, SVG, JSON file of the generated circuit
  ******************************************************************
  */
  function exportSVG() {
    const svg = svgRef.current;
    const xml = new XMLSerializer().serializeToString(svg);

    const blob = new Blob([xml], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "circuit.svg";
    a.click();

    URL.revokeObjectURL(url);
  }

  function exportPNG() {
    const svg = svgRef.current;
    const xml = new XMLSerializer().serializeToString(svg);

    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(xml);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svg.clientWidth * 2;
      canvas.height = svg.clientHeight * 2;

      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);

      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "circuit.png";
      a.click();
    };
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(activeCircuit, null, 2)], {
      type: "application/json",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "circuit.json";
    a.click();
  }

  /*
  ****************************************************************
    Allow user to add a qubit based on their problem
  ******************************************************************
  */
  function addQubit() {
    const updated = { ...activeCircuit };
    updated.qubits += 1;
    setActiveCircuit(updated);
  }

  /*
  ****************************************************************
    Allow users to remove a qubit 
  ******************************************************************
  */
  function removeQubit() {
    if (activeCircuit.qubits <= 1) {
      alert("You need at least 1 qubit.");
      return;
    }

    const updated = { ...activeCircuit };
    updated.qubits -= 1;

    // Remove gates touching removed qubit
    updated.gates = updated.gates.filter(
      (g) =>
        g.qubit !== updated.qubits &&
        g.control !== updated.qubits &&
        g.target !== updated.qubits
    );

    setActiveCircuit(updated);
    setSelectedGate(null);
  }

  /*
  ****************************************************************
    Reset the entire circuit and start over
  ******************************************************************
  */
  function resetCircuit() {
    setActiveCircuit({ qubits: 1, gates: [] });
    setSelectedGate(null);
  }

  /*
  ****************************************************************
    Allow users to add gates to the circuit
  ******************************************************************
  */
  function addGate() {
    const updated = { ...activeCircuit };
    const q = Number(gateQubit);
    const t = Number(gateTime);

    if (q < 0 || q >= updated.qubits) {
      alert("Invalid qubit index.");
      return;
    }
    if (t < 0) {
      alert("Time must be >= 0");
      return;
    }

    if (gateType === "cnot") {
      const c = Number(gateControl);
      const target = Number(gateTarget);

      if (c < 0 || c >= updated.qubits) {
        alert("Invalid control qubit.");
        return;
      }
      if (c === target) {
        alert("Control and target cannot be the same.");
        return;
      }

      updated.gates.push({
        type: "cnot",
        control: c,
        target,
        t,
      });
    } else {
      updated.gates.push({
        type: gateType,
        qubit: q,
        t,
      });
    }

    setActiveCircuit(updated);
  }

  /*
  ****************************************************************
  Draw circuit using D3  (includes width control + zoom)
  ******************************************************************
  */
  function drawCircuit(c) {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (!c) return;

    const maxTime = getMaxTime(c);
    const spacingX = 80;
    const spacingY = 60;
    const width = maxTime * spacingX + 200;
    const height = c.qubits * spacingY + 120;

    // Responsive with user-controlled width & zoom
    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", svgWidth)
      .style("height", "auto")
      .attr("transform", `scale(${zoomLevel})`);

    // Tooltip
    const tooltip = d3.select("#qc-tooltip");

    const showTooltip = (text, event) => {
      tooltip
        .style("visibility", "visible")
        .style("top", event.pageY - 40 + "px")
        .style("left", event.pageX + 10 + "px")
        .text(text);
    };

    const hideTooltip = () => {
      tooltip.style("visibility", "hidden");
    };

    /*
    ****************************************************************
      Animated Time Grid
    ******************************************************************
    */
    for (let t = 0; t <= maxTime; t++) {
      const x = 100 + t * spacingX;

      svg
        .append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", 30)
        .attr("y2", height - 30)
        .attr("stroke", "#ccc")
        .attr("stroke-dasharray", "4 4")
        .attr("opacity", 0)
        .transition()
        .duration(350)
        .delay(t * 100)
        .attr("opacity", 1);

      svg
        .append("text")
        .attr("x", x)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text(`t=${t}`)
        .attr("opacity", 0)
        .transition()
        .duration(350)
        .delay(t * 100)
        .attr("opacity", 1);
    }

    /*
    ****************************************************************
      Draw Qubit Lines
    ******************************************************************
    */
    [...Array(c.qubits).keys()].forEach((q, i) => {
      const y = 50 + i * spacingY;

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

    /*
    ****************************************************************
      Draw Gates in the circuit
    ******************************************************************
    */
    c.gates.forEach((g) => {
      const x = 100 + g.t * spacingX;

      const isSelected =
        selectedGate &&
        selectedGate.type === g.type &&
        selectedGate.t === g.t &&
        selectedGate.qubit === g.qubit &&
        selectedGate.control === g.control &&
        selectedGate.target === g.target;

      /* H and X Gates */
      if (g.type === "h" || g.type === "x") {
        const y = 50 + g.qubit * spacingY;

        svg
          .append("rect")
          .attr("x", x - 20)
          .attr("y", y - 20)
          .attr("width", 40)
          .attr("height", 40)
          .attr("fill", "white")
          .attr("stroke", isSelected ? "#ff9900" : "black")
          .attr("stroke-width", isSelected ? 3 : 2)
          .on("mouseover", (e) =>
            showTooltip(
              `${g.type.toUpperCase()} gate — q${g.qubit}, t=${g.t}`,
              e
            )
          )
          .on("mouseout", hideTooltip)
          .on("click", () => setSelectedGate(g));

        svg
          .append("text")
          .attr("x", x)
          .attr("y", y + 5)
          .attr("text-anchor", "middle")
          .attr("font-weight", "bold")
          .text(g.type.toUpperCase());
      }

      /* CNOT Gates */
      if (g.type === "cnot") {
        const yC = 50 + g.control * spacingY;
        const yT = 50 + g.target * spacingY;

        svg
          .append("circle")
          .attr("cx", x)
          .attr("cy", yC)
          .attr("r", 7)
          .attr("fill", isSelected ? "#ff9900" : "black")
          .on("mouseover", (e) =>
            showTooltip(`CNOT control — q${g.control}, t=${g.t}`, e)
          )
          .on("mouseout", hideTooltip)
          .on("click", () => setSelectedGate(g));

        svg
          .append("line")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", yC)
          .attr("y2", yT)
          .attr("stroke", "black")
          .attr("stroke-width", 2);

        svg
          .append("circle")
          .attr("cx", x)
          .attr("cy", yT)
          .attr("r", 12)
          .attr("stroke", isSelected ? "#ff9900" : "black")
          .attr("stroke-width", isSelected ? 3 : 2)
          .attr("fill", "white")
          .on("mouseover", (e) =>
            showTooltip(`CNOT target — q${g.target}, t=${g.t}`, e)
          )
          .on("mouseout", hideTooltip)
          .on("click", () => setSelectedGate(g));

        // Plus sign
        svg
          .append("line")
          .attr("x1", x - 8)
          .attr("x2", x + 8)
          .attr("y1", yT)
          .attr("y2", yT)
          .attr("stroke", "black")
          .attr("stroke-width", 2);

        svg
          .append("line")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", yT - 8)
          .attr("y2", yT + 8)
          .attr("stroke", "black")
          .attr("stroke-width", 2);
      }
    });
  }

  /*
  ****************************************************************
    Re-render the circuit whenever data changes
  ******************************************************************
  */
  useEffect(() => {
    drawCircuit(activeCircuit);
  }, [activeCircuit, selectedGate, svgWidth, zoomLevel]);

  /*
  ****************************************************************
    User interfaces with import, export, modify changes in the circuit and zoom in or out.
  ******************************************************************
  */
  return (
    <div className={styles.quantumContainer} style={{ width: "100%" }}>
      <h2>Quantum Circuit Visualizer</h2>

      {/* IMPORT JSON */}
      <button onClick={() => document.getElementById("qc-import").click()}>
        Import JSON
      </button>
      <input
        id="qc-import"
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleJSONImport}
      />

      {/* Circuit SVG */}
      <svg ref={svgRef}></svg>

      {/* Tooltip */}
      <div
        id="qc-tooltip"
        style={{
          position: "absolute",
          padding: "6px 10px",
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "5px",
          fontSize: "12px",
          pointerEvents: "none",
          visibility: "hidden",
          zIndex: 10,
        }}
      ></div>

      {/* Export buttons */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={exportSVG}>Export SVG</button>
        <button onClick={exportPNG}>Export PNG</button>
        <button onClick={exportJSON}>Export JSON</button>
      </div>

      {/* Controls for width and zoom */}
      <div style={{ marginTop: "25px" }}>
        <h3>View Controls</h3>

        <label>
          Circuit Width (px or %):
          <input
            type="text"
            value={svgWidth}
            onChange={(e) => setSvgWidth(e.target.value)}
            style={{ marginLeft: "10px", width: "120px" }}
          />
        </label>

        <br />
        <br />

        <label>
          Zoom: {zoomLevel.toFixed(1)}x
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            style={{ width: "250px", marginLeft: "15px" }}
          />
        </label>
      </div>

      {/* MODIFY CIRCUIT */}
      <div style={{ marginTop: "25px" }}>
        <h3>Modify Circuit</h3>

        {/* ADD QUBIT / REMOVE QUBIT / RESET */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <button onClick={addQubit}>Add Qubit</button>
          <button onClick={removeQubit}>Remove Qubit</button>
          <button onClick={resetCircuit}>Reset Circuit</button>
        </div>

        {/* ADD GATE FORM */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label>
            Gate Type:
            <select
              value={gateType}
              onChange={(e) => setGateType(e.target.value)}
            >
              <option value="h">H</option>
              <option value="x">X</option>
              <option value="cnot">CNOT</option>
            </select>
          </label>

          <label>
            Time (t):
            <input
              type="number"
              value={gateTime}
              onChange={(e) => setGateTime(e.target.value)}
            />
          </label>

          {gateType !== "cnot" && (
            <label>
              Qubit:
              <input
                type="number"
                value={gateQubit}
                onChange={(e) => setGateQubit(e.target.value)}
              />
            </label>
          )}

          {gateType === "cnot" && (
            <>
              <label>
                Control Qubit:
                <input
                  type="number"
                  value={gateControl}
                  onChange={(e) => setGateControl(e.target.value)}
                />
              </label>

              <label>
                Target Qubit:
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
