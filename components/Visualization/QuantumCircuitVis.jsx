import React, { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import { openqasmToQText } from "./openqasmToQText";

const QuantumCircuitVis = ({ problemData }) => {
  const [qReady, setQReady] = useState(false);
  const containerRef = useRef(null);

  // 1) Get the OpenQASM string from problemData
  const openQasm =
    problemData?.openQasm ||
    problemData?.solution?.openQasm ||
    problemData?.qasm ||
    "";

  // 2) Convert QASM → Q.js text
  const qText = useMemo(() => {
    if (!openQasm) return "// No OpenQASM found in problemData";
    try {
      return openqasmToQText(openQasm);
    } catch (err) {
      console.error(err);
      return `// Failed to parse OpenQASM:\n// ${err.message}`;
    }
  }, [openQasm]);

  // 3) When Q.js is ready and we have qText, render the circuit
  useEffect(() => {
    if (!qReady) return;
    if (typeof window === "undefined") return;
    if (!containerRef.current) return;

    // clear whatever was there before
    containerRef.current.innerHTML = "";

    if (!window.Q) {
      console.error("Q.js is not available on window");
      containerRef.current.textContent = "Q.js library not available.";
      return;
    }

    try {
      // normalize line endings just in case
      const normalized = qText.replace(/\r\n/g, "\n").trim();

      console.log("qText for Q.js:\n", normalized);
      console.log("window.Q =", window.Q);

      // 👉 Use Q’s “text as circuit” API:
      // In the docs they write Q` ...text... `.
      // When we have a plain string, the function form Q(text) does the same parse.
      const circuit = window.Q(normalized);

      console.log("Q.js circuit object:", circuit);

      if (circuit && typeof circuit.toDom === "function") {
        const dom = circuit.toDom();
        console.log("Q.js circuit DOM:", dom);
        containerRef.current.appendChild(dom);
      } else {
        console.warn("circuit.toDom is not a function; showing text instead");
        const pre = document.createElement("pre");
        pre.textContent = circuit && circuit.toText
          ? circuit.toText()
          : "Circuit created but no toDom() available.";
        containerRef.current.appendChild(pre);
      }
    } catch (err) {
      console.error("Error rendering Q.js circuit:", err);
      containerRef.current.textContent =
        "Error rendering circuit: " + err.message;
    }
  }, [qReady, qText]);

  return (
    <div style={{ padding: "1rem", maxWidth: 900 }}>
      {/* Load the local Q.js file from /public/q.js */}
      <Script
        src="/q.js"
        strategy="afterInteractive"
        onLoad={() => {
            console.log("Q.js script loaded. window.Q =", window.Q);

            if (!window.Q && globalThis.Q) {
            window.Q = globalThis.Q;
            console.log("Patched window.Q from globalThis.Q");
            }

            if (!window.Q) {
            console.error("Q.js failed to attach Q() to window.");
            setQReady(true);
            return;
            }

            // --- Define a custom 4-qubit “Q” gate for visualization ---
            const Qjs = window.Q;

            // Only create it once
            if (!Qjs.Gate.findBySymbol("Q")) {
            const fourQubitDim = 16; // 2^4
            const identity4Q = Qjs.Matrix.createIdentity(fourQubitDim);

            const groverQGate = new Qjs.Gate({
                symbol: "Q",
                name: "Grover iteration",
                nameCss: "grover-iteration", // CSS class name
                matrix: identity4Q          // behaves like identity, just for display
            });

            Qjs.Gate.createConstant("GROVER_Q", groverQGate);
            console.log("Custom Q gate registered with Q.js");
            }

            setQReady(true);
        }}
        />



      <h3>Quantum Circuit (Q.js format)</h3>
      <p style={{ marginBottom: "0.5rem" }}>
        You can still copy this text into{" "}
        <a
          href="https://quantumjavascript.app/playground.html"
          target="_blank"
          rel="noreferrer"
        >
          the Q.js playground
        </a>
        , but the live circuit is rendered below.
      </p>

      <textarea
        readOnly
        value={qText}
        rows={4}
        style={{
          width: "100%",
          fontFamily: "monospace",
          fontSize: "0.9rem",
          marginBottom: "1rem",
        }}
      />

      <h4>Embedded Quantum Circuit</h4>
      {!qReady && <p>Loading Q.js circuit library…</p>}
      <div
        ref={containerRef}
        style={{
          border: "1px solid #ccc",
          padding: "0.5rem",
          minHeight: "80px",
          overflowX: "auto",
        }}
      />
    </div>
  );
};

export default QuantumCircuitVis;

