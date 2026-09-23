import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Radio } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface ResourceDataPoint {
  timestamp: Date;
  cpu: number; // 0 - 100 (%)
  memory: number; // 0 - 100 (%)
}

interface ResourceTrendsChartProps {
  runningContainersCount: number;
}

export const ResourceTrendsChart: React.FC<ResourceTrendsChartProps> = ({
  runningContainersCount,
}) => {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 160 });
  const [hoveredPoint, setHoveredPoint] = useState<ResourceDataPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const isLight = resolvedTheme === 'light';

  // Generate initial 30-minute historical data (1 point per minute = 30 points)
  const [data, setData] = useState<ResourceDataPoint[]>(() => {
    const now = Date.now();
    const points: ResourceDataPoint[] = [];
    const baseCpu = Math.min(85, Math.max(8, 12 + runningContainersCount * 7.5));
    const baseMem = Math.min(90, Math.max(18, 26 + runningContainersCount * 8.2));

    for (let i = 30; i >= 0; i--) {
      const time = new Date(now - i * 60 * 1000);
      // Create organic wave fluctuations
      const timeOffset = i * 0.4;
      const noiseCpu = Math.sin(timeOffset) * 6 + Math.cos(timeOffset * 1.7) * 4 + (Math.random() * 4 - 2);
      const noiseMem = Math.sin(timeOffset * 0.5) * 4 + Math.cos(timeOffset * 1.2) * 2 + (Math.random() * 2 - 1);

      points.push({
        timestamp: time,
        cpu: Math.max(2, Math.min(99, Math.round((baseCpu + noiseCpu) * 10) / 10)),
        memory: Math.max(5, Math.min(99, Math.round((baseMem + noiseMem) * 10) / 10)),
      });
    }
    return points;
  });

  // Real-time updates: add new tick every 4 seconds and slide window
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const now = new Date();
        const baseCpu = Math.min(88, Math.max(8, 14 + runningContainersCount * 7.2));
        const baseMem = Math.min(92, Math.max(18, 28 + runningContainersCount * 8.0));

        const last = prev[prev.length - 1];
        const lastCpu = last ? last.cpu : baseCpu;
        const lastMem = last ? last.memory : baseMem;

        // Smooth delta with target tendency
        const deltaCpu = (baseCpu - lastCpu) * 0.15 + (Math.random() * 6 - 3);
        const deltaMem = (baseMem - lastMem) * 0.08 + (Math.random() * 3 - 1.5);

        const newCpu = Math.max(3, Math.min(98, Math.round((lastCpu + deltaCpu) * 10) / 10));
        const newMem = Math.max(6, Math.min(98, Math.round((lastMem + deltaMem) * 10) / 10));

        const cutoff = new Date(now.getTime() - 30 * 60 * 1000);
        const filtered = prev.filter((p) => p.timestamp >= cutoff);
        return [...filtered, { timestamp: now, cpu: newCpu, memory: newMem }];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [runningContainersCount]);

  // Track container width via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0) {
        setDimensions({ width, height: 160 });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Latest current values
  const currentCpu = data.length > 0 ? data[data.length - 1].cpu : 0;
  const currentMem = data.length > 0 ? data[data.length - 1].memory : 0;

  // D3 Rendering
  useEffect(() => {
    if (!svgRef.current || dimensions.width <= 0 || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 12, right: 12, bottom: 24, left: 34 };
    const innerWidth = Math.max(10, dimensions.width - margin.left - margin.right);
    const innerHeight = Math.max(10, dimensions.height - margin.top - margin.bottom);

    const g = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X and Y Scales
    const xExtent = d3.extent(data, (d) => d.timestamp) as [Date, Date];
    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);

    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    // Color definitions based on theme
    const cpuColor = isLight ? '#0284c7' : '#06b6d4';
    const memColor = isLight ? '#7c3aed' : '#a855f7';
    const gridLineColor = isLight ? '#e2e8f0' : 'rgba(39, 39, 42, 0.6)';
    const axisTextColor = isLight ? '#64748b' : '#71717a';
    const axisDomainColor = isLight ? '#cbd5e1' : 'rgba(39, 39, 42, 0.8)';

    // Define Gradients
    const defs = svg.append('defs');

    // CPU Area Gradient
    const cpuGradient = defs
      .append('linearGradient')
      .attr('id', 'cpu-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    cpuGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', cpuColor)
      .attr('stop-opacity', isLight ? 0.22 : 0.28);
    cpuGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', cpuColor)
      .attr('stop-opacity', 0.0);

    // Memory Area Gradient
    const memGradient = defs
      .append('linearGradient')
      .attr('id', 'mem-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    memGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', memColor)
      .attr('stop-opacity', isLight ? 0.18 : 0.22);
    memGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', memColor)
      .attr('stop-opacity', 0.0);

    // Grid lines (horizontal)
    const yTicks = [0, 25, 50, 75, 100];
    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', gridLineColor)
      .attr('stroke-dasharray', '3 3')
      .attr('stroke-width', 1);

    // X Axis
    const xAxis = d3
      .axisBottom<Date>(xScale)
      .ticks(Math.max(3, Math.floor(innerWidth / 90)))
      .tickFormat((d) => d3.timeFormat('%H:%M')(d as Date))
      .tickSize(0)
      .tickPadding(8);

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', axisDomainColor);
    xAxisGroup
      .selectAll('text')
      .attr('fill', axisTextColor)
      .attr('class', 'text-[10px] font-mono select-none');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .tickValues([0, 50, 100])
      .tickFormat((d) => `${d}%`)
      .tickSize(0)
      .tickPadding(6);

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.select('.domain').remove();
    yAxisGroup
      .selectAll('text')
      .attr('fill', axisTextColor)
      .attr('class', 'text-[10px] font-mono select-none');

    // Area Generators
    const cpuArea = d3
      .area<ResourceDataPoint>()
      .x((d) => xScale(d.timestamp))
      .y0(innerHeight)
      .y1((d) => yScale(d.cpu))
      .curve(d3.curveMonotoneX);

    const memArea = d3
      .area<ResourceDataPoint>()
      .x((d) => xScale(d.timestamp))
      .y0(innerHeight)
      .y1((d) => yScale(d.memory))
      .curve(d3.curveMonotoneX);

    // Line Generators
    const cpuLine = d3
      .line<ResourceDataPoint>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(d.cpu))
      .curve(d3.curveMonotoneX);

    const memLine = d3
      .line<ResourceDataPoint>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(d.memory))
      .curve(d3.curveMonotoneX);

    // Draw Areas
    g.append('path')
      .datum(data)
      .attr('fill', 'url(#mem-area-gradient)')
      .attr('d', memArea);

    g.append('path')
      .datum(data)
      .attr('fill', 'url(#cpu-area-gradient)')
      .attr('d', cpuArea);

    // Draw Lines
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', memColor)
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', memLine);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', cpuColor)
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', cpuLine);

    // Interactive Overlay for Tooltip Tracking
    const bisectDate = d3.bisector<ResourceDataPoint, Date>((d) => d.timestamp).left;

    const overlay = g
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    overlay.on('mousemove', (event) => {
      const [pointerX] = d3.pointer(event);
      const x0 = xScale.invert(pointerX);
      const i = bisectDate(data, x0, 1);
      const d0 = data[i - 1];
      const d1 = data[i];
      let selected = d0;
      if (d0 && d1) {
        selected = x0.getTime() - d0.timestamp.getTime() > d1.timestamp.getTime() - x0.getTime() ? d1 : d0;
      } else if (d1) {
        selected = d1;
      }

      if (selected) {
        setHoveredPoint(selected);
        const pointX = xScale(selected.timestamp) + margin.left;
        const pointY = Math.min(yScale(selected.cpu), yScale(selected.memory)) + margin.top;
        setHoverPos({ x: pointX, y: pointY });
      }
    });

    overlay.on('mouseleave', () => {
      setHoveredPoint(null);
      setHoverPos(null);
    });
  }, [data, dimensions, isLight]);

  const formattedHoverTime = useMemo(() => {
    if (!hoveredPoint) return '';
    return d3.timeFormat('%H:%M:%S')(hoveredPoint.timestamp);
  }, [hoveredPoint]);

  return (
    <div className="pt-2">
      {/* Chart Top Bar: Title & Real-time stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-zinc-300">
            Real-Time Resource Trends
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>30m Live</span>
          </span>
        </div>

        {/* Legend & Current metrics */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          {/* CPU indicator */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-zinc-400">CPU:</span>
            <span className="text-cyan-400 font-semibold">{hoveredPoint ? hoveredPoint.cpu : currentCpu}%</span>
          </div>

          {/* Memory indicator */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-zinc-400">Mem:</span>
            <span className="text-purple-400 font-semibold">{hoveredPoint ? hoveredPoint.memory : currentMem}%</span>
          </div>
        </div>
      </div>

      {/* D3 Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-lg bg-zinc-950/40 border border-zinc-800/60 p-1.5 overflow-hidden select-none"
      >
        <svg ref={svgRef} className="w-full overflow-visible block" />

        {/* Hover Crosshair / Tooltip Box */}
        {hoveredPoint && hoverPos && (
          <div
            className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-full bg-zinc-900/95 border border-zinc-700/80 rounded-md px-2 py-1 shadow-lg backdrop-blur-xs text-[10px] font-mono text-zinc-200 transition-all duration-75"
            style={{
              left: `${hoverPos.x}px`,
              top: `${Math.max(28, hoverPos.y - 6)}px`,
            }}
          >
            <div className="text-zinc-400 border-b border-zinc-800 pb-0.5 mb-1 text-center font-semibold">
              {formattedHoverTime}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-medium">CPU: {hoveredPoint.cpu}%</span>
              <span className="text-purple-400 font-medium">MEM: {hoveredPoint.memory}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
