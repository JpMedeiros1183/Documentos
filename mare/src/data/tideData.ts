export interface TideEvent {
  time: string;
  height: number;
  type: 'high' | 'low';
}

export interface DayForecast {
  date: string;
  dayOfWeek: string;
  moonPhase: string;
  moonIcon: string;
  tides: TideEvent[];
}

export interface FishingWindow {
  start: string;
  end: string;
  quality: 'excellent' | 'good' | 'fair';
}

export const LOCATION = {
  name: 'Praia de Búzios',
  city: 'Nísia Floresta',
  state: 'RN',
  fullName: 'Praia de Búzios - Nísia Floresta/RN',
  coordinates: { lat: -6.2006, lng: -35.0554 }, // Coordenadas precisas da praia
};

// Buscar dados reais da API Open-Meteo
export async function fetchTideDataFromAPI(): Promise<DayForecast[]> {
  try {
    const { lat, lng } = LOCATION.coordinates;
    
    // Open-Meteo Marine API - dados de nível do mar
    const response = await fetch(
      `https://marine-api.open-meteo.com/v1/marine?` +
      `latitude=${lat}&` +
      `longitude=${lng}&` +
      `hourly=sea_surface_height&` +
      `timezone=America%2FFortaleza&` +
      `forecast_days=7&` +
      `models=meteofrance`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.hourly || !data.hourly.sea_surface_height) {
      throw new Error('Dados de maré não disponíveis na resposta');
    }
    
    return processAPITideData(data);
    
  } catch (error) {
    console.warn('Erro ao buscar dados da API, usando fallback:', error);
    return generateFallbackTideData();
  }
}

// Processar dados da API Open-Meteo
function processAPITideData(apiData: any): DayForecast[] {
  const hourly = apiData.hourly;
  const times: string[] = hourly.time;
  const heights: number[] = hourly.sea_surface_height;
  
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const moonPhases = [
    { name: 'Lua Nova', icon: '🌑' },
    { name: 'Lua Crescente', icon: '🌒' },
    { name: 'Lua Crescente', icon: '🌓' },
    { name: 'Lua Crescente', icon: '🌔' },
    { name: 'Lua Cheia', icon: '🌕' },
    { name: 'Lua Minguante', icon: '🌖' },
    { name: 'Lua Minguante', icon: '🌗' },
    { name: 'Lua Minguante', icon: '🌘' },
  ];
  
  // Agrupar dados por dia
  const dailyData: { [key: string]: { times: string[], heights: number[] } } = {};
  
  times.forEach((time: string, index: number) => {
    const date = time.split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = { times: [], heights: [] };
    }
    dailyData[date].times.push(time);
    dailyData[date].heights.push(heights[index]);
  });
  
  const forecasts: DayForecast[] = [];
  const dates = Object.keys(dailyData).sort().slice(0, 7);
  
  dates.forEach((date, dayIndex) => {
    const dayData = dailyData[date];
    const dateObj = new Date(date);
    const dayOfWeek = dayNames[dateObj.getDay()];
    
    // Detectar máximas (preia-mar) e mínimas (baixa-mar)
    const tides = detectTideExtremes(dayData.times, dayData.heights);
    
    // Calcular fase da lua baseada no dia
    const moonIndex = (dayIndex + Math.floor(dateObj.getTime() / (1000 * 60 * 60 * 24))) % 8;
    const moon = moonPhases[moonIndex];
    
    forecasts.push({
      date: dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      dayOfWeek,
      moonPhase: moon.name,
      moonIcon: moon.icon,
      tides: tides.sort((a, b) => a.time.localeCompare(b.time)),
    });
  });
  
  return forecasts;
}

// Detectar extremos de maré (máximas e mínimas)
function detectTideExtremes(times: string[], heights: number[]): TideEvent[] {
  const tides: TideEvent[] = [];
  const minTimeBetweenTides = 4; // mínimo 4 horas entre marés
  
  for (let i = 1; i < heights.length - 1; i++) {
    const prev = heights[i - 1];
    const curr = heights[i];
    const next = heights[i + 1];
    
    // Verificar se é um pico (máximo local)
    if (curr > prev && curr > next && curr > 0.3) {
      const timeStr = times[i].split('T')[1].substring(0, 5);
      
      // Verificar se não está muito próximo da última maré
      if (tides.length === 0) {
        tides.push({ time: timeStr, height: Math.abs(curr), type: 'high' });
      } else {
        const lastTide = tides[tides.length - 1];
        const [lastHour, lastMin] = lastTide.time.split(':').map(Number);
        const [currHour, currMin] = timeStr.split(':').map(Number);
        const hoursDiff = currHour - lastHour + (currMin - lastMin) / 60;
        
        if (hoursDiff >= minTimeBetweenTides) {
          tides.push({ time: timeStr, height: Math.abs(curr), type: 'high' });
        }
      }
    }
    
    // Verificar se é um vale (mínimo local)
    if (curr < prev && curr < next && curr < 1.5) {
      const timeStr = times[i].split('T')[1].substring(0, 5);
      
      if (tides.length === 0) {
        tides.push({ time: timeStr, height: Math.max(0.1, Math.abs(curr)), type: 'low' });
      } else {
        const lastTide = tides[tides.length - 1];
        const [lastHour, lastMin] = lastTide.time.split(':').map(Number);
        const [currHour, currMin] = timeStr.split(':').map(Number);
        const hoursDiff = currHour - lastHour + (currMin - lastMin) / 60;
        
        if (hoursDiff >= minTimeBetweenTides) {
          tides.push({ time: timeStr, height: Math.max(0.1, Math.abs(curr)), type: 'low' });
        }
      }
    }
  }
  
  // Se não detectou marés suficientes, usar padrão típico
  if (tides.length < 3) {
    return generateTypicalDailyTides(heights);
  }
  
  return tides.slice(0, 4); // Máximo 4 marés por dia
}

// Gerar marés típicas do dia baseado na média dos dados
function generateTypicalDailyTides(heights: number[]): TideEvent[] {
  const maxHeight = Math.max(...heights);
  const minHeight = Math.max(0.1, Math.min(...heights));
  
  return [
    { time: '03:30', height: Math.abs(maxHeight) * 0.9, type: 'high' },
    { time: '09:45', height: Math.max(0.1, Math.abs(minHeight)), type: 'low' },
    { time: '16:00', height: Math.abs(maxHeight), type: 'high' },
    { time: '22:15', height: Math.max(0.1, Math.abs(minHeight) * 0.9), type: 'low' },
  ];
}

// Dados de fallback em caso de erro na API
function generateFallbackTideData(): DayForecast[] {
  console.log('Usando dados de fallback');
  return generateTideData(); // Chama a função original
}

export function generateTideData(): DayForecast[] {
  const days: DayForecast[] = [];
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const moonPhases = [
    { name: 'Lua Crescente', icon: '🌓' },
    { name: 'Lua Crescente', icon: '🌓' },
    { name: 'Lua Cheia', icon: '🌕' },
    { name: 'Lua Cheia', icon: '🌕' },
    { name: 'Lua Minguante', icon: '🌗' },
    { name: 'Lua Minguante', icon: '🌗' },
    { name: 'Lua Nova', icon: '🌑' },
  ];

  const baseTides: TideEvent[][] = [
    [
      { time: '03:23', height: 2.42, type: 'high' },
      { time: '09:19', height: 0.21, type: 'low' },
      { time: '15:44', height: 2.55, type: 'high' },
      { time: '21:42', height: 0.15, type: 'low' },
    ],
    [
      { time: '04:01', height: 2.38, type: 'high' },
      { time: '10:05', height: 0.25, type: 'low' },
      { time: '16:22', height: 2.48, type: 'high' },
      { time: '22:18', height: 0.19, type: 'low' },
    ],
    [
      { time: '04:38', height: 2.31, type: 'high' },
      { time: '10:48', height: 0.32, type: 'low' },
      { time: '16:58', height: 2.39, type: 'high' },
      { time: '22:55', height: 0.26, type: 'low' },
    ],
    [
      { time: '05:14', height: 2.22, type: 'high' },
      { time: '11:30', height: 0.41, type: 'low' },
      { time: '17:35', height: 2.28, type: 'high' },
      { time: '23:33', height: 0.35, type: 'low' },
    ],
    [
      { time: '05:52', height: 2.11, type: 'high' },
      { time: '12:15', height: 0.52, type: 'low' },
      { time: '18:14', height: 2.15, type: 'high' },
      { time: '00:12', height: 0.45, type: 'low' },
    ],
    [
      { time: '06:33', height: 1.98, type: 'high' },
      { time: '13:02', height: 0.64, type: 'low' },
      { time: '18:58', height: 2.01, type: 'high' },
      { time: '00:55', height: 0.56, type: 'low' },
    ],
    [
      { time: '07:18', height: 1.85, type: 'high' },
      { time: '13:55', height: 0.77, type: 'low' },
      { time: '19:48', height: 1.88, type: 'high' },
      { time: '01:44', height: 0.68, type: 'low' },
    ],
  ];

  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const dayOfWeek = dayNames[date.getDay()];
    const dateStr = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    days.push({
      date: dateStr,
      dayOfWeek,
      moonPhase: moonPhases[i].name,
      moonIcon: moonPhases[i].icon,
      tides: baseTides[i],
    });
  }

  return days;
}

export function getCurrentTideStatus(tides: TideEvent[]): {
  status: 'SUBINDO' | 'DESCENDO';
  nextEvent: TideEvent;
  previousEvent: TideEvent;
  progress: number;
  timeUntilNext: string;
  minutesUntilNext: number;
} {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const tideMinutes = tides.map((t) => {
    const [h, m] = t.time.split(':').map(Number);
    return h * 60 + m;
  });

  let nextIndex = tideMinutes.findIndex((m) => m > currentMinutes);
  if (nextIndex === -1) nextIndex = 0;

  const prevIndex = nextIndex === 0 ? tides.length - 1 : nextIndex - 1;
  const nextEvent = tides[nextIndex];
  const previousEvent = tides[prevIndex];

  const nextMin = tideMinutes[nextIndex];
  const prevMin = tideMinutes[prevIndex];

  const totalSpan = nextMin > prevMin ? nextMin - prevMin : 1440 - prevMin + nextMin;
  const elapsed =
    currentMinutes >= prevMin ? currentMinutes - prevMin : 1440 - prevMin + currentMinutes;
  const progress = Math.min(Math.max(elapsed / totalSpan, 0), 1);

  const minutesUntilNext =
    nextMin > currentMinutes ? nextMin - currentMinutes : 1440 - currentMinutes + nextMin;

  const hours = Math.floor(minutesUntilNext / 60);
  const mins = minutesUntilNext % 60;
  const timeUntilNext = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;

  const status = nextEvent.type === 'high' ? 'SUBINDO' : 'DESCENDO';

  return { status, nextEvent, previousEvent, progress, timeUntilNext, minutesUntilNext };
}

export function getFishingWindows(tides: TideEvent[]): FishingWindow[] {
  const windows: FishingWindow[] = [];

  tides.forEach((tide) => {
    const [h, m] = tide.time.split(':').map(Number);
    const startMin = (h * 60 + m - 120 + 1440) % 1440;
    const endMin = (h * 60 + m + 120) % 1440;

    const startH = Math.floor(startMin / 60)
      .toString()
      .padStart(2, '0');
    const startM = (startMin % 60).toString().padStart(2, '0');
    const endH = Math.floor(endMin / 60)
      .toString()
      .padStart(2, '0');
    const endM = (endMin % 60).toString().padStart(2, '0');

    if (tide.type === 'high') {
      windows.push({
        start: `${startH}:${startM}`,
        end: `${endH}:${endM}`,
        quality: tide.height > 2.3 ? 'excellent' : 'good',
      });
    }
  });

  return windows;
}
