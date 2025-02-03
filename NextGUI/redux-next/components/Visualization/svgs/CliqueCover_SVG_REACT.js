
import { Container } from "@mui/material";
import * as d3 from "d3";
import { text } from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import VisColors from '../constants/VisColors';


function ForceGraph({ w, h, charge, apiCall, problemInstance }) {


    const margin = { top: 200, right: 30, bottom: 30, left: 200 },
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;

    const ref = useRef(null);
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
        const problemUrl = apiCall;
        d3.json(problemUrl).then(function (data) {

            // Initialize the links
            const link = svg
                .selectAll("line")
                .data(data.links)
                .join("line")
                .style("stroke", function (d) {
                    if (d.attribute2 == "1") {
                        return VisColors.Rose
                    }
                    else if (d.attribute2 == "2") {
                        return VisColors.Purple
                    }
                    else if (d.attribute2 == "3") {
                        return VisColors.Sand
                    }
                    else if (d.attribute2 == "4") {
                        return VisColors.Green
                    }
                    else if (d.attribute2 == "5") {
                        return VisColors.Cyan
                    }
                    else if (d.attribute2 == "6") {
                        return VisColors.Wine
                    }
                    else if (d.attribute2 == "7") {
                        return VisColors.Teal
                    }
                    else if (d.attribute2 == "0") {
                        return VisColors.Olive
                    } else {
                        return VisColors.Background
                    }
                  })
                  .style("stroke-width", "2px");



            // Initialize the nodes

            const node = svg
                .selectAll("circle")
                .data(data.nodes)
                .join("circle")
                .attr("class", function (d) {
                    let dName = d.name.replaceAll('!', 'NOT'); //ALEX NOTE: This is a bandaid that lets the sat3 reduction work.

                    return "node_" + dName;
                }) //node prefix added to class name to allow for int names by user.
                .attr("id", function (d) {
                    let dName = d.name.replaceAll('!', 'NOT'); //ALEX NOTE: This is a bandaid that lets the sat3 reduction work.

                    return "_" + dName;
                })
                .attr("r", 20)
                .attr("fill", function (d) {
                    if (d.attribute2 == "1") {
                        return VisColors.Rose
                    }
                    else if (d.attribute2 == "2") {
                        return VisColors.Purple
                    }
                    else if (d.attribute2 == "3") {
                        return VisColors.Sand
                    }
                    else if (d.attribute2 == "4") {
                        return VisColors.Green
                    }
                    else if (d.attribute2 == "5") {
                        return VisColors.Cyan
                    }
                    else if (d.attribute2 == "6") {
                        return VisColors.Wine
                    }
                    else if (d.attribute2 == "7") {
                        return VisColors.Teal
                    }
                    else if (d.attribute2 == "0") {
                        return VisColors.Olive
                    } else {
                        return VisColors.Background
                    }
                })
                .on("mouseover", function (d) {
                    let dName = d.target.__data__.name.replaceAll('!', 'NOT')
                    if (d3.select("#highlightGadgets").property("checked")) {  // Mouseover is only on if the toggle switch is on
                        d3.selectAll(`#${"_" + dName}`).attr('fill', VisColors.ElementHighlight) //note node prefix, color orange
                        d3.selectAll(`#${"_" + dName}`).attr('stroke', VisColors.ElementHighlight)
                    }
                })
                .on("mouseout", function (d) {
                    let dName = d.target.__data__.name.replaceAll('!', 'NOT')
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
                .attr('text-anchor', "middle")
                .text(function (d) { return d["name"]; });

            // Let's list the force we wanna apply on the network
            const simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
                .force("link", d3.forceLink(data.links).distance(charge * -0.75)                               // This force provides links between nodes
                    .id(function (d) { return d.name; })                     // This provide  the id of a node
                    .links(data.links)                                    // and this the list of links
                )
                .force("charge", d3.forceManyBody().strength(charge * 4))
                // This adds repulsion between nodes. Play with the charge for the repulsion strength
                .force("x", d3.forceX()) //centers disconnected subgraphs
                .force("y", d3.forceY())
                .force("collide", d3.forceCollide().radius(d => d.r + 1).iterations(10))
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
                    .attr("searchId", function (d) { return "node_" + d.name.replaceAll('!', 'NOT'); });

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

        }).catch(error => { return error });

    }, [apiCall])
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


export default function CliqueCoverSvgReact(props) {
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
            <ForceGraph w={700} h={700} charge={charge} apiCall={props.apiCall} problemInstance={props.instance} />
        </Container>
    );
}

