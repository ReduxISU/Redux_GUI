import React, { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import { openqasmToQText } from "./openqasmToQText";

const QuantumCircuitVis = ({
  problemData,
  useSolutionCircuit = false,
  // Unused today but kept for signature parity with other visualizations
  solve,
  url,
  gadgetMap,
  gadgetsOn,
}) => {
  const [qReady, setQReady] = useState(false);
  const containerRef = useRef(null);

  // 1) Get the OpenQASM string from problemData; prefer solution circuit when requested
  function extractOpenQasm(raw, useSolution) {
    let data = raw;

    // If we were passed an array of frames, pick the first one that has QASM
    if (Array.isArray(data)) {
      const candidate = data.find(
        (f) =>
          (useSolution && (f?.solution?.openQasm || f?.solution?.qasm)) ||
          f?.openQasm ||
          f?.qasm ||
          f?.openqasm
      );
      if (candidate) data = candidate;
    }

    // If it's a JSON string, try to parse it
    if (typeof data === "string") {
      const trimmed = data.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          data = JSON.parse(trimmed);
        } catch {
          // treat raw string as the qasm itself
          return trimmed;
        }
      } else {
        return trimmed;
      }
    }

    // If there's a string payload, try to parse it as JSON; otherwise, treat it as QASM text
    if (data && typeof data === "object" && typeof data.payload === "string") {
      const payloadStr = data.payload.trim();
      if (payloadStr.startsWith("{") || payloadStr.startsWith("[")) {
        try {
          data = JSON.parse(payloadStr);
        } catch {
          // keep existing data; fall back to fields below
        }
      } else {
        // payload is raw QASM text
        return payloadStr;
      }
    }

    // At this point, data is either an object or undefined
    const fromSolution = data?.solution?.openQasm || data?.solution?.qasm;
    const fromMain =
      data?.openQasm ||
      data?.qasm ||
      data?.openqasm ||
      data?.circuitQasm ||
      data?.qasmText;

    if (useSolution && fromSolution) return fromSolution;
    if (fromMain) return fromMain;
    if (fromSolution) return fromSolution;
    return "";
  }

  const openQasm = extractOpenQasm(problemData, useSolutionCircuit);
  console.log("QJS problemData", problemData);
  console.log("QJS openQasm", openQasm);

  // Pull a human-readable solution string from the incoming data
  const solutionText = useMemo(() => {
    const serialize = (val) => {
      if (val === undefined || val === null) return "";
      if (typeof val === "string") return val.trim();
      if (typeof val === "number" || typeof val === "boolean") return String(val);
      return JSON.stringify(val);
    };

    const getField = (obj) => {
      if (!obj || typeof obj !== "object") return "";
      return (
        obj.solution ??
        obj.solutionText ??
        obj.solution_string ??
        obj.answer ??
        obj.result ??
        ""
      );
    };

    let data = problemData;

    // If array of frames, prefer the first that carries a solution-like field
    if (Array.isArray(data)) {
      const found = data.find((frame) => getField(frame));
      if (found) return serialize(getField(found));
      data = data[0];
    }

    // If raw JSON string, try to parse it
    if (typeof data === "string") {
      const trimmed = data.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          data = JSON.parse(trimmed);
        } catch {
          return "";
        }
      }
    }

    // If payload holds JSON, parse and fall through
    if (data && typeof data === "object" && typeof data.payload === "string") {
      const payloadStr = data.payload.trim();
      if (payloadStr.startsWith("{") || payloadStr.startsWith("[")) {
        try {
          data = JSON.parse(payloadStr);
        } catch {
          // ignore parse error, fall back to payload string below
        }
      } else if (payloadStr) {
        return serialize(payloadStr);
      }
    }

    return serialize(getField(data));
  }, [problemData]);

  // 2) Convert QASM to Q.js text
  const qText = useMemo(() => {
    if (!openQasm) return "// No OpenQASM found in problemData";
    try {
      return openqasmToQText(openQasm);
    } catch (err) {
      console.error(err);
      return `// Failed to parse OpenQASM:\n// ${err.message}`;
    }
  }, [openQasm]);

  // If Q.js is already on the page (e.g., returning to this view), mark ready immediately
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Q || globalThis.Q) {
      if (!window.Q && globalThis.Q) window.Q = globalThis.Q;
      setQReady(true);
    }
  }, []);

  // 3) When Q.js is ready and we have qText, render the circuit
  useEffect(() => {
    if (!qReady) return;
    if (typeof window === "undefined") return;
    if (!containerRef.current) return;
    if (!openQasm || !qText || qText.startsWith("// No OpenQASM")) {
      containerRef.current.textContent = "No OpenQASM found in problemData";
      return;
    }

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

      // Use Q's text-as-circuit API
      const circuit = window.Q(normalized);

      console.log("Q.js circuit object:", circuit);

      if (circuit && typeof circuit.toDom === "function") {
        const dom = circuit.toDom();
        console.log("Q.js circuit DOM:", dom);
        containerRef.current.appendChild(dom);

        // Keep the visual static: hide toolbar/lock button and disable interaction
        dom.classList.add("Q-circuit-locked");
        const toolbar = dom.querySelector(".Q-circuit-toolbar");
        if (toolbar) toolbar.remove();
        const board = dom.querySelector(".Q-circuit-board");
        if (board) {
          board.style.pointerEvents = "auto";
          board.style.userSelect = "none";
        }
      } else {
        console.warn("circuit.toDom is not a function; showing text instead");
        const pre = document.createElement("pre");
        pre.textContent =
          circuit && circuit.toText
            ? circuit.toText()
            : "Circuit created but no toDom() available.";
        containerRef.current.appendChild(pre);
      }
    } catch (err) {
      console.error("Error rendering Q.js circuit:", err);
      containerRef.current.textContent =
        "Error rendering circuit: " + err.message;
    }
  }, [qReady, qText, openQasm]);

  return (
    <div style={{ padding: "1rem", maxWidth: 900 }}>
      {/* Load the local Q.js file from /public/q.js */}
      <Script
        src="/q.js"
        strategy="afterInteractive"
        onReady={() => {
          if (!window.Q && globalThis.Q) window.Q = globalThis.Q;
          setQReady(true);
        }}
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

          // Define a custom 4-qubit "Q" gate for visualization
          const Qjs = window.Q;

          // Only create it once
          if (!Qjs.Gate.findBySymbol("Q")) {
            const fourQubitDim = 16; // 2^4
            const identity4Q = Qjs.Matrix.createIdentity(fourQubitDim);

            const groverQGate = new Qjs.Gate({
              symbol: "Q",
              name: "Grover iteration",
              nameCss: "grover-iteration",
              matrix: identity4Q, // behaves like identity, just for display
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
      {!qReady && <p>Loading Q.js circuit library...</p>}
      <div
        ref={containerRef}
        style={{
          border: "1px solid #ccc",
          padding: "0.5rem",
          minHeight: "80px",
          overflowX: "auto",
        }}
      />
      <p style={{ marginTop: "0.75rem" }}>
        Solution: {solutionText || "Not provided"}
      </p>
    </div>
  );
};

export default QuantumCircuitVis;
