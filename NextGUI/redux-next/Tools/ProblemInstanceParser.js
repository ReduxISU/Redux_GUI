//Unlike most of the files in this project, this is not a React Componenent, it is instead a pure Javascript object.
// It contains functions for parsing passed in text, and returning an object with either error diagnostics, or a success message.
import Constants from "./Constants";

class ProblemInstanceParser {
    constructor() {
        
    }
    
    //Breaks parsing logic up by problem type, calls function based on type.
    parse(problemType, problemInstance) {
        let parsedOutput = {}

        if (problemType === Constants.ProblemTypes.Clique || problemType === Constants.ProblemTypes.VertexCover || problemType === Constants.ProblemTypes.GraphColoring) {
            parsedOutput = this.parseUndirectedGraph(problemInstance);
        }
        else if (problemType === Constants.ProblemTypes.Sat3) {
            parsedOutput = this.parseSat3(problemInstance);
        }
            
        else if (problemType === Constants.ProblemTypes.Arcset) {
            parsedOutput = this.parseDirectedGraph(problemInstance);
        }
        else {
            parsedOutput = {
                test: true,
                input: problemInstance,
                regex: "There is no regex string for this problem, parsing is likely not enabled",
                type: problemType,
                exampleStr: "There is no example string for this problem, click on the problem info box for more problem information"
                
            }
        }

    return parsedOutput
    }

    
    parseSat3(instance) {


        const type = "Sat3BooleanExp"
        // const sat3Format = /^(\((!)*\w+\|(!)*\w+\|(!)*\w+\))((&)(\((!)*\w+\|(!)*\w+\|(!)*\w+\)))*$/g
        const sat3Format = /^(\((!)*[^\W_]+\|(!)*[^\W_]+\|(!)*[^\W_]+\))((&)(\((!)*[^\W_]+\|(!)*[^\W_]+\|(!)*[^\W_]+\)))*$/g

        //[^\W_]
        const satRegex = new RegExp(sat3Format)
        const bool = satRegex.test(instance);
        return {test:bool,input:instance,regex:sat3Format,type:type,exampleStr:"(x1|!x2|x3)&(!x1|x3|x1)&(x2|!x3|x1)"}
    }
        
      
    parseUndirectedGraph(instance) {
        const type = "UndirectedGraph"
        const undirectedGraphFormat = /\(\({([\w!]+)(,([\w!]+))*},{\{([\w!]+),([\w!]+)\}(,\{([\w!]+),([\w!]+)\})*}\),\d+\)$/g; //checks for undirected graph format, implicitly regex
        const graphReg = new RegExp(undirectedGraphFormat);
        const bool = graphReg.test(instance)
        return {test:bool,input:instance,regex:undirectedGraphFormat,type:type,exampleStr:"(({a,b,c},{{a,b},{b,c}}),2)"}
    }

    parseDirectedGraph(instance) {
        const type = "DirectedGraph"
        const directedGraphFormat = /\(\({(([\w!]+)+(,([\w!]+))*)},{(\(([\w!]+),([\w!]+)\)(,\(([\w!]+),([\w!]+)\))*)*}\),\d+\)$/g
        const graphReg = new RegExp(directedGraphFormat);
        const bool = graphReg.test(instance);
        return {test:bool,input:instance,regex:directedGraphFormat,type:type,exampleStr:"(({a,b,c},{(a,b),(b,c),(c,a)}),3)"}
    }
    
}

export default ProblemInstanceParser