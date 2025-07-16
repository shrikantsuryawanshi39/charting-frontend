import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function AreaChartD3({ data, design }) {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    const width = design.width;
    const height = design.height;
    const margin = { top: 50, right: 50, bottom: 50, left: 60 };

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();
    svgElement.attr('width', width).attr('height', height);

    const tooltip = d3.select(tooltipRef.current);
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const chartGroup = svgElement
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xDomain = data.length > 0 ? data[0].map(d => d[design.xAxisField]) : [];
    const x = d3.scalePoint()
      .domain(xDomain)
      .range([0, innerWidth])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data.flat(), d => d[design.yAxisField])])
      .nice()
      .range([innerHeight, 0]);

    chartGroup.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    chartGroup.append('g').call(d3.axisLeft(y));

    // Legend colors
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    data.forEach((dataset, idx) => {
      const area = d3.area()
        .x(d => x(d[design.xAxisField]))
        .y0(innerHeight)
        .y1(d => y(d[design.yAxisField]))
        .curve(d3.curveMonotoneX);

      chartGroup.append('path')
        .datum(dataset)
        .attr('fill', color(idx))
        .attr('fill-opacity', 0.5)
        .attr('stroke', color(idx))
        .attr('stroke-width', 1.5)
        .attr('d', area);

      // Data Points
      chartGroup.selectAll(`.dot-${idx}`)
        .data(dataset)
        .enter()
        .append('circle')
        .attr('class', `dot-${idx}`)
        .attr('cx', d => x(d[design.xAxisField]))
        .attr('cy', d => y(d[design.yAxisField]))
        .attr('r', 4)
        .attr('fill', color(idx))
        .on('mouseover', (event, d) => {
          tooltip.style('display', 'block')
            .html(`
                            <strong>${design.xAxisField}:</strong> ${d[design.xAxisField]}<br/>
                            <strong>${design.yAxisField}:</strong> ${d[design.yAxisField]}<br/>
                            <strong>Dataset:</strong> ${d.name}
                        `);
        })
        .on('mousemove', (event) => {
          const bounds = svgRef.current.getBoundingClientRect();
          tooltip
            .style('left', `${event.clientX - bounds.left + 10}px`)
            .style('top', `${event.clientY - bounds.top + 10}px`);
        })
        .on('mouseout', () => tooltip.style('display', 'none'));
    });

    // Labels
    chartGroup.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .text(design.xAxisLabel);

    chartGroup.append('text')
      .attr('x', -40)
      .attr('y', -20)
      .text(design.yAxisLabel);

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
