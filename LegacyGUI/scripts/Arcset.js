




	var nodesTest = [
		{id: '1',name:"1"},
		{id: '2',name:"2"},
		{id: '3',name:"3"},
		{id: '4',name:"Daniel"},
		// {id: '5',name:"Elliot"},
		// {id: '6',name:"Fish"},
		// {id: '7',name:"Ghost"},
		// {id: '8',name:"Hello"},
		// {id: '9',name:"Ink"}
	]
	var edgesTest = [
	
	{source:'4',target:'1'},
	{source:'1',target:'2'},
	{source:'4',target:'3'},
	{source:'3',target:'2'},
	{source:'2',target:'4'}
	// {source:'C',target:'D'},
	// {source:'E',target:'G'},
	// {source:'E',target:'H'},
	// {source:'E',target:'A'},
	// {source:'E',target:'B'},
	// {source:'C',target:'F'},
	// {source:'H',target:'G'},
	// {source:'I',target:'C'},
	// {source:'F',target:'F'}
	]

	var initNodes = [
		{id: 'TEST',name:"TEST"}
	]


	
function arcsetReq(){

	var nodesTestReq = []; //request List
	var edgesTestReq = []; //request List
	//ticked();
	var baseUrl = 'http://redux.aws.cose.isu.edu:27000/ArcsetJsonPayload';
	var totalUrl = baseUrl + "?listType=nodes";
	var test =fetch(totalUrl)
	.then(res => res.json())
	.then(data => parseNodes(data))
	.catch(err=> {console.log(err)});

	var totalUrl = baseUrl + "?listType=edges";
	fetch(totalUrl)
	.then(res => res.json())
	.then(data => {
	parseEdges(data)
	.catch(err=> {console.log(err)});
	
	});

	function parseNodes(jsonData) {
		console.log("parsing nodes");
		var retArr ={};
		var num = 0
		for (var elem of jsonData) {

			nodesTestReq.push({"name":elem.name});
			initNodes.push({"name":elem.name})
			num++;
			console.log(elem);
		}
	
	}
	function parseEdges(jsonData){
		console.log("parsing edges");
		var nodesTestReq = []; //request List
		var edgesTestReq = []; //request List
		var num = 0;
		for (var elem of jsonData) {
			// var node1 = {id:elem.node1.name,name:elem.node1.name,x:1,y:1,vx:1,vy:1}
			// var node2 = {id:elem.node2.name,name:elem.node2.name,x:1,y:1,vx:1,vy:1}
		
			//var edge = {"source":elem.node1.name,"target":elem.node2.name};
			num++
			edgesTestReq.push({ "source": elem.node1, "target": elem.node2});
			//edgesTestReq.push(edge);
			//console.log(edge);
		}
	}


	
	return [nodesTestReq,edgesTestReq];
}


var nodesTestReq = [];
var edgesTestReq = [];
async function jsonReq(){

	var workingJson = 'http://redux.aws.cose.isu.edu:5501/scripts/test.json';
	var baseUrl = 'http://redux.aws.cose.isu.edu:27000/ARCSETGENERIC';
	var totalUrl = baseUrl;
	
	var bigG = {};
	var promise =await fetch(totalUrl)
	.then(response => response.json())
	.then((data) => {
	  //console.log(nodesTestReq)
	  bigG = parseJson(data.directedGraph,nodesTestReq,edgesTestReq)
	})
	// bigG.a = nodesTestReq;
	// bigG.b = edgesTestReq;
	console.log(bigG);
	// return bigG;
//return "AHHH";		
	return bigG;
}
function parseJson(jsonData,nTest,eTest){

	console.log("parsing json");

	// var nodes = jsonData.nodes;
	// var edges = jsonData.links;
	var nodes = jsonData.getNodeList;
	var edges = jsonData.getEdgeList;
	for(var n of nodes){
		//console.log(n)
		nTest.push({"name":n.name})
	}
	for(var elem of edges){
		console.log(elem)
		eTest.push({"source":elem.node1.name,"target":elem.node2.name})
		//console.log(elem);
		//console.log({"source":elem.source,"target":elem.target})
	}
	//console.log([nodesTestReq,edgesTestReq]);

	//  var tSim = d3.forceSimulation(nTest)
	// .force('charge', d3.forceManyBody().strength(-500))
	// .force('center', d3.forceCenter(width / 4, height / 2))
	// .force('link', d3.forceLink().links(eTest).id(function(d) { 
	// 	//console.log(d.id)
	// 	return d.id; }))
	// 	.on('tick', ticked);
	var obj = {};
	obj.a = nodesTestReq
	obj.b = edgesTestReq
	console.log(obj)
	return obj;

//return [nodesTestReq,edgesTestReq];

}
//var graph = new Arcset(nodesTestReq,edgesTestReq);
//console.log(graph.altNodes);
//console.log(graph.altLinks);
	

function createClasses(){
	document.getElementById("reduceInstanceSvg").innerHTML+='<g class="linksGUI"></g>';
	document.getElementById("reduceInstanceSvg").innerHTML+='<g class="nodes"></g>';
	document.getElementById("reduceInstanceSvg").innerHTML+='<g class="circles"></g>';
	document.getElementById("reduceInstanceSvg").innerHTML+='<g class="pointers"></g>';

}


	createClasses();
	//var graphArr =arcsetReq();
	var width = 1000;
	var height = 1000;

	// const gNodes = graphArr[0];
	// const gLinks  = graphArr[1];
	// console.log(nodesTestReq);
	 //console.log( edgesTestReq);
	 var graph = jsonReq().then(

		res=>{console.log(res)
		sim(res.a,res.b);
		}
	 )
	 .catch(err=>console.log(err));
	 
	 //var gArrA = graph.a;
	 //gArrA.push({name:"test"});

	//  console.log(graph);
	//  console.log(initNodes);
	//  console.log(initNodes.length);
	//  console.log(Array.isArray(graph.a));
	//  //gArrA.forEach(element => console.log(element));
	// // console.log(Object.keys(graph.a).length);
	// // console.log(graph.a[1]);
 	//  //var altNodes = graph.a;
 	//  //  var altLinks = graph.b;
	// //console.log(altNodes);
	// //console.log(altLinks);
	// console.log(nodesTest);
	// console.log(edgesTest);
	//  var altNodes = nodesTest;
	//   var altLinks = edgesTest;

	
	//   console.log(graph);
	//   console.log(graph[0][0]);
	//   console.log(edgesTest[0]);
	//   console.log(graph[1][0]);
	//   console.log(edgesTest[0]);

function sim(altNodes,altLinks){
	console.log(altNodes[0]);
	console.log(altNodes[1]);
	console.log(altLinks[0])
	console.log(altLinks);
	var simulation = d3.forceSimulation(altNodes)
.force('charge', d3.forceManyBody().strength(-500))
.force('center', d3.forceCenter(width / 4, height / 2))
.force('link', d3.forceLink().links(altLinks).id(function(d) { 
	//console.log(d.index)
	return d.name }))
	.on('tick', ticked);


	//console.log(jsonReq())

const angle = (anchor, point) => Math.atan2(anchor.y - point.y, anchor.x - point.x) * 180 / Math.PI + 180;

const a = {x: 20, y: 20};
const p = {x: 0,y: 0};

angle(a, p); // 225
//console.log(angle(a,p));
// angle in degrees, from example, same data
angleDeg = Math.atan2(a.y - p.y, a.x - p.x) * 180 / Math.PI; // 45
//console.log(angleDeg);
	


function updateNodes() {
	var u = d3.select('.nodes')
		.selectAll('text')
		.data(altNodes)
		.join('text')
		//.attr("r",100)
		.style("fill","#000")
		.text(function(d) {
			//console.log(d.name);
			return d.name;
		})
		.attr('x', function(d) {
			return d.x+15;
		})
		.attr('y', function(d) {
			return d.y
		})
		.attr('dy', function(d) {
			return 5
		})
		return u; //u = svg g object class = nodes
		}
		

 function updateLinks() {
	var u = d3.select('.linksGUI') 
		.selectAll('line')
		.data(altLinks)
		.join('line')
		.style("stroke","#000")

		.attr('x1', function(d) {
			//console.log(d.source.x)
			return d.source.x
		})
		.attr('y1', function(d) {
			return d.source.y
		})
		.attr('x2', function(d) {
			return d.target.x
		})
		.attr('y2', function(d) {
			return d.target.y
		})
		.attr('fCoords',function(d){
			const coords = {x:d.source.x,y:d.source.y}
			//console.log(coords);
			return coords;
		})
		.attr('tCoords',function(d){
			const coords = {x:d.target.x,y:d.target.y}
			//console.log(coords);
			return coords;
		})
		.attr('angle',function(d){
			const fromCoords = {x:d.source.x,y:d.source.y};
			const toCoords = {x:d.target.x,y:d.target.y};
			const angleBetween = angle(fromCoords,toCoords);
			d.angle = angleBetween;
			//console.log(angleBetween);
			return angleBetween;
		});
	
		return u;
}



	function updateCircles(){
		var u = d3.select(".circles")
		.selectAll('circle')
		.data(altNodes)
		.join('circle')
		.style('fill','black')
		.attr('r',10)
		.attr('cx',function(d){
			return d.x;
		})
		.attr('cy',function(d){
			return d.y;
		})
	}

	function updateArrows(){
		var u = d3.select(".pointers")
		.selectAll('circle')
		.data(altLinks)
		.join('circle')
		.style('fill','blue')
		.attr('r',1)
		.attr('cx',function(d){
			//console.log(d.target.x)
			return d.target.x - (1/6)*(d.target.x-d.source.x);
		})
		.attr('cy',function(d){
			return d.target.y - (1/6)*(d.target.y-d.source.y);
		})
		//.attr('height',50)
		//.attr('width',50)
	}

	function testTriangle(){
		var triangle = d3.symbol().type(d3.symbolTriangle).size(100);
		var translateStrx = 50
		var translateStry = 100;
		//var translateStrRotate = 60;
		//var translateString = "translate("+translateStrx+ ","+translateStry+")";

		var u = d3.select(".pointers")
		.selectAll('path')
		.data(altLinks)
		.join('path')
		.attr("d",triangle)
		.attr("fill", "#A9A9A9")
        .attr("transform", function(d){
			 translateStrx = d.target.x - (1/4)*(d.target.x-d.source.x);
			 translateStry = d.target.y - (1/4)*(d.target.y-d.source.y);
			 //console.log(d.angle)
			 translateStrRotate = d.angle-30;
			 translateStringCoords =  "translate("+translateStrx+ ","+translateStry+")";
			 translateStringRotate = "rotate("+translateStrRotate+")";
			var totalTranslation = translateStringCoords+ " "+translateStringRotate;
		
			
			//console.log(translateString);
			//return translateStringCoords;
			return totalTranslation;
		});
	}

	
function ticked() {
	//createClasses();
	var nodesSvg = updateNodes();
	var linksSvg = updateLinks();
	var arrowsSvg = updateCircles();
	var pointerSvg = updateArrows();
	var testtriangle = testTriangle();
	var totalSvg = d3.selectAll('g');
	//console.log("total",totalSvg);
	//console.log("links",updateLinks())

	return [totalSvg];

}

}




