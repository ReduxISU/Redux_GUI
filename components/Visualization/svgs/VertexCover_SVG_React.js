//This is a react compatible vertexcover visualization built in d3.


import * as d3 from "d3";
import { text } from "d3";
import { useEffect, useMemo, useRef, useState} from "react";
import VisColors from '../constants/VisColors';
import { showSolution } from "./Sat3ToCliqueInstance";

function getProblemSolutionData(url, solver, instance) {
  var fullUrl = `${url}${solver}/solve?problemInstance=${instance}`;
  return fetch(fullUrl).then(resp => {
    if (resp.ok) {
      return resp.json()
    }
  });
}

function ForceGraph({ w, h, charge,apiCall,problemInstance,solve,reduceFrom,reduceFromInstance,url,reduceFromData }) {
  const [animatedNodes, setAnimatedNodes] = useState([]);
  const [animatedLinks, setAnimatedLinks] = useState([]);
  const margin = {top: 200, right: 30, bottom: 30, left: 200},
  width = w - margin.left - margin.right,
  height = h - margin.top - margin.bottom;
  
  let ref = useRef(null);

   // re-create animation every time nodes change
  useEffect(() => {
    d3.select(ref.current).selectChildren().remove();
    
      // set the dimensions and margins of the graph

  // append the svg object to the body of the page
  const svg = d3.select(ref.current)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 600 400")
    .append("g")
    .attr("transform",
        `translate(${margin.left}, ${margin.top})`);

  const problemUrl = apiCall;
  d3.json(problemUrl).then( function( data) {
    // Initialize the links
    const link = svg
      .selectAll("line")
      .data(data.links)
      .join("line")
      .style("stroke", VisColors.Edges)



// Initialize the nodes
// Here is where the color editing is for the Reduction side of the graph.
    
const node = svg
  .selectAll("circle")
  .data(data.nodes)
  .join("circle")
  .attr("class", function (d) {
    let dName = d.name.replaceAll('!','NOT'); //ALEX NOTE: This is a bandaid that lets the sat3 reduction work.
      
      return "node_" + dName +" gadget";
  })
  .attr("id", function (d) {
    let dName = d.name.replaceAll('!','NOT'); //ALEX NOTE: This is a bandaid that lets the sat3 reduction work.
      
      return "_" + dName;
  }) //node prefix added to class name to allow for int names by user.
  .attr("r", 20)
  .attr("fill", function (d) {
    //return "#FFC300";
    //"#00e676"
      
    if (d.attribute2 == "True") {
      return VisColors.Solution //Highlight solutions color: green 
    }
    else {
      return VisColors.Background // Non-Solution color: grey
    }
      
  })
  .on("mouseover", function (d) {
    let dName = d.target.__data__.name.replaceAll('!','NOT')
    if (d3.select("#highlightGadgets").property("checked")){ // Mouseover is only on if the toggle switch is on
      d3.selectAll(`#${"_" +dName}`).attr('fill', VisColors.ElementHighlight) //note node prefix, color orange
      d3.selectAll(`#${"_" +dName}`).attr('stroke', VisColors.ElementHighlight)
    }
  })
  .on("mouseout", function (d) {  
    let dName = d.target.__data__.name.replaceAll('!','NOT')
    if (d3.select("#highlightGadgets").property("checked")) {
      d3.selectAll(`#${"_"+dName}`).attr('fill', VisColors.Background) //FFC300 grey abc
      d3.selectAll(`#${"_" +dName}`).attr('stroke', VisColors.Background)
    }
  })

    
const text = svg.selectAll("text") //Append Text on top of nodes.
        .data(data.nodes)
        .enter()
        .append("text")
        .attr("fill", "black")
        .attr("font-size", "12px")
        .attr('text-anchor', "middle")
        .text(function(d) { return d["name"]; });

// Let's list the force we wanna apply on the network
const simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
    .force("link", d3.forceLink().distance(charge*-1.5)                               // This force provides links between nodes
          .id(function(d) { return d.name; })                     // This provide  the id of a node
          .links(data.links)                                    // and this the list of links
    )
    .force("charge", d3.forceManyBody().strength(charge*8)) // This adds repulsion between nodes 
    .force("x", d3.forceX()) //centers disconnected subgraphs
    .force("y", d3.forceY())
    .force("collide", d3.forceCollide().radius(d => d.r * 2).iterations(10)) //collision detection
    .on("tick", ticked);



    
// This function is run at each iteration of the force algorithm, updating the nodes position.
function ticked() {
  link
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  node
    .attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; })
    .attr("searchId", function (d) { return d.name; });
  
  text
    .text(function(d) {
        return d.name;
    })
    .attr('x', function(d) {
        return d.x;
    })
    .attr('y', function(d) {
        return d.y
    })
    .attr('dy', function(d) {
        return 5
    })
    
}
    
}).catch(error => console.log("VERTEX COVER VISUALIZATION FAILED"));
 
      }, [solve, apiCall])
  return (
    <svg 
        width={width}
        height={height}
        ref={ref}
        style={{
          display: "inline-block",
          position: "relative",
          height: "100%",
          width: "100%",
          marginRight: "0px",
          marginLeft: "0px",
          }}
        />
      )
}


export default function VertexCoverSvgReact(props) {
  const [charge, setCharge] = useState(-50);
  
  // create nodes with unique ids
  // radius: 5px
  const nodes = [
    {"id": "Alice"},
    {"id": "Bob"},
    {"id": "Carol"}
  ];
  
  const links = [
    {"source": "Alice", "target": "Bob"},
    {"source": "Bob", "target": "Carol"}
  ];

  
  return (
    <>
    
      {/* <input
        type="range"
        min="-500"
        max= "500"
        step="1"
        value={charge}
        onChange={(e) => setCharge(e.target.value)}
      /> */}
    <ForceGraph 
      w={700} 
      h={700} 
      charge={charge} 
      apiCall={props.apiCall} 
      problemInstance = {props.instance}
      solve = {props.solveSwitch}
      reduceFrom = {props.reduceFrom}
      reduceFromInstance = {props.reduceFromInstance}
      reduceFromData = {props.reduceFromData}
      url = {props.url}
      />
    </>
  );
}

