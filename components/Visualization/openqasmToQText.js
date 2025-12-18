// components/Visualization/openqasmToQText.js

// All gate *symbols* that actually exist in Q.Gate.constants
const QJS_SYMBOLS = new Set([
  "I", "*", "M", "H", "X", "Y", "Z", "P", "T", "B", "S", "√S", "Q"
]);

// Map from OpenQASM gate name -> Q.js gate symbol
// (multi-qubit vs single-qubit is determined by how many qubits we apply it to)
const QASM_TO_QJS_SYMBOL = {
  // existing stuff...
  h: "H",
  x: "X",
  y: "Y",
  z: "Z",
  t: "T",
  cx: "X",
  cz: "Z",
  ccx: "X",
  swap: "S",

  // All your Grover-style macros map to a single visual Q gate
  gate_q: "Q",
  gate_q_4505047632: "Q",
  gate_q_4505045840: "Q",
  gate_q_4505048912: "Q",
  gate_q_4505050448: "Q"
};


// Helper: look up a Q.js symbol for a QASM gate name
function lookupSymbol(qasmName) {
  const key = qasmName.toLowerCase();
  const symbol = QASM_TO_QJS_SYMBOL[key];
  if (!symbol) return null;
  if (!QJS_SYMBOLS.has(symbol)) return null;
  return symbol;
}

// Helper: parse "q[0],q[1],q[2]" into [0,1,2]
function parseQubitList(argString) {
  return argString
    .split(",")
    .map((s) => s.trim())
    .map((s) => {
      const m = s.match(/q\[(\d+)\]/i);
      if (!m) throw new Error(`Cannot parse qubit index from "${s}"`);
      return parseInt(m[1], 10);
    });
}

export function openqasmToQText(qasm) {
  const lines = qasm
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"));

  // Find "qreg q[N];"
  const qregLine = lines.find((l) => l.startsWith("qreg "));
  if (!qregLine) throw new Error("No qreg line found in QASM");

  const matchQreg = qregLine.match(/qreg\s+q\[(\d+)\];/i);
  if (!matchQreg) throw new Error("Could not parse qreg line");
  const numQubits = parseInt(matchQreg[1], 10);

  // rows[q][t] = gate symbol at (qubit q, time t)
  const rows = Array.from({ length: numQubits }, () => []);
  let time = 0;

  function ensureAllRowsHaveMoment(t) {
    for (const row of rows) {
      while (row.length < t) row.push("I");
    }
  }

  for (const line of lines) {
    // Skip boilerplate and gate *definitions* (we only care about uses)
    if (
      line.startsWith("OPENQASM") ||
      line.startsWith("include") ||
      line.startsWith("qreg") ||
      line.startsWith("creg") ||
      line.startsWith("barrier") ||
      line.startsWith("gate ")
    ) {
      continue;
    }

    let m;

    // ------------------------------------------------------------------
    // Measurement:  measure q[i] -> c[j];
    // ------------------------------------------------------------------
    if (
      (m = line.match(
        /^measure\s+q\[(\d+)\]\s*->\s*[a-zA-Z_]\w*\[(\d+)\];/i
      ))
    ) {
      const qIndex = parseInt(m[1], 10);
      time++;
      ensureAllRowsHaveMoment(time);
      rows[qIndex][time - 1] = "M";
      continue;
    }

    // ------------------------------------------------------------------
    // Parameterised gates like "p(pi/8) q[0];"
    // Currently we *skip* all of these, but log them.
    // ------------------------------------------------------------------
    if (
      /^([a-zA-Z][a-zA-Z0-9_]*)\s*\(.*\)\s+q\[\d+\]/.test(line)
    ) {
      console.warn("Skipping parameterised gate (not supported in Q.js text):", line);
      continue;
    }

    // ------------------------------------------------------------------
    // 1-qubit gate:   name q[i];
    // ------------------------------------------------------------------
    if (
      (m = line.match(
        /^([a-zA-Z][a-zA-Z0-9_]*)\s+q\[(\d+)\];$/
      ))
    ) {
      const gateName = m[1];
      const qIndex = parseInt(m[2], 10);
      const symbol = lookupSymbol(gateName);

      if (!symbol) {
        console.warn("Skipping unsupported 1-qubit gate:", gateName, "in line:", line);
        continue;
      }

      time++;
      ensureAllRowsHaveMoment(time);
      rows[qIndex][time - 1] = symbol;
      continue;
    }

    // ------------------------------------------------------------------
    // SPECIAL CASE: auto-generated Grover Q gates
    //    gate_Q_12345678 q[0],q[1],q[2],q[3];
    // ------------------------------------------------------------------
    if (
      (m = line.match(
        /^(gate_Q_[A-Za-z0-9_]+)\s+((?:q\[\d+\]\s*,\s*)*q\[\d+\]);$/
      ))
    ) {
      const gateName = m[1];          // eg "gate_Q_4505047632" (not really used)
      const qubits = parseQubitList(m[2]); // [0,1,2,3,...]

      const symbol = "Q"; // our custom multi-qubit Grover gate symbol

      time++;
      ensureAllRowsHaveMoment(time);

      qubits.forEach((qIndex, idx) => {
        // Q.js multi-qubit syntax: Q#0, Q#1, ...
        rows[qIndex][time - 1] = `${symbol}#${idx}`;
      });

      continue; // we handled this line, skip to next one
    }


    // ------------------------------------------------------------------
    // Multi-qubit gate:  name q[a],q[b],q[c],...
    // ------------------------------------------------------------------
    // name q[a],q[b],q[c],...
    if (
      (m = line.match(
        /^([a-zA-Z][a-zA-Z0-9_]*)\s+((?:q\[\d+\]\s*,\s*)*q\[\d+\]);$/
      ))
    ) {
      const gateName = m[1];
      const qubits = parseQubitList(m[2]);
      const symbol = lookupSymbol(gateName);

      if (!symbol) {
        console.warn("Skipping unsupported multi-qubit gate:", gateName);
        continue;
      }

      time++;
      ensureAllRowsHaveMoment(time);

      if (symbol === "Q") {
        // 🔮 Oracle style: draw a Q box on *every* wire at this moment,
        // no controls / targets, so it looks like one tall Q block.
        qubits.forEach((qIndex) => {
          rows[qIndex][time - 1] = "Q";
        });
      } else {
        // Default behavior: real multi-qubit gate → controls + target
        qubits.forEach((qIndex, idx) => {
          rows[qIndex][time - 1] = `${symbol}#${idx}`;
        });
      }

      continue;
    }

    // If we got here, we don't recognize this line.
    console.warn("Unrecognized/unsupported QASM line:", line);
  }

  // Fill any remaining holes with identity
  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      if (!row[i]) row[i] = "I";
    }
  }

  // Convert table into Q.js text format
  return rows
    .map((row) => row.join("-"))
    .join("\n");
}
