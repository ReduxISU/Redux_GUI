/**
 * GraphVisualization.js
 * 
 * This component generates an example Graph component using the Graphviz library.
 * 
 * @author Daniel Igbokwe
 */



import dynamic from "next/dynamic";

const Graphviz = dynamic(() => import("./GraphvizWrapper"), { ssr: false });

function Page(props) {
  return (
    <Graphviz dot={props.dot} options={props.options} />

  );
}

export default Page;
