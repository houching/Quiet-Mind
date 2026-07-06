import React, { useState, useEffect, useRef } from 'react';
import {
  Sound,
  Mix,
  TimerState,
  MeanderState,
  SOUND_KEYS,
  SOUND_LABELS,
  SOUND_SHORTCODES,
  SOUND_SORT_KEYS,
  TimerMode,
  MeanderIntensity,
  MEANDER_INTENSITY_CONFIG,
  MeanderPattern
} from './types';
import { SoundPlayer } from './components/SoundPlayer';
import spinner from './assets/spinner.gif';

interface PresetMix {
  id: string;
  nameEn: string;
  nameKm: string;
  sounds: { [key: string]: number };
}

const PRESET_MIXES: PresetMix[] = [
  {
    id: 'p1',
    nameEn: 'Relaxing Rain',
    nameKm: 'ភ្លៀងលំហែកាយ',
    sounds: { rain: 0.5, thunder: 0.2, wind: 0.3 }
  },
  {
    id: 'p2',
    nameEn: 'Forest Walk',
    nameKm: 'ដើរលេងក្នុងព្រៃ',
    sounds: { birds: 0.6, crickets: 0.4, stream: 0.5 }
  },
  {
    id: 'p3',
    nameEn: 'Cozy Cafe',
    nameKm: 'ហាងកាហ្វេកក់ក្ដៅ',
    sounds: { people: 0.5, rain: 0.3, vinyl: 0.2 }
  },
  {
    id: 'p4',
    nameEn: 'Deep Focus',
    nameKm: 'ផ្ដោតអារម្មណ៍ខ្លាំង',
    sounds: { whitenoise: 0.4, fanlow: 0.3, aircon: 0.2 }
  },
  {
    id: 'p5',
    nameEn: 'Ocean Breeze',
    nameKm: 'ខ្យល់សមុទ្រ',
    sounds: { waves: 0.6, wind: 0.4, chimesmetal: 0.3 }
  },
  {
    id: 'p6',
    nameEn: 'Summer Night',
    nameKm: 'រាត្រីរដូវក្ដៅ',
    sounds: { cicadas: 0.5, frogs: 0.4, crickets: 0.4 }
  },
  {
    id: 'p7',
    nameEn: 'Cabin Retreat',
    nameKm: 'លំហែកាយក្នុងផ្ទះឈើ',
    sounds: { raincabin: 0.6, fire: 0.5, wind: 0.3 }
  },
  {
    id: 'p8',
    nameEn: 'Stormy Sleep',
    nameKm: 'គេងក្នុងព្យុះភ្លៀង',
    sounds: { raintinroof: 0.7, thunder: 0.4, brownnoise: 0.3 }
  }
];

// Multi-language translation dictionary for Khmer intranet context
const TRANSLATIONS = {
  en: {
    title: 'Quiet Mind',
    subtitle: 'Mix ambient sounds together to focus or relax',
    mute: 'Mute',
    unmute: 'Unmute',
    timers: 'Timers',
    mixes: 'Mixes',
    sounds: 'Sounds',
    share: 'Share',
    meanderTitle: 'Meander: Wander the volumes randomly',
    resetTitle: 'Reset all volumes or restore previous mix',
    activeSounds: 'Active Sounds',
    availableSounds: 'Available Sounds',
    slotsTitle: 'Active Slots',
    clearAll: 'Clear All',
    addAll: 'Add All',
    noMixes: 'No mixes saved yet.',
    saveMix: 'Save Mix',
    mixNamePlaceholder: 'Enter mix name...',
    save: 'Save',
    copy: 'Copy to clipboard',
    copied: 'Copied!',
    copyError: "Couldn't copy",
    shareTitle: '↓ Share this mix ↓',
    timerModeLabel: 'Timer Mode',
    timerDurationLabel: 'Duration',
    timerStart: 'Start Timer',
    timerCancel: 'Cancel Timer',
    soundsWillStartIn: 'Sounds will start in',
    soundsWillStopIn: 'Sounds will stop in',
    soundsWillFadeIn: 'Sounds will fade in',
    soundsWillFadeOut: 'Sounds will fade out in',
    hours: 'hours',
    minutes: 'mins',
    limitMessage: 'Please remove an active sound first (max 25 active sounds).',
    presetMixes: 'Preset Mixes',
    myMixes: 'My Mixes',
    settings: 'Settings',
    meanderIntensity: 'Meander Intensity',
    gentle: 'Gentle',
    medium: 'Medium',
    wild: 'Wild',
    driftPattern: 'Drift Pattern',
    sine: 'Sine Wave',
    random: 'Random Walk',
    pulse: 'Pulse',
    applyToAll: 'Apply pattern to all'
  },
  km: {
    title: 'ស្ងប់ចិត្ត',
    subtitle: 'លាយសំឡេងជុំវិញខ្លួនជាមួយគ្នា ដើម្បីបង្កើនការផ្ដោតអារម្មណ៍ ឬលំហែកាយ',
    mute: 'បិទសំឡេង',
    unmute: 'បើកសំឡេង',
    timers: 'ម៉ោងកំណត់',
    mixes: 'ល្បាយសំឡេង',
    sounds: 'គ្រប់គ្រងសំឡេង',
    share: 'ចែករំលែក',
    meanderTitle: 'លម្អៀង៖ ផ្លាស់ប្ដូរទំហំសំឡេងដោយស្វ័យប្រវត្តិតាមពេលវេលា',
    resetTitle: 'កំណត់ឡើងវិញ ឬស្តារល្បាយសំឡេងចុងក្រោយ',
    activeSounds: 'សំឡេងកំពុងដំណើរការ',
    availableSounds: 'សំឡេងដែលអាចប្រើបាន',
    slotsTitle: 'កន្លែងដាក់សំឡេង',
    clearAll: 'សម្អាតទាំងអស់',
    addAll: 'បន្ថែមទាំងអស់',
    noMixes: 'មិនទាន់មានល្បាយសំឡេងដែលបានរក្សាទុកទេ។',
    saveMix: 'រក្សាទុកល្បាយសំឡេង',
    mixNamePlaceholder: 'បញ្ចូលឈ្មោះល្បាយសំឡេង...',
    save: 'រក្សាទុក',
    copy: 'ចម្លងតំណភ្ជាប់',
    copied: 'បានចម្លង!',
    copyError: 'មិនអាចចម្លងបានទេ',
    shareTitle: '↓ ចែករំលែកល្បាយសំឡេងនេះ ↓',
    timerModeLabel: 'របៀបកំណត់ម៉ោង',
    timerDurationLabel: 'រយៈពេល',
    timerStart: 'ចាប់ផ្ដើមកំណត់ម៉ោង',
    timerCancel: 'បោះបង់ម៉ោងកំណត់',
    soundsWillStartIn: 'សំឡេងនឹងចាប់ផ្ដើមក្នុងរយៈពេល',
    soundsWillStopIn: 'សំឡេងនឹងបញ្ឈប់ក្នុងរយៈពេល',
    soundsWillFadeIn: 'សំឡេងនឹងលេចឡើងក្នុងរយៈពេល',
    soundsWillFadeOut: 'សំឡេងនឹងរលត់ទៅវិញក្នុងរយៈពេល',
    hours: 'ម៉ោង',
    minutes: 'នាទី',
    limitMessage: 'សូមដកសំឡេងកំពុងដំណើរការចេញសិន (អនុញ្ញាតត្រឹមតែ ២៥ សំឡេងប៉ុណ្នោះ)។',
    presetMixes: 'ល្បាយគំរូ',
    myMixes: 'ល្បាយរបស់ខ្ញុំ',
    settings: 'ការកំណត់',
    meanderIntensity: 'កម្រិតលម្អៀង',
    gentle: 'ទន់ភ្លន់',
    medium: 'មធ្យម',
    wild: 'ខ្លាំង',
    driftPattern: 'ទម្រង់ផ្លាស់ប្ដូរ',
    sine: 'រលកសញ្ញាណ',
    random: 'ចៃដន្យ',
    pulse: 'ចង្វាក់',
    applyToAll: 'កំណត់គ្រប់សំឡេង'
  },
  zh: {
    title: '静心',
    subtitle: '混合背景音，帮助您专注或放松',
    mute: '静音',
    unmute: '取消静音',
    timers: '定时器',
    mixes: '混合声',
    sounds: '声音',
    share: '分享',
    meanderTitle: '漫游：随机漂移音量',
    resetTitle: '重置所有音量或恢复上一次混合',
    activeSounds: '启用中',
    availableSounds: '可用声音',
    slotsTitle: '可用插槽',
    clearAll: '清空全部',
    addAll: '添加全部',
    noMixes: '尚未保存任何混合声音。',
    saveMix: '保存混合声',
    mixNamePlaceholder: '输入名字...',
    save: '保存',
    copy: '复制到剪贴板',
    copied: '已复制!',
    copyError: '无法复制',
    shareTitle: '↓ 分享此混合声音 ↓',
    timerModeLabel: '定时模式',
    timerDurationLabel: '时长',
    timerStart: '启动定时',
    timerCancel: '取消定时',
    soundsWillStartIn: '声音将在以下时间后开启',
    soundsWillStopIn: '声音将在以下时间后停止',
    soundsWillFadeIn: '声音将在以下时间后淡入',
    soundsWillFadeOut: '声音将在以下时间后淡出',
    hours: '小时',
    minutes: '分钟',
    limitMessage: '请先移除部分启用中的声音（最多支持 25 个）。',
    presetMixes: '预设混合声',
    myMixes: '我的混合声',
    settings: '设置',
    meanderIntensity: '漫游强度',
    gentle: '柔和',
    medium: '中等',
    wild: '强烈',
    driftPattern: '漂移模式',
    sine: '正弦波',
    random: '随机漫游',
    pulse: '脉冲',
    applyToAll: '应用到全部'
  }
};

// Why only 10: show core sounds first, rest revealed via "More Sounds" button
const DEFAULT_ACTIVE_KEYS = SOUND_KEYS.slice(0, 10);

// Supported application languages
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'km', label: 'ភាសាខ្មែរ' },
  { code: 'zh', label: '中文' }
];

export const App: React.FC = () => {
  // --- Language / i18n State ---
  const [lang, setLang] = useState<string>(() => {
    const stored = localStorage.getItem('quietmind_lang');
    return stored || 'en';
  });

  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const getSoundLabel = (key: string) => {
    return SOUND_LABELS[lang]?.[key] || SOUND_LABELS.en?.[key] || key;
  };

  // --- Active / Available Sounds Configuration ---
  const [activeKeys, setActiveKeys] = useState<string[]>(() => {
    const stored = localStorage.getItem('quietmind_active_keys');
    return stored ? JSON.parse(stored) : DEFAULT_ACTIVE_KEYS;
  });

  // --- Audio State ---
  const [sounds, setSounds] = useState<Record<string, Sound>>(() => {
    const initial: Record<string, Sound> = {};
    SOUND_KEYS.forEach(key => {
      initial[key] = {
        key,
        label: SOUND_LABELS.en[key] || key,
        shortcode: SOUND_SHORTCODES[key],
        volume: 0, // initially off
        sortKey: SOUND_SORT_KEYS[key]
      };
    });
    return initial;
  });

  const [globalVolume, setGlobalVolume] = useState<number>(() => {
    const stored = localStorage.getItem('quietmind_global_volume');
    return stored ? parseFloat(stored) : 0.5;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [soundLoadedStatus, setSoundLoadedStatus] = useState<Record<string, boolean>>({});
  const [limitWarning, setLimitWarning] = useState<boolean>(false);

  // --- State to Reset / Restore previous mix ---
  const [stateToReset, setStateToReset] = useState<Record<string, number> | null>(null);

  // --- Settings Open State ---
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  // --- Meander State ---
  const [meander, setMeander] = useState<MeanderState>({
    isActive: false,
    sounds: null,
    tickCount: 0,
    intensity: 'medium'
  });

  // --- Timer State ---
  const [timer, setTimer] = useState<TimerState>({
    isActive: false,
    secondsLeft: 0,
    totalSeconds: 0,
    mode: null
  });

  // Input states for Timer tab
  const [timerInputHours, setTimerInputHours] = useState<number>(0);
  const [timerInputMins, setTimerInputMins] = useState<number>(30);
  const [timerInputMode, setTimerInputMode] = useState<TimerMode>('stop');

  // --- Saved Mixes State ---
  const [mixes, setMixes] = useState<Mix[]>(() => {
    const stored = localStorage.getItem('quietmind_saved_mixes');
    return stored ? JSON.parse(stored) : [];
  });
  const [newMixName, setNewMixName] = useState<string>('');
  const [mixDeletePendingId, setMixDeletePendingId] = useState<string | null>(null);

  // --- Share Options ---
  const [copyStatus, setCopyStatus] = useState<'success' | 'error' | null>(null);

  // --- Active Row Control Tab ---
  const [activeTab, setActiveTab] = useState<'timers' | 'mixes' | 'manage' | 'share' | null>(null);

  // --- Local Storage Synchronization ---
  useEffect(() => {
    localStorage.setItem('quietmind_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('quietmind_active_keys', JSON.stringify(activeKeys));
  }, [activeKeys]);

  useEffect(() => {
    localStorage.setItem('quietmind_global_volume', globalVolume.toString());
  }, [globalVolume]);

  useEffect(() => {
    localStorage.setItem('quietmind_saved_mixes', JSON.stringify(mixes));
  }, [mixes]);

  // --- Clear soundLoadedStatus for muted sounds to ensure spinners show correctly on reload ---
  useEffect(() => {
    setSoundLoadedStatus(prev => {
      let changed = false;
      const next = { ...prev };
      Object.keys(sounds).forEach(key => {
        if (sounds[key].volume <= 0.02 && next[key]) {
          delete next[key];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [sounds]);

  // --- URL Search Params Parse (Share URL load) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mixCode = params.get('m');
    const autoplay = params.get('autoplay') === '1';
    const meanderActive = params.get('meander') === '1';
    const meanderDisabledCodes = params.get('md')?.split(',') || [];

    if (mixCode) {
      const newVolumes: Record<string, number> = {};
      // Parse 5-character chunks (e.g. "rno50", "thn05")
      for (let i = 0; i < mixCode.length; i += 5) {
        const code = mixCode.substring(i, i + 3);
        const volStr = mixCode.substring(i + 3, i + 5);
        const volNum = parseInt(volStr, 10);
        if (!isNaN(volNum)) {
          const key = Object.keys(SOUND_SHORTCODES).find(
            k => SOUND_SHORTCODES[k] === code
          );
          if (key) {
            newVolumes[key] = volNum === 99 ? 1.0 : volNum / 100;
          }
        }
      }

      setSounds(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          next[key] = { ...next[key], volume: newVolumes[key] || 0 };
        });
        return next;
      });

      if (meanderActive) {
        let parsedIntensity: MeanderIntensity = 'medium';
        const intensityCode = params.get('mi');
        if (intensityCode === 'g') parsedIntensity = 'gentle';
        else if (intensityCode === 'w') parsedIntensity = 'wild';

        const patternParam = params.get('mp') || '';
        const patternsMap: Record<string, MeanderPattern> = {};
        patternParam.split(',').forEach(item => {
          const [sc, pat] = item.split(':');
          if (sc && (pat === 'sine' || pat === 'random' || pat === 'pulse')) {
            const key = Object.keys(SOUND_SHORTCODES).find(
              k => SOUND_SHORTCODES[k] === sc
            );
            if (key) {
              patternsMap[key] = pat as MeanderPattern;
            }
          }
        });

        // Initialize meander state parameters from loaded URL volumes
        const meanderSounds: Record<string, { baseVolume: number; tickOffset: number; direction: 'left' | 'right'; disabled?: boolean; pattern: MeanderPattern }> = {};
        SOUND_KEYS.forEach(key => {
          const isSoundDisabled = meanderDisabledCodes.includes(SOUND_SHORTCODES[key]);
          meanderSounds[key] = {
            baseVolume: newVolumes[key] || 0,
            tickOffset: 0,
            direction: Math.random() > 0.5 ? 'right' : 'left',
            disabled: isSoundDisabled,
            pattern: patternsMap[key] || 'sine'
          };
        });
        setMeander({
          isActive: true,
          sounds: meanderSounds,
          tickCount: 0,
          intensity: parsedIntensity
        });
      }

      if (autoplay || meanderActive) {
        setIsPlaying(true);
      }
    }
  }, []);

  // Use refs to keep values fresh inside the interval without re-creating the timer
  const timerRef = useRef(timer);
  const meanderRef = useRef(meander);
  const soundsRef = useRef(sounds);

  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

  useEffect(() => {
    meanderRef.current = meander;
  }, [meander]);

  useEffect(() => {
    soundsRef.current = sounds;
  }, [sounds]);

  // --- 1-Second Timer Tick (Handles Countdown & Meander volume drifts) ---
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const currentTimer = timerRef.current;
      const currentMeander = meanderRef.current;
      const currentSounds = soundsRef.current;

      // 1. Timer Tick
      if (currentTimer.isActive) {
        if (currentTimer.secondsLeft <= 1) {
          // Timer triggered
          setTimer(prev => ({ ...prev, isActive: false, secondsLeft: 0 }));

          if (currentTimer.mode === 'stop' || currentTimer.mode === 'fadeOut') {
            setIsPlaying(false);
          } else if (currentTimer.mode === 'start') {
            setIsPlaying(true);
          }
          setMeander(prev => ({ ...prev, isActive: false }));
        } else {
          setTimer(prev => {
            // If in fadeOut mode and last 30 seconds, smoothly reduce global volume
            if (prev.mode === 'fadeOut' && prev.secondsLeft <= 30) {
              setGlobalVolume(gv => Math.max(0, gv - gv / prev.secondsLeft));
            }
            return { ...prev, secondsLeft: prev.secondsLeft - 1 };
          });
        }
      }

      // 2. Meander Volume Drift
      if (currentMeander.isActive) {
        setMeander(prevMeander => {
          const nextTick = prevMeander.tickCount + 1;
          let meanderSounds = prevMeander.sounds ? { ...prevMeander.sounds } : null;

          if (!meanderSounds) {
            meanderSounds = {};
            Object.keys(currentSounds).forEach(key => {
              meanderSounds![key] = {
                baseVolume: currentSounds[key].volume,
                tickOffset: 0,
                direction: Math.random() > 0.5 ? 'right' : 'left',
                disabled: false,
                pattern: 'sine'
              };
            });
          }

          const intensityConfig = MEANDER_INTENSITY_CONFIG[prevMeander.intensity || 'medium'];
          const cycleLength = intensityConfig.cycleLength;
          const driftRange = intensityConfig.driftRange;

          setSounds(prevSounds => {
            const nextSounds = { ...prevSounds };
            Object.keys(meanderSounds!).forEach(key => {
              const mState = meanderSounds![key];
              if (mState.disabled) return; // skip if meander is disabled for this sound
              const baseVol = mState.baseVolume;
              if (baseVol <= 0.02) return; // ignore inactive sounds

              let nextVol = baseVol;
              const pat = mState.pattern || 'sine';

              if (pat === 'sine') {
                const offsetIndex = (nextTick - mState.tickOffset) % cycleLength;
                const phase = (2 * Math.PI * offsetIndex) / cycleLength;
                const sineVal = Math.sin(phase);
                const maxUp = (1 - baseVol) * driftRange;
                const maxDown = baseVol * (driftRange / (1 + driftRange));
                nextVol = baseVol + (sineVal > 0 ? sineVal * maxUp : sineVal * maxDown);
              } else if (pat === 'random') {
                // Brownian walk drift
                const stepMax = (baseVol * driftRange) / 8;
                const randChange = (Math.random() * 2 - 1) * stepMax;
                const prevVol = prevSounds[key]?.volume ?? baseVol;
                nextVol = prevVol + randChange;
                
                // Clamp within drift range boundaries
                const maxLimit = baseVol + (1 - baseVol) * driftRange;
                const minLimit = baseVol - baseVol * (driftRange / (1 + driftRange));
                nextVol = Math.max(minLimit, Math.min(maxLimit, nextVol));
              } else if (pat === 'pulse') {
                // Heartbeat / breathing fade-out cycle
                const progress = ((nextTick - mState.tickOffset) % cycleLength) / cycleLength;
                let factor = 1;
                if (progress < 0.25) {
                  const p = progress / 0.25;
                  factor = 1 - (1 - 0.10) * p;
                } else if (progress < 0.50) {
                  factor = 0.10;
                } else if (progress < 0.75) {
                  const p = (progress - 0.50) / 0.25;
                  factor = 0.10 + (1 - 0.10) * p;
                } else {
                  factor = 1;
                }
                nextVol = baseVol * factor;
              }

              nextVol = Math.max(0, Math.min(1, nextVol));
              nextSounds[key] = { ...nextSounds[key], volume: nextVol };
            });
            return nextSounds;
          });

          return {
            ...prevMeander,
            tickCount: nextTick,
            sounds: meanderSounds
          };
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // --- Helper to trigger sound loading indicator ---
  const handleSoundLoaded = (key: string) => {
    setSoundLoadedStatus(prev => ({ ...prev, [key]: true }));
  };

  // --- Sound controls ---
  const updateSoundVolume = (key: string, vol: number) => {
    setSounds(prev => ({
      ...prev,
      [key]: { ...prev[key], volume: vol }
    }));

    if (vol > 0.02 && !isPlaying) {
      setIsPlaying(true);
    }

    if (meander.isActive && meander.sounds && meander.sounds[key]) {
      setMeander(prev => {
        const nextSounds = { ...prev.sounds };
        if (nextSounds[key]) {
          nextSounds[key] = {
            ...nextSounds[key],
            baseVolume: vol
          };
        }
        return { ...prev, sounds: nextSounds };
      });
    }
  };

  const handleToggleSoundActive = (key: string) => {
    const sound = sounds[key];
    if (sound.volume > 0.02) {
      updateSoundVolume(key, 0);
    } else {
      updateSoundVolume(key, 0.5);
    }
  };

  // --- Playback controls ---
  const toggleMeander = () => {
    if (meander.isActive) {
      setMeander(prev => ({ isActive: false, sounds: null, tickCount: 0, intensity: prev.intensity }));
    } else {
      // Initialize meander state parameters
      const meanderSounds: Record<string, { baseVolume: number; tickOffset: number; direction: 'left' | 'right'; disabled?: boolean; pattern: MeanderPattern }> = {};
      Object.keys(sounds).forEach(key => {
        meanderSounds[key] = {
          baseVolume: sounds[key].volume,
          tickOffset: 0,
          direction: Math.random() > 0.5 ? 'right' : 'left',
          disabled: false,
          pattern: 'sine'
        };
      });
      setMeander(prev => ({
        isActive: true,
        sounds: meanderSounds,
        tickCount: 0,
        intensity: prev.intensity
      }));
    }
  };

  const setMeanderIntensity = (level: MeanderIntensity) => {
    setMeander(prev => ({
      ...prev,
      intensity: level
    }));
  };

  const setSoundPattern = (key: string, pattern: MeanderPattern) => {
    setMeander(prev => {
      if (!prev.sounds) return prev;
      const nextSounds = { ...prev.sounds };
      if (nextSounds[key]) {
        nextSounds[key] = {
          ...nextSounds[key],
          pattern,
          tickOffset: prev.tickCount
        };
      }
      return {
        ...prev,
        sounds: nextSounds
      };
    });
  };

  const setAllSoundPatterns = (pattern: MeanderPattern) => {
    setMeander(prev => {
      if (!prev.sounds) return prev;
      const nextSounds = { ...prev.sounds };
      Object.keys(nextSounds).forEach(key => {
        nextSounds[key] = {
          ...nextSounds[key],
          pattern,
          tickOffset: prev.tickCount
        };
      });
      return {
        ...prev,
        sounds: nextSounds
      };
    });
  };

  const toggleMeanderForSound = (key: string) => {
    if (!meander.isActive) return;
    setMeander(prev => {
      if (!prev.sounds) return prev;
      const nextSounds = { ...prev.sounds };
      const currentSoundState = nextSounds[key];
      if (!currentSoundState) return prev;

      const isDisabling = !currentSoundState.disabled;

      nextSounds[key] = {
        ...currentSoundState,
        disabled: isDisabling
      };

      if (isDisabling) {
        // Restore base volume when disabling meander for this sound
        setSounds(prevSounds => ({
          ...prevSounds,
          [key]: { ...prevSounds[key], volume: currentSoundState.baseVolume }
        }));
      } else {
        // If enabling, set baseVolume to the current volume
        nextSounds[key].baseVolume = soundsRef.current[key].volume;
        nextSounds[key].tickOffset = prev.tickCount; // Reset tick offset to keep transition smooth
      }

      return {
        ...prev,
        sounds: nextSounds
      };
    });
  };

  const handleReset = () => {
    if (stateToReset) {
      // Restore previous state
      setSounds(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          next[key] = { ...next[key], volume: stateToReset[key] || 0 };
        });
        return next;
      });
      setStateToReset(null);
      setIsPlaying(true);
    } else {
      // Cache current volumes, reset all to 0
      const currentVols: Record<string, number> = {};
      let hasActive = false;
      Object.keys(sounds).forEach(key => {
        currentVols[key] = sounds[key].volume;
        if (sounds[key].volume > 0.02) hasActive = true;
      });

      if (hasActive) {
        setStateToReset(currentVols);
        setSounds(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(key => {
            next[key] = { ...next[key], volume: 0 };
          });
          return next;
        });
        setIsPlaying(false);
        setMeander(prev => ({ isActive: false, sounds: null, tickCount: 0, intensity: prev.intensity }));
        setTimer({ isActive: false, secondsLeft: 0, totalSeconds: 0, mode: null });
      }
    }
  };

  // --- Tab Toggling ---
  const toggleTab = (tabName: 'timers' | 'mixes' | 'manage' | 'share') => {
    if (activeTab === tabName) {
      setActiveTab(null);
    } else {
      setActiveTab(tabName);
    }
  };

  // --- Timer Actions ---
  const handleStartTimer = () => {
    const totalSecs = timerInputHours * 3600 + timerInputMins * 60;
    if (totalSecs > 0) {
      setTimer({
        isActive: true,
        secondsLeft: totalSecs,
        totalSeconds: totalSecs,
        mode: timerInputMode
      });
    }
  };

  const handleCancelTimer = () => {
    setTimer({
      isActive: false,
      secondsLeft: 0,
      totalSeconds: 0,
      mode: null
    });
  };

  // --- Mix Actions ---
  const handleSaveMix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMixName.trim()) return;

    const currentSounds: Record<string, number> = {};
    Object.keys(sounds).forEach(key => {
      if (sounds[key].volume > 0.02) {
        currentSounds[key] = sounds[key].volume;
      }
    });

    const newMix: Mix = {
      id: Date.now().toString(),
      name: newMixName.trim(),
      sounds: currentSounds,
      created: Date.now()
    };

    setMixes(prev => [...prev, newMix]);
    setNewMixName('');
  };

  const handleLoadMix = (mixSounds: Record<string, number>) => {
    setSounds(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        next[key] = { ...next[key], volume: mixSounds[key] || 0 };
      });
      return next;
    });
    setIsPlaying(true);
  };

  const handleDeleteMix = (id: string) => {
    setMixes(prev => prev.filter(m => m.id !== id));
    setMixDeletePendingId(null);
  };

  // --- Sound Manager Actions ---
  const activateSound = (key: string) => {
    if (activeKeys.length >= 25) {
      setLimitWarning(true);
      setTimeout(() => setLimitWarning(false), 5000);
      return;
    }
    setActiveKeys(prev => [...prev, key]);
  };

  const deactivateSound = (key: string) => {
    setActiveKeys(prev => prev.filter(k => k !== key));
    updateSoundVolume(key, 0);
  };

  const handleActivateAllSounds = () => {
    setActiveKeys([...SOUND_KEYS]);
  };

  const handleClearAllSounds = () => {
    setActiveKeys([]);
    setSounds(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        next[k] = { ...next[k], volume: 0 };
      });
      return next;
    });
    setIsPlaying(false);
  };

  // --- Share URL Generator ---
  const getShareUrl = () => {
    let code = '';
    const sortedActive = Object.keys(sounds)
      .filter(k => {
        const vol = (meander.isActive && meander.sounds && meander.sounds[k])
          ? meander.sounds[k].baseVolume
          : sounds[k].volume;
        return vol > 0.02;
      })
      .sort((a, b) => sounds[a].sortKey - sounds[b].sortKey);

    sortedActive.forEach(key => {
      const vol = Math.round(
        ((meander.isActive && meander.sounds && meander.sounds[key])
          ? meander.sounds[key].baseVolume
          : sounds[key].volume) * 100
      );
      let volStr = vol.toString();
      if (volStr.length === 1) volStr = '0' + volStr;
      if (volStr === '100') volStr = '99';
      code += sounds[key].shortcode + volStr;
    });

    const url = new URL(window.location.origin + window.location.pathname);
    if (code) {
      url.searchParams.set('m', code);
    }

    if (meander.isActive) {
      url.searchParams.set('meander', '1');

      if (meander.intensity !== 'medium') {
        const intCode = meander.intensity === 'gentle' ? 'g' : 'w';
        url.searchParams.set('mi', intCode);
      }

      const disabledShortcodes: string[] = [];
      const patternPairs: string[] = [];

      if (meander.sounds) {
        Object.keys(meander.sounds).forEach(key => {
          const mState = meander.sounds![key];
          if (mState?.disabled) {
            disabledShortcodes.push(SOUND_SHORTCODES[key]);
          }
          if (mState?.pattern && mState.pattern !== 'sine') {
            patternPairs.push(`${SOUND_SHORTCODES[key]}:${mState.pattern}`);
          }
        });
      }

      if (disabledShortcodes.length > 0) {
        url.searchParams.set('md', disabledShortcodes.join(','));
      }
      if (patternPairs.length > 0) {
        url.searchParams.set('mp', patternPairs.join(','));
      }
    }

    return url.toString();
  };

  const handleCopyToClipboard = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopyStatus('success');
        setTimeout(() => setCopyStatus(null), 3000);
      })
      .catch(() => {
        setCopyStatus('error');
        setTimeout(() => setCopyStatus(null), 3000);
      });
  };

  // --- Timer formatting helper ---
  const formatSecondsDigits = (totalSecs: number) => {
    const seconds = totalSecs % 60;
    const totalMinutes = (totalSecs - seconds) / 60;
    const minutes = totalMinutes % 60;
    const hours = (totalMinutes - minutes) / 60;

    const pad = (num: number) => {
      const s = num.toString();
      return s.length === 1 ? '0' + s : s;
    };

    const hStr = pad(hours);
    const mStr = pad(minutes);
    const sStr = pad(seconds);

    return (
      <span>
        <span className="time hours">{hStr[0]}</span>
        <span className="time hours">{hStr[1]}</span>
        <span className="colon">:</span>
        <span className="time minutes">{mStr[0]}</span>
        <span className="time minutes">{mStr[1]}</span>
        <span className="colon">:</span>
        <span className="time seconds">{sStr[0]}</span>
        <span className="time seconds">{sStr[1]}</span>
      </span>
    );
  };

  // --- Tab Renders ---
  const renderTimersTab = () => {
    if (timer.isActive) {
      return (
        <div className="ActiveTimerDisplay">
          <div className="wrap">
            <div className="msg">
              {timer.mode === 'stop' && t.soundsWillStopIn}
              {timer.mode === 'fadeOut' && t.soundsWillFadeOut}
              {timer.mode === 'start' && t.soundsWillStartIn}
            </div>
            <div className="timeLeft">
              {formatSecondsDigits(timer.secondsLeft)}
            </div>
          </div>
          <div className="controls">
            <button className="interactive" onClick={handleCancelTimer}>
              {t.timerCancel}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="TimerInput">
        <div className="input">
          <div className="step1">
            <button
              className={timerInputMode === 'stop' ? 'selected' : 'deselected'}
              onClick={() => setTimerInputMode('stop')}
            >
              Stop Playback
            </button>
            <button
              className={timerInputMode === 'fadeOut' ? 'selected' : 'deselected'}
              onClick={() => setTimerInputMode('fadeOut')}
            >
              Fade Out
            </button>
          </div>
          <div className="step3">
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                min="0"
                max="23"
                value={timerInputHours}
                onChange={(e) => setTimerInputHours(Math.max(0, parseInt(e.target.value) || 0))}
              />
              {t.hours}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', marginLeft: '1rem' }}>
              <input
                type="number"
                min="0"
                max="59"
                value={timerInputMins}
                onChange={(e) => setTimerInputMins(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              />
              {t.minutes}
            </label>
          </div>
          <div className="step4">
            <button className="interactive" onClick={handleStartTimer}>
              {t.timerStart}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMixesTab = () => {
    return (
      <div className="MixInput">
        {/* Preset Mixes Section - Horizontal list at the top */}
        <div className="mixSection presetMixesSection" style={{ width: '100%', padding: '1rem 1.25rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', opacity: 0.7, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t.presetMixes}
          </h4>
          <div className="presetsHorizontalContainer">
            {PRESET_MIXES.map(preset => {
              const name = lang === 'km' ? preset.nameKm : preset.nameEn;
              return (
                <button
                  key={preset.id}
                  className="presetPill interactive"
                  type="button"
                  onClick={() => handleLoadMix(preset.sounds)}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSaveMix} className="save" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
          <input
            type="text"
            placeholder={t.mixNamePlaceholder}
            value={newMixName}
            onChange={(e) => setNewMixName(e.target.value)}
          />
          <button type="submit" className="interactive">{t.save}</button>
        </form>

        <div className="mixList">
          {/* User Saved Mixes Section */}
          <div className="mixSection myMixesSection">
            <h4 style={{ margin: '0 0 0.5rem 0', opacity: 0.7, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t.myMixes}
            </h4>
            {mixes.length === 0 ? (
              <div className="noMixMessage">{t.noMixes}</div>
            ) : (
              <ol>
                {mixes.map(mix => (
                  <li key={mix.id} className="MixInputItem">
                    <div className="wrap">
                      {mixDeletePendingId === mix.id ? (
                        <div className="deletePending">
                          <button
                            className="deleteCancel interactive"
                            type="button"
                            onClick={() => setMixDeletePendingId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="deleteConfirm interactive"
                            type="button"
                            onClick={() => handleDeleteMix(mix.id)}
                          >
                            Delete Mix
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            className="main interactive"
                            type="button"
                            onClick={() => handleLoadMix(mix.sounds)}
                          >
                            {mix.name}
                          </button>
                          <button
                            className="share interactive"
                            type="button"
                            onClick={() => {
                              // Load sounds then open share tab
                              handleLoadMix(mix.sounds);
                              setActiveTab('share');
                            }}
                          >
                            Share
                          </button>
                          <button
                            className="delete interactive"
                            type="button"
                            onClick={() => setMixDeletePendingId(mix.id)}
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderManageTab = () => {
    const active = activeKeys.map(k => sounds[k]);
    const inactiveKeys = SOUND_KEYS.filter(k => !activeKeys.includes(k));
    const available = inactiveKeys.map(k => sounds[k]);

    return (
      <div className="ManageSoundsInput">
        {limitWarning && (
          <div className="slotMessage noSelect">{t.limitMessage}</div>
        )}
        <div className="content">
          <div className="pane1">
            <div className="slots">
              <p>{t.activeSounds} ({active.length}/25)</p>
            </div>
            <div className="activeList">
              <ol>
                {active.map(sound => (
                  <li key={sound.key} className="SoundItem active">
                    <span className="label">{getSoundLabel(sound.key)}</span>
                    <div className="buttonContainer right">
                      <button onClick={() => deactivateSound(sound.key)}>
                        <div className="buttonInner">
                          <span className="buttonInnerContent" />
                        </div>
                      </button>
                    </div>
                  </li>
                ))}
                {Array.from({ length: Math.max(0, 25 - active.length) }).map((_, idx) => (
                  <li key={`empty-${idx}`} className="emptySlot">
                    <p>Free Slot</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="pane2">
            <div className="slots">
              <p>{t.availableSounds}</p>
            </div>
            <div className="inactiveList">
              <ol>
                {available.map(sound => (
                  <li key={sound.key} className="SoundItem">
                    <span className="label">{getSoundLabel(sound.key)}</span>
                    <div className="buttonContainer left">
                      <button onClick={() => activateSound(sound.key)}>
                        <div className="buttonInner">
                          <span className="buttonInnerContent" />
                        </div>
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="clearAllContainer" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="interactive" onClick={handleClearAllSounds}>
            {t.clearAll}
          </button>
          <button className="interactive" onClick={handleActivateAllSounds}>
            {t.addAll}
          </button>
        </div>
      </div>
    );
  };

  const renderShareTab = () => {
    const shareUrl = getShareUrl();
    const encodedUrl = encodeURIComponent(shareUrl);
    const twitterText = encodeURIComponent("Check out this ambient noise mix I made! @quietmindapp ");

    return (
      <div className="ShareInput">
        <div className="linkStuff">
          <div className="shareUrl">
            <a href={shareUrl} onClick={(e) => e.preventDefault()} style={{ wordBreak: 'break-all' }}>
              {shareUrl}
            </a>
          </div>
          <div className="options">
            <div className="clipboardContainer">
              <button className="clipboard interactive" onClick={handleCopyToClipboard}>
                {copyStatus === null && t.copy}
                {copyStatus === 'success' && t.copied}
                {copyStatus === 'error' && t.copyError}
              </button>
            </div>
          </div>
        </div>

        <div className="letsGetSocial">
          <h3>{t.shareTitle}</h3>
          <div className="links">
            <a
              className="fb"
              href={`http://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span />Facebook
            </a>
            <a
              className="tw"
              href={`http://twitter.com/intent/tweet?text=${twitterText}&url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span />Twitter
            </a>
            <a
              className="re"
              href={`http://www.reddit.com/submit?url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span />Reddit
            </a>
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsPanel = () => {
    if (!settingsOpen) return null;

    // Get list of currently active sounds (volume > 0.02)
    const activeSoundsList = Object.keys(sounds).filter(key => sounds[key].volume > 0.02);

    return (
      <div className="settingsBackdrop" onClick={() => setSettingsOpen(false)}>
        <div className="settingsPanel" onClick={(e) => e.stopPropagation()}>
          <div className="settingsHeader">
            <h2>⚙ {t.settings}</h2>
            <button className="closeBtn interactive" onClick={() => setSettingsOpen(false)}>×</button>
          </div>

          <div className="settingsContent">
            <div className="settingsSection">
              <h3>{t.meanderIntensity}</h3>
              <div className="intensityGroup">
                {(['gentle', 'medium', 'wild'] as MeanderIntensity[]).map(level => (
                  <button
                    key={level}
                    className={`intensityBtn interactive ${meander.intensity === level ? 'active' : ''}`}
                    onClick={() => setMeanderIntensity(level)}
                  >
                    {t[level]}
                  </button>
                ))}
              </div>
            </div>

            {meander.isActive && activeSoundsList.length > 0 && (
              <div className="settingsSection">
                <div className="sectionHeader">
                  <h3>{t.driftPattern}</h3>
                  <div className="bulkAction">
                    <select
                      className="bulkPatternSelect"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          setAllSoundPatterns(e.target.value as MeanderPattern);
                          e.target.value = "";
                        }
                      }}
                    >
                      <option value="" disabled>{t.applyToAll}</option>
                      <option value="sine">🌊 {t.sine}</option>
                      <option value="random">🎲 {t.random}</option>
                      <option value="pulse">💓 {t.pulse}</option>
                    </select>
                  </div>
                </div>

                <div className="patternsList">
                  {activeSoundsList.map(key => {
                    const currentPattern = meander.sounds?.[key]?.pattern || 'sine';
                    const isSoundDisabled = meander.sounds?.[key]?.disabled;

                    return (
                      <div key={key} className={`patternRow ${isSoundDisabled ? 'soundDisabled' : ''}`}>
                        <span className="soundLabel">{getSoundLabel(key)}</span>
                        <div className="rowControls">
                          <button
                            className={`rowMeanderToggle interactive ${isSoundDisabled ? 'disabled' : 'active'}`}
                            onClick={() => toggleMeanderForSound(key)}
                            title={isSoundDisabled ? 'Enable Meander' : 'Disable Meander'}
                          >
                            {isSoundDisabled ? '⏸' : '▶'}
                          </button>
                          <select
                            className="patternSelect"
                            value={currentPattern}
                            disabled={isSoundDisabled}
                            onChange={(e) => setSoundPattern(key, e.target.value as MeanderPattern)}
                          >
                            <option value="sine">🌊 {t.sine}</option>
                            <option value="random">🎲 {t.random}</option>
                            <option value="pulse">💓 {t.pulse}</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="App">
      {renderSettingsPanel()}

      {/* 25 Hidden SoundPlayers dynamically rendering audio loops */}
      {SOUND_KEYS.map(key => {
        const sound = sounds[key];
        // Load audio strictly when unmuted (volume > 0.02) to prevent continuous network requests when muted/off
        const shouldLoadAudio = sound.volume > 0.02;

        if (!shouldLoadAudio) return null;

        return (
          <SoundPlayer
            key={key}
            soundKey={key}
            volume={sound.volume}
            globalVolume={globalVolume}
            isPlaying={isPlaying}
            onLoaded={() => handleSoundLoaded(key)}
          />
        );
      })}

      <div className="Header">
        <div className="container">
          <div className="GlobalVolume">
            <div className="sliderContainer">
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={globalVolume}
                onChange={(e) => setGlobalVolume(parseFloat(e.target.value))}
              />
            </div>
            <button
              className="mute interactive"
              onClick={() => setGlobalVolume(prev => prev > 0 ? 0 : 0.5)}
            >
              {globalVolume > 0 ? t.mute : t.unmute}
            </button>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              className="langSelect"
              value={lang}
              onChange={(e) => {
                setLang(e.target.value);
                localStorage.setItem('quietmind_lang', e.target.value);
              }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <button
              className={`settingsBtn interactive ${settingsOpen ? 'active' : ''}`}
              onClick={() => setSettingsOpen(prev => !prev)}
              title={t.settings}
            >
              ⚙
            </button>
          </nav>
        </div>
      </div>

      <div className="home">
        <div className="Title noSelect">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <div className="PlayControls">
          <button
            className={`secondary meander interactive ${meander.isActive ? 'active' : 'inactive'}`}
            onClick={toggleMeander}
            title={t.meanderTitle}
          >
            <div className="buttonContents">
              <span className="image" />
            </div>
          </button>

          <button
            className={`pb ${isPlaying ? 'stop' : 'play'}`}
            onClick={() => setIsPlaying(prev => !prev)}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <div className="first" />
          </button>

          <button
            className={`secondary reset interactive ${stateToReset ? 'canRestore' : ''}`}
            onClick={handleReset}
            title={t.resetTitle}
          >
            <div className="buttonContents">
              <span className="image" />
            </div>
          </button>
        </div>

        {/* Row controls showing Timers, Mixes, Manage Sounds, Share */}
        <div className={`RowControls ${activeTab || ''}`}>
          <div className="container">
            <button
              onClick={() => toggleTab('timers')}
              className={`rowControl interactive timers ${activeTab === 'timers' ? 'expanded' : 'initial'} ${timer.isActive ? 'timeDisplay' : ''}`}
            >
              {timer.isActive ? formatSecondsDigits(timer.secondsLeft) : t.timers}
            </button>
            <button
              onClick={() => toggleTab('mixes')}
              className={`rowControl interactive mixes ${activeTab === 'mixes' ? 'expanded' : 'initial'}`}
            >
              {t.mixes}
            </button>
            <button
              onClick={() => toggleTab('manage')}
              className={`rowControl interactive sounds ${activeTab === 'manage' ? 'expanded' : 'initial'}`}
            >
              {t.sounds}
            </button>
            <button
              onClick={() => toggleTab('share')}
              className={`rowControl interactive share ${activeTab === 'share' ? 'expanded' : 'initial'}`}
            >
              {t.share}
            </button>
          </div>

          {activeTab && (
            <div className={`controlContent expanded ${activeTab}`}>
              <div className="inner">
                {activeTab === 'timers' && renderTimersTab()}
                {activeTab === 'mixes' && renderMixesTab()}
                {activeTab === 'manage' && renderManageTab()}
                {activeTab === 'share' && renderShareTab()}
              </div>
            </div>
          )}
        </div>

        {/* Sounds Grid */}
        <div className="SoundsGrid" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', margin: '2rem auto', maxWidth: '1000px' }}>
          {activeKeys.map(key => {
            const sound = sounds[key];
            const isLoaded = soundLoadedStatus[key] || false;
            const hasVolume = sound.volume > 0.02;

            return (
              <div key={key} className="SoundContainer">
                <div className="inner">
                  <button
                    onClick={() => handleToggleSoundActive(key)}
                    className={`imageContainer interactive ${key} pro`}
                  >
                    <div className={`loadingIndicator ${!isLoaded && hasVolume && isPlaying ? 'loadingGlue' : ''}`}>
                      <img src={spinner} height="32" width="30" alt="Loading icon" />
                    </div>
                    <div className={`image outline ${key}`} />
                    <div className={`image fill ${key}`} style={{ opacity: sound.volume }} />
                  </button>
                  <h3>
                    {getSoundLabel(sound.key)}
                    {isPlaying && hasVolume && meander.isActive && (
                      <button
                        className={`meanderIndicator ${meander.sounds?.[sound.key]?.disabled ? 'disabled' : 'active'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMeanderForSound(sound.key);
                        }}
                        title={meander.sounds?.[sound.key]?.disabled ? 'Enable meander for this sound / បើកការលម្អៀងសម្រាប់សំឡេងនេះ' : 'Disable meander for this sound / បិទការលម្អៀងសម្រាប់សំឡេងនេះ'}
                      />
                    )}
                  </h3>
                  <div className="sliderContainer" style={{ display: 'flex', width: '100%', padding: '0 0.5rem' }}>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.02"
                      value={sound.volume}
                      onChange={(e) => updateSoundVolume(key, parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Toggle between More Sounds / Show Less */}
        <div className="MoreSounds">
          {activeKeys.length < SOUND_KEYS.length ? (
            <button
              className="button interactive"
              onClick={() => {
                const remaining = SOUND_KEYS.filter(k => !activeKeys.includes(k));
                setActiveKeys(prev => [...prev, ...remaining]);
              }}
            >
              More Sounds
            </button>
          ) : (
            <button
              className="button interactive"
              onClick={() => setActiveKeys([...DEFAULT_ACTIVE_KEYS])}
            >
              Show Less
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
