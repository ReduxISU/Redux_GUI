//This is a react compatible vertexcover visualization built in d3.


import { Container } from "@mui/material";
import * as d3 from "d3";
import { text } from "d3";
import { useEffect, useMemo, useRef, useState } from "react";

function ForceGraph({ w, h, charge,apiCall,problemInstance }) {
    const [animatedNodes, setAnimatedNodes] = useState([]);
    const [animatedLinks, setAnimatedLinks] = useState([]);
    const margin = {top: 200, right: 30, bottom: 30, left: 200},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;
    
    const ref = useRef(null);
    // re-create animation every time nodes change
  
    useEffect(() => {
       // set the dimensions and margins of the graph

// append the svg object to the body of the page
      const svg = d3.select(ref.current)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 600 400")
.append("g")
.attr("transform",
      `translate(${margin.left}, ${margin.top})`);
      const problemUrl = apiCall + '?problemInstance=' + problemInstance;
d3.json(problemUrl).then( function( data) {
  console.log(data);
  console.log(problemUrl)
// Initialize the links
const link = svg
  .selectAll("line")
  .data(data.links)
  .join("line")
    .style("stroke", "#aaa")



// Initialize the nodes
    
const node = svg
  .selectAll("circle")
  .data(data.nodes)
    .join("circle")
    // .attr("class", function (d) { return d.cover; })
    .attr("r", 20)
  .style("fill", function (d) {
      return "#FFC300";
      //"#00e676"
        // if (d.cover === "true") {
        //         return "#00e676"
        // }
        // else {
        //     return "#ff1744"
        // }
    })
    // .on("mouseover", function (d) {
    //     //console.log("HOVERING OVER A NODE", d.target.__data__.name)
    //     svg.selectAll(`.${d.target.__data__.cover}`).style('fill', "#abc")
    // })
    // .on("mouseout", function (d) {
    //     if (d.target.__data__.cover === "true") {
    //         svg.selectAll(`.${d.target.__data__.cover}`).style('fill', "#ffea00")
    //     }
    //     else {
    //         svg.selectAll(`.${d.target.__data__.cover}`).style('fill', "#ff1744")

    //     }
    // })
 
    
const text = svg.selectAll("text") //Append Text on top of nodes.
        .data(data.nodes)
        .enter()
        .append("text")
        .attr("fill", "black")
        .attr("font-size", "12px")
        .text(function(d) { return d["name"]; });

// Let's list the force we wanna apply on the network
const simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
    .force("link", d3.forceLink(data.links).distance(charge*-0.75)                               // This force provides links between nodes
          .id(function(d) { return d.name; })                     // This provide  the id of a node
          .links(data.links)                                    // and this the list of links
    )
    .force("charge", d3.forceManyBody().strength(charge*4))
    // This adds repulsion between nodes. Play with the charge for the repulsion strength
    .force("x", d3.forceX()) //centers disconnected subgraphs
  .force("y", d3.forceY())
  .force("collide", d3.forceCollide().radius(d => d.r + 1).iterations(10))
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
        //console.log(d.name);
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
    
});
 
      }, [])
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


export default function CliqueSvgReactV2(props) {
  const [charge, setCharge] = useState(-150);
  

  return (
    <Container>
   
      {/* <input
        type="range"
        min="-500"
        max= "500"
        step="1"
        value={charge}
        onChange={(e) => setCharge(e.target.value)}
      /> */}
     <ForceGraph w={700} h={700} charge={charge} apiCall={props.apiCall} problemInstance ={props.instance} />
    </Container>
  );
}
