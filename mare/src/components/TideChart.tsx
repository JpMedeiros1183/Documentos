import type { TideEvent } from '../data/tideData';

interface TideChartProps {
  tides: TideEvent[];
}

export default function TideChart({ tides }: TideChartProps) {
  const width = 500;
  const height = 160;
  const padding = { top: 20, right: 30, bottom: 35, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Create smooth curve through tide points
  const timeToX = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    const minutes = h * 60 + m;
    return padding.left + (minutes / 1440) * chartW;
  };

  const heightToY = (h: number): number => {
    const minH = 0;
    const maxH = 3;
    return padding.top + chartH - ((h - minH) / (maxH - minH)) * chartH;
  };

  // Build extended points for smooth curve (start of day to end)
  const points: { x: number; y: number; tide: TideEvent }[] = tides.map((t) => ({
    x: timeToX(t.time),
    y: heightToY(t.height),
    tide: t,
  }));

  // Add boundary points for smooth curve
  const allPoints = [
    { x: padding.left, y: points[0].y + (points[0].tide.type === 'high' ? 30 : -30) },
    ...points.map((p) => ({ x: p.x, y: p.y })),
    {
      x: padding.left + chartW,
      y: points[points.length - 1].y + (points[points.length - 1].tide.type === 'high' ? 30 : -30),
    },
  ];

  // Create smooth bezier curve
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cpx1 = curr.x + (next.x - curr.x) * 0.5;
      const cpy1 = curr.y;
      const cpx2 = next.x - (next.x - curr.x) * 0.5;
      const cpy2 = next.y;
      path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const curvePath = createSmoothPath(allPoints);
  const areaPath = curvePath + ` L ${padding.left + chartW} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`;

  // Current time marker
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentX = padding.left + (currentMinutes / 1440) * chartW;

  // Time labels
  const timeLabels = ['00:00', '06:00', '12:00', '18:00', '24:00'];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-ocean-400/10 border border-ocean-400/20 flex items-center justify-center">
          <span className="text-xl">📊</span>
        </div>
        <div>
          <h3 className="font-orbitron text-base font-bold text-white tracking-wide">
            Gráfico de Marés
          </h3>
          <p className="text-white/30 text-xs font-mono">Variação ao longo do dia</p>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[400px]">
          <defs>
            <linearGradient id="chart-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#0080e6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0080e6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="chart-line-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00d4aa" />
              <stop offset="50%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#0080e6" />
            </linearGradient>
            <filter id="chart-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feFlood floodColor="#00f0ff" floodOpacity="0.5" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[0.5, 1.0, 1.5, 2.0, 2.5].map((h) => (
            <g key={h}>
              <line
                x1={padding.left}
                y1={heightToY(h)}
                x2={padding.left + chartW}
                y2={heightToY(h)}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={heightToY(h) + 3}
                fill="rgba(255,255,255,0.2)"
                fontSize="8"
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                {h.toFixed(1)}m
              </text>
            </g>
          ))}

          {/* Time labels */}
          {timeLabels.map((label, i) => {
            const x = padding.left + (i / (timeLabels.length - 1)) * chartW;
            return (
              <text
                key={label}
                x={x}
                y={height - 8}
                fill="rgba(255,255,255,0.25)"
                fontSize="8"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
              >
                {label}
              </text>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#chart-area-gradient)" />

          {/* Main curve */}
          <path
            d={curvePath}
            fill="none"
            stroke="url(#chart-line-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#chart-glow)"
          />

          {/* Current time line */}
          <line
            x1={currentX}
            y1={padding.top}
            x2={currentX}
            y2={padding.top + chartH}
            stroke="#ff9500"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.6"
          />
          <circle cx={currentX} cy={padding.top - 3} r="3" fill="#ff9500" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
          <text
            x={currentX}
            y={padding.top - 10}
            fill="#ff9500"
            fontSize="7"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
          >
            AGORA
          </text>

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill={p.tide.type === 'high' ? '#00d4aa' : '#ff6b6b'}
                stroke={p.tide.type === 'high' ? '#00d4aa' : '#ff6b6b'}
                strokeWidth="2"
                opacity="0.9"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="8"
                fill="none"
                stroke={p.tide.type === 'high' ? '#00d4aa' : '#ff6b6b'}
                strokeWidth="1"
                opacity="0.3"
              >
                <animate attributeName="r" values="8;14;8" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
              </circle>
              <text
                x={p.x}
                y={p.tide.type === 'high' ? p.y - 14 : p.y + 18}
                fill="rgba(255,255,255,0.5)"
                fontSize="7"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
              >
                {p.tide.time}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
