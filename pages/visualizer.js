// pages/visualizer.js
import React from "react";
import QuantumCircuitVisualizer from "../components/Quantum/QuantumCircuitVisualizer";

const SHOW_QUANTUM_VIS = false;

export default function VisualizerPage() {
  if (!SHOW_QUANTUM_VIS) return null;
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
