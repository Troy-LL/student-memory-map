import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { CurriculumGraph, SubjectNode, SubjectEdge } from '../../types';

interface UseSubjectGraphArgs {
  graph: CurriculumGraph | null;
  selectedSubjectId: string | null;
  onSelectSubject: (id: string | null) => void;
}

export function useSubjectGraph({
  graph,
  selectedSubjectId,
  onSelectSubject,
}: UseSubjectGraphArgs) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!graph || !svgRef.current) return;

    const svgEl = svgRef.current;
    const bounds = svgEl.getBoundingClientRect();
    const width = bounds.width || 800;
    const height = bounds.height || 500;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const semesterCount = graph.semesters.length || 1;
    const baseRadius = width / (semesterCount * 6);
    const radius = Math.max(10, Math.min(24, baseRadius));
    const xScale = d3
      .scalePoint<number>()
      .domain(graph.semesters.map((s) => s.index))
      .range([80, width - 80]);

    const nodes: (SubjectNode & d3.SimulationNodeDatum)[] = [];
    const verticalPadding = 120;
    const usableHeight = height - verticalPadding * 2;

    // Deterministic grid per semester using the official semester.subjectIds ordering
    const subjectById = new Map<string, SubjectNode>();
    graph.subjects.forEach((s) => subjectById.set(s.id, s));

    graph.semesters.forEach((sem) => {
      const ids = sem.subjectIds;
      const count = ids.length || 1;
      const rowGap = count > 1 ? usableHeight / (count - 1) : 0;

      ids.forEach((id, idx) => {
        const base = subjectById.get(id);
        if (!base) return;
        const y =
          count === 1
            ? height / 2
            : verticalPadding + rowGap * idx;
        nodes.push({
          ...base,
          x: xScale(sem.index) ?? width / 2,
          y,
        });
      });
    });

    const nodeById = new Map<string, SubjectNode & d3.SimulationNodeDatum>();
    nodes.forEach((n) => nodeById.set(n.id, n));

    const links: (SubjectEdge & d3.SimulationLinkDatum<SubjectNode>)[] =
      graph.edges.map((e) => ({
        ...e,
        source: nodeById.get(e.from)!,
        target: nodeById.get(e.to)!,
      }));

    const g = svg
      .append('g')
      .attr('transform', `translate(0,0)`);

    // subtle semester bands
    const semesterGroups = g
      .selectAll('g.semester')
      .data(graph.semesters)
      .enter()
      .append('g')
      .attr('class', 'semester');

    semesterGroups
      .append('rect')
      .attr('x', (s) => (xScale(s.index) ?? 0) - (width / (semesterCount * 2)))
      .attr('y', 0)
      .attr('width', width / semesterCount)
      .attr('height', height)
      .attr('fill', '#020617')
      .attr('opacity', 0.55);

    semesterGroups
      .append('line')
      .attr('x1', (s) => xScale(s.index) ?? 0)
      .attr('x2', (s) => xScale(s.index) ?? 0)
      .attr('y1', 24)
      .attr('y2', height - 24)
      .attr('stroke', '#0b1120')
      .attr('stroke-dasharray', '4,6')
      .attr('stroke-width', 1.2);

    semesterGroups
      .append('text')
      .attr('x', (s) => xScale(s.index) ?? 0)
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f9fafb')
      .attr('font-size', 11)
      .attr('font-weight', '600')
      .text((s) => s.label);

    const domainColor = (domain: string) => {
      switch (domain) {
        case 'CS':
          return '#f97316'; // amber
        case 'Math':
          return '#22c55e'; // green
        case 'GE':
          return '#38bdf8'; // cyan
        default:
          return '#a855f7'; // violet
      }
    };

    const linkSelection = g
      .append('g')
      .attr('stroke-linecap', 'round')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d) =>
        d.type === 'prereq' ? '#111827' : '#1f2937',
      )
      .attr('stroke-width', (d) =>
        d.type === 'prereq' ? 1.5 + d.overlapWeight * 2 : 0.4 + d.overlapWeight,
      )
      .attr('opacity', (d) =>
        d.type === 'prereq' ? 0.5 + d.overlapWeight * 0.4 : 0.15 + d.overlapWeight * 0.2,
      )
      .attr('d', (d) => {
        const source = d.source as SubjectNode & d3.SimulationNodeDatum;
        const target = d.target as SubjectNode & d3.SimulationNodeDatum;
        const x1 = source.x ?? 0;
        const y1 = source.y ?? 0;
        const x2 = target.x ?? 0;
        const y2 = target.y ?? 0;
        const midX = (x1 + x2) / 2;
        return `M ${x1},${y1} C ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
      });

    const nodeGroup = g
      .append('g')
      .selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        onSelectSubject(d.id);
      });

    nodeGroup
      .append('circle')
      .attr('r', radius)
      .attr('fill', (d) => domainColor(d.domain))
      .attr('stroke', '#0b1120')
      .attr('stroke-width', 3)
      .attr('opacity', 1);

    nodeGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', radius + 16)
      .attr('fill', '#f9fafb')
      .attr('font-size', 12)
      .attr('font-weight', '600')
      .text((d) => d.label);

    // Scale entire graph to fit viewport
    const minX = d3.min(nodes, (n) => n.x ?? 0) ?? 0;
    const maxX = d3.max(nodes, (n) => n.x ?? 0) ?? width;
    const minY = d3.min(nodes, (n) => n.y ?? 0) ?? 0;
    const maxY = d3.max(nodes, (n) => n.y ?? height) ?? height;
    const contentWidth = maxX - minX || 1;
    const contentHeight = maxY - minY || 1;
    const pad = 40;
    const sx = (width - pad * 2) / contentWidth;
    const sy = (height - pad * 2) / contentHeight;
    const scale = Math.min(sx, sy, 1.5);

    g.attr(
      'transform',
      `translate(${pad},${pad}) scale(${scale}) translate(${-minX},${-minY})`,
    );

    const handleResize = () => {
      const newBounds = svgEl.getBoundingClientRect();
      svg.attr('width', newBounds.width).attr('height', newBounds.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [graph, selectedSubjectId, onSelectSubject]);

  return { svgRef };
}

