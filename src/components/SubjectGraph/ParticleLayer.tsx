import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { useAppStore } from '../../state/store';
import type { CurriculumGraph } from '../../types';

interface Particle {
  edgeIndex: number;
  t: number;
  speed: number;
  life: number;
  maxLife: number;
  thickness: number;
  alpha: number;
}

interface EdgePathInfo {
  element: SVGLineElement;
}

function collectEdgeElements(
  container: HTMLElement | null,
): EdgePathInfo[] {
  if (!container) return [];
  const edgeLines = Array.from(
    container.querySelectorAll<SVGLineElement>('line'),
  );
  return edgeLines.map((element) => ({ element }));
}

const createParticlesForSemester = (
  graph: CurriculumGraph,
  semesterIndex: number,
  edgeInfos: EdgePathInfo[],
): Particle[] => {
  if (!edgeInfos.length) return [];

  const semester = graph.semesters.find((s) => s.index === semesterIndex);
  const activeIds = new Set(semester?.subjectIds ?? []);

  const particles: Particle[] = [];

  graph.edges.forEach((edge, idx) => {
    const isTargetActive = activeIds.has(edge.to);
    const baseCount = isTargetActive ? 8 : 2;
    for (let i = 0; i < baseCount; i += 1) {
      particles.push({
        edgeIndex: idx,
        t: isTargetActive ? Math.random() * 0.2 : Math.random() * 0.4,
        speed: isTargetActive ? 0.4 + Math.random() * 0.3 : 0.2,
        life: 0,
        maxLife: isTargetActive ? 1.2 + Math.random() * 0.5 : 0.7,
        thickness: isTargetActive ? 2 + Math.random() * 1.5 : 1,
        alpha: isTargetActive ? 0.9 : 0.35,
      });
    }
  });

  return particles;
};

export const ParticleLayer: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graph = useAppStore((s) => s.graph);
  const currentSemesterIndex = useAppStore((s) => s.currentSemesterIndex);
   const isPlaying = useAppStore((s) => s.isPlaying);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !graph) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    let edgeInfos = collectEdgeElements(container);
    let particles: Particle[] = createParticlesForSemester(
      graph,
      currentSemesterIndex,
      edgeInfos,
    );

    let studentX = 0;
    let studentTargetX = 0;
    const studentY = height * 0.2;

    let lastTs = performance.now();
    let frameId: number;

    const step = (ts: number) => {
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      edgeInfos = collectEdgeElements(container);

      ctx.clearRect(0, 0, width, height);

      const semesterCount = graph.semesters.length || 1;
      const laneX =
        width * ((currentSemesterIndex + 1) / (semesterCount + 1));
      studentTargetX = laneX;
      studentX += (studentTargetX - studentX) * Math.min(1, dt * 6);

      // draw glowing student dot
      const gradient = ctx.createRadialGradient(
        studentX,
        studentY,
        0,
        studentX,
        studentY,
        40,
      );
      gradient.addColorStop(0, 'rgba(250,250,250,0.95)');
      gradient.addColorStop(0.4, 'rgba(148,163,184,0.7)');
      gradient.addColorStop(1, 'rgba(15,23,42,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(studentX, studentY, 40, 0, Math.PI * 2);
      ctx.fill();

      if (isPlaying) {
        particles.forEach((p) => {
          p.life += dt;
          p.t += p.speed * dt;
        });
        particles = particles.filter((p) => p.life < p.maxLife && p.t < 1.05);
      }

      for (const p of particles) {
        const edgeInfo = edgeInfos[p.edgeIndex];
        if (!edgeInfo) continue;
        const { element } = edgeInfo;
        const x1 = Number(element.getAttribute('x1') ?? 0);
        const y1 = Number(element.getAttribute('y1') ?? 0);
        const x2 = Number(element.getAttribute('x2') ?? 0);
        const y2 = Number(element.getAttribute('y2') ?? 0);

        const x = x1 + (x2 - x1) * p.t;
        const y = y1 + (y2 - y1) * p.t;

        const ageRatio = p.life / p.maxLife;
        const alpha = p.alpha * (1 - ageRatio);

        ctx.beginPath();
        ctx.strokeStyle = `rgba(249,250,251,${alpha})`;
        ctx.lineWidth = p.thickness;
        ctx.moveTo(x, y);
        ctx.lineTo(x + 2, y + 2);
        ctx.stroke();
      }

      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, [graph, currentSemesterIndex, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !graph) return;

    // when semester changes we will re-seed particles via main effect
  }, [graph, currentSemesterIndex]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

