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

    const pieData = data.map(d => ({
      label: d[design.xAxisField],
      value: d[design.yAxisField]
    }));

    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    svg.selectAll('path')
      .data(pie(pieData))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (_, i) => color(i))
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')
      .on('mouseover', (event, d) => {
        tooltip
          .style('display', 'block')
          .html(`<strong>${d.data.label} :</strong> ${d.value}`);
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
