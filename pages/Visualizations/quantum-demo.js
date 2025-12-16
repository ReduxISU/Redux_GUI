import React from "react";
import QuantumCircuitVis from "../../components/Visualization/QuantumCircuitVis";

const sampleQasm = `OPENQASM 2.0;
include "qelib1.inc";
gate ccz q0,q1,q2 { h q2; ccx q0,q1,q2; h q2; }
gate ccz_o0 q0,q1,q2 { x q0; x q1; ccz q0,q1,q2; x q0; x q1; }
gate mcx q0,q1,q2,q3 { h q3; p(pi/8) q0; p(pi/8) q1; p(pi/8) q2; p(pi/8) q3; cx q0,q1; p(-pi/8) q1; cx q0,q1; cx q1,q2; p(-pi/8) q2; cx q0,q2; p(pi/8) q2; cx q1,q2; p(-pi/8) q2; cx q0,q2; cx q2,q3; p(-pi/8) q3; cx q1,q3; p(pi/8) q3; cx q2,q3; p(-pi/8) q3; cx q0,q3; p(pi/8) q3; cx q2,q3; p(-pi/8) q3; cx q1,q3; p(pi/8) q3; cx q2,q3; p(-pi/8) q3; cx q0,q3; h q3; }
gate c3z q0,q1,q2,q3 { h q3; mcx q0,q1,q2,q3; h q3; }
gate c3z_o6 q0,q1,q2,q3 { x q0; c3z q0,q1,q2,q3; x q0; }
gate gate_Phase_Oracle q0,q1,q2,q3 { x q2; ccz_o0 q0,q1,q2; x q2; c3z_o6 q0,q1,q2,q3; x q3; ccz q0,q2,q3; x q3; }
gate gate_Q q0,q1,q2,q3 { gate_Phase_Oracle q0,q1,q2,q3; h q3; h q2; h q1; h q0; x q0; x q1; x q2; x q3; h q3; mcx q0,q1,q2,q3; h q3; x q0; x q1; x q2; x q3; h q0; h q1; h q2; h q3; }
gate gate_Q_4505047632 q0,q1,q2,q3 { gate_Q q0,q1,q2,q3; }
gate gate_Q_4505045840 q0,q1,q2,q3 { gate_Q q0,q1,q2,q3; }
gate gate_Q_4505048912 q0,q1,q2,q3 { gate_Q q0,q1,q2,q3; }
gate gate_Q_4505050448 q0,q1,q2,q3 { gate_Q q0,q1,q2,q3; }
qreg q[4];
creg c1[4];
h q[0];
h q[1];
h q[2];
h q[3];
gate_Q_4505047632 q[0],q[1],q[2],q[3];
gate_Q_4505045840 q[0],q[1],q[2],q[3];
gate_Q_4505048912 q[0],q[1],q[2],q[3];
gate_Q_4505050448 q[0],q[1],q[2],q[3];
measure q[0] -> c1[0];
measure q[1] -> c1[1];
measure q[2] -> c1[2];
measure q[3] -> c1[3];`;

export default function QuantumDemoPage() {
  const problemData = { openQasm: sampleQasm };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Quantum Circuit Demo</h2>
      <QuantumCircuitVis problemData={problemData} />
    </div>
  );
}
