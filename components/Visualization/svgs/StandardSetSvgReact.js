import React from 'react'
import * as d3 from 'd3'
import VisColors from '../constants/VisColors';
import dynamic from "next/dynamic";
import { useRef, useState, useEffect, useContext } from 'react';

import { requestProblemGenericInstance } from '../../redux';
/// SAT3_SVG_React.js
/// This is a wrapper for the SAT3 visualization instance. It allows us to use the visualization as a react component, and also disables
/// server side rendering due to compilation issues with rendering a d3 svg before the entire page is rendered. 

function StandardSetSvgReact(props) {
    const ref = useRef(null);
    const problemInstance = props.problemInstance;
    const [solutionData, setSolutionData] = useState([]);
    const [data, setData] = useState('hello');
    useEffect(() => {
        try {
            if (props.problemData) {
                getSets(ref.current, props.problemData);
            }


            if (props.showSolution) {
                // let solutionData = getProblemSolution(props.url, "Sat3BacktrackingSolver", problemInstance.replaceAll('&', "%26"));
                let apiCompatibleInstance = problemInstance.replaceAll('&', "%26");
                let stringArr = props.solutionData.replace('(', '').replace(')', ''); //turns (x1:True) int x1:True
                stringArr = stringArr.split(','); //turns x1:True,x2:True into [x1:True,x2:True]
                let finalArr = [];
                for (const str of stringArr) {
                    let temp = str.split(':');
                    if (temp[1] === "False") {
                        finalArr.push("NOT" + temp[0]);
                    }
                    else {
                        finalArr.push(temp[0]); //turns x1:true into x1
                    }
                }
                setSolutionData(finalArr);
            }

            else if (!props.showSolution) { //ALEX NOTE: Code in here causes a rerender of sat3 that gets rid of the solution.
                setSolutionData([]);
                fullClear();


            }
        }
        catch (error) { console.log("VISUALIZATION FAILED") };

    }, [problemInstance, props.showSolution])

    try {
        if (props.showSolution) {
            showSolution(solutionData); //Data fed to this triggers a instance render with solution
        }
    }
    catch (error) { console.log("VISUALIZATION FAILED") }

    // useEffect(() => { //This updated the cerificate text with a solution value when a user hits the solution button in SolvedRow
    //  if(!props.showSolution){
    //   setSolutionData([])
    //  }
    // }, [props.showSolution])

    return (
        <svg ref={ref}
            style={{
                height: "700px",
                width: "100%",
                marginRight: "0px",
                marginLeft: "0px",
            }} />
    )
}

function getSets(ref, data) {
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
        let c = new clause(clauses[i].id, svg, x, y, clauses[i].literals, 15);
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
        .attr("fill", VisColors.ElementHighlight)
        .attr("stroke", VisColors.ElementHighlight);

    d3.select(ref).selectChildren()._groups[0]?.slice(1).map((child) => d3.select(child).remove())
}


function showSolution(solution) {
    for (let i = 0; i < solution.length; i++) {
        d3.selectAll("." + solution[i] + ".gadget") 
            .attr("fill", VisColors.Solution)
            .attr("stroke", VisColors.Solution);
    }
}
function showCluster(cluster) {
    if (d3.select("#highlightGadgets").property("checked")) {
        d3.selectAll("." + cluster)
            .attr("fill", VisColors.ClauseHighlight)
            .attr("stroke", VisColors.ClauseHighlight);
    }
}
function showElement(element) {
    if (d3.select("#highlightGadgets").property("checked")) {
        d3.selectAll("#" + element)
            .attr("fill", VisColors.ElementHighlight)
            .attr("stroke", VisColors.ElementHighlight);
    }
}
function clear() {
    if (d3.select("#highlightGadgets").property("checked")) {
        d3.selectAll(".gadget")
            .attr("fill", VisColors.Background)
            .attr("stroke", VisColors.Background);
    }
}
function fullClear() {
    d3.selectAll(".gadget")
        .attr("fill", VisColors.Background)
        .attr("stroke", VisColors.Background);
}

class literal {
    constructor(id, className, name, svg, x, y, size = 25) {
        this.id = "id" + id;
        this.className = className;
        this.name = name;
        this.svg = svg;
        this.x = x;
        this.y = y;
        this.size = size;
    }
    show(c = this.className, e = this.id) {
        this.svg.append("rect")
            .attr("x", this.x)
            .attr("y", this.y - this.size / 2)
            .attr("fill", VisColors.Background)
            .attr("height", this.size)
            .attr("width", this.size * this.name.length - 7)//subtracting 7 since the stroke length is 7.
            .attr("id", this.id)
            .attr("class", this.className + " gadget " + this.name.replace("!", "NOT"))
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", "7px")
            .on("mouseover", function () {
                showCluster(c)
                showElement(e);
            })
            .on("mouseout", function () {
                clear();
            })
        this.svg.append("text")
            .attr("class", this.name)
            .attr("x", this.x)
            .attr("y", this.y)
            .attr("text-anchor", "left")
            .attr("dominant-baseline", "middle")
            .attr("font-size", this.size + "px")
            .attr("font-family", "'Courier New', Courier, monospace")
            .text(this.name)
            .on("mouseover", function () {
                showCluster(c);
                showElement(e);
            })
            .on("mouseout", function () {
                clear();
            })

    }
}

class clause {
    constructor(className, svg, x, y, literals, size = 20) {
        this.className = "class" + className;
        this.svg = svg;
        this.x = x;
        this.y = y;
        this.size = size;
        this.literalsIDs = [];
        this.literals = literals
        this.width = 0;
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
            .text("(");

        // draw each literal and OR symbol
        for (let i = 0; i < this.literals.length; i++) {
            const lit = new literal(
                this.literals[i].id,
                this.className,
                this.literals[i].literal,
                this.svg,
                offsetX,
                this.y,
                this.size
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
                    .text("\u2228");

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
            .text(")");

        // compute width for background rect
        this.width = offsetX - this.x + this.size / 2;

        this.svg.append("rect")
            .attr("x", this.x)
            .attr("y", this.y - this.size)
            .attr("fill", VisColors.Background)
            .attr("stroke", VisColors.Background)
            .attr("height", this.size * 2)
            .attr("width", this.width)
            .attr("class", this.className + " gadget")
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", "7px")
            .lower() // send behind text
            .on("mouseover", () => showCluster(c))
            .on("mouseout", clear);
    }
}


export default dynamic(() => Promise.resolve(StandardSetSvgReact), {
    ssr: false
})