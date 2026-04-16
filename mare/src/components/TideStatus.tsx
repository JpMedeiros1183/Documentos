import type { TideEvent } from '../data/tideData';

interface TideStatusProps {
  status: 'SUBINDO' | 'DESCENDO';
  nextEvent: TideEvent;
  timeUntilNext: string;
}

export default function TideStatus({ status, nextEvent, timeUntilNext }: TideStatusProps) {
  const isRising = status === 'SUBINDO';
  const color = isRising ? 'text-tide-high' : 'text-tide-low';
  const bgGlow = isRising
    ? 'from-tide-high/10 to-transparent'
    : 'from-tide-low/10 to-transparent';

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGlow} opacity-50`} />

      <div className="relative z-10 text-center">
        {/* Status icon */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className={`text-4xl ${isRising ? 'animate-float' : ''}`}>
            {isRising ? '🌊' : '🏖️'}
          </div>
          <div>
            <h2 className={`font-orbitron text-3xl font-bold ${color} tracking-wider`}>
              {status}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              {isRising ? (
                <svg className="w-4 h-4 text-tide-high" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-tide-low" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
              <span className="text-white/50 text-sm font-inter">
                Maré {isRising ? 'enchendo' : 'vazando'}
              </span>
            </div>
          </div>
        </div>

        {/* Next event */}
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5">
          <p className="text-white/40 text-xs font-mono tracking-widest uppercase mb-2">
            Próxima {nextEvent.type === 'high' ? 'maré alta' : 'maré baixa'} em
          </p>
          <p className="font-orbitron text-2xl font-bold text-white tracking-wider">
            {timeUntilNext}
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <span className="text-white/40 text-xs font-mono">Horário</span>
              <span className={`font-orbitron text-sm font-bold ${color}`}>{nextEvent.time}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="text-white/40 text-xs font-mono">Altura</span>
              <span className={`font-orbitron text-sm font-bold ${color}`}>
                {nextEvent.height.toFixed(2)}m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
