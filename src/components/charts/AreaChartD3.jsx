import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function AreaChartD3({ data, design }) {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    const width = design.width;
    const height = design.height;
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select(tooltipRef.current);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scalePoint()
      .domain(data.map(d => d[design.xAxisField]))
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[design.yAxisField])])
      .nice()
      .range([innerHeight, 0]);

    svg.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x));
    svg.append('g').call(d3.axisLeft(y));

    const area = d3.area()
      .x(d => x(d[design.xAxisField]))
      .y0(innerHeight)
      .y1(d => y(d[design.yAxisField]));

    svg.append('path')
      .datum(data)
      .attr('fill', design.barColor)
      .attr('d', area);

    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d[design.xAxisField]))
      .attr('cy', d => y(d[design.yAxisField]))
      .attr('r', 5)
      .attr('fill', "black")
      .on('mouseover', (event, d) => {
        tooltip.style('display', 'block')
          .html(`<strong>${design.xAxisField}:</strong> ${d[design.xAxisField]}
            <br>
            <strong>${design.yAxisField}:</strong> ${d[design.yAxisField]}
            <br>
            <strong>${design.performanceField}:</strong> ${d[design.performanceField]}`);
      })
      .on('mousemove', (event) => {
        const bounds = svgRef.current.getBoundingClientRect();
        tooltip
          .style('left', `${event.clientX - bounds.left + 10}px`)
          .style('top', `${event.clientY - bounds.top + 10}px`);
      })
      .on('mouseout', () => tooltip.style('display', 'none'));

  }, [data, design]);

  return (
    <div className="relative">
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none bg-white text-sm px-3 py-1 rounded shadow border"
        style={{ display: 'none' }}
      />
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default AreaChartD3;
