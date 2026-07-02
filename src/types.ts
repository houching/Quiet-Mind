export interface Sound {
  key: string;
  label: string;
  shortcode: string;
  volume: number; // 0 to 1
  sortKey: number;
}

export interface Mix {
  id: string;
  name: string;
  sounds: { [key: string]: number }; // volume levels (key -> volume)
  created: number;
}

export type TimerMode = 'stop' | 'fadeOut' | 'start' | null;

export interface TimerState {
  isActive: boolean;
  secondsLeft: number;
  totalSeconds: number;
  mode: TimerMode;
}

export interface MeanderSoundState {
  baseVolume: number;
  tickOffset: number;
  direction: 'left' | 'right';
}

export interface MeanderState {
  isActive: boolean;
  sounds: { [key: string]: MeanderSoundState } | null;
  tickCount: number;
}

// Sound definitions matching the scraped A Soft Murmur config
export const SOUND_KEYS = [
  'rain',
  'thunder',
  'waves',
  'wind',
  'fire',
  'birds',
  'crickets',
  'people',
  'sbowl',
  'whitenoise',
  'aircon',
  'fanhigh',
  'fanlow',
  'city',
  'chimesmetal',
  'stream',
  'raintinroof',
  'raintrees',
  'raincabin',
  'waterfall',
  'cicadas',
  'brownnoise',
  'pinknoise',
  'frogs',
  'vinyl'
] as const;

export const SOUND_LABELS: Record<string, string> = {
  rain: 'Rain',
  thunder: 'Thunder',
  waves: 'Waves',
  wind: 'Wind',
  fire: 'Fire',
  birds: 'Birds',
  crickets: 'Crickets',
  people: 'Coffee shop',
  sbowl: 'Singing Bowl',
  whitenoise: 'White noise',
  aircon: 'Air conditioning',
  fanhigh: 'Fan on high',
  fanlow: 'Fan on low',
  city: 'City',
  chimesmetal: 'Metal chimes',
  stream: 'Stream',
  raintinroof: 'Rain on tin roof',
  raintrees: 'Rain on trees',
  raincabin: 'Rain on cabin',
  waterfall: 'Waterfall',
  cicadas: 'Cicadas',
  brownnoise: 'Brown noise',
  pinknoise: 'Pink noise',
  frogs: 'Frogs',
  vinyl: 'Record player'
};

export const SOUND_SHORTCODES: Record<string, string> = {
  rain: 'rno',
  thunder: 'thn',
  waves: 'wve',
  wind: 'wnd',
  fire: 'fre',
  birds: 'brd',
  crickets: 'crk',
  people: 'pep',
  sbowl: 'sbo',
  whitenoise: 'wno',
  aircon: 'arc',
  fanhigh: 'fnh',
  fanlow: 'fnl',
  city: 'cit',
  chimesmetal: 'chm',
  stream: 'str',
  raintinroof: 'rnr',
  raintrees: 'rnt',
  raincabin: 'rnc',
  waterfall: 'wtr',
  cicadas: 'cic',
  brownnoise: 'brn',
  pinknoise: 'pnk',
  frogs: 'frg',
  vinyl: 'vnl'
};

export const SOUND_SORT_KEYS: Record<string, number> = {
  rain: 1,
  thunder: 2,
  waves: 3,
  wind: 4,
  fire: 5,
  birds: 6,
  crickets: 7,
  people: 8,
  sbowl: 9,
  whitenoise: 10,
  fanhigh: 20,
  fanlow: 19,
  city: 18,
  chimesmetal: 17,
  stream: 14,
  raintinroof: 12,
  raintrees: 11,
  raincabin: 13,
  waterfall: 15,
  cicadas: 16,
  frogs: 22,
  brownnoise: 99,
  pinknoise: 100,
  vinyl: 24,
  aircon: 21
};
