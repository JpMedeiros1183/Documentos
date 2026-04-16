import { useEffect, useState } from 'react';
import type { TideEvent } from '../data/tideData';

interface TideGaugeProps {
  progress: number;
  status: 'SUBINDO' | 'DESCENDO';
  nextEvent: TideEvent;
  previousEvent: TideEvent;
}

export default function TideGauge({ progress, status, nextEvent, previousEvent }: TideGaugeProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 300);
    return () => clearTimeout(timer);
  }, [progress]);

  const size = 280;
  const center = size / 2;
  const radius = 110;
  const strokeWidth = 18;

  // Arc calculations
  const startAngle = -225;
  const endAngle = 45;
  const totalAngle = endAngle - startAngle;
  const currentAngle = startAngle + totalAngle * animatedProgress;

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
    const s = polarToCartesian(cx, cy, r, end);
    const e = polarToCartesian(cx, cy, r, start);
    const largeArc = end - start <= 180 ? '0' : '1';
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 0 ${e.x} ${e.y}`;
  };

  const needleTip = polarToCartesian(center, center, radius - 10, currentAngle);

  // Tick marks
  const ticks = [];
  for (let i = 0; i <= 20; i++) {
    const angle = startAngle + (totalAngle / 20) * i;
    const outer = polarToCartesian(center, center, radius + 14, angle);
    const inner = polarToCartesian(center, center, radius + 6, angle);
    const isMajor = i % 5 === 0;
    ticks.push(
      <line
        key={i}
        x1={outer.x}
        y1={outer.y}
        x2={inner.x}
        y2={inner.y}
        stroke={i / 20 <= animatedProgress ? (status === 'SUBINDO' ? '#00d4aa' : '#ff6b6b') : 'rgba(255,255,255,0.15)'}
        strokeWidth={isMajor ? 2.5 : 1}
        strokeLinecap="round"
      />
    );
  }

  // Glowing particles along the arc
  const particles = [];
  for (let i = 0; i < 8; i++) {
    const pAngle = startAngle + (totalAngle * animatedProgress * (i / 8));
    if (pAngle <= currentAngle) {
      const pos = polarToCartesian(center, center, radius, pAngle);
      particles.push(
        <circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r={1.5}
          fill={status === 'SUBINDO' ? '#00d4aa' : '#ff6b6b'}
          opacity={0.3 + (i / 8) * 0.7}
        >
          <animate
            attributeName="opacity"
            values={`${0.3 + (i / 8) * 0.4};${0.8};${0.3 + (i / 8) * 0.4}`}
            dur={`${1.5 + i * 0.2}s`}
            repeatCount="indefinite"
          />
        </circle>
      );
    }
  }

  const activeColor = status === 'SUBINDO' ? '#00d4aa' : '#ff6b6b';
  const glowFilter = status === 'SUBINDO' ? 'tide-glow-green' : 'tide-glow-red';

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-2xl">
        <defs>
          <filter id="tide-glow-green" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#00d4aa" floodOpacity="0.6" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="tide-glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#ff6b6b" floodOpacity="0.6" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="needle-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#ffffff" floodOpacity="0.8" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={status === 'SUBINDO' ? '#004d40' : '#4d0000'} />
            <stop offset="100%" stopColor={activeColor} />
          </linearGradient>
          <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={activeColor} stopOpacity="0.15" />
            <stop offset="100%" stopColor={activeColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background glow */}
        <circle cx={center} cy={center} r={radius + 30} fill="url(#center-glow)" />

        {/* Background arc track */}
        <path
          d={describeArc(center, center, radius, startAngle, endAngle)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Active arc */}
        <path
          d={describeArc(center, center, radius, startAngle, currentAngle)}
          fill="none"
          stroke="url(#arc-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter={`url(#${glowFilter})`}
          style={{ transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />

        {/* Tick marks */}
        {ticks}

        {/* Particles */}
        {particles}

        {/* Needle */}
        <line
          x1={center}
          y1={center}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#needle-glow)"
          style={{ transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />

        {/* Center circle */}
        <circle cx={center} cy={center} r="8" fill={activeColor} filter={`url(#${glowFilter})`} />
        <circle cx={center} cy={center} r="4" fill="white" />

        {/* Animated outer ring */}
        <circle
          cx={center}
          cy={center}
          r={radius + 25}
          fill="none"
          stroke={activeColor}
          strokeWidth="0.5"
          opacity="0.2"
          strokeDasharray="4 8"
          className="animate-rotate-slow"
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Labels on gauge */}
        {/* Low label */}
        {(() => {
          const lowPos = polarToCartesian(center, center, radius + 32, startAngle + 10);
          return (
            <text
              x={lowPos.x}
              y={lowPos.y}
              fill="rgba(255,255,255,0.4)"
              fontSize="9"
              fontFamily="Orbitron"
              textAnchor="middle"
            >
              BAIXA
            </text>
          );
        })()}
        {/* High label */}
        {(() => {
          const highPos = polarToCartesian(center, center, radius + 32, endAngle - 10);
          return (
            <text
              x={highPos.x}
              y={highPos.y}
              fill="rgba(255,255,255,0.4)"
              fontSize="9"
              fontFamily="Orbitron"
              textAnchor="middle"
            >
              ALTA
            </text>
          );
        })()}
      </svg>

      {/* Center info */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingTop: '30px' }}>
        <div className="text-center">
          <div
            className="text-xs font-mono tracking-widest mb-1"
            style={{ color: activeColor, opacity: 0.8 }}
          >
            {previousEvent.type === 'high' ? 'PREIA-MAR' : 'BAIXA-MAR'}
          </div>
          <div className="font-orbitron text-lg font-bold text-white/60">
            {previousEvent.time}
          </div>
          <div className="text-[10px] text-white/30 font-mono mt-0.5">
            {previousEvent.height.toFixed(2)}m
          </div>
        </div>
      </div>

      {/* Bottom labels */}
      <div className="flex justify-between w-full max-w-[250px] mt-2 px-2">
        <div className="text-center">
          <div className="text-[10px] font-mono text-tide-low/70 tracking-wider">BAIXA-MAR</div>
          <div className="font-orbitron text-sm font-bold text-tide-low">
            {previousEvent.type === 'low' ? previousEvent.time : nextEvent.time}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-mono text-tide-high/70 tracking-wider">PREIA-MAR</div>
          <div className="font-orbitron text-sm font-bold text-tide-high">
            {previousEvent.type === 'high' ? previousEvent.time : nextEvent.time}
          </div>
        </div>
      </div>
    </div>
  );
}
