import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function PieChartD3({ data, design }) {
    const svgRef = useRef();
    const tooltipRef = useRef();

    useEffect(() => {
        const width = design.width;
        const height = design.height;
        const radius = Math.min(width, height) / 2;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        const tooltip = d3.select(tooltipRef.current);

        // Combine multiple datasets into a single array for pie
        const pieData = data.flat().map(d => ({
            label: d[design.xAxisField],
            value: d[design.yAxisField],
            dataset: d.name || ''
        }));

        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const color = d3.scaleOrdinal(d3.schemeTableau10);

        const group = svg
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        group.selectAll('path')
            .data(pie(pieData))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', (_, i) => color(i))
            .on('mouseover', (event, d) => {
                tooltip
                    .style('display', 'block')
                    .html(`
                        <strong>${d.data.label}:</strong> ${d.data.value}<br/>
                        <strong>Dataset:</strong> ${d.data.dataset || 'N/A'}
                    `);
            })
            .on('mousemove', (event) => {
                const bounds = svgRef.current.getBoundingClientRect();
                tooltip
                    .style('left', `${event.clientX - bounds.left + 10}px`)
                    .style('top', `${event.clientY - bounds.top + 10}px`);
            })
            .on('mouseout', () => {
                tooltip.style('display', 'none');
            });

    }, [data, design]);

    return (
        <div className="relative">
            <div
                ref={tooltipRef}
                className="absolute pointer-events-none bg-white text-sm px-3 py-1 rounded shadow border"
                style={{ display: 'none' }}
            />
            <svg ref={svgRef} width={design.width} height={design.height}></svg>
        </div>
    );
}

export default PieChartD3;
