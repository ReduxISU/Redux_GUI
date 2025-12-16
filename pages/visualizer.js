// pages/visualizer.js
import React from "react";
import QuantumCircuitVisualizer from "../components/Quantum/QuantumCircuitVisualizer";

export default function VisualizerPage() {
  return (
    <div style={{ padding: "20px" }}>
      <QuantumCircuitVisualizer
        circuit={{
          qubits: 2,
          gates: [
            { type: "h", qubit: 0, t: 0 },
            { type: "x", qubit: 1, t: 1 },
            { type: "cnot", control: 0, target: 1, t: 2 },
          ],
        }}
      />
    </div>
  );
}
