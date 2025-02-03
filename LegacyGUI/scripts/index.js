// Create a request variable and assign a new XMLHttpRequest object to it to allow for Web API calls
var request = new XMLHttpRequest()
const reduxBaseUrl = 'http://redux.aws.cose.isu.edu:27000/'; //redux url. Note the trailing slash
//const reduxBaseUrl = 'http://localhost:27000/'


// Solve button
document.getElementById('solveButton').addEventListener('click', () => {
  console.log('Solve button clicked')
});

// Verify button
document.getElementById('verifyButton').addEventListener('click', () => {
  console.log('Verify button clicked')
});

// ------ Problem Dropdown ------ //

var problems = [
  // {label: '3SAT', value: '3SAT'},
  // {label: '3STAR', value: '3STAR'},
  // Populated upon onLoad via Web API
];

// Open a new connection, using the GET request on the URL endpoint
request.open('GET', reduxBaseUrl+ 'navigation/NPC_Problems', true)

request.onload = function () {
  // Begin accessing JSON data here
  var data = JSON.parse(this.response)
  console.log(data)
  data.forEach(element => {
    var newLabel = {label: element, value: element}
    problems.push(newLabel)
  });
  
}
// Send request
request.send()


// Problem Info button
document.getElementById('problemInfo').addEventListener('click', () => {
  console.log('Info button clicked')

  try {
    var problemSelection = document.getElementById('problemsAutocomplete').value

    // Check if the problem has a prepended type
    if (problemSelection.includes('_')) {
      problemSelection = problemSelection.split('_')[1]
    }
    var route = reduxBaseUrl + problemSelection + "Generic"
    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', route, true)

    request.onload = function () {
      // Get the problem information and populate the problem dropdown
      if (this.response) {
        var data = JSON.parse(this.response)

        // Populate problem description
        $("#problemInfo").popover("dispose").popover({
          title: "Problem Information",
          content: problemSelection + ": " + data.formalDefinition
        });
        $("#problemInfo").popover("show");}
  }
      // Send request
      request.send()
  }
  catch(error) {

    // Populate it with "Problem not found" NOT BEING CALLED FOR SOME REASON
    $("#problemInfo").popover("dispose").popover({
      title: "Problem Information",
      content: "Problem not selected or problem not available"
    });
    $("#problemInfo").popover("show");
    console.log("hitting this")
    console.error(error);
  }
  
});

// Problem Instance Field

var problemInstanceField = document.getElementById('problemsAutocomplete');
problemInstanceField.addEventListener("change", function(){
  var collapseAreaProblem = document.getElementById('collapseArea');
  var bsCollapse = new bootstrap.Collapse(collapseAreaProblem, {
    toggle: false
  });
  bsCollapse.show();

  document.getElementById('reduceRow').hidden = false;
  document.getElementById('visualizeRow').hidden = false
  document.getElementById('solveRow').hidden = false
  document.getElementById('verifyRow').hidden = false

  // updateVisualization()

  try {
    var problemSelection = document.getElementById('problemsAutocomplete').value

    // Check if the problem has a prepended type
    if (problemSelection.includes('_')) {
      problemSelection = problemSelection.split('_')[1]
    }

    var route = reduxBaseUrl + problemSelection + "Generic"
    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', route, true)

    request.onload = function () {
      // Get the problem information and populate the problem dropdown
      if (this.response) {
        var data = JSON.parse(this.response)
        const textBoxContents = document.getElementById('problemInstanceText').value = data.defaultInstance
        //console.log(textBoxInstance)
      }
  }

  // ------ Problem Instance Textbox ------ //

var problemInstanceTextBox = document.getElementById('problemInstanceText')
problemInstanceTextBox.addEventListener("change", function(){
  console.log(problemInstanceTextBox.value)

})

      // Send request
      request.send()
      
  }
  catch(error) {
    // Populate it with "Problem not found" NOT BEING CALLED FOR SOME REASON
    $("#problemInfo").popover("dispose").popover({
      title: "Problem Information",
      content: "Problem not selected or problem not available"
    });
    $("#problemInfo").popover("show");
    console.log("hitting this")
    console.error(error);
  }
});






// ------ Reduce to Dropdown ------ //

// Populate the ReduceTo Field
var reduceTo = [
  //{label: 'CLIQUE', value: 'CLIQUE'},
  //{label: 'Clustering', value: 'Clustering'},
  // Populated upon onLoad via Web API
];


document.getElementById('reduceToAutocomplete').addEventListener('change', () => {
  var collapseAreaReduce = document.getElementById('collapseArea2');
  var bsCollapse = new bootstrap.Collapse(collapseAreaReduce, {
    toggle: false
  });
  bsCollapse.show();
});

document.getElementById('reduceToAutocomplete').addEventListener('click', () => {
  const noReductionFoundErr = "No Reductions Available" //API returns this message on no reductions found. 
  reduceTo = [];
  reduceToAC.setData(reduceTo);

  try {

    //gets instance
    var problemSelection = document.getElementById('problemsAutocomplete').value

        // Open a new connection, using the GET request on the URL endpoint
    var route = reduxBaseUrl + 'Navigation/Problem_Reductions?chosenProblem=' + problemSelection
    request.open('GET', route, true)
    request.onload = function () {
      // Get the problem information and populate the problem dropdown
      
      var data = JSON.parse(this.response) //Converts the json sent into an object.

        console.log(data.ERROR) //error is undefined if a reduction is found, defined if an error is returned. 
        if(data.ERROR!=noReductionFoundErr){
        // Begin accessing JSON data here and parse it out into the reduceTo array
        console.log(data)
        data.forEach(element => {
          var newLabel = {label: element, value: element}
          reduceTo.push(newLabel)
        });
        reduceToAC.setData(reduceTo);
      }
      else{
        console.log(data)
      }
      
  }
      // Send request
      request.send()
  }
  catch(error) {
    console.error(error);
  }
  
}); // Might want to remove the once rule. Will talk to paul about this


// Populate the SelectReduction Field
var reductions = [
  //{label: "Paul's reduction", value: "Paul's reduction"},
  //{label: 'Power reduction', value: 'Power reduction'},
  // Populated upon onLoad via Web API
];

document.getElementById('reductionsAutocomplete').addEventListener('click', () => {
  reductions = [];
  reductionsAC.setData(reductions);

  try {
    var problemFromSelection = document.getElementById('problemsAutocomplete').value
    var problemToSelection = document.getElementById('reduceToAutocomplete').value

    var route = reduxBaseUrl + 'Navigation/PossibleReductions?reducingFrom=' + problemFromSelection +
                '&reducingTo=' + problemToSelection
    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', route, true)
    request.onload = function () {
      // Get the problem information and populate the problem dropdown
      if (this.response) {
        // Begin accessing JSON data here and parse it out into the reduceTo array
        var data = JSON.parse(this.response)
        console.log(data)
        data.forEach(element => {
          var newLabel = {label: element.split('.')[0], value: element.split('.')[0]}
          reductions.push(newLabel)
        });
        reductionsAC.setData(reductions);
      }
  }
      // Send request
      request.send()
  }
  catch(error) {
    console.error(error);
  }
  
}, {once : true}); // Might want to remove the once rule. Will talk to paul about this

// ReductionTo Info button
document.getElementById('reductionToInfo').addEventListener('click', () => {

  try {
    var problemSelection = document.getElementById('reduceToAutocomplete').value

    // Check if the problem has a prepended type
    if (problemSelection.includes('_')) {
      problemSelection = problemSelection.split('_')[1]
    }
    var route = reduxBaseUrl + problemSelection + "Generic"
    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', route, true)

    request.onload = function () {
      // Get the problem information and populate the problem dropdown
      if (this.response) {
        var data = JSON.parse(this.response)

        // Populate problem description
        $("#reductionToInfo").popover("dispose").popover({
          title: "ReductionTo Problem Information",
          content: problemSelection + ": " + data.formalDefinition
        });
        $("#reductionToInfo").popover("show");}
  }
      // Send request
      request.send()
  }
  catch(error) {

    // Populate it with "Problem not found" NOT BEING CALLED FOR SOME REASON
    $("#reductionToInfo").popover("dispose").popover({
      title: "ReductionTo Problem Information",
      content: "Problem not selected or problem not available"
    });
    $("#reductionToInfo").popover("show");
    console.log("hitting this")
    console.error(error);
  }
  
});

// Reduction Info Button
document.getElementById('reductionInfo').addEventListener('click', () => {

  try {
    var reductionSelection = document.getElementById('reductionsAutocomplete').value

    // ChecSk if the problem has a prepended type
    if (reductionSelection.includes('_')) {
      reductionSelection = reductionSelection.split('_')[1]
    }
    var route = reduxBaseUrl + reductionSelection + '/info'
    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', route, true)

    request.onload = function () {
      // Get the problem information and populate the problem dropdown
      if (this.response) {
        var data = JSON.parse(this.response)

        // Populate problem description
        $("#reductionInfo").popover("dispose").popover({
          title: "ReductionTo Problem Information",
          content: reductionSelection + ": " + data.reductionDefinition
        });
        $("#reductionInfo").popover("show");}
  }
      // Send request
      request.send()
  }
  catch(error) {

    // Populate it with "Problem not found" NOT BEING CALLED FOR SOME REASON
    $("#reductionInfo").popover("dispose").popover({
      title: "Problem Information",
      content: "Problem not selected or problem not available"
    });
    $("#reductionInfo").popover("show");
    console.log("hitting this")
    console.error(error);
  }
  
});

// Reduce Button Functionality
document.getElementById('reduceButton').addEventListener('click', () => {
  try {
    var reductionSelection = document.getElementById('reductionsAutocomplete').value
    var reduceFromInstance = decodeURI(document.getElementById('problemInstanceText').value)
    var parsedInstance = reduceFromInstance
    parsedInstance = reduceFromInstance.replaceAll('&','%26');
    //parsedInstance = reduceFromInstance.replaceAll(' ','%20');
    



    var route = reduxBaseUrl + reductionSelection + '/reduce?problemInstance=' + decodeURI(parsedInstance)
    //var route = 'http://localhost:27000/' + reductionSelection + '/reduce?problemInstance=' + decodeURI(parsedInstance)

    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', route, true)

    request.onload = function () {
      // Get the problem information and populate the problem dropdown
      if (this.response) {
        var data = JSON.parse(this.response)
        console.log(data)
        document.getElementById('reduceInstanceText').textContent = data.reductionTo.instance
      }
  }
      // Send request
      request.send()
  }
  catch(error) {
    console.error(error);
  }

});

// ------ Visualize Dropdown ------ //

document.getElementById('collapseArea3').addEventListener('show.bs.collapse', () => {
  updateVisualization()
})

function updateVisualization() {
  var problemSelection = document.getElementById('problemsAutocomplete').value

  // Check if the problem has a prepended type
  if (problemSelection.includes('_')) {
    problemSelection = problemSelection.split('_')[1]
  }
  if (problemSelection === "GRAPHCOLORING") {
    reloadVisualizationScript("scripts/VertexColoringV2.js");
  }
  else if (problemSelection ==="ARCSET") {
    reloadVisualizationScript("scripts/ArcsetV2.js");
  }
  else if (problemSelection ==="DM3") {
    reloadVisualizationScript("scripts/DM3Generic.js");
  }
  else if (problemSelection ==="VERTEXCOVER") {
    reloadVisualizationScript("scripts/VertexCover.js");
  }
}

function reloadVisualizationScript(scriptSource) {
  var scriptTag = document.getElementById('visualization');
  var parent = document.getElementsByTagName('body')[0];
  parent.removeChild(scriptTag);
  scriptTag = document.createElement("script");
  scriptTag.setAttribute("id", "visualization"); 
  scriptTag.src = scriptSource;
  parent.appendChild(scriptTag);
}

// document.getElementById('collapseArea3').addEventListener('hide.bs.collapse', () => {
//   console.log("og");
//   var scriptTag = document.getElementById('visualization');
//   scriptTag.src = "";
// })






// ------ Solve Dropdown ------ //

var solvers = [
  //{label: "Default CLIQUE solver (Greedy Heuristic Solver)", value: "Default CLIQUE solver (Greedy Heuristic Solver)"},
  // Populated upon onLoad via Web API
];

//Get Solver
document.getElementById('solversAutocomplete').addEventListener('click', () => {
  solvers = [];
  solversAC.setData(solvers);
  try {
    var problemFromSelection = document.getElementById('problemsAutocomplete').value

    var route = reduxBaseUrl+'Navigation/Problem_Solvers?chosenProblem=' + problemFromSelection

    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', route, true)
    request.onload = function () {
      // Get the problem information and populate the problem dropdown
      if (this.response) {
        // Begin accessing JSON data here and parse it out into the reduceTo array
        var data = JSON.parse(this.response)
        console.log(data)
        data.forEach(element => {
          var newLabel = {label: element.split('.')[0], value: element.split('.')[0]}
          solvers.push(newLabel)
        });
        solversAC.setData(solvers);
      }
  }
      // Send request
      request.send()
  }
  catch(error) {
    console.error(error);
  }

}, {once : true});

// Get Solver Info
document.getElementById('solverInfo').addEventListener('click', () => {

  try {
    var solverSelection = document.getElementById('solversAutocomplete').value

    var route = reduxBaseUrl + solverSelection + '/info'
    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', route, true)

    request.onload = function () {
      // Get the problem information and populate the problem dropdown
      if (this.response) {
        var data = JSON.parse(this.response)

        // Populate problem description
        $("#solverInfo").popover("dispose").popover({
          title: "Solver Information",
          content: solverSelection + ": " + data.solverDefinition
        });
        $("#solverInfo").popover("show");}
  }
      // Send request
      request.send()
  }
  catch(error) {

    // Populate it with "Problem not found" NOT BEING CALLED FOR SOME REASON
    $("#solverInfo").popover("dispose").popover({
      title: "Solver Information",
      content: "Solver not selected or problem not available"
    });
    $("#solverInfo").popover("show");
    console.log("hitting this")
    console.error(error);
  }
  
});

// Solve Button Functionality. 
document.getElementById('solveButton').addEventListener('click', () => {
  try {
    var solverSelection = document.getElementById('solversAutocomplete').value

    var reduceFromInstance = decodeURI(document.getElementById('problemInstanceText').value)
    var parsedInstance = reduceFromInstance
    parsedInstance = reduceFromInstance.replaceAll('&','%26');

    var route = reduxBaseUrl + solverSelection + '/solve?problemInstance=' + decodeURI(parsedInstance)
    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', route, true)

    request.onload = function () {
      // Get the problem information and populate the problem dropdown
      if (this.response) {
        var data = JSON.parse(this.response)
        console.log(data)
        document.getElementById('solutionText').textContent = data
      ;}
  }
      // Send request
      request.send()
  }
  catch(error) {
    console.error(error);
  }

});

// ------ Verify Dropdown ------ //

var verifiers = [
  //{label: "Default CLIQUE solver (Greedy Heuristic Solver)", value: "Default CLIQUE solver (Greedy Heuristic Solver)"},
  // Populated upon onLoad via Web API
];

//Get Verifiers
document.getElementById('verifiersAutocomplete').addEventListener('click', () => {
  verifiers = [];
  verifiersAC.setData(verifiers);
  try {
    var problemFromSelection = document.getElementById('problemsAutocomplete').value

    var route = reduxBaseUrl +'Navigation/Problem_Verifiers?chosenProblem=' + problemFromSelection

    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', route, true)
    request.onload = function () {
      // Get the problem information and populate the problem dropdown
      if (this.response) {
        // Begin accessing JSON data here and parse it out into the reduceTo array
        var data = JSON.parse(this.response)
        console.log(data)
        data.forEach(element => {
          var newLabel = {label: element.split('.')[0], value: element.split('.')[0]}
          verifiers.push(newLabel)
        });
        verifiersAC.setData(verifiers);
      }
  }
      // Send request
      request.send()
  }
  catch(error) {
    console.error(error);
  }

}, {once : true});


// Get Verifier Info
document.getElementById('verifierInfo').addEventListener('click', () => {

  try {
    var verifierSelection = document.getElementById('verifiersAutocomplete').value

    var route = reduxBaseUrl + verifierSelection + '/info'
    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', route, true)

    request.onload = function () {
      // Get the problem information and populate the problem dropdown
      if (this.response) {
        var data = JSON.parse(this.response)

        // Populate problem description
        $("#verifierInfo").popover("dispose").popover({
          title: "Solver Information",
          content: verifierSelection + ": " + data.verifierDefinition
        });
        $("#verifierInfo").popover("show");}
  }
      // Send request
      request.send()
  }
  catch(error) {

    // Populate it with "Problem not found" NOT BEING CALLED FOR SOME REASON
    $("#verifierInfo").popover("dispose").popover({
      title: "Verifier Information",
      content: "Verifier not selected or problem not available"
    });
    $("#verifierInfo").popover("show");
    console.log("hitting this")
    console.error(error);
  }
  
});

// Verifier Button Functionality
document.getElementById('verifyButton').addEventListener('click', () => {
  try {
    var verifierSelection = document.getElementById('verifiersAutocomplete').value
    var certificate = document.getElementById('verifyText').value
    certificate = certificate.replaceAll('&','%26');

    var reduceFromInstance = decodeURI(document.getElementById('problemInstanceText').value)
    var parsedInstance = reduceFromInstance
    parsedInstance = reduceFromInstance.replaceAll('&','%26');

    var route = reduxBaseUrl + verifierSelection + '/verify?certificate=' + certificate+'&problemInstance=' + decodeURI(parsedInstance)
    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', route, true)

    request.onload = function () {
      // Get the problem information and populate the problem dropdown
      if (this.response) {
        var data = JSON.parse(this.response)
        console.log(data)
        document.getElementById('verifyResult').textContent = data
      ;}
  }
      // Send request
      request.send()
  }
  catch(error) {
    console.error(error);
  }

});



// Autocomplete fields


// Autocomplete fields

var problems = [
  // {label: '3SAT', value: '3SAT'},
  // {label: '3STAR', value: '3STAR'},
  // {label: 'CLIQUE', value: 'CLIQUE'},
  // {label: 'SET PACKING', value: 'SET PACKING'},
];
const problemsAC = new Autocomplete(document.getElementById('problemsAutocomplete'),{
  threshold: 0,
  maximumItems: 20,
  data: problems
});

var reduceTo = [
  // {label: 'CLIQUE', value: 'CLIQUE'},
  // {label: 'Clustering', value: 'Clustering'},
];
const reduceToAC = new Autocomplete(document.getElementById('reduceToAutocomplete'),{
  threshold: 0,
  maximumItems: 20,
  data: reduceTo
});

const reductionsAC = new Autocomplete(document.getElementById('reductionsAutocomplete'),{
  data: reductions
});

const solversAC = new Autocomplete(document.getElementById('solversAutocomplete'),{
  threshold: 0,
  maximumItems: 20,
  data: solvers
});

const verifiersAC = new Autocomplete(document.getElementById('verifiersAutocomplete'),{
  threshold: 0,
  maximumItems: 20,
  data: verifiers
});


// Enable popovers
var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})
