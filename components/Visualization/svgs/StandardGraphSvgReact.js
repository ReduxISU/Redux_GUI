//This is a react compatible graph visualization built in d3.
import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import { getColorByKey } from '../constants/VisColorsArray';
import { requestVisualization } from "../../redux";

function ForceGraph({ w, h, charge, problemData, solve, url, problemInstance }) {
  const margin = { top: 200, right: 30, bottom: 30, left: 200 },
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

    const data = problemData;
    if (!data) return;

    const defs = svg.append("defs");
    data.links.forEach((d, i) => {
      if (d.directed) {
        const marker = defs.append("marker")
          .attr("id", `arrow-${i}`) // unique per link
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 26)
          .attr("refY", 0)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto");

        marker.append("path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", getColorByKey("Edges")); // start neutral, animate to d.color

        d.markerId = `arrow-${i}`;
      }
    });

    // Initialize the links
    const link = svg
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("marker-end", d => d.directed ? `url(#${d.markerId})` : null)
      .style("stroke", function (d) {
        if (getColorByKey(d.color)) {
          if (d.delay !== "") {
            // Add fading effect for the link transitioning from grey to expected color
            d3.select(this)
              .transition()
              .delay(d.delay)
              .duration(1000)
              .style("stroke", getColorByKey(d.color))
              .attr("stroke-width", 2);
            return getColorByKey("Edges")
          }
          else return getColorByKey(d.color)
        }
        else {
          return getColorByKey("Edges") // Non-Solution color: grey
        }
      })
      .style("stroke-width", "2px")
      .style("stroke-dasharray", function (d) {
        if (d.dashed !== "") {
          return "5, 5"; // Dashed pattern for solutions: 5 pixels dash, 5 pixels gap
        } else {
          return "none"; // No dashed pattern for non-solutions
        }
      })

    data.links.forEach(d => {
      if (d.directed) {
        const markerPath = d3.select(`#${d.markerId} path`);
        if (d.delay !== "") {
          markerPath
            .transition()
            .delay(d.delay)
            .duration(1000)
            .attr("fill", getColorByKey(d.color));
        } else {
          markerPath.attr("fill", getColorByKey(d.color) || getColorByKey("Edges"));
        }
      }
    });

    // Initialize the nodes
    // Here is where the color editing is for the Reduction side of the graph.

    const node = svg
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", 20)
      .attr("class", d => d.id.replace("!", "NOT"))
      .attr("fill", function (d) {

        if (getColorByKey(d.color)) {
          if (d.delay !== "") {
            // Add fading effect for the node transitioning from grey to expected color
            d3.select(this)
              .transition()
              .delay(d.delay)
              .duration(1000)
              .attr("fill", getColorByKey(d.color))
            return getColorByKey("Background")
          } else
            return getColorByKey(d.color);
        }
        else {
          return getColorByKey("Background") // Non-Solution color: grey
        }

      })
      .attr("stroke", function (d) {
        if (getColorByKey(d.outline)) {
          return getColorByKey(d.outline); // Outline color
        } else {
          return null;
        }
      })
      .attr("stroke-width", d => d.outline ? 2 : 0)
      .on("mouseover", function (event, d) {
        if (d3.select("#highlightGadgets").property("checked")) {
          d3.selectAll(`.${d.id.replace("!", "NOT")}`).attr('fill', getColorByKey("ElementHighlight"))
          d3.selectAll(`.${d.id.replace("!", "NOT")}`).attr('stroke', getColorByKey("ElementHighlight"))
        }
      })
      .on("mouseout", function (event, d) {
        if (d3.select("#highlightGadgets").property("checked")) {
          d3.selectAll(`.${d.id.replace("!", "NOT")}`).attr('fill', getColorByKey("Background"))
          d3.selectAll(`.${d.id.replace("!", "NOT")}`).attr('stroke', getColorByKey("Background"))
        }
      });

    const text = svg.selectAll("text") //Append Text on top of nodes.
      .data(data.nodes)
      .enter()
      .append("text")
      .attr("fill", "black")
      .attr("font-size", "12px")
      .attr('text-anchor', "middle")
      .text(function (d) { return d["name"]; });

    text.style("pointer-events", "none");


    const weights = data.links.map(d => d.weight);
    const minWeight = d3.min(weights);
    const maxWeight = d3.max(weights);

    const scale = (minWeight === maxWeight)
      ? () => 1
      : d3.scaleLinear().domain([minWeight, maxWeight]).range([1, 4]).clamp(true);

    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links)
        .id(d => d.name)
        .distance(d => scale(d.weight) * Math.abs(charge) * 1.5))
      .force("charge", d3.forceManyBody().strength(charge * 8))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("collide", d3.forceCollide().radius(d => d.r * 2).iterations(10))
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

    }


  }, [url, solve, problemInstance, problemData])
  return (
    <svg
      width={width}
      height={height}
      ref={ref}
      style={{
        display: "inline-block",
        position: "relative",

        width: "100%",
        marginRight: "0px",
        marginLeft: "0px",
      }}
    />
  )
}


export default function StandardGraphSvgReact(props) {
  const [charge, setCharge] = useState(-50);

  return (
    <>
      <ForceGraph w={700} h={700} charge={charge} {...props} />
    </>
  );
}

