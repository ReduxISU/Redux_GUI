// ForceGraphReact.js
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { getColorByKey } from '../constants/VisColorsArray';

function ForceGraph({ w, h, charge, problemData, gadgetMap }) {
  const margin = { top: 200, right: 30, bottom: 30, left: 200 },
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

  const ref = useRef(null);

  // Highlight all gadgets related to a node
  function highlightGadget(nodeId, gadgetMap) {
    if(!gadgetMap || gadgetMap.length === 0) return;
    gadgetMap.forEach(item => {
      if ((item.reductionFromIds.includes(nodeId) || item.reductionToIds.includes(nodeId)) && item.color === "ElementHighlight") {
        [...item.reductionFromIds, ...item.reductionToIds].forEach(id => {
          d3.selectAll("#id" + id.replace("!", "NOT"))
            .attr("fill", getColorByKey("ElementHighlight"))
            .attr("stroke", getColorByKey("ElementHighlight"));
        });
      }
    });
  }

  // Reset all gadget highlights
  function clearHighlights(gadgetMap) {
    if(!gadgetMap || gadgetMap.length === 0) return;
    // Reset all gadgets in gadgetMap
    gadgetMap.forEach(item => {
      [...item.reductionFromIds, ...item.reductionToIds].forEach(id => {
        d3.selectAll("#id" + id.replace("!", "NOT"))
          .attr("fill", getColorByKey("Background"))
          .attr("stroke", getColorByKey("Background"));
      });
    });
  }

  // Highlight all gadgets related to a node
  function highlightCluster(nodeId, gadgetMap) {
    if(!gadgetMap || gadgetMap.length === 0) return;
    gadgetMap.forEach(item => {
      if ((item.reductionFromIds.includes(nodeId) || item.reductionToIds.includes(nodeId))) {
        [...item.reductionFromIds, ...item.reductionToIds].forEach(id => {
          d3.selectAll("#id" + id.replace("!", "NOT"))
            .attr("fill", getColorByKey("ClauseHighlight"))
            .attr("stroke", getColorByKey("ClauseHighlight"));
          d3.selectAll(".class" + id.replace("!", "NOT"))
          .attr("fill", getColorByKey("ClauseHighlight"))
          .attr("stroke", getColorByKey("ClauseHighlight"));
        });
      }
    });
  }

  // Reset all cluster highlights
  function clearClusters(gadgetMap) {
    if(!gadgetMap || gadgetMap.length === 0) return;
    // Reset all clusters in gadgetMap
    gadgetMap.forEach(item => {
      [...item.reductionFromIds, ...item.reductionToIds].forEach(id => {
        d3.selectAll("#id" + id.replace("!", "NOT"))
          .attr("fill", getColorByKey("Background"))
          .attr("stroke", getColorByKey("Background"));
        d3.selectAll(".class" + id.replace("!", "NOT"))
          .attr("fill", getColorByKey("Background"))
          .attr("stroke", getColorByKey("Background"));
      });
    });
  }


  useEffect(() => {
    if (!problemData) return;

    d3.select(ref.current).selectChildren().remove();

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const defs = svg.append("defs");

    // Setup markers for directed edges
    problemData.links.forEach((d, i) => {
      if (d.directed) {
        const marker = defs.append("marker")
          .attr("id", `arrow-${i}`)
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 26)
          .attr("refY", 0)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto");

        marker.append("path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", getColorByKey("Edges"));

        d.markerId = `arrow-${i}`;
      }
    });

    // Draw links
    const link = svg.selectAll("line")
      .data(problemData.links)
      .join("line")
      .attr("marker-end", d => d.directed ? `url(#${d.markerId})` : null)
      .style("stroke", d => getColorByKey(d.color || "Edges"))
      .style("stroke-width", "2px")
      .style("stroke-dasharray", d => d.dashed ? "5,5" : "none");

    problemData.links.forEach(d => {
      if (d.directed) {
        const markerPath = d3.select(`#${d.markerId} path`);
        markerPath.attr("fill", getColorByKey(d.color || "Edges"));
      }
    });

    // Draw nodes
    const node = svg.selectAll("circle")
      .data(problemData.nodes)
      .join("circle")
      .attr("r", 20)
      .attr("id", d => "id" + d.id.replace("!", "NOT"))
      .attr("class", d => "node" + d.id.replace("!", "NOT"))
      .attr("fill", d => getColorByKey(d.color || "Background"))
      .attr("stroke", d => d.outline ? getColorByKey(d.outline) : null)
      .attr("stroke-width", d => d.outline ? 2 : 0)
      .on("mouseover", (event, d) => {
        if (d3.select("#highlightGadgets").property("checked")) {
          highlightCluster(d.id, gadgetMap);
          highlightGadget(d.id, gadgetMap);
        }
      })
      .on("mouseout", (event, d) => {
        if (d3.select("#highlightGadgets").property("checked")) {
          clearClusters(gadgetMap);
          clearHighlights(gadgetMap);
        }
      });

    // Draw labels
    const text = svg.selectAll("text")
      .data(problemData.nodes)
      .enter()
      .append("text")
      .attr("fill", "black")
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .text(d => d.name)
      .style("pointer-events", "none"); // disables pointer events for labels

    // Scale for link distances based on weight
    const weights = problemData.links.map(d => d.weight);
    const minWeight = d3.min(weights);
    const maxWeight = d3.max(weights);
    const scale = (minWeight === maxWeight)
      ? () => 1
      : d3.scaleLinear().domain([minWeight, maxWeight]).range([1, 4]).clamp(true);

    // Force simulation
    const simulation = d3.forceSimulation(problemData.nodes)
      .force("link", d3.forceLink(problemData.links)
        .id(d => d.name)
        .distance(d => scale(d.weight) * Math.abs(charge) * 1.5))
      .force("charge", d3.forceManyBody().strength(charge * 8))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("collide", d3.forceCollide().radius(d => d.r * 2).iterations(10))
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
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("dy", 5)
        .text(d => d.name);
    }

  }, [problemData, charge]);

  return (
    <svg
      width={width}
      height={height}
      ref={ref}
      style={{
        display: "inline-block",
        width: "100%",
        marginRight: 0,
        marginLeft: 0,
      }}
    />
  );
}

export default function StandardGraphSvgReact(props) {
  const [charge, setCharge] = useState(-50);

  return (
    <ForceGraph w={700} h={700} charge={charge} {...props} />
  );
}
