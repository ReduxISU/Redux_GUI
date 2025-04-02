const VisColorsArray = [
    { key: "ElementHighlight", value: "#f69240" },
    { key: "ClauseHighlight", value: "#989898" },
    { key: "Background", value: "#abc" },
    { key: "Solution", value: "#00e676" },
    { key: "SolutionAlt", value: "#E600E3" },
    { key: "Edges", value: "#aaa" },
    { key: "Rose", value: "#CC6677" },
    { key: "Indigo", value: "#332288" },
    { key: "Sand", value: "#DDCC77" },
    { key: "Green", value: "#117733" },
    { key: "Cyan", value: "#88CCEE" },
    { key: "Wine", value: "#882255" },
    { key: "Teal", value: "#44AA99" },
    { key: "Olive", value: "#999933" },
    { key: "Purple", value: "#AA4499" }
];

const getColorByKey = (key) => {
    const colorObj = VisColorsArray.find(color => color.key === key);
    return colorObj ? colorObj.value : null;
};

export { VisColorsArray, getColorByKey };