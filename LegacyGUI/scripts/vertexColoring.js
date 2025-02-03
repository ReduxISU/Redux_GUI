// Create a request variable and assign a new XMLHttpRequest object to it to allow for Web API calls
var request = new XMLHttpRequest()
var graphColoring;
var nodeList = [];
var edgeList = [];

const CSS_COLOR_NAMES = [
    "AliceBlue",
    "AntiqueWhite",
    "Aqua",
    "Aquamarine",
    "Azure",
    "Beige",
    "Bisque",
    "Black",
    "BlanchedAlmond",
    "Blue",
    "BlueViolet",
    "Brown",
    "BurlyWood",
    "CadetBlue",
    "Chartreuse",
    "Chocolate",
    "Coral",
    "CornflowerBlue",
    "Cornsilk",
    "Crimson",
    "Cyan",
    "DarkBlue",
    "DarkCyan",
    "DarkGoldenRod",
    "DarkGray",
    "DarkGrey",
    "DarkGreen",
    "DarkKhaki",
    "DarkMagenta",
    "DarkOliveGreen",
    "DarkOrange",
    "DarkOrchid",
    "DarkRed",
    "DarkSalmon",
    "DarkSeaGreen",
    "DarkSlateBlue",
    "DarkSlateGray",
    "DarkSlateGrey",
    "DarkTurquoise",
    "DarkViolet",
    "DeepPink",
    "DeepSkyBlue",
    "DimGray",
    "DimGrey",
    "DodgerBlue",
    "FireBrick",
    "FloralWhite",
    "ForestGreen",
    "Fuchsia",
    "Gainsboro",
    "GhostWhite",
    "Gold",
    "GoldenRod",
    "Gray",
    "Grey",
    "Green",
    "GreenYellow",
    "HoneyDew",
    "HotPink",
    "IndianRed",
    "Indigo",
    "Ivory",
    "Khaki",
    "Lavender",
    "LavenderBlush",
    "LawnGreen",
    "LemonChiffon",
    "LightBlue",
    "LightCoral",
    "LightCyan",
    "LightGoldenRodYellow",
    "LightGray",
    "LightGrey",
    "LightGreen",
    "LightPink",
    "LightSalmon",
    "LightSeaGreen",
    "LightSkyBlue",
    "LightSlateGray",
    "LightSlateGrey",
    "LightSteelBlue",
    "LightYellow",
    "Lime",
    "LimeGreen",
    "Linen",
    "Magenta",
    "Maroon",
    "MediumAquaMarine",
    "MediumBlue",
    "MediumOrchid",
    "MediumPurple",
    "MediumSeaGreen",
    "MediumSlateBlue",
    "MediumSpringGreen",
    "MediumTurquoise",
    "MediumVioletRed",
    "MidnightBlue",
    "MintCream",
    "MistyRose",
    "Moccasin",
    "NavajoWhite",
    "Navy",
    "OldLace",
    "Olive",
    "OliveDrab",
    "Orange",
    "OrangeRed",
    "Orchid",
    "PaleGoldenRod",
    "PaleGreen",
    "PaleTurquoise",
    "PaleVioletRed",
    "PapayaWhip",
    "PeachPuff",
    "Peru",
    "Pink",
    "Plum",
    "PowderBlue",
    "Purple",
    "RebeccaPurple",
    "Red",
    "RosyBrown",
    "RoyalBlue",
    "SaddleBrown",
    "Salmon",
    "SandyBrown",
    "SeaGreen",
    "SeaShell",
    "Sienna",
    "Silver",
    "SkyBlue",
    "SlateBlue",
    "SlateGray",
    "SlateGrey",
    "Snow",
    "SpringGreen",
    "SteelBlue",
    "Tan",
    "Teal",
    "Thistle",
    "Tomato",
    "Turquoise",
    "Violet",
    "Wheat",
    "White",
    "WhiteSmoke",
    "Yellow",
    "YellowGreen",
];


// fetch json data
fetch('http://redux.aws.cose.isu.edu:27000/GRAPHCOLORINGGeneric/instance?problemInstance='+document.getElementById('problemInstanceText').value)
.then(res => res.json())
.then(data => {
    console.log(data)
    graphColoring = data 

    parseProblem(graphColoring)
})




// parse nodes and edges
function parseProblem(jsonData) {
    console.log("parsing problem");
 
    for (var elem of jsonData.nodes) {
        nodeList.push({ "name": elem, "color": jsonData.nodeColoring[elem]});
    }
    for (var elem of jsonData.edges) {
        edgeList.push({ "source": elem.Key, "target": elem.Value });
    }

    //creating visualization 
    createVisualization(nodeList, edgeList);
}

// set node color 
function colorNode(d) {

    // node not colored 
    if (d.color === '-1') {

        return "#eee";
    } 

    return CSS_COLOR_NAMES[parseInt(d.color)]; 
}


function createVisualization(nodes, edges) {
    var svg = d3.select("#reduceInstanceSvg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");


    nodes_data = nodes;
    links_data = edges;



    // create a force simulation 
    var simulation = d3.forceSimulation(nodes_data);

    var link_force = d3.forceLink(links_data)
        .id(function (d) { return d.name; });

    var charge_force = d3.forceManyBody()
        .strength(-100);

    var center_force = d3.forceCenter(width / 2, height / 2);

    simulation
        .force("charge_force", charge_force)
        .force("center_force", center_force)
        .force("links", link_force)
        .on("tick", tickActions);



    // Draw lines, circles, text
    var g = svg.append("g")
        .attr("class", "everything");

    var link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links_data)
        .enter().append("line")
        .attr("stroke-width", 2)
        .style("stroke", "black");

    //draw circles for the nodes
    var node = g.selectAll('.nodes')
        .data(nodes_data)
        .enter().append('g')
        .attr('class', 'nodes')

    node.append('circle')
        .attr("r", 15)
        .attr("fill", colorNode)

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function (d) { return d.name });


    //add drag capabilities
    var drag_handler = d3.drag()
        .on("start", drag_start)
        .on("drag", drag_drag)
        .on("end", drag_end);


    drag_handler(node);


    //add zoom capabilities
    // var zoom_handler = d3.zoom()
    //     .on("zoom", zoom_actions);

    // zoom_handler(svg);

        //Zoom functions
function zoom_actions(){
    g.attr("transform", d3.event.transform)
}


    
    function tickActions(e) {

        node.attr('transform', d => `translate(${d.x},${d.y})`);


        link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });
    }





    //Drag functions
    //d is the node
    function drag_start(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    //make sure you can't drag the circle outside the box
    function drag_drag(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function drag_end(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    // Drag functions end


}