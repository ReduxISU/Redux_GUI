var request = new XMLHttpRequest()


var graphColoring;
var edgeList = [];
var nodeList = [];

const CSS_COLOR_NAMES = [
    "White",
    "Red",
    "Green",
    "Blue",
    "AntiqueWhite",
    "Aqua",
    "Aquamarine",
    "Azure",
    "Beige",
    "Bisque",
    "Black",
    "BlanchedAlmond",
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
    "WhiteSmoke",
    "Yellow",
    "YellowGreen",
];


// fetch json data
//http://localhost:27000/
// fetch('http://redux.aws.cose.isu.edu:27000/GRAPHCOLORINGGeneric/instance?problemInstance='+document.getElementById('problemInstanceText').value)
// fetch('http://redux.aws.cose.isu.edu:27000/GRAPHCOLORINGGeneric')
fetch('http://localhost:27000/GRAPHCOLORINGGeneric')
.then(res => res.json())
.then(data => {
    console.log(data);
    graphColoring = data;

    parseUndirectedGraph(graphColoring);
})


function parseUndirectedGraph(jsonData) {
    const newInstance = jsonData.instance.replaceAll('{', "").replaceAll('}', "");
   
   // [0] is nodes,  [1] is edges,  [2] is k.
    const splitInstance = newInstance.split(":");

    
    // add nodes to NodeList
    const nodes = splitInstance[0].split(",");
    for(var elem of nodes){
        let element = elem;
        if(elem.includes('!')){
            element  = element.replaceAll("!", "_");
        }
        
        /* Adding the node to the nodeList. */
        nodeList.push({ "name": element.trim(), "color": jsonData.nodeColoring[elem.trim()]});
    }

    // add edges to EdgeList
    const edges = splitInstance[1].split('&');
    for(var edge of edges){
        const fromTo = edge.split(',');
        
        let nodeFrom = fromTo[0];
        let nodeTo = fromTo[1];

        if(nodeFrom.includes("!") || nodeTo.includes("!")){
            nodeFrom = nodeFrom.replaceAll("!", "_");
            nodeTo =  nodeTo.replaceAll("!", "_");
        }

        edgeList.push({"source": nodeFrom.trim(), "target": nodeTo.trim()});
    }
    //creating visualization 
   createUndirectedColoredGraph(nodeList, edgeList);
}

// set node color 
function colorNode(d) {

    // node not colored 
    if (d.color === '-1') {

        return CSS_COLOR_NAMES[0];
    } 

    const color  = parseInt(d.color) + 1;
    if (color< CSS_COLOR_NAMES.length) {
        console.log("we out of colors");
        color = 0;

    }

    return CSS_COLOR_NAMES[color]; 
}

function createUndirectedColoredGraph(){
    var graph =  'graph G { ' + '\n';
    graph += 'node [style="filled"];  \n';
   
    for(var elem of edgeList){
        graph +=elem.source + '--' + elem.target + '; \n';
    }
    for(var elem of nodeList){
        graph += elem.name + '[fillcolor = '+ colorNode(elem) +']' + ' \n';
    }
   
    graph+= ' }';

    console.log(graph)

   createVisualization(graph);
}


function createVisualization(graph){
    d3.select("#reduceInstanceDiv").graphviz()
    .renderDot(graph);
}