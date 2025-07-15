import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function LineChartD3({ data, design }) {
    // Refs for SVG and tooltip
    const svgRef = useRef();
    const tooltipRef = useRef();

    useEffect(() => {
        console.log("data - " , data)
        console.log("design - ", design)
        const svgElement = d3.select(svgRef.current);
        svgElement.selectAll("*").remove(); // Clear any previous chart drawings

        const tooltipElement = d3.select(tooltipRef.current);
        const svgWidth = design.width || 700;
        const svgHeight = design.height || 400;
        const margin = { top: 50, right: 50, bottom: 50, left: 60 };

        svgElement.attr("width", svgWidth).attr("height", svgHeight);

        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;

        // Create inner chart group with margin
        const chartGroup = svgElement
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // X Scale - Using scalePoint for categorical axis
        const xScale = d3.scalePoint()
            .domain(data.map(d => d[design.xAxisField]))
            .range([0, chartWidth])
            .padding(0.5);

        // Y Scale - Using scaleLinear for numeric values
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[design.yAxisField])])
            .nice()
            .range([chartHeight, 0]);

        // Optional grid lines for Y-axis
        if (design.showGrid) {
            chartGroup.append("g")
                .attr("class", "grid")
                .call(d3.axisLeft(yScale).tickSize(-chartWidth).tickFormat(""));
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
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(xScale));

        chartGroup.append("text")
            .attr("x", chartWidth / 2)
            .attr("y", chartHeight + 40)
            .attr("fill", "black")
            .text(design.xAxisLabel);

        // Create Line Path
        const lineGenerator = d3.line()
            .x(d => xScale(d[design.xAxisField]))
            .y(d => yScale(d[design.yAxisField]))
            .curve(d3.curveMonotoneX); // Smooth curve for better UX

        chartGroup.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", design.barColor || "#4caf50")
            .attr("stroke-width", 2)
            .attr("d", lineGenerator);

        // Add Data Points (Dots)
        chartGroup.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d[design.xAxisField]))
            .attr("cy", d => yScale(d[design.yAxisField]))
            .attr("r", 5)
            .attr("fill", design.barColor || "#4caf50")
            .on("mouseover", (event, d) => {
                tooltipElement
                    .style("display", "block")
                    .html(`
                        <strong>${design.xAxisField}:</strong> ${d[design.xAxisField]}<br/>
                        <strong>${design.yAxisField}:</strong> ${d[design.yAxisField]}<br/>
                        <strong>${design.performanceField}:</strong> ${d[design.performanceField]}
                    `);
            })
            .on("mousemove", (event) => {
                const bounds = svgRef.current.getBoundingClientRect();
                tooltipElement
                    .style("left", `${event.clientX - bounds.left + 10}px`)
                    .style("top", `${event.clientY - bounds.top - 30}px`);
            })
            .on("mouseout", () => {
                tooltipElement.style("display", "none");
            });

    }, [data, design]);

    // Render SVG and tooltip
    return (
        <div className="relative w-full">
            <div
                ref={tooltipRef}
                className="absolute pointer-events-none bg-white text-sm text-gray-800 px-3 py-1 rounded shadow border border-gray-300 z-10"
                style={{ display: "none" }}
            ></div>
            <svg ref={svgRef} />
        </div>
    );
}
