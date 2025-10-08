import { Container } from "@mui/material";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import VisColors from "../constants/VisColors";
  import {
    requestVisualization,
    requestSolvedVisualization,
  } from "../../redux";

  function DominatingForce({
    w = 700,
    h = 700,
    charge = -150,
    url,
    solve,
    problemName,
    problemInstance,
    solution,
  }) {
    const ref = useRef(null);
    const margin = { top: 200, right: 30, bottom: 30, left: 200 };
    const width = w - margin.left - margin.right;
    const height = h - margin.top - margin.bottom;

    useEffect(() => {
      if (!url || !problemInstance) return;

      const root = d3.select(ref.current);
      root.selectChildren().remove();

      const svg = root
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 600 400")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      const apiCall = solve
        ? requestSolvedVisualization(
            url,
            problemName,
            problemInstance,
            solution ?? ""
          )
        : requestVisualization(url, problemName, problemInstance);

      let simulation;

      apiCall
        .then((data) => {
          const links = data?.links ?? [];
          const nodes = data?.nodes ?? [];

          const link = svg
            .selectAll("line")
            .data(links)
            .join("line")
            .style("stroke", VisColors.Edges);

          const node = svg
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("class", (d) => `node_${d.name.replaceAll("!", "NOT")}`)
            .attr("id", (d) => `_${d.name.replaceAll("!", "NOT")}`)
            .attr("r", 20)
            .attr("fill", (d) =>
              d.attribute2 === "True" ? VisColors.Solution :
  VisColors.Background
            )
            .attr("stroke", VisColors.Edges)
            .on("mouseover", (event, d) => {
              if (d3.select("#highlightGadgets").property("checked")) {
                const selector = `_${d.name.replaceAll("!", "NOT")}`;
                d3.selectAll(`#${selector}`)
                  .attr("fill", VisColors.ElementHighlight)
                  .attr("stroke", VisColors.ElementHighlight);
              }
            })
            .on("mouseout", (event, d) => {
              if (d3.select("#highlightGadgets").property("checked")) {
                const selector = `_${d.name.replaceAll("!", "NOT")}`;
                const baseColor =
                  d.attribute2 === "True"
                    ? VisColors.Solution
                    : VisColors.Background;
                d3.selectAll(`#${selector}`)
                  .attr("fill", baseColor)
                  .attr("stroke", VisColors.Edges);
              }
            });

          const label = svg
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("fill", "black")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .text((d) => d.name);

          simulation = d3
            .forceSimulation(nodes)
            .force(
              "link",
              d3.forceLink(links).distance(Number(charge) * -0.75).id((d) =>
  d.name)
            )
            .force("charge", d3.forceManyBody().strength(Number(charge) * 4))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .force("collide", d3.forceCollide().radius((d) => d.r +
  1).iterations(10))
            .on("tick", () => {
              link
                .attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);

              node
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
                .attr("searchId", (d) => `node_${d.name.replaceAll("!", "NOT")}
  `);

              label
                .attr("x", (d) => d.x)
                .attr("y", (d) => d.y + 5);
            });
        })
        .catch((error) => console.error("DominatingSet visualization error:",
  error));

      return () => {
        if (simulation) simulation.stop();
      };
    }, [solve, url, problemName, problemInstance, solution, charge]);

    return (
      <svg
        ref={ref}
        width={width}
        height={height}
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

  export default function DominatingSetSvg(props) {
    const [charge] = useState(-150);

    return (
      <Container>
        <DominatingForce
          w={700}
          h={700}
          charge={charge}
          url={props.url}
          solve={props.solve}
          problemName={props.problemName}
          problemInstance={props.problemInstance}
          solution={props.solution}
        />
      </Container>
    );
  }
