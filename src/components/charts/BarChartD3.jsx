import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function BarChartD3({ data, design }) {
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

        const chartGroup = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xLabels = data[0]?.map(d => d[design.xAxisField]) || [];

        const x0 = d3.scaleBand()
            .domain(xLabels)
            .range([0, width])
            .paddingInner(0.2);

        const x1 = d3.scaleBand()
            .domain(data.map((_, i) => `dataset${i}`))
            .range([0, x0.bandwidth()])
            .padding(0.1);

        const yMax = d3.max(data.flat(), d => d[design.yAxisField]) || 0;

        const y = d3.scaleLinear()
            .domain([0, yMax])
            .nice()
            .range([height, 0]);

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        if (design.showGrid) {
            chartGroup.append("g")
                .attr("class", "grid")
                .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));
        }

        chartGroup.append("g").call(d3.axisLeft(y));
        chartGroup.append("text")
            .attr("x", -40)
            .attr("y", -20)
            .attr("fill", "black")
            .text(design.yAxisLabel);

        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x0));

        chartGroup.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("fill", "black")
            .text(design.xAxisLabel);

        // Bars
        chartGroup.selectAll("g.layer")
            .data(xLabels)
            .enter()
            .append("g")
            .attr("class", "layer")
            .attr("transform", d => `translate(${x0(d)}, 0)`)
            .selectAll("rect")
            .data(d => data.map((dataset, idx) => ({
                key: `dataset${idx}`,
                xValue: d,
                yValue: dataset.find(item => item[design.xAxisField] === d)?.[design.yAxisField],
                name: dataset[0]?.name || `Dataset ${idx + 1}`,
                color: colorScale(idx)
            })))
            .enter()
            .append("rect")
            .attr("x", d => x1(d.key))
            .attr("y", d => y(d.yValue))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.yValue))
            .attr("fill", d => d.color)
            .on("mouseover", (event, d) => {
                tooltip
                    .style("display", "block")
                    .html(`
                        <strong>${design.xAxisField}:</strong> ${d.xValue}<br/>
                        <strong>${design.yAxisField}:</strong> ${d.yValue}<br/>
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

    }, [data, design]);

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
