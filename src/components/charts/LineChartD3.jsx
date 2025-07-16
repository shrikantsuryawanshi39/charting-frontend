import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function LineChartD3({ data, design }) {
    const svgRef = useRef();
    const tooltipRef = useRef();

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const tooltip = d3.select(tooltipRef.current);
        const svgWidth = design.width || 800;
        const svgHeight = design.height || 400;
        const margin = { top: 50, right: 50, bottom: 50, left: 60 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        svg.attr("width", svgWidth).attr("height", svgHeight);

        const chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Flatten x-axis values from any dataset (all datasets share x axis)
        const xValues = data[0]?.map(d => d[design.xAxisField]) || [];

        const xScale = d3.scalePoint()
            .domain(xValues)
            .range([0, width])
            .padding(0.5);

        const yMax = d3.max(data.flat(), d => d[design.yAxisField]) || 0;
        const yScale = d3.scaleLinear()
            .domain([0, yMax])
            .nice()
            .range([height, 0]);

        // Grid (Optional)
        if (design.showGrid) {
            chartGroup.append("g")
                .attr("class", "grid")
                .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));
        }

        // Y Axis
        chartGroup.append("g").call(d3.axisLeft(yScale));
        chartGroup.append("text")
            .attr("x", -40)
            .attr("y", -20)
            .attr("fill", "black")
            .text(design.yAxisLabel);

        // X Axis
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        chartGroup.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("fill", "black")
            .text(design.xAxisLabel);

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        data.forEach((dataset, idx) => {
            const line = d3.line()
                .x(d => xScale(d[design.xAxisField]))
                .y(d => yScale(d[design.yAxisField]))
                .curve(d3.curveMonotoneX);

            chartGroup.append("path")
                .datum(dataset)
                .attr("fill", "none")
                .attr("stroke", colorScale(idx))
                .attr("stroke-width", 2)
                .attr("d", line);

            chartGroup.selectAll(`.dot-${idx}`)
                .data(dataset)
                .enter()
                .append("circle")
                .attr("class", `dot-${idx}`)
                .attr("cx", d => xScale(d[design.xAxisField]))
                .attr("cy", d => yScale(d[design.yAxisField]))
                .attr("r", 4)
                .attr("fill", colorScale(idx))
                .on("mouseover", (event, d) => {
                    tooltip
                        .style("display", "block")
                        .html(`
                            <strong>${design.xAxisField}:</strong> ${d[design.xAxisField]}<br/>
                            <strong>${design.yAxisField}:</strong> ${d[design.yAxisField]}<br/>
                            <strong>Dataset:</strong> ${d.name}
                        `);
                })
                .on("mousemove", (event) => {
                    const bounds = svgRef.current.getBoundingClientRect();
                    tooltip
                        .style("left", `${event.clientX - bounds.left + 10}px`)
                        .style("top", `${event.clientY - bounds.top - 30}px`);
                })
                .on("mouseout", () => {
                    tooltip.style("display", "none");
                });
        });

    }, [data, design]);

    return (
        <div className="relative w-full">
            <div
                ref={tooltipRef}
                className="absolute pointer-events-none bg-white text-sm text-gray-800 px-3 py-1 rounded shadow border border-gray-300 z-10"
                style={{ display: "none" }}
            ></div>
            <svg ref={svgRef}></svg>
        </div>
    );
}
