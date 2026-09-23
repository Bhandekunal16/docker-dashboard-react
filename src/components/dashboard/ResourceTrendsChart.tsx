import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Radio, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface ResourceDataPoint {
  timestamp: Date;
  cpu: number; // 0 - 100 (%)
  memory: number; // 0 - 100 (%)
}

interface ResourceTrendsChartProps {
  cpuUsage?: number;
  memoryUsage?: number;
}

const THRESHOLD_LIMIT = 80;

export const ResourceTrendsChart: React.FC<ResourceTrendsChartProps> = ({
  cpuUsage,
  memoryUsage,
}) => {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 165 });
  const [hoveredPoint, setHoveredPoint] = useState<ResourceDataPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const isLight = resolvedTheme === 'light';

  const [data, setData] = useState<ResourceDataPoint[]>([]);

  // Add each backend sample and retain a 30-minute window.
  useEffect(() => {
    if (cpuUsage === undefined || memoryUsage === undefined) return;
    const now = new Date();
    const cutoff = new Date(now.getTime() - 30 * 60 * 1000);
    setData((prev) => [
      ...prev.filter((point) => point.timestamp >= cutoff),
      { timestamp: now, cpu: cpuUsage, memory: memoryUsage },
    ]);
  }, [cpuUsage, memoryUsage]);

  // Track container width via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0) {
        setDimensions({ width, height: 165 });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Latest current values
  const currentCpu = data.length > 0 ? data[data.length - 1].cpu : 0;
  const currentMem = data.length > 0 ? data[data.length - 1].memory : 0;

  // Threshold status
  const isCpuExceeded = currentCpu >= THRESHOLD_LIMIT;
  const isMemExceeded = currentMem >= THRESHOLD_LIMIT;
  const isAnyExceeded = isCpuExceeded || isMemExceeded;

  // D3 Rendering
  useEffect(() => {
    if (!svgRef.current || dimensions.width <= 0 || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 14, right: 14, bottom: 24, left: 34 };
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
    const thresholdLineColor = isLight ? '#e11d48' : '#f43f5e';
    const thresholdZoneFill = isLight ? 'rgba(244, 63, 94, 0.07)' : 'rgba(244, 63, 94, 0.12)';

    // Define Gradients & Defs
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

    // Threshold Danger Zone Rect (80% to 100%)
    const thresholdY = yScale(THRESHOLD_LIMIT);
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth)
      .attr('height', thresholdY)
      .attr('fill', thresholdZoneFill)
      .attr('rx', 2);

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

    // Threshold Alert Line (80%)
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', thresholdY)
      .attr('y2', thresholdY)
      .attr('stroke', thresholdLineColor)
      .attr('stroke-dasharray', '4 3')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85);

    // Threshold Label tag
    const thresholdLabelGroup = g
      .append('g')
      .attr('transform', `translate(${innerWidth - 72}, ${Math.max(10, thresholdY - 4)})`);

    thresholdLabelGroup
      .append('rect')
      .attr('x', 0)
      .attr('y', -9)
      .attr('width', 70)
      .attr('height', 13)
      .attr('rx', 3)
      .attr('fill', isLight ? '#ffe4e6' : 'rgba(159, 18, 57, 0.6)')
      .attr('stroke', thresholdLineColor)
      .attr('stroke-width', 0.75);

    thresholdLabelGroup
      .append('text')
      .attr('x', 35)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('fill', thresholdLineColor)
      .attr('font-size', '8.5px')
      .attr('font-family', 'monospace')
      .attr('font-weight', '600')
      .attr('class', 'select-none')
      .text('80% ALERT CAP');

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
      .tickValues([0, 50, 80, 100])
      .tickFormat((d) => `${d}%`)
      .tickSize(0)
      .tickPadding(6);

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.select('.domain').remove();
    yAxisGroup
      .selectAll('text')
      .attr('fill', (d) => (d === 80 ? thresholdLineColor : axisTextColor))
      .attr('font-weight', (d) => (d === 80 ? '700' : '400'))
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

    // Threshold Spike Highlight Points on curves (Points > 80%)
    const highPoints = data.filter((d) => d.cpu >= THRESHOLD_LIMIT || d.memory >= THRESHOLD_LIMIT);
    if (highPoints.length > 0) {
      highPoints.forEach((pt) => {
        const xPos = xScale(pt.timestamp);
        if (pt.cpu >= THRESHOLD_LIMIT) {
          g.append('circle')
            .attr('cx', xPos)
            .attr('cy', yScale(pt.cpu))
            .attr('r', 3)
            .attr('fill', '#f43f5e')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.2);
        }
        if (pt.memory >= THRESHOLD_LIMIT) {
          g.append('circle')
            .attr('cx', xPos)
            .attr('cy', yScale(pt.memory))
            .attr('r', 3)
            .attr('fill', '#f43f5e')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.2);
        }
      });
    }

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
      {/* Chart Top Bar: Title, Threshold Alert & Real-time stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-zinc-300">
            Real-Time Resource Trends
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>30m Live</span>
          </span>

          {/* Dynamic 80% Threshold Alert Badge */}
          {isAnyExceeded ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-500 border border-rose-500/30 animate-pulse">
              <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
              <span>
                {isCpuExceeded && isMemExceeded
                  ? 'CRITICAL: CPU & MEM > 80%'
                  : isCpuExceeded
                  ? 'HIGH CPU > 80%'
                  : 'HIGH MEM > 80%'}
              </span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-800/40 border border-zinc-700/50">
              <ShieldAlert className="w-2.5 h-2.5 text-zinc-400" />
              <span>Cap: 80%</span>
            </span>
          )}
        </div>

        {/* Legend & Current metrics with threshold warning styling */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          {/* CPU indicator */}
          <div
            className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-colors ${
              (hoveredPoint ? hoveredPoint.cpu : currentCpu) >= THRESHOLD_LIMIT
                ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30 font-semibold'
                : ''
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                (hoveredPoint ? hoveredPoint.cpu : currentCpu) >= THRESHOLD_LIMIT
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-cyan-400'
              }`}
            />
            <span className={(hoveredPoint ? hoveredPoint.cpu : currentCpu) >= THRESHOLD_LIMIT ? 'text-rose-500' : 'text-zinc-400'}>
              CPU:
            </span>
            <span
              className={`font-semibold ${
                (hoveredPoint ? hoveredPoint.cpu : currentCpu) >= THRESHOLD_LIMIT
                  ? 'text-rose-500'
                  : 'text-cyan-400'
              }`}
            >
              {hoveredPoint ? hoveredPoint.cpu : currentCpu}%
            </span>
          </div>

          {/* Memory indicator */}
          <div
            className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-colors ${
              (hoveredPoint ? hoveredPoint.memory : currentMem) >= THRESHOLD_LIMIT
                ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30 font-semibold'
                : ''
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                (hoveredPoint ? hoveredPoint.memory : currentMem) >= THRESHOLD_LIMIT
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-purple-400'
              }`}
            />
            <span className={(hoveredPoint ? hoveredPoint.memory : currentMem) >= THRESHOLD_LIMIT ? 'text-rose-500' : 'text-zinc-400'}>
              Mem:
            </span>
            <span
              className={`font-semibold ${
                (hoveredPoint ? hoveredPoint.memory : currentMem) >= THRESHOLD_LIMIT
                  ? 'text-rose-500'
                  : 'text-purple-400'
              }`}
            >
              {hoveredPoint ? hoveredPoint.memory : currentMem}%
            </span>
          </div>
        </div>
      </div>

      {/* D3 Canvas Container */}
      <div
        ref={containerRef}
        className={`relative w-full rounded-lg border p-1.5 overflow-hidden select-none transition-colors ${
          isAnyExceeded
            ? 'bg-rose-950/10 border-rose-500/40'
            : 'bg-zinc-950/40 border-zinc-800/60'
        }`}
      >
        <svg ref={svgRef} className="w-full overflow-visible block" />

        {/* Hover Crosshair / Tooltip Box with Threshold Warnings */}
        {hoveredPoint && hoverPos && (
          <div
            className={`absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-full rounded-md px-2.5 py-1.5 shadow-lg backdrop-blur-xs text-[10px] font-mono transition-all duration-75 ${
              hoveredPoint.cpu >= THRESHOLD_LIMIT || hoveredPoint.memory >= THRESHOLD_LIMIT
                ? 'bg-zinc-900/98 border border-rose-500/60 text-zinc-100 shadow-rose-950/30'
                : 'bg-zinc-900/95 border border-zinc-700/80 text-zinc-200'
            }`}
            style={{
              left: `${hoverPos.x}px`,
              top: `${Math.max(30, hoverPos.y - 8)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-1 mb-1 font-semibold">
              <span className="text-zinc-400">{formattedHoverTime}</span>
              {(hoveredPoint.cpu >= THRESHOLD_LIMIT || hoveredPoint.memory >= THRESHOLD_LIMIT) && (
                <span className="inline-flex items-center gap-0.5 text-rose-500 text-[9px] font-bold">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  &gt;80% ALERT
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <span
                className={`font-medium ${
                  hoveredPoint.cpu >= THRESHOLD_LIMIT ? 'text-rose-500 font-bold underline' : 'text-cyan-400'
                }`}
              >
                CPU: {hoveredPoint.cpu}%
              </span>
              <span
                className={`font-medium ${
                  hoveredPoint.memory >= THRESHOLD_LIMIT ? 'text-rose-500 font-bold underline' : 'text-purple-400'
                }`}
              >
                MEM: {hoveredPoint.memory}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
