import * as d3 from 'd3'
import VisColors from '../constants/VisColors';
import dynamic from "next/dynamic";


// let data = [
//     [
//         "x1",
//         "!x2",
//         "x3"
//     ],
//     [
//         "!x1",
//         "x3",
//         "x1"
//     ],
//     [
//         "x2",
//         "!x3",
//         "x1"
//     ],
// ]
const width = 600;
const height = 600;


let clauses = [];
let literals = [];
function getSat3(ref, data, parentState) {
    
    
   // var element = d3.select("#" + divID);
    //var width = element.node().getBoundingClientRect().width;
    //var parentWidth = element.getBoundingClientRect().width;
    //width = parentWidth;   
    let svg = new d3.select(ref).append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("class", "all");
    // new clause("a",svg,100,200,["X","Y","Z"]).show();
    let x = 20;
    let y = 100;
    

    for (let i = 0; i < data.length; i++){
        let c = new clause(data, i, svg, x, y, [data[i][0], data[i][1], data[i][2]], 15);
        c.show();
        x += c.width + 8;
        if (i < data.length-1){
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
        .attr("fill",VisColors.ElementHighlight)
        .attr("stroke",VisColors.ElementHighlight);

    d3.select(ref).selectChildren()._groups[0]?.slice(1).map((child) => d3.select(child).remove())
}

function showSolution(solution) {
    for(let i=0; i<solution.length; i++){
        d3.selectAll("."+solution[i])
            .attr("fill",VisColors.Solution)
            .attr("stroke", VisColors.Solution);
    }
}
function showCluster(cluster){
    if(d3.select("#highlightGadgets").property("checked")){
    d3.selectAll(".c_"+cluster)
        .attr("fill", VisColors.ClauseHighlight)
        .attr("stroke", VisColors.ClauseHighlight);
    }
}
function showElement(element){
    if(d3.select("#highlightGadgets").property("checked")){
    d3.selectAll("#"+element)
        .attr("fill", VisColors.ElementHighlight)
        .attr("stroke", VisColors.ElementHighlight);
    }
}
function clear(){
    if(d3.select("#highlightGadgets").property("checked")){
    d3.selectAll(".gadget")
        .attr("fill", VisColors.Background)
        .attr("stroke", VisColors.Background);
    }
}
function fullClear(){
    d3.selectAll(".gadget")
        .attr("fill", VisColors.Background)
        .attr("stroke", VisColors.Background);
}

class literal{
    constructor(id, className, name, svg, x, y, size = 25){
        this.id = "_"+id.replace("!","NOT")
        this.className = className;
        this.name = name;
        this.svg = svg;
        this.x = x;
        this.y = y;
        this.size = size;
    }
    show(c = this.className, e = this.id){
        this.svg.append("rect")
            .attr("x", this.x)
            .attr("y", this.y-this.size/2)
            .attr("fill", VisColors.Background)
            .attr("height", this.size)
            .attr("width", this.size*this.name.length-7)//subtracting 7 since the stroke length is 7.
            .attr("id", this.id)
            .attr("class", "c_"+this.className+" gadget"+" "+this.name.replace("!","NOT"))
            .attr("stroke-linejoin","round")
            .attr("stroke-width", "7px")
            .on("mouseover", function () {
                showCluster(c)
                showElement(e);
            })
            .on("mouseout", function () {
                clear();
            })
        this.svg.append("text")
            .attr("class", this.className)
            .attr("x", this.x)
            .attr("y", this.y)
            .attr("text-anchor", "left")
            .attr("dominant-baseline", "middle")
            .attr("font-size", this.size+"px")
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

class clause{
    constructor(data,className,svg,x,y,literals,size = 20,solution=[["x1"]]){
        this.className = className;
        this.svg = svg;
        this.x = x;
        this.y = y;
        this.size = size;
        this.literalsIDs = [];
        this.solution = solution;
        // for (let i=0; i<literals.length; i++){
        //     this.literalsIDs[i] = literals[i] + "_"+(i + className*3); //ALEX NOTE: I don't understand this math but it has to do with underscores in names
        // }
        for(let i=0; i<literals.length; i++){
            let count = 0;
            for(let j=0; j<className; j++){
                data[j].forEach(element => {
                    if(element == literals[i]){
                        count += 1;
                    }
                }); 
                
            }
            for(let j=0; j<i; j++){
                if(literals[j] == literals[i]){
                    count +=1;
                }
            }
            if(count > 0){
                this.literalsIDs[i] = literals[i] + "_"+(count);
            }
            else{
                this.literalsIDs[i] = literals[i];
            }
        }
        this.literalsSolutions = [];
        for (let i=0; i<literals.length; i++){
            if (this.solution[0].includes(literals[i])){
                this.literalsSolutions[i] = true;
            }
            else{
                this.literalsSolutions[i] = false;
            }
        }
        this.literals = literals
        this.width = 0;
        //012 345 678
        //
    }
    show(c = this.className){
        let l1 = new literal(this.literalsIDs[0], this.className, this.literals[0], this.svg, (this.x + this.size), this.y, this.size, this.literalsSolutions[0]);
        let l2 = new literal(this.literalsIDs[1], this.className, this.literals[1], this.svg, (this.x + this.size*2 + l1.size*l1.name.length), this.y, this.size, this.literalsSolutions[1]);   
        let l3 = new literal(this.literalsIDs[2], this.className, this.literals[2], this.svg, (this.x + this.size*3 + l1.size*l1.name.length + l2.size*l2.name.length), this.y, this.size, this.literalsSolutions[2]);
        this.width = this.size*3 + l1.size*l1.name.length + l2.size*l2.name.length + l3.size*l3.name.length + this.size/2;
        this.svg.append("rect")
            .attr("x", this.x)
            .attr("y", this.y-this.size)
            .attr("fill", VisColors.Background)
            .attr("stroke", VisColors.Background)
            .attr("height", this.size*2)
            .attr("width", this.width)
            .attr("class", "c_"+this.className+" gadget")
            .attr("stroke-linejoin","round")
            .attr("stroke-width", "7px")
            .on("mouseover", function () {
                showCluster(c);
            })
            .on("mouseout", function () {
                clear();
            })
        this.svg.append("text")
            .attr("x", this.x)
            .attr("y", this.y)
            .attr("text-anchor", "left")
            .attr("dominant-baseline", "middle")
            .attr("font-size", this.size+"px")
            .text("(");
        l1.show();
        this.svg.append("text")
            .attr("x", this.x + this.size + l1.size*l1.name.length)
            .attr("y", this.y)
            .attr("text-anchor", "left")
            .attr("dominant-baseline", "middle")
            .attr("font-size", this.size+"px")
            .attr("font-family", "'Courier New', Courier, monospace")
            .text("\u2228");
        l2.show();     
        this.svg.append("text")
            .attr("x", this.x + this.size*2 + l1.size*l1.name.length + l2.size*l2.name.length)
            .attr("y", this.y)
            .attr("text-anchor", "left")
            .attr("dominant-baseline", "middle")
            .attr("font-size", this.size+"px")
            .attr("font-family", "'Courier New', Courier, monospace")
            .text("\u2228");
        l3.show();
        this.svg.append("text")
            .attr("x", this.x + this.size*3 + l1.size*l1.name.length + l2.size*l2.name.length + l3.size*l3.name.length)
            .attr("y", this.y)
            .attr("text-anchor", "left")
            .attr("dominant-baseline", "middle")
            .attr("font-size", this.size+"px")
            .attr("font-family", "'Courier New', Courier, monospace")
            .text(")");
       
        // this.
    }
}

export{
    getSat3,
    showSolution,
    fullClear
}