import * as d3 from "d3";
import dynamic from "next/dynamic";
import React, { useEffect, useRef } from "react";
import { getColorByKey } from "../constants/VisColorsArray";

function StandardSetSvgReact(props) {
  const ref = useRef(null);

  useEffect(() => {
    try {
      if (props.problemData) {
        globalY = 100;
        getSets(ref.current, props.problemData, props.gadgetMap, props.gadgetsOn);
      }
    } catch (error) {
      console.log("VISUALIZATION FAILED", error);
    }
  }, [props.problemData, props.gadgetMap, props.gadgetsOn]);

  return (
    <svg
      ref={ref}
      style={{
        height: "470px",
        width: "100%",
        marginRight: "0px",
        marginLeft: "0px",
      }}
    />
  );
}

function getSets(ref, data, gadgetMap, gadgetsOn) {
  const margin = { top: 200, right: 30, bottom: 30, left: 200 },
    width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

  d3.select(ref).selectAll("*").remove();

  const svg = d3
    .select(ref)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("class", "all");

  let x = 20;

  recursiveSets(data.data.list, svg, gadgetMap, gadgetsOn, x, width);

  d3.selectAll(".true")
    .attr("fill", getColorByKey("ElementHighlight"))
    .attr("stroke", getColorByKey("ElementHighlight"));

  d3.select(ref)
    .selectChildren()
    ._groups[0]?.slice(1)
    .map((child) => d3.select(child).remove());
}

function asciiToHex(str) {
  return Array.from(str)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
}

let globalY = 100; // start Y

function recursiveSets(sets, svg, gadgetMap, gadgetsOn, x, maxWidth) {
  for (let i = 0; i < sets.length; i++) {
    // Wrap line if needed
    if (x >= maxWidth - 50) {
      x = 20;
      globalY += 50;
    }

    const s = new CustomSet(
      sets[i].id,
      svg,
      x,
      globalY,
      sets[i].list || [sets[i]],
      13,
      gadgetMap,
      gadgetsOn,
      sets[i].isOrdered,
      sets[i].isValue || false,
      sets[i].color,
    );

    x = s.show(); // x after the set including its rectangle

    // Only add comma between sets
    if (i < sets.length - 1) {
      const commaGap = 8;
      svg
        .append("text")
        .attr("x", x + commaGap)
        .attr("y", globalY)
        .attr("text-anchor", "left")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "15px")
        .text(",")
        .style("pointer-events", "none");

      x += commaGap + 10; // move x past comma for next set
    }
  }
  return x;
}

function showCluster(clusterClass, gadgetMap) {
  if (!d3.select("#highlightGadgets").property("checked")) return;

  d3.selectAll("." + clusterClass)
    .attr("fill", getColorByKey("ClauseHighlight"))
    .attr("stroke", getColorByKey("ClauseHighlight"));

  const cleanElement = asciiToHex(clusterClass.replace(/^class/, ""));

  if (Array.isArray(gadgetMap)) {
    gadgetMap.forEach((item) => {
      if (
        (item.reductionFromIds.includes(cleanElement) ||
          item.reductionToIds.includes(cleanElement)) &&
        item.color === "ClauseHighlight"
      ) {
        [...item.reductionFromIds, ...item.reductionToIds].forEach((id) => {
          d3.selectAll("#id" + id.replace("!", "NOT"))
            .attr("fill", getColorByKey("ClauseHighlight"))
            .attr("stroke", getColorByKey("ClauseHighlight"));
        });
      }
    });
  }
}

function showElement(element, gadgetMap) {
  if (!d3.select("#highlightGadgets").property("checked")) return;
  if (!gadgetMap) return;

  d3.selectAll("#" + element)
    .attr("fill", getColorByKey("ElementHighlight"))
    .attr("stroke", getColorByKey("ElementHighlight"));

  const cleanElement = asciiToHex(element.replace(/^id/, ""));
  gadgetMap.forEach((item) => {
    if (
      (item.reductionFromIds.includes(cleanElement) ||
        item.reductionToIds.includes(cleanElement)) &&
      item.color === "ElementHighlight"
    ) {
      [...item.reductionFromIds, ...item.reductionToIds].forEach((id) => {
        d3.selectAll("#id" + id.replace("!", "NOT"))
          .attr("fill", getColorByKey("ElementHighlight"))
          .attr("stroke", getColorByKey("ElementHighlight"));
      });
    }
  });
}

function clear(gadgetMap) {
  d3.selectAll("[id^='id']")
    .attr("fill", getColorByKey("Background"))
    .attr("stroke", getColorByKey("Background"));
  d3.selectAll(".gadget")
    .attr("fill", getColorByKey("Background"))
    .attr("stroke", getColorByKey("Background"));

  if (Array.isArray(gadgetMap)) {
    gadgetMap.forEach((item) => {
      if (item.color === "ElementHighlight") {
        [...item.reductionFromIds, ...item.reductionToIds].forEach((id) => {
          d3.selectAll("#id" + id.replace("!", "NOT"))
            .attr("fill", getColorByKey("Background"))
            .attr("stroke", getColorByKey("Background"));
        });
      }
    });
  }
}

class element {
  constructor(id, className, name, svg, x, y, size = 25, gadgetMap, color, gadgetsOn) {
    this.id = "id" + asciiToHex(id);
    this.className = className;
    this.name = name;
    this.svg = svg;
    this.x = x;
    this.y = y;
    this.size = size;
    this.gadgetMap = gadgetMap;
    this.color = color;
    this.gadgetsOn = gadgetsOn;
  }
  show(c = this.className, e = this.id) {
    this.svg
      .append("rect")
      .attr("x", this.x)
      .attr("y", this.y - this.size / 2)
      .attr("fill", getColorByKey(this.color.trim()) || getColorByKey("Background"))
      .attr("height", this.size)
      .attr("width", this.size * this.name.length - 7)
      .attr("id", this.id)
      .attr("class", this.className + " gadget " + this.name.replace("!", "NOT"))
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", "7px")
      .on("mouseover", () => {
        if (this.gadgetsOn) {
          showCluster(c, this.gadgetMap);
          showElement(e, this.gadgetMap);
        }
      })
      .on("mouseout", () => {
        if (this.gadgetsOn) clear();
      });
    this.svg
      .append("text")
      .attr("class", this.name)
      .attr("x", this.x)
      .attr("y", this.y)
      .attr("text-anchor", "left")
      .attr("dominant-baseline", "middle")
      .attr("font-size", this.size + "px")
      .text(this.name)
      .style("pointer-events", "none");
  }
}

class CustomSet {
  constructor(
    className,
    svg,
    x,
    y,
    elements,
    size = 20,
    gadgetMap,
    gadgetsOn,
    isOrdered = false,
    isValue,
    color,
  ) {
    this.className = "class" + asciiToHex(className);
    this.svg = svg;
    this.x = x;
    this.y = y;
    this.size = size;
    this.elements = elements;
    this.width = 0;
    this.gadgetMap = gadgetMap;
    this.gadgetsOn = gadgetsOn;
    this.isOrdered = isOrdered;
    this.isValue = isValue;
    this.color = color;
  }

  show(c = this.className) {
    let offsetX = this.x + this.size;

    this.svg
      .append("text")
      .attr("x", this.x)
      .attr("y", this.y)
      .attr("text-anchor", "left")
      .attr("dominant-baseline", "middle")
      .attr("font-size", this.size + "px")
      .text(!this.isValue ? (this.isOrdered ? "(" : "{") : "")
      .style("pointer-events", "none");

    let hasNestedSets = false;

    this.elements.forEach((el, i) => {
      if (!el.isValue && el.list) {
        hasNestedSets = true;
        offsetX = recursiveSets([el], this.svg, this.gadgetMap, this.gadgetsOn, offsetX, 700);
        if (i < this.elements.length - 1) offsetX += 8;
      } else {
        const e = new element(
          el.id,
          this.className,
          el.value,
          this.svg,
          offsetX,
          this.y,
          this.size,
          this.gadgetMap,
          el.color,
          this.gadgetsOn,
        );

        e.show();
        offsetX += e.size * e.name.length - 7;
      }
      if (i < this.elements.length - 1) {
        const gap = 8;
        this.svg
          .append("text")
          .attr("x", offsetX + gap)
          .attr("y", globalY)
          .attr("text-anchor", "left")
          .attr("dominant-baseline", "middle")
          .attr("font-size", this.size + "px")
          .text(",")
          .style("pointer-events", "none");
        offsetX += this.size + gap;
      } else {
        offsetX += this.size;
      }
    });

    this.svg
      .append("text")
      .attr("x", offsetX)
      .attr("y", globalY)
      .attr("text-anchor", "left")
      .attr("dominant-baseline", "middle")
      .attr("font-size", this.size + "px")
      .text(!this.isValue ? (this.isOrdered ? ")" : "}") : "")
      .style("pointer-events", "none");

    this.width = offsetX - this.x + this.size / 2;

    if (!hasNestedSets) {
      this.svg
        .append("rect")
        .attr("x", this.x)
        .attr("y", this.y - this.size)
        .attr("fill", getColorByKey(this.color?.trim() || "Background"))
        .attr("stroke", getColorByKey(this.color?.trim() || "Background"))
        .attr("height", this.size * 2)
        .attr("width", this.width)
        .attr("class", this.className + " gadget")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", "7px")
        .lower()
        .on("mouseover", () => {
          if (this.gadgetsOn) showCluster(c, this.gadgetMap);
        })
        .on("mouseout", () => {
          if (this.gadgetsOn) clear();
        });
    }

    return offsetX;
  }
}

export default dynamic(() => Promise.resolve(StandardSetSvgReact), { ssr: false });
