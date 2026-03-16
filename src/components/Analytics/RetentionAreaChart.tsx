import type { FC } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAppStore } from '../../state/store';
import { buildRetentionMatrix } from '../../utils/analytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

export const RetentionAreaChart: FC = () => {
  const graph = useAppStore((s) => s.graph);
  const retentionBySemester = useAppStore((s) => s.retentionBySemester);
  const maxSemesterIndex = useAppStore((s) => s.maxSemesterIndex);
  const chartMode = useAppStore((s) => s.chartMode);
  const chartSubjectId = useAppStore((s) => s.chartSubjectId);

  if (!graph) {
    return null;
  }

  const fullMatrix = buildRetentionMatrix(graph, retentionBySemester);
  const upper = Math.max(
    0,
    Math.min(maxSemesterIndex, fullMatrix.semesters.length - 1),
  );
  const semesters = fullMatrix.semesters.slice(0, upper + 1);

  let data;
  if (chartMode === 'subject' && chartSubjectId) {
    const subjectIndex = fullMatrix.subjectIds.indexOf(chartSubjectId);
    if (subjectIndex === -1) {
      // fallback to overall
      const averaged = fullMatrix.values
        .slice(0, upper + 1)
        .map((row) => {
          if (!row.length) return 0;
          const sum = row.reduce((acc, v) => acc + v, 0);
          return sum / row.length;
        });
      data = {
        labels: semesters,
        datasets: [
          {
            label: 'Overall retention',
            data: averaged,
            borderColor: '#f9fafb',
            backgroundColor: 'rgba(15,23,42,0.6)',
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      };
    } else {
      const subjectValues = fullMatrix.values
        .slice(0, upper + 1)
        .map((row) => row[subjectIndex]);
      data = {
        labels: semesters,
        datasets: [
          {
            label: chartSubjectId,
            data: subjectValues,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56,189,248,0.15)',
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 3,
          },
        ],
      };
    }
  } else {
    // overall mode
    const averaged = fullMatrix.values
      .slice(0, upper + 1)
      .map((row) => {
        if (!row.length) return 0;
        const sum = row.reduce((acc, v) => acc + v, 0);
        return sum / row.length;
      });
    data = {
      labels: semesters,
      datasets: [
        {
          label: 'Overall retention',
          data: averaged,
          borderColor: '#f9fafb',
          backgroundColor: 'rgba(15,23,42,0.6)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    };
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label(context: any) {
            const label = context.dataset.label ?? '';
            const value = context.parsed.y ?? 0;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(15,23,42,0.7)',
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 10 },
        },
      },
      y: {
        stacked: true,
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(15,23,42,0.9)',
        },
        ticks: {
          color: '#6b7280',
          font: { size: 9 },
          callback(value: any) {
            return `${value}%`;
          },
        },
      },
    },
  };

  return (
    <div className="h-40">
      <Line data={data} options={options} />
    </div>
  );
};

