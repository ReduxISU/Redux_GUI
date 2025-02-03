let problemInstance;
var hyperedgeColors = [
    "rgba(255,0,0,0.2)", //red
    "rgba(254,177,68,0.2)", //orange
    "rgba(0,255,0,0.2)", //green
    "rgba(0,0,255,0.2)", //blue
    "rgba(127,0,255,0.2)", //violet
    "rgba(165,42,42,0.2)", //brown
]

function findIndexOf(array, doubleArray){
    for(i=0; i<doubleArray.length; i++){
        var match = true;
        for(j=0; j<3; j++){
            if(array[j] != doubleArray[i][j])
            match = false;
        }
        if(match){return i;}
    }
}


function visualize(){
    fetch('http://redux.aws.cose.isu.edu:27000/DM3Generic/instance?problemInstance='+document.getElementById('problemInstanceText').value)
    .then(res => res.json())
    .then(data => {
        console.log(data.M)
        console.log(data.X)
        console.log(data.Y)
        console.log(data.Z)
        DM3 = data 

        getDM3(DM3)
    })
}
visualize();

document.getElementById('collapseArea3').addEventListener('show.bs.collapse', () => {
    document.getElementById('reduceInstanceSvg').innerHTML="";
    visualize();
})




function getDM3(DM3) {
    var XGroup = DM3.X;
    var YGroup = DM3.Y;
    var ZGroup = DM3.Z;
    var M = DM3.M;
    // var Solution = [["x1", "y4", "z2"], ["x2", "y1", "z3"], ["x3", "y2", "z4"]]

    var XNodes = [];
    var YNodes = [];
    var ZNodes = [];
    var Edges = [];
    var width = 1000;
    var height = 1000;
    var spacingx = 200;
    var spacingy = 150;
    var paddingx = 200;
    var paddingy = 100;
    
    svg = new d3.select("#reduceInstanceSvg").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "all");

    //create X-Y-Z nodes
    for (i = 0; i < XGroup.length; i++) {
        console.log(XGroup.length)
        XNodes[i] = (new node3DM("X", XGroup[i], svg, paddingx+spacingx*0, paddingy+spacingy*i));
        // YNodes[i] = (new node3DM("Y", YGroup[i], svg, paddingx+spacingx*1, paddingy+spacingy*i));
        // ZNodes[i] = (new node3DM("Z", ZGroup[i], svg, paddingx+spacingx*2, paddingy+spacingy*i));
    }
    for (i=0; i<YGroup.length; i++){
        YNodes[i] = (new node3DM("Y", YGroup[i], svg, paddingx+spacingx*1, paddingy+spacingy*i));
    }
    for (i=0; i<ZGroup.length; i++){
        ZNodes[i] = (new node3DM("Z", ZGroup[i], svg, paddingx+spacingx*2, paddingy+spacingy*i));
    }
    //create hyperedges
    for (i = 0; i < M.length; i++) {
        var X = XGroup.indexOf(M[i][0]);
        var Y = YGroup.indexOf(M[i][1]);
        var Z = ZGroup.indexOf(M[i][2]);
        Edges[i] = new hyperEdge3DM(i, svg, XNodes[X], YNodes[Y], ZNodes[Z], hyperedgeColors[i % hyperedgeColors.length]);
    }

    //show nodes
    for (i = 0; i < XNodes.length; i++) {
        XNodes[i].show();
    }
    for (i = 0; i < YNodes.length; i++) {
        YNodes[i].show();
    }    for (i = 0; i < ZNodes.length; i++) {
        ZNodes[i].show();
    }


}

function solve(){
    for(i=0; i<Solution.length; i++){
        var edge = Edges[findIndexOf(Solution[i], M)];
        var color = edge.Color();
        d3.select("#"+edge.Id())
            .attr("stroke", color.replace(/[^,]+(?=\))/, 1));
        
    }

}

class node3DM {
    constructor(className, name, svg, x, y, size = 25) {
        this.svg = svg;
        this.x = x;
        this.y = y;
        this.size = size;
        this.name = name;
        this.class = className;
    }
    show() {
        svg.append("circle")
            .attr("cx", this.x)
            .attr("cy", this.y)
            .attr("r", this.size)
            .attr("class", this.class)
            .attr("fill", "white")
            .attr("stroke","black")
            .attr("stroke_width","2px");
        svg.append("text")
            .attr("x", this.x)
            .attr("y", this.y)
            .attr("stroke", "black")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", 1 / 1.5 * this.size + "px")
            .text(this.name);
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


}

class hyperEdge3DM {
    constructor(id, svg, A, B, C, color = "rgba(0,255,0,0.3)") {
        this.svg = svg;
        this.A = A;
        this.B = B;
        this.C = C;
        this.id = "e"+id;
        this.color = color;
        this.clicked;
        svg.append("path")
            .attr("d", ("M " + A.X() + " " + A.Y()) + (" L " + B.X() + " " + B.Y()) + ("M " + B.X() + " " + B.Y()) + (" L " + C.X() + " " + C.Y()))
            .attr("stroke", color)
            .attr("stroke-width", 2 * A.Size() + "px")
            .attr("fill", "transparent")
            .attr("id", this.id)
            .on("mouseover", function (d) {
                if(!this.clicked){this.clicked = false;}
                d3.select(event.currentTarget).attr("stroke", color.replace(/[^,]+(?=\))/, 1));
            })
            .on("mouseout", function (d) {
                if(!this.clicked){
                    d3.select(event.currentTarget).attr("stroke", color);
                }
            })
            .on("click", function (d) {
                if (this.clicked == false) {
                    d3.select(event.currentTarget).attr("stroke", color.replace(/[^,]+(?=\))/, 1));
                    this.clicked = true;
                }
                else {
                    d3.select(event.currentTarget).attr("stroke", color);
                    this.clicked = false;
                }
            })
    }
    Id(){
        return this.id;
    }
    Clicked(bool){
        this.clicked = bool;
    }
    Color(){
        return this.color;
    }


}
