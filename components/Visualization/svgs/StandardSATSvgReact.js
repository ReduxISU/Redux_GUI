import React from 'react'
import * as d3 from 'd3'
import { getColorByKey } from '../constants/VisColorsArray';
import dynamic from "next/dynamic";
import { useRef, useState, useEffect, useContext } from 'react';

/// StandardSATSvgReact.js
/// This is a wrapper for the boolean visualization instance. It allows us to use the visualization as a react component, and also disables
/// server side rendering due to compilation issues with rendering a d3 svg before the entire page is rendered. 

function StandardSATSvgReact(props) {
    const ref = useRef(null);
    useEffect(() => {

        try {
            if (props.problemData) {
                getSets(ref.current, props.problemData, props.gadgetMap);
            }

        }
        catch (error) { console.log("VISUALIZATION FAILED") };

    }, [props.problemData, props.gadgetMap])


    return (
        <svg ref={ref}
            style={{
                height: "470px",
                width: "100%",
                marginRight: "0px",
                marginLeft: "0px",
            }} />
    )
}

function getSets(ref, data, gadgetMap) {
    const margin = { top: 200, right: 30, bottom: 30, left: 200 },
        width = 700 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    // clear previous content
    d3.select(ref).selectAll("*").remove();

    // create main svg container
    const svg = d3.select(ref)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("class", "all");

    let x = 20;
    let y = 100;

    const clauses = data.clauses;

    for (let i = 0; i < clauses.length; i++) {
        let c = new clause(clauses[i].id, svg, x, y, clauses[i].literals, 13, gadgetMap);
        c.show();
        x += c.width + 8;
        if (i < clauses.length - 1) {
            svg.append("text")
                .attr("x", x)
                .attr("y", y)
                .attr("text-anchor", "left")
                .attr("dominant-baseline", "middle")
                .attr("font-size", "15px")
                .attr("font-family", "'Courier New', Courier, monospace")
                .text("\u2227");
            x += 16;
        }
        if (x >= width - c.width) {
            x = 20;
            y += 50
        }
    }

    d3.selectAll(".true")
        .attr("fill", getColorByKey("ElementHighlight"))
        .attr("stroke", getColorByKey("ElementHighlight"));

    d3.select(ref).selectChildren()._groups[0]?.slice(1).map((child) => d3.select(child).remove())
}

function showCluster(clusterClass, gadgetMap) {
    if (!d3.select("#highlightGadgets").property("checked")) return;

    d3.selectAll("." + clusterClass)
        .attr("fill", getColorByKey("ClauseHighlight"))
        .attr("stroke", getColorByKey("ClauseHighlight"));


    const cleanElement = clusterClass.replace(/^class/, "");

    // Optionally highlight linked elements via gadgetMap
    if (Array.isArray(gadgetMap)) {
        gadgetMap.forEach(item => {
            if ((item.reductionFromIds.includes(cleanElement) || item.reductionToIds.includes(cleanElement)) && item.color === "ClauseHighlight") {
                [...item.reductionFromIds, ...item.reductionToIds].forEach(id => {
                    d3.selectAll("#id" + id.replace("!", "NOT"))
                        .attr("fill", getColorByKey("ClauseHighlight"))
                        .attr("stroke", getColorByKey("ClauseHighlight"));
                });
            }
        });
    }
}
function showElement(element, gadgetMap) {
    if (d3.select("#highlightGadgets").property("checked")) {
        d3.selectAll("#" + element)
            .attr("fill", getColorByKey("ElementHighlight"))
            .attr("stroke", getColorByKey("ElementHighlight"))

        if (!gadgetMap) return;

        const cleanElement = element.replace(/^id/, "");

        gadgetMap.forEach(item => {
            // Check if the element is in reductionFromIds or reductionToIds
            if ((item.reductionFromIds.includes(cleanElement) || item.reductionToIds.includes(cleanElement)) && item.color === "ElementHighlight") {

                // Highlight all IDs in reductionFromIds
                item.reductionFromIds.forEach(id => {
                    d3.selectAll("#id" + id.replace("!", "NOT"))
                        .attr("fill", getColorByKey("ElementHighlight"))
                        .attr("stroke", getColorByKey("ElementHighlight"));
                });

                // Highlight all IDs in reductionToIds
                item.reductionToIds.forEach(id => {
                    d3.selectAll("#id" + id.replace("!", "NOT"))
                        .attr("fill", getColorByKey("ElementHighlight"))
                        .attr("stroke", getColorByKey("ElementHighlight"));
                });
            }
        });
    }
}
function clear(gadgetMap) {
    // Reset all elements highlighted directly
    d3.selectAll("[id^='id']").attr("fill", getColorByKey("Background"))
        .attr("stroke", getColorByKey("Background"));

    // Reset all gadgets
    d3.selectAll(".gadget").attr("fill", getColorByKey("Background"))
        .attr("stroke", getColorByKey("Background"));

    // Reset linked elements from gadgetMap
    if (Array.isArray(gadgetMap)) {
        gadgetMap.forEach(item => {
            if (item.color === "ElementHighlight") {
                item.reductionFromIds.forEach(id => {
                    d3.selectAll("#id" + id.replace("!", "NOT"))
                        .attr("fill", getColorByKey("Background"))
                        .attr("stroke", getColorByKey("Background"));
                });
                item.reductionToIds.forEach(id => {
                    d3.selectAll("#id" + id.replace("!", "NOT"))
                        .attr("fill", getColorByKey("Background"))
                        .attr("stroke", getColorByKey("Background"));
                });
            }
        });
    }
}

class literal {
    constructor(id, className, name, svg, x, y, size = 25, gadgetMap, color) {
        this.id = "id" + id;
        this.className = className;
        this.name = name;
        this.svg = svg;
        this.x = x;
        this.y = y;
        this.size = size;
        this.gadgetMap = gadgetMap;
        this.color = color;
    }
    show(c = this.className, e = this.id) {
        this.svg.append("rect")
            .attr("x", this.x)
            .attr("y", this.y - this.size / 2)
            .attr("fill", getColorByKey(this.color.trim()))
            .attr("height", this.size)
            .attr("width", this.size * this.name.length - 7)//subtracting 7 since the stroke length is 7.
            .attr("id", this.id)
            .attr("class", this.className + " gadget " + this.name.replace("!", "NOT"))
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", "7px")
            .on("mouseover", () => {
                showCluster(c, this.gadgetMap)
                showElement(e, this.gadgetMap);
            })
            .on("mouseout", () => clear());
        this.svg.append("text")
            .attr("class", this.name)
            .attr("x", this.x)
            .attr("y", this.y)
            .attr("text-anchor", "left")
            .attr("dominant-baseline", "middle")
            .attr("font-size", this.size + "px")
            .attr("font-family", "'Courier New', Courier, monospace")
            .text(this.name)
            .on("mouseover", () => {
                showCluster(c, this.gadgetMap);
                showElement(e, this.gadgetMap);
            })
            .on("mouseout", () => clear())
            .style("pointer-events", "none");
            
    }
}

class clause {
    constructor(className, svg, x, y, literals, size = 20, gadgetMap) {
        this.className = "class" + className;
        this.svg = svg;
        this.x = x;
        this.y = y;
        this.size = size;
        this.literalsIDs = [];
        this.literals = literals;
        this.width = 0;
        this.gadgetMap = gadgetMap;
    }
    show(c = this.className) {
        // starting offset
        let offsetX = this.x + this.size;

        // opening parenthesis
        this.svg.append("text")
            .attr("x", this.x)
            .attr("y", this.y)
            .attr("text-anchor", "left")
            .attr("dominant-baseline", "middle")
            .attr("font-size", this.size + "px")
            .text("(")
            .style("pointer-events", "none"); 

        // draw each literal and OR symbol
        for (let i = 0; i < this.literals.length; i++) {
            const lit = new literal(
                this.literals[i].id,
                this.className,
                this.literals[i].literal,
                this.svg,
                offsetX,
                this.y,
                this.size,
                this.gadgetMap,
                this.literals[i].color,
            );
            lit.show();

            // literal width exactly
            const litWidth = lit.size * lit.name.length - 7;

            // update offsetX to the right edge of the literal
            offsetX += litWidth;

            if (i < this.literals.length - 1) {
                // small gap between literal and OR symbol
                const gap = 4;
                this.svg.append("text")
                    .attr("x", offsetX + gap)
                    .attr("y", this.y)
                    .attr("text-anchor", "left")
                    .attr("dominant-baseline", "middle")
                    .attr("font-size", this.size + "px")
                    .attr("font-family", "'Courier New', Courier, monospace")
                    .text("\u2228")
                    .style("pointer-events", "none"); 

                // move offsetX past the OR symbol plus some spacing
                offsetX += this.size + gap;
            } else {
                // last literal, move offsetX past a bit for closing parenthesis
                offsetX += this.size / 2;
            }
        }


        // closing parenthesis
        this.svg.append("text")
            .attr("x", offsetX)
            .attr("y", this.y)
            .attr("text-anchor", "left")
            .attr("dominant-baseline", "middle")
            .attr("font-size", this.size + "px")
            .attr("font-family", "'Courier New', Courier, monospace")
            .text(")")
            .style("pointer-events", "none"); 

        // compute width for background rect
        this.width = offsetX - this.x + this.size / 2;

        this.svg.append("rect")
            .attr("x", this.x)
            .attr("y", this.y - this.size)
            .attr("fill", getColorByKey("Background"))
            .attr("stroke", getColorByKey("Background"))
            .attr("height", this.size * 2)
            .attr("width", this.width)
            .attr("class", this.className + " gadget")
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", "7px")
            .lower() // send behind text
            .on("mouseover", () => showCluster(c, this.gadgetMap))
            .on("mouseout", clear);
    }
}


export default dynamic(() => Promise.resolve(StandardSATSvgReact), {
    ssr: false
})