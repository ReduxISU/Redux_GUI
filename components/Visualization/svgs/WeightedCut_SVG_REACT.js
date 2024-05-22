//This is a react compatible vertexcover visualization built in d3.


import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import VisColors from '../constants/VisColors';


function DirectedForceGraph({ w, h, charge, apiCall, solve, reductionType = "" }) {
  const [animatedNodes, setAnimatedNodes] = useState([]);
  const [animatedLinks, setAnimatedLinks] = useState([]);
  const margin = { top: 200, right: 30, bottom: 30, left: 200 },
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

  if (reductionType.includes("-")) reductionType = reductionType.split("-").at(-1)

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
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    svg
      .append("rect")
      .attr("x", -margin.left - w / 2)
      .attr("y", -margin.top - h / 2)
      .attr("width", w * 2)
      .attr("height", h * 2)
      .attr("fill", "transparent")
      .attr("pointer-events", "all");



    // Zoom functionality
    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.7, 2])
      .on("zoom", (event) => {
        svg.transition().duration(400).attr("transform", event.transform);
      });

    svg.call(zoomBehavior);
    svg.on("mousedown.zoom", null);
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(width / 2, height / 2));


    const problemUrl = apiCall;
    d3.json(problemUrl).then(function (data) {
      // Initialize the links
      const link = svg
        .selectAll("line")
        .data(data.links)
        .join("line")
        .style("stroke", function (d) {
          if (d.attribute1 == "True" || d.attribute1 == "Cut") {
            return VisColors.Solution //Highlight solutions color: green 
          }
          else {
            return VisColors.Edges // Non-Solution color: grey
          }
        })
        .style("stroke-width", function (d) {
          if (d.attribute1 == "Cut" || d.attribute1 == "True") {
            return "2px"; // Increase thickness for solutions
          } else {
            return "1px"; // Default thickness for non-solutions
          }
        })
        .style("stroke-dasharray", function (d) {
          if (d.attribute1 == "Cut") {
            return "5, 5"; // Dashed pattern for solutions: 5 pixels dash, 5 pixels gap
          } else {
            return "none"; // No dashed pattern for non-solutions
          }
        })
        .attr('marker-end', function (d) {
          if (d.attribute1 == "Cut") {
            return "url(#solvedTriangle)" //Highlight solutions color: green 
          }
          else {
            return "url(#triangle)" // Non-Solution color: grey
          }
        });


        



      // Initialize the nodes
      // Here is where the color editing is for the Reduction side of the graph.

      const node = svg
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("class", function (d) {
          let dName = d.name.replaceAll('!', 'NOT'); //ALEX NOTE: This is a bandaid that lets the sat3 reduction work.
          if (reductionType == "LawlerKarp") {
            if (dName.slice(-1) == "0" || dName.slice(-1) == "1") { dName = dName.substring(0, dName.length - 1) }//Makes gadget groupings match
          }
          return "node_" + dName + " gadget";
        })
        .attr("id", function (d) {
          let dName = d.name.replaceAll('!', 'NOT'); //ALEX NOTE: This is a bandaid that lets the sat3 reduction work.
          if (reductionType == "LawlerKarp") {
            if (dName.slice(-1) == "0" || dName.slice(-1) == "1") { dName = dName.substring(0, dName.length - 1) }//Makes gadget groupings match
          }
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
          let dName = d.target.__data__.name.replaceAll('!', 'NOT')
          if (reductionType == "LawlerKarp") {
            if (dName.slice(-1) == "0" || dName.slice(-1) == "1") { dName = dName.substring(0, dName.length - 1) }//Makes gadget groupings match
          }
          if (d3.select("#highlightGadgets").property("checked")) { // Mouseover is only on if the toggle switch is on
            d3.selectAll(`#${"_" + dName}`).attr('fill', VisColors.ElementHighlight) //note node prefix, color orange
            d3.selectAll(`#${"_" + dName}`).attr('stroke', VisColors.ElementHighlight)
          }
        })
        .on("mouseout", function (d) {
          let dName = d.target.__data__.name.replaceAll('!', 'NOT')
          if (reductionType == "LawlerKarp") {
            if (dName.slice(-1) == "0" || dName.slice(-1) == "1") { dName = dName.substring(0, dName.length - 1) }//Makes gadget groupings match
          }
          if (d3.select("#highlightGadgets").property("checked")) {
            d3.selectAll(`#${"_" + dName}`).attr('fill', VisColors.Background) //FFC300 grey abc
            d3.selectAll(`#${"_" + dName}`).attr('stroke', VisColors.Background)
          }
        })


      const text = svg.selectAll("text") //Append Text on top of nodes.
        .data(data.nodes)
        .enter()
        .append("text")
        .attr("fill", "black")
        .attr("font-size", "12px")
        .text(function (d) { return d["name"]; });

      // Let's list the force we wanna apply on the network
      const simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink().distance(charge * -1.5)                               // This force provides links between nodes
          .id(function (d) { return d.name; })                     // This provide  the id of a node
          .links(data.links)                                    // and this the list of links
        )
        .force("charge", d3.forceManyBody().strength(charge * 8)) // This adds repulsion between nodes 
        .force("x", d3.forceX()) //centers disconnected subgraphs
        .force("y", d3.forceY())
        .force("collide", d3.forceCollide().radius(d => d.r * 2).iterations(10)) //collision detection
        .on("tick", ticked);




      // This function is run at each iteration of the force algorithm, updating the nodes position.
      function ticked() {
        link
          .attr("x1", function (d) { return d.source.x; })
          .attr("y1", function (d) { return d.source.y; })
          .attr("x2", function (d) { return d.target.x; })
          .attr("y2", function (d) { return d.target.y; });

        node
          .attr("cx", function (d) { return d.x; })
          .attr("cy", function (d) { return d.y; })
          .attr("searchId", function (d) { return d.name; });

        text
          .text(function (d) {
            return d.name;
          })
          .attr('x', function (d) {
            return d.x;
          })
          .attr('y', function (d) {
            return d.y
          })
          .attr('dy', function (d) {
            return 5
          })
          .attr('text-anchor', "middle")
      }

    }).catch(error => console.log("CUT VISUALIZATION FAILED"));

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


export default function WeightedCutSvgReact(props) {
  const [charge, setCharge] = useState(-50);

  // create nodes with unique ids
  // radius: 5px
  const nodes = [
    { "id": "Alice" },
    { "id": "Bob" },
    { "id": "Carol" }
  ];

  const links = [
    { "source": "Alice", "target": "Bob" },
    { "source": "Bob", "target": "Carol" }
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
      <DirectedForceGraph
        w={700}
        h={700}
        charge={charge}
        apiCall={props.apiCall}
        solve={props.solveSwitch}
        reductionType={props.reductionType}
      />
    </>
  );
}

