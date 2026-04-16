import type { TideEvent } from '../data/tideData';

interface TideForecastProps {
  tides: TideEvent[];
  title: string;
  date: string;
}

export default function TideForecast({ tides, title, date }: TideForecastProps) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-orbitron text-lg font-bold text-white tracking-wide">{title}</h3>
          <p className="text-white/30 text-xs font-mono mt-1">{date}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-blue/10 border border-neon-blue/20">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
          <span className="text-neon-blue text-xs font-mono">LIVE</span>
        </div>
      </div>

      <div className="space-y-3">
        {tides.map((tide, index) => {
          const isHigh = tide.type === 'high';
          return (
            <div
              key={index}
              className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isHigh
                    ? 'bg-tide-high/15 border border-tide-high/20'
                    : 'bg-tide-low/15 border border-tide-low/20'
                }`}
              >
                {isHigh ? (
                  <svg className="w-5 h-5 text-tide-high" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-tide-low" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>

              {/* Label */}
              <div className="flex-1">
                <p className={`text-sm font-semibold ${isHigh ? 'text-tide-high' : 'text-tide-low'}`}>
                  {isHigh ? 'Preia-mar' : 'Baixa-mar'}
                </p>
                <p className="text-white/30 text-xs font-mono">
                  {isHigh ? 'Maré Alta' : 'Maré Baixa'}
                </p>
              </div>

              {/* Time */}
              <div className="text-right">
                <p className="font-orbitron text-lg font-bold text-white group-hover:text-neon-blue transition-colors">
                  {tide.time}
                </p>
                <p className="text-white/40 text-xs font-mono">
                  {tide.height.toFixed(2)}m
                </p>
              </div>

              {/* Height bar */}
              <div className="w-16 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isHigh
                      ? 'bg-gradient-to-r from-tide-high/50 to-tide-high'
                      : 'bg-gradient-to-r from-tide-low/50 to-tide-low'
                  }`}
                  style={{ width: `${(tide.height / 3) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-5 p-3 rounded-lg bg-white/[0.02] border border-white/5">
        <p className="text-white/25 text-[10px] font-mono leading-relaxed text-center">
          Previsões baseadas em dados da Marinha do Brasil. Valores de referência para o porto mais
          próximo. Condições climáticas podem causar variações.
        </p>
      </div>
    </div>
  );
}
