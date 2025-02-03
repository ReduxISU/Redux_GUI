
import NavGraph, { nodesList, edgeList } from '../components/widgets/SearchBars/testAutoProb'
import { useEffect, useState, useRef } from "react";
import PopoverTooltipClick from '../components/widgets/PopoverTooltipClick';
import { Overlay, Popover } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
//import * as d3 from 'd3'


/**
 * 
 * @param {*} url the base url of the application 
 * @param {*} name The name of the selected problem
 * @returns A promise from the passed in url. 
 */
async function requestProblemData(url, name) {
  return await fetch(url + name + "Generic").then(resp => {
    if (resp.ok) {
      return resp.json()
    }
  });

}



export default function Test(props) {
  //const toolTip = { header: 'SAT3', formalDef: '3SAT = {Φ | Φ is a satisfiabile Boolean forumla in 3CNF}', info: '3SAT, or the Boolean satisfiability problem, is a problem that asks for a list of assignments to the literals of phi (with a maximum of 3 literals per clause) to result in', source: 'Complexity of computer computations. Springer, Boston, MA, 1972. 85-103.', credit: '3' }
  const [tool, setToolTip] = useState({});
  const [nodeTarget, setTarget] = useState();
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  // let popoverList = {}
  const popoverList = new Map()


  useEffect(() => {
    setToolTip({})
    
    // document.addEventListener("click", function (e) {
    //   setToolTip({})
    //   let target = (e.target);
    //   if (target.tagName !== 'ellipse') {
    //     setShow(false);
    //   }
    // })

    setTimeout(() => {

      // hide popover 


      for (let elem of nodesList) {
        let node = document.getElementById(elem)
        const ellipseArray = node.getElementsByTagName('ellipse');
        node.addEventListener('mouseover', function () {
          ellipseArray[0].setAttribute("fill", "#f69240")
        })

        node.addEventListener('mouseout', function () {
          ellipseArray[0].setAttribute("fill", "none")
        })

        node.addEventListener('click', function (e) {
          let nodeId = node.id;
          let target = (e.target);
          // setToolTip(popoverList.get(nodeId))
          // if (target.tagName === 'ellipse') {
          requestProblemData('http://localhost:27000/', nodeId).then(data => {
            if (!(typeof data === "undefined")) {
              setToolTip({ header: nodeId, formalDef: data.formalDefinition, info: data.problemDefinition + data.source })
            }
          }).catch(console.log("Problem not defined"));

          setTarget(node);
          // setToolTip(toolTip);
          setShow(true);

          // }else{
          //   setShow(false);
          // }
        })

        // requestProblemData('http://localhost:27000/', elem).then(data => {
        //   if (!(typeof data === "undefined")) {
        //     popoverList.set(elem,  setToolTip({ header: elem, formalDef: data.formalDefinition, info: data.problemDefinition + data.source }) )
        //   }
        // }).catch(console.log("Problem not defined"));


      }

      for (let elem of edgeList) {
        let edge = document.getElementById(elem)
        // const polygonArray =  edge.getElementsByTagName('polygon');
        //   edge.addEventListener('mouseover', function(){
        //   polygonArray[0].setAttribute("fill", "#f69240")
        //   })

      }
    }, 2000);
  }, [])

  return (

    <div ref={ref}>
      <NavGraph />
      {/* <Button onClick={handleClick}>Holy guacamole!</Button> */}

      <Overlay
        rootClose={true}
        show={show}
        target={nodeTarget}
        placement="bottom"
        container={ref}
      containerPadding={20}
      >
        <Popover id="popover-basic" className="tooltip">

          <Popover.Header as="h3">
            {tool.header}
          </Popover.Header>

          <Popover.Body>
            {tool.formalDef}
            <br></br>
            <br></br>
            {tool.info}
            <br></br>
            <br></br>
            {tool.source}
            <br></br><br></br>
            {tool.credit}
          </Popover.Body>

        </Popover>
      </Overlay>
    </div>

  );
}