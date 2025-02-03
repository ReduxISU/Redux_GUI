var problemInstanceTextBox = document.getElementById('problemInstanceText')
var problemInstanceText = problemInstanceTextBox.value;
problemInstanceTextBox.addEventListener("change", function(){
  //console.log(problemInstanceTextBox.value)
//d3.selectAll("svg").remove();
  readJson()
})




function drawGraph(dotsPassed){
    //<div id="graph" style="text-align: center;">
   // document.getElementById("reduceInstanceSvg").innerHTML+='<div id="arcsetGraph" style="text-align: center;">';

    console.log(dotsPassed)

    // svg = new d3.select(svg.node().querySelector("#reduceInstanceSvg")).graphviz()
    // .renderDot(dotsPassed);
    // svg.append("#reduceInstanceSvg")
    // console.log(svg)
    // var svg = d3.select("#reduceInstanceSvg").append("svg").attr("width", 200).attr("height", 200)

    // // Add the path using this helper function
    // svg.append('circle')
    //   .attr('cx', 100)
    //   .attr('cy', 100)
    //   .attr('r', 50)
    //   .attr('stroke', 'black')
    //   .attr('fill', '#69a3b2');
    //document.getElementById("reduceInstanceSvg").innerHTML= "";

      var svg2 = d3.select("#reduceInstanceSvg");
      svg2.append("svg")
    
      .graphviz().renderDot(dotsPassed);
    

}


async function readJson () {
    // http://localhost:8080
    //var fetchPromise = fetch('./digraphTestData.json');
    //var userInstance = "{{1,2,3,4,5,6,7} : {(1,2) & (1,6) & (2,3) & (3,4) & (4,5) & (5,3) & (4,2)} : 2}"
    //var userInstance = document.getElementById('problemInstanceText').value;
  var userInstance = problemInstanceText;
  var url = new URL("http://redux.aws.cose.isu.edu:27000/ARCSETDev/instance/")
    //var devurl  = new URL("http://localhost:27000/ARCSETDev/instance/");
    var params = {problemInstance: userInstance,}
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    var fetchPromise = fetch(url)
    console.log(fetchPromise)
    return fetchPromise; 
 }
 //readJson();
 async function f1(){
     var promise =  readJson();
      promise.then(response => response.json()
        //{
    //     if (!response.ok) {
    //         throw new Error("HTTP error " + response.status);
    //     }
    //     console.log(response.json())
    //     return response.json();
    // }
    
    )
    .then(data => {
       // this.users = json;
        //testNestedArr[0] = json;
        //testNestedArr.push(json);
        console.log("HELLO")
        console.log(data);
        //dots2 = json;
       // dots2 = data;
      drawGraph(data)
    })
    .catch(function () {
        this.dataError = true;
    })
     console.log(promise);
 }

 f1(); //actual call to server.

//dots array is overriden by promise.
var dots = [
];

//var dots2 = "";


// console.log(JSON.stringify(dots2))
// var str = JSON.stringify(dots2, null, 2); // spacing level = 2
// console.log(str);