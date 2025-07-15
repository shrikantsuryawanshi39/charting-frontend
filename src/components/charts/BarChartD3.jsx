import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function BarChartD3({ data, design }) {
    const svgRef = useRef();
    const tooltipRef = useRef();

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const tooltip = d3.select(tooltipRef.current);
        const width = design.width || 700;
        const height = design.height || 400;
        const margin = { top: 50, right: 50, bottom: 50, left: 60 };

        svg.attr("width", width).attr("height", height);

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3
            .scaleBand()
            .domain(data.map((d) => d[design.xAxisField]))
            .range([0, innerWidth])
            .padding(0.3);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d[design.yAxisField])])
            .nice()
            .range([innerHeight, 0]);

        if (design.showGrid) {
            g.append("g")
                .attr("class", "grid")
                .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(""));
        }

        g.append("g").call(d3.axisLeft(y));
        g.append("text")
            .attr("x", -40)
            .attr("y", -20)
            .attr("fill", "black")
            .text(design.yAxisLabel);

        g.append("g")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(x));

        g.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + 40)
            .attr("fill", "black")
            .text(design.xAxisLabel);

        // Bars
        g.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => x(d[design.xAxisField]))
            .attr("y", (d) => y(d[design.yAxisField]))
            .attr("width", x.bandwidth())
            .attr("height", (d) => innerHeight - y(d[design.yAxisField]))
            .attr("fill", design.barColor || "#4caf50")
            .on("mouseover", (event, d) => {
                tooltip
                    .style("display", "block")
                    .html(`
            <strong>${design.xAxisField}:</strong> ${d[design.xAxisField]}<br/>
            <strong>${design.yAxisField}:</strong> ${d[design.yAxisField]}<br/>
            <strong>${design.performanceField}:</strong> ${d[design.performanceField]}
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
