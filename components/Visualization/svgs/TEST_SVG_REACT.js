
import React from "react";
import * as d3 from "d3";
import { svg } from "d3";
import dynamic from "next/dynamic";
import {useRef,useEffect,useState} from 'react'


function TestSvgReact(props) {
    const ref = useRef(null);
    const dimensions = { width: 400, height: 400, margin: { top: 30, right: 30, bottom: 30, left: 60 } }

    const generateDataset = () => (
        Array(10).fill(0).map(() => ([
           Math.random() * 80 + 10,
           Math.random() * 35 + 10,
        ]))
    )
    const { width, height, margin } = dimensions;
    const svgWidth = width + margin.left + margin.right;
    const svgHeight = height + margin.top + margin.bottom;
    const [dataset, setDataset] = useState(
        generateDataset()
    )
    


   useEffect(() => {
   const svgElement = d3.select(ref.current)
   svgElement.selectAll("circle")
           .data(dataset)
           .join("circle")
           .attr("cx", d => d[0])
           .attr("cy", d => d[1])
           .attr("r",  3)
}, [])


    return (
        <svg ref = {ref} width={svgWidth} height={svgHeight}>    
        </svg>
)     
}
export default dynamic(() => Promise.resolve(TestSvgReact), {
    ssr: false
})
  

