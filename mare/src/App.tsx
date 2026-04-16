import { useState, useEffect } from 'react';
import WaveBackground from './components/WaveBackground';
import TideGauge from './components/TideGauge';
import TideStatus from './components/TideStatus';
import TideForecast from './components/TideForecast';
import TideChart from './components/TideChart';
import FishingTimes from './components/FishingTimes';
import WeeklyForecast from './components/WeeklyForecast';
import {
  fetchTideDataFromAPI,
  getCurrentTideStatus,
  getFishingWindows,
  LOCATION,
  type DayForecast,
} from './data/tideData';

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
      <span className="font-orbitron text-xl font-bold text-white tracking-wider">
        {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
}

function Header() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="relative z-10 text-center py-8 px-4">
      {/* Logo area */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-blue/30 to-ocean-500/30 border border-neon-blue/20 flex items-center justify-center animate-pulse-glow">
            <span className="text-3xl">🌊</span>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-green flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
        </div>
        <div className="text-left">
          <h1 className="font-orbitron text-2xl sm:text-3xl font-bold text-white tracking-wider">
            MARÉS
          </h1>
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-neon-blue" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-neon-blue/80 text-xs font-mono tracking-wider">
              {LOCATION.fullName}
            </span>
          </div>
        </div>
      </div>

      {/* Date & Clock */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <Clock />
        <p className="text-white/30 text-xs font-mono capitalize">{dateStr}</p>
      </div>

      {/* Coordinates */}
      <div className="mt-3 flex items-center justify-center gap-4">
        <span className="text-white/15 text-[10px] font-mono">
          LAT {LOCATION.coordinates.lat.toFixed(4)}°
        </span>
        <span className="text-white/10">|</span>
        <span className="text-white/15 text-[10px] font-mono">
          LNG {LOCATION.coordinates.lng.toFixed(4)}°
        </span>
      </div>
    </header>
  );
}

function DataSourceBadge() {
  return (
    <div className="glass-card rounded-2xl p-5 text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <svg className="w-5 h-5 text-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-orbitron text-sm font-bold text-white tracking-wider">
          Open-Meteo API
        </span>
      </div>
      <p className="text-white/40 text-xs font-inter leading-relaxed">
        Previsões em tempo real via{' '}
        <span className="text-neon-blue font-semibold">Open-Meteo</span> - API meteorológica global gratuita.
      </p>
      <div className="mt-3 flex items-center justify-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
        <span className="text-white/25 text-[10px] font-mono">
          Modelo: Météo-France • Atualizado: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <a 
        href="https://open-meteo.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-3 inline-block text-neon-blue/60 hover:text-neon-blue text-[10px] font-mono transition-colors"
      >
        open-meteo.com →
      </a>
    </div>
  );
}

function SeaConditions() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-ocean-400/10 border border-ocean-400/20 flex items-center justify-center">
          <span className="text-xl">🌡️</span>
        </div>
        <div>
          <h3 className="font-orbitron text-base font-bold text-white tracking-wide">
            Condições do Mar
          </h3>
          <p className="text-white/30 text-xs font-mono">Informações complementares</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: '🌡️', label: 'Temp. Água', value: '27°C', color: 'text-neon-blue' },
          { icon: '💨', label: 'Vento', value: '12 km/h', color: 'text-neon-green' },
          { icon: '🌊', label: 'Ondas', value: '0.8m', color: 'text-tide-high' },
          { icon: '🧭', label: 'Dir. Vento', value: 'SE', color: 'text-neon-orange' },
          { icon: '☀️', label: 'Nascer do Sol', value: '05:18', color: 'text-neon-orange' },
          { icon: '🌅', label: 'Pôr do Sol', value: '17:42', color: 'text-tide-low' },
        ].map((item, i) => (
          <div
            key={i}
            className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">{item.icon}</span>
              <span className="text-white/30 text-[10px] font-mono uppercase tracking-wider">
                {item.label}
              </span>
            </div>
            <p className={`font-orbitron text-lg font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SafetyAlert() {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-neon-orange/10 to-tide-low/10 border border-neon-orange/20">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-neon-orange/20 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-lg">⚠️</span>
        </div>
        <div>
          <h4 className="font-orbitron text-xs font-bold text-neon-orange tracking-wider mb-1">
            AVISO DE SEGURANÇA
          </h4>
          <p className="text-white/40 text-xs leading-relaxed">
            Sempre consulte as condições locais antes de atividades aquáticas. As previsões são estimativas e podem variar conforme condições meteorológicas. Respeite as sinalizações da praia.
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente de Loading
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-ocean-400/20 border-t-neon-blue animate-spin mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🌊</span>
          </div>
        </div>
        <p className="font-orbitron text-white/60 text-sm tracking-wider animate-pulse">
          CARREGANDO DADOS...
        </p>
        <p className="text-white/30 text-xs mt-2 font-mono">
          Open-Meteo API
        </p>
      </div>
    </div>
  );
}

// Componente de Erro
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-8 text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-neon-orange/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-neon-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="font-orbitron text-white font-bold mb-2">ERRO DE CONEXÃO</h3>
        <p className="text-white/50 text-sm mb-6">
          Não foi possível carregar os dados da maré. Verifique sua conexão.
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/30 rounded-xl font-mono text-neon-blue text-sm transition-all active:scale-95"
        >
          TENTAR NOVAMENTE
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [tideData, setTideData] = useState<DayForecast[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tideStatus, setTideStatus] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    
    try {
      const data = await fetchTideDataFromAPI();
      setTideData(data);
      const status = getCurrentTideStatus(data[0].tides);
      setTideStatus(status);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Atualizar a cada 5 minutos
    const refreshInterval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Atualizar status a cada minuto
  useEffect(() => {
    if (!tideData) return;
    
    const interval = setInterval(() => {
      setTideStatus(getCurrentTideStatus(tideData[0].tides));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [tideData]);

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-x-hidden">
        <WaveBackground />
        <LoadingState />
      </div>
    );
  }

  if (error || !tideData || !tideStatus) {
    return (
      <div className="relative min-h-screen overflow-x-hidden">
        <WaveBackground />
        <ErrorState onRetry={loadData} />
      </div>
    );
  }

  const todayTides = tideData[0].tides;
  const fishingWindows = getFishingWindows(todayTides);
  const todayDate = tideData[0].date;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <WaveBackground />

      <div className="relative z-10 max-w-lg mx-auto pb-12">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="px-4 space-y-5">
          {/* Tide Gauge */}
          <div
            className="glass-card rounded-2xl p-6 flex flex-col items-center"
            style={{ animation: 'fade-in-up 0.6s ease-out forwards' }}
          >
            <TideGauge
              progress={tideStatus.progress}
              status={tideStatus.status}
              nextEvent={tideStatus.nextEvent}
              previousEvent={tideStatus.previousEvent}
            />
          </div>

          {/* Tide Status */}
          <div style={{ animation: 'fade-in-up 0.6s ease-out 0.1s forwards', opacity: 0 }}>
            <TideStatus
              status={tideStatus.status}
              nextEvent={tideStatus.nextEvent}
              timeUntilNext={tideStatus.timeUntilNext}
            />
          </div>

          {/* Tide Chart */}
          <div style={{ animation: 'fade-in-up 0.6s ease-out 0.2s forwards', opacity: 0 }}>
            <TideChart tides={todayTides} />
          </div>

          {/* Today's Forecast */}
          <div style={{ animation: 'fade-in-up 0.6s ease-out 0.3s forwards', opacity: 0 }}>
            <TideForecast
              tides={todayTides}
              title="Previsão de Hoje"
              date={todayDate}
            />
          </div>

          {/* Fishing Times */}
          <div style={{ animation: 'fade-in-up 0.6s ease-out 0.4s forwards', opacity: 0 }}>
            <FishingTimes windows={fishingWindows} />
          </div>

          {/* Sea Conditions */}
          <div style={{ animation: 'fade-in-up 0.6s ease-out 0.5s forwards', opacity: 0 }}>
            <SeaConditions />
          </div>

          {/* Weekly Forecast */}
          <div style={{ animation: 'fade-in-up 0.6s ease-out 0.6s forwards', opacity: 0 }}>
            <WeeklyForecast days={tideData} />
          </div>

          {/* Safety Alert */}
          <div style={{ animation: 'fade-in-up 0.6s ease-out 0.7s forwards', opacity: 0 }}>
            <SafetyAlert />
          </div>

          {/* Data Source */}
          <div style={{ animation: 'fade-in-up 0.6s ease-out 0.8s forwards', opacity: 0 }}>
            <DataSourceBadge />
          </div>

          {/* Footer */}
          <footer className="text-center py-6" style={{ animation: 'fade-in-up 0.6s ease-out 0.9s forwards', opacity: 0 }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg">🌊</span>
              <span className="font-orbitron text-xs font-bold text-white/20 tracking-widest">
                MARÉS BÚZIOS
              </span>
            </div>
            <p className="text-white/15 text-[10px] font-mono">
              Dados em tempo real via Open-Meteo
            </p>
            <p className="text-white/10 text-[10px] font-mono mt-1">
              {LOCATION.fullName} • {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
