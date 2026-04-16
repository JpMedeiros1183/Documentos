import type { FishingWindow } from '../data/tideData';

interface FishingTimesProps {
  windows: FishingWindow[];
}

export default function FishingTimes({ windows }: FishingTimesProps) {
  const qualityLabels = {
    excellent: { label: 'Excelente', color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/20', dots: 3, dotColor: 'bg-neon-green' },
    good: { label: 'Bom', color: 'text-neon-blue', bg: 'bg-neon-blue/10', border: 'border-neon-blue/20', dots: 2, dotColor: 'bg-neon-blue' },
    fair: { label: 'Regular', color: 'text-neon-orange', bg: 'bg-neon-orange/10', border: 'border-neon-orange/20', dots: 1, dotColor: 'bg-neon-orange' },
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center">
          <span className="text-xl">🎣</span>
        </div>
        <div>
          <h3 className="font-orbitron text-base font-bold text-white tracking-wide">
            Horários de Pesca
          </h3>
          <p className="text-white/30 text-xs font-mono">Melhores janelas sugeridas</p>
        </div>
      </div>

      <div className="space-y-3">
        {windows.map((w, index) => {
          const q = qualityLabels[w.quality];
          return (
            <div
              key={index}
              className={`p-4 rounded-xl ${q.bg} border ${q.border} hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < q.dots ? q.dotColor : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-mono ${q.color}`}>{q.label}</span>
                </div>
                <div className="font-orbitron text-base font-bold text-white">
                  {w.start} — {w.end}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-neon-orange/5 border border-neon-orange/10">
        <span className="text-sm mt-0.5">💡</span>
        <p className="text-white/40 text-xs leading-relaxed">
          Os melhores horários são de <strong className="text-white/60">2h antes</strong> da preia-mar e{' '}
          <strong className="text-white/60">2h antes</strong> da baixa-mar, quando a
          movimentação da água é maior.
        </p>
      </div>
    </div>
  );
}
