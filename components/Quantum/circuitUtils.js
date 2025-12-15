// components/Quantum/circuitUtils.js
export function getMaxTime(circuit) {
  if (!circuit?.gates || circuit.gates.length === 0) return 0;
  return Math.max(...circuit.gates.map((g) => g.t));
}