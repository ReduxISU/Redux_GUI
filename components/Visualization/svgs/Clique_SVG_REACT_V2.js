import { Container } from "@mui/material";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import VisColors from '../constants/VisColors';
import {requestVisualization, requestSolvedVisualization} from "../../redux";

function ForceGraph({ w, h, charge, url, solve, problemName, problemInstance, solution, steps, currentStep}) {
  const margin = { top: 200, right: 30, bottom: 30, left: 200 },
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

  const ref = useRef(null);

  useEffect(() => {
    d3.select(ref.current).selectChildren().remove();

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 600 400")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const apiCall = (solve) => solve ? requestSolvedVisualization(url, problemName, problemInstance, solution) : requestVisualization(url, problemName, problemInstance);

    // Ensure steps is resolved before using it
    Promise.resolve(steps).then(resolvedSteps => {
      const fetchData = currentStep >= 1 && currentStep <= resolvedSteps.length
        ? Promise.resolve(resolvedSteps[currentStep - 1])
        : apiCall(solve);

      fetchData.then(function (data) {
        // Clear previous elements
        svg.selectAll("*").remove();

        // Initialize the links
        const link = svg
          .selectAll("line")
          .data(data.links)
          .join("line")
          .style("stroke", "#aaa");

        // Initialize the nodes
        const node = svg
          .selectAll("circle")
          .data(data.nodes)
          .join("circle")
          .attr("class", d => "node_" + d.name.replaceAll('!', 'NOT'))
          .attr("id", d => "_" + d.name.replaceAll('!', 'NOT'))
          .attr("r", 20)
          .attr("fill", function (d) {
            //return "#FFC300";
            //"#00e676"
          if (d.attribute2 == "True") {
            return VisColors.Solution //Highlight solutions color: green 
          }
          else if (d.attribute2 == "Pending") {
            return VisColors.Sand;
          }
          else {
            return VisColors.Background // Non-Solution color: grey
          }
      
          })
          .on("mouseover", function (d) {
            let dName = d.target.__data__.name.replaceAll('!', 'NOT');
            if (d3.select("#highlightGadgets").property("checked")) {
              d3.selectAll(`#${"_" + dName}`).attr('fill', VisColors.ElementHighlight);
              d3.selectAll(`#${"_" + dName}`).attr('stroke', VisColors.ElementHighlight);
            }
          })
          .on("mouseout", function (d) {
            let dName = d.target.__data__.name.replaceAll('!', 'NOT');
            if (d3.select("#highlightGadgets").property("checked")) {
              d3.selectAll(`#${"_" + dName}`).attr('fill', VisColors.Background);
              d3.selectAll(`#${"_" + dName}`).attr('stroke', VisColors.Background);
            }
          });

        // Append text on top of nodes
        const text = svg.selectAll("text")
          .data(data.nodes)
          .enter()
          .append("text")
          .attr("fill", "black")
          .attr("font-size", "12px")
          .attr('text-anchor', "middle")
          .text(d => d.name);

        // Force simulation
        const simulation = d3.forceSimulation(data.nodes)
          .force("link", d3.forceLink(data.links).distance(charge * -0.75).id(d => d.name).links(data.links))
          .force("charge", d3.forceManyBody().strength(charge * 4))
          .force("x", d3.forceX())
          .force("y", d3.forceY())
          .force("collide", d3.forceCollide().radius(d => d.r + 1).iterations(10))
          .on("tick", ticked);

        function ticked() {
          link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

          node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

          text
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('dy', 5);
        }
      }).catch(error => console.error("Error fetching data:", error));
    }).catch(error => console.error("Error resolving steps:", error));
  }, [url, solve, problemInstance, currentStep, steps]);

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
  );
}

export default function CliqueSvgReactV2(props) {
  const [charge, setCharge] = useState(-150);

  return (
    <Container>
      <ForceGraph
        w={700}
        h={700}
        charge={charge}
        apiCall={props.apiCall}
        steps={props.problemSteps}
        currentStep={props.currentStep}
        problemInstance={props.instance}
        {...props}
      />
    </Container>
  );
}