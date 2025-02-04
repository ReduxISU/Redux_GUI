/**
 * GraphVisualization.js
 * 
 * This component generates an example Graph component using the Graphviz library.
 * 
 * @author Daniel Igbokwe
 */



import dynamic from "next/dynamic";
// import { useEffect, useState } from "react";

const Graphviz = dynamic(() => import("graphviz-react"), { ssr: false });


const graphTest = `graph GRAPHCOLORING {  
  node [style="filled"];  
  a--b[ id="a-b"];
  b--c[ id="b-c"]; 
  c--a[ id="c-a"]; 
  d--a[ id="d-a"]; 
  d--e[ id="d-e"]; 
  e--a[ id="e-a"]; 
  f--a[ id="f-a"]; 
  f--g[ id="f-g"]; 
  a--g[ id="a-g"]; 
  h--a[ id="h-a"]; 
  h--i[ id="h-i"]; 
  a--i[ id="a-i"]; 
  a[fillcolor = White, id="a"] 
  b[fillcolor = White, id="b"] 
  c[fillcolor = White, id="c"] 
  d[fillcolor = White, id="d"] 
  e[fillcolor = White, id="e"] 
  f[fillcolor = White, id="f"] 
  g[fillcolor = White, id="g"] 
  h[fillcolor = White, id="h"] 
  i[fillcolor = White, id="i"] 
   }`;


function Page(props) {
  let viz = "";
  // const graphTest = props.dot;
  //const [visualization, setVisualization]= useState('')


  return (
    <Graphviz dot={props.dot} options={props.options} />

  );
}

export default Page;
