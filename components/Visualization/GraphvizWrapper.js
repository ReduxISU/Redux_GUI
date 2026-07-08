import { useEffect, useRef } from "react";
import { graphviz } from "d3-graphviz";

export default function GraphvizWrapper({ dot, options = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && dot) {
      graphviz(ref.current, { useWorker: false, ...options }).renderDot(dot);
    }
  }, [dot, options]);

  return <div ref={ref} />;
}
