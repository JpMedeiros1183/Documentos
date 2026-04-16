import { useState } from 'react';
import type { DayForecast } from '../data/tideData';

interface WeeklyForecastProps {
  days: DayForecast[];
}

export default function WeeklyForecast({ days }: WeeklyForecastProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-ocean-400/10 border border-ocean-400/20 flex items-center justify-center">
          <span className="text-xl">📅</span>
        </div>
        <div>
          <h3 className="font-orbitron text-base font-bold text-white tracking-wide">
            Previsão Semanal
          </h3>
          <p className="text-white/30 text-xs font-mono">Próximos 7 dias</p>
        </div>
      </div>

      <div className="space-y-2">
        {days.map((day, dayIndex) => {
          const isExpanded = expandedDay === dayIndex;
          const isToday = dayIndex === 0;

          return (
            <div key={dayIndex}>
              <button
                onClick={() => setExpandedDay(isExpanded ? null : dayIndex)}
                className={`w-full p-3.5 rounded-xl flex items-center justify-between transition-all duration-300 ${
                  isToday
                    ? 'bg-neon-blue/10 border border-neon-blue/20 hover:bg-neon-blue/15'
                    : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{day.moonIcon}</span>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${isToday ? 'text-neon-blue' : 'text-white/80'}`}>
                        {day.dayOfWeek}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-neon-blue/20 text-neon-blue">
                          HOJE
                        </span>
                      )}
                    </div>
                    <span className="text-white/30 text-xs font-mono">{day.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Mini tide preview */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    {day.tides.map((t, i) => (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full ${
                          t.type === 'high' ? 'bg-tide-high' : 'bg-tide-low'
                        }`}
                        style={{ height: `${Math.max(8, t.height * 10)}px` }}
                      />
                    ))}
                  </div>

                  {/* Expand icon */}
                  <svg
                    className={`w-4 h-4 text-white/30 transition-transform duration-300 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="mt-2 ml-4 mr-4 space-y-2 animate-fade-in-up">
                  {day.tides.map((tide, tideIndex) => {
                    const isHigh = tide.type === 'high';
                    return (
                      <div
                        key={tideIndex}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isHigh ? 'bg-tide-high' : 'bg-tide-low'
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              isHigh ? 'text-tide-high' : 'text-tide-low'
                            }`}
                          >
                            {isHigh ? 'Preia-mar' : 'Baixa-mar'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-orbitron text-sm font-bold text-white">
                            {tide.time}
                          </span>
                          <span className="text-white/40 text-xs font-mono w-14 text-right">
                            {tide.height.toFixed(2)}m
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-2 p-2 text-white/20 text-xs font-mono">
                    <span>{day.moonIcon}</span>
                    <span>{day.moonPhase}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
