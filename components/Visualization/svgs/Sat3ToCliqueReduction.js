import * as d3 from 'd3'
import VisColors from '../constants/VisColors';
// import { Constants } from 'two.js/src/constants';



var width = 400;
var height = 350;




const degrees = (value) => value * (Math.PI / 180);
const sin = (theta) => Math.sin(degrees(theta));
const cos = (theta) => Math.cos(degrees(theta));

const positionByDegree = (degree, r, w, h) => {
    return {
        "x": sin(degree) * r + w,
        "y": cos(degree) * -r + h
    }
}

function getClique(ref, data) {
    try{
        d3.select(ref.current).selectChildren().remove();
        // Creating a list of the "known" literals that are true so we can also make it's _2, _3 etc. also also true.
        // Makes a set of strings of the known literals; e.g x1, x3 etc.

        //NOTE: This is now being done in the backend, but I'm leaving if here in case there are future problems.

        // const knownSolutions = new Set();
        // for (var j = 0; j < data.length; j++){
        //     if (!data[j].solutionState == '' ){
        //         const baseName = data[j].name.split('_')[0]
        //         knownSolutions.add(baseName)
        //         //knownSolutions.push(data[j]);
        //     }
        // }

        // var fullSolutionList = []
        // // comparing all the literals we know are part of the solution, with all the other literals to make the same literals true as well.
        // knownSolutions.forEach(cliqueSolution => {
        //     for (let currentLiteralIndex = 0; currentLiteralIndex < data.length; currentLiteralIndex++){
        //         //Getting the base name of the literal (stripping the _1, _2 etc.)
        //         let baseLiteralName = data[currentLiteralIndex].name.split('_')[0]
        //         if (!baseLiteralName){
        //             baseLiteralName = data[currentLiteralIndex].name
        //         }
        //         // Make that literal true and add it to the list for visulization.
        //         if (baseLiteralName === cliqueSolution){
        //             data[currentLiteralIndex].solutionState = "True"
        //             fullSolutionList.push(data[currentLiteralIndex])
        //         }
        //     }
        // });
        let nodes = [];
        let edges = [];
        let svg = new d3.select(ref).append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("class", "all");

        let centerX = width / 2;
        let centerY = height / 3;
        let r = centerX / 2;
        let center = { "x": centerX, "y": centerY }
        // new node("X","C", svg, center).show();

        try {
            data.sort((a, b) => (a.cluster > b.cluster) ? 1 : ((b.cluster > a.cluster) ? -1 : 0));


            let n = data.length;
            let m = n + n / 3;

            let dataCount = 0;
            for (var i = 0; i < m; i++) {
                if (i % 4 === 0) { continue; }
                //constructor(id, cluster, name, solutionState,svg, position = {"x":10,"y":10}, size = 15)
                let nodeName = data[dataCount].name;
                // let idTest;
                // if (nodeName.lastIndexOf('_')!=-1) {
                //    idTest = nodeName.substr(0, nodeName.lastIndexOf('_')) + "_" + dataCount;
                // }
                // else {
                //     idTest = nodeName + '_' + dataCount;
                // }

                
                // let nodeId = nodeName + '_' + dataCount;
                nodes[dataCount] = new node(nodeName, data[dataCount].cluster, nodeName, data[dataCount].solutionState, svg, positionByDegree(i * 360 / m, r, centerX, centerY));
                dataCount++;
            }

            // Creating edges between nodes
            for (var i = 0; i < nodes.length; i++) {
                for (var j = 0; j < nodes.length; j++) {
                    if (nodes[i].Cluster() !== nodes[j].Cluster()) {
                        let iVariable = nodes[i].Variable().split("_")[0]
                        let jVariable = nodes[j].Variable().split("_")[0]
                        let iName = nodes[i].Name().split("_")[0]
                        let jName = nodes[j].Name().split("_")[0]
                        if ((iName == jName && iVariable == jVariable) || iVariable !== jVariable) {
                            new edge(svg, nodes[i], nodes[j]);
                        }
                    }
                }
            }

            nodes.forEach(node => node.show());

        }
        catch (error) {console.log("SAT3ToCliqueReuction Data Sort Error, BAD DATA")}
    } catch (error) {console.log("NO VISUALIZATION DATA")}
}

function showCluster(cluster) {
    if (d3.select("#highlightGadgets").property("checked")) {
        d3.selectAll(".c_" + cluster)
            .attr("fill", VisColors.ClauseHighlight)
            .attr("stroke", VisColors.ClauseHighlight);
    }
}
//Element comes in as an exact id. Ie. x1, x2_1 ... !x3_2, etc.
function showElement(element) {
    let parsedElement = element;
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


class node {
    constructor(id, cluster, name, solutionState, svg, position = { "x": 10, "y": 10 }, size = 15) {
        this.svg = svg;
        this.x = position.x;
        this.y = position.y;
        this.size = size;
        this.name = name;
        this.cluster = cluster;
        this.solutionState = solutionState;
        this.variable = name.replace("!", "");
        this.id = "_" + id.replace("!", "NOT");
        this.color = VisColors.Background

        if (solutionState === "") {
            this.color = VisColors.Background
        }
        else if (solutionState === "True") {
            this.color = VisColors.Solution//green
        }
        else {
            this.color = VisColors.SolutionAlt//purple 
        }

    }
    show(c = this.cluster, e = this.id) {
        this.svg.append("circle")
            .attr("cx", this.x)
            .attr("cy", this.y)
            .attr("r", this.size)
            .attr("class", "c_" + this.cluster + " " + "gadget" + " " + "cliqueNode")
            .attr("id", this.id)
            .attr("fill", this.color)
            .on("mouseover", function () {
                showCluster(c);
                showElement(e);
            })
            .on("mouseout", function () {
                clear();
            })
        this.svg.append("text")
            .attr("x", this.x)
            .attr("y", this.y)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", 1 / 1.7 * this.size + "px")
            .text(this.name)
            .on("mouseover", function () {
                showCluster(c);
                showElement(e);
            })
            .on("mouseout", function () {
                clear();
            })
    }
    X() {
        return this.x;
    }
    Y() {
        return this.y;
    }
    Size() {
        return this.size;
    }
    Name() {
        return this.name;
    }
    Cluster() {
        return this.cluster;
    }
    Variable() {
        return this.variable;
    }
    Id() {
        return this.id;
    }


}

class edge {
    constructor(svg, A, B,) {
        this.svg = svg;
        this.A = A;
        this.B = B;
        svg.append("path")
            .attr("d", ("M " + A.X() + " " + A.Y()) + (" L " + B.X() + " " + B.Y()))
            .attr("stroke", VisColors.Edges)
    }
}

export {
    getClique
}