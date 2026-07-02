import React, { useState, useEffect } from 'react';
import { 
  Sound, 
  Mix, 
  TimerState, 
  MeanderState, 
  SOUND_KEYS, 
  SOUND_LABELS, 
  SOUND_SHORTCODES, 
  SOUND_SORT_KEYS,
  TimerMode
} from './types';
import { SoundPlayer } from './components/SoundPlayer';

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
    limitMessage: 'Please remove an active sound first (max 25 active sounds).'
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
    limitMessage: 'សូមដកសំឡេងកំពុងដំណើរការចេញសិន (អនុញ្ញាតត្រឹមតែ ២៥ សំឡេងប៉ុណ្ណោះ)។'
  }
};

const DEFAULT_ACTIVE_KEYS = [...SOUND_KEYS];

export const App: React.FC = () => {
  // --- Language / i18n State ---
  const [lang, setLang] = useState<'en' | 'km'>(() => {
    const stored = localStorage.getItem('asoftmurmur_lang');
    return (stored === 'km' ? 'km' : 'en');
  });

  const t = TRANSLATIONS[lang];

  // --- Active / Available Sounds Configuration ---
  const [activeKeys, setActiveKeys] = useState<string[]>(() => {
    const stored = localStorage.getItem('asoftmurmur_active_keys');
    return stored ? JSON.parse(stored) : DEFAULT_ACTIVE_KEYS;
  });

  // --- Audio State ---
  const [sounds, setSounds] = useState<Record<string, Sound>>(() => {
    const initial: Record<string, Sound> = {};
    SOUND_KEYS.forEach(key => {
      initial[key] = {
        key,
        label: SOUND_LABELS[key],
        shortcode: SOUND_SHORTCODES[key],
        volume: 0, // initially off
        sortKey: SOUND_SORT_KEYS[key]
      };
    });
    return initial;
  });

  const [globalVolume, setGlobalVolume] = useState<number>(() => {
    const stored = localStorage.getItem('asoftmurmur_global_volume');
    return stored ? parseFloat(stored) : 0.5;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [soundLoadedStatus, setSoundLoadedStatus] = useState<Record<string, boolean>>({});
  const [limitWarning, setLimitWarning] = useState<boolean>(false);

  // --- State to Reset / Restore previous mix ---
  const [stateToReset, setStateToReset] = useState<Record<string, number> | null>(null);

  // --- Meander State ---
  const [meander, setMeander] = useState<MeanderState>({
    isActive: false,
    sounds: null,
    tickCount: 0
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
    const stored = localStorage.getItem('asoftmurmur_saved_mixes');
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
    localStorage.setItem('asoftmurmur_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('asoftmurmur_active_keys', JSON.stringify(activeKeys));
  }, [activeKeys]);

  useEffect(() => {
    localStorage.setItem('asoftmurmur_global_volume', globalVolume.toString());
  }, [globalVolume]);

  useEffect(() => {
    localStorage.setItem('asoftmurmur_saved_mixes', JSON.stringify(mixes));
  }, [mixes]);

  // --- URL Search Params Parse (Share URL load) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mixCode = params.get('m');
    const autoplay = params.get('autoplay') === '1';

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

      if (autoplay) {
        setIsPlaying(true);
      }
    }
  }, []);

  // --- 1-Second Timer Tick (Handles Countdown & Meander volume drifts) ---
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // 1. Timer Tick
      if (timer.isActive) {
        if (timer.secondsLeft <= 1) {
          // Timer triggered
          setTimer(prev => ({ ...prev, isActive: false, secondsLeft: 0 }));
          
          if (timer.mode === 'stop' || timer.mode === 'fadeOut') {
            setIsPlaying(false);
          } else if (timer.mode === 'start') {
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
      if (meander.isActive) {
        setMeander(prevMeander => {
          const nextTick = prevMeander.tickCount + 1;
          let meanderSounds = prevMeander.sounds ? { ...prevMeander.sounds } : null;

          if (!meanderSounds) {
            meanderSounds = {};
            Object.keys(sounds).forEach(key => {
              meanderSounds![key] = {
                baseVolume: sounds[key].volume,
                tickOffset: 0,
                direction: Math.random() > 0.5 ? 'right' : 'left'
              };
            });
          }

          setSounds(prevSounds => {
            const nextSounds = { ...prevSounds };
            Object.keys(meanderSounds!).forEach(key => {
              const mState = meanderSounds![key];
              const baseVol = mState.baseVolume;
              if (baseVol <= 0.02) return; // ignore inactive sounds

              const offsetIndex = (nextTick - mState.tickOffset) % 60;
              if (offsetIndex === 0) {
                mState.direction = Math.random() > 0.5 ? 'right' : 'left';
              }

              const targetVol = mState.direction === 'right' 
                ? baseVol + (1 - baseVol) / 3 
                : baseVol / 1.5;

              const diff = Math.abs(baseVol - targetVol) / 30;
              const step = (offsetIndex > 30 ? 30 - (offsetIndex - 30) : offsetIndex) * diff;

              let nextVol = mState.direction === 'right' ? baseVol + step : baseVol - step;
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
  }, [isPlaying, timer.isActive, timer.secondsLeft, timer.mode, meander.isActive, sounds]);

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
      setMeander({ isActive: false, sounds: null, tickCount: 0 });
    } else {
      // Initialize meander state parameters
      const meanderSounds: Record<string, { baseVolume: number; tickOffset: number; direction: 'left' | 'right' }> = {};
      Object.keys(sounds).forEach(key => {
        meanderSounds[key] = {
          baseVolume: sounds[key].volume,
          tickOffset: 0,
          direction: Math.random() > 0.5 ? 'right' : 'left'
        };
      });
      setMeander({
        isActive: true,
        sounds: meanderSounds,
        tickCount: 0
      });
    }
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
        setMeander({ isActive: false, sounds: null, tickCount: 0 });
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
      .filter(k => sounds[k].volume > 0.02)
      .sort((a, b) => sounds[a].sortKey - sounds[b].sortKey);

    sortedActive.forEach(key => {
      const vol = Math.round(sounds[key].volume * 100);
      let volStr = vol.toString();
      if (volStr.length === 1) volStr = '0' + volStr;
      if (volStr === '100') volStr = '99';
      code += sounds[key].shortcode + volStr;
    });

    const url = new URL(window.location.origin + window.location.pathname);
    if (code) {
      url.searchParams.set('m', code);
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
        <form onSubmit={handleSaveMix} className="save">
          <input 
            type="text" 
            placeholder={t.mixNamePlaceholder} 
            value={newMixName}
            onChange={(e) => setNewMixName(e.target.value)}
          />
          <button type="submit" className="interactive">{t.save}</button>
        </form>

        <div className="mixList">
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
                    <span className="label">{sound.label}</span>
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
                    <span className="label">{sound.label}</span>
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
    const twitterText = encodeURIComponent("Check out this ambient noise mix I made! @asoftmurmur ");

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

  return (
    <div id="App">
      {/* 25 Hidden SoundPlayers dynamically rendering audio loops */}
      {SOUND_KEYS.map(key => {
        const sound = sounds[key];
        // Load audio if volume is non-zero, or it is in the active list
        const shouldLoadAudio = sound.volume > 0.02 || activeKeys.includes(key);

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
          <nav>
            <span style={{ paddingLeft: '1.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
              {t.title}
            </span>
            <button 
              className="updateButton active" 
              style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', textDecoration: 'none' }}
              onClick={() => setLang(prev => prev === 'en' ? 'km' : 'en')}
            >
              {lang === 'en' ? 'ភាសាខ្មែរ' : 'English'}
            </button>
          </nav>
          
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
        </div>
      </div>

      <div className="home">
        <div className="Title noSelect">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <div className="PlayControls">
          <button 
            className={`pb ${isPlaying ? 'stop' : 'play'}`}
            onClick={() => setIsPlaying(prev => !prev)}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <div className="first" />
          </button>

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
                      <img src="/assets/spinner.gif" height="32" width="30" alt="Loading icon" />
                    </div>
                    <div className={`image outline ${key}`} />
                    <div className={`image fill ${key}`} style={{ opacity: sound.volume }} />
                  </button>
                  <h3>
                    {sound.label}
                    {isPlaying && hasVolume && meander.isActive && (
                      <span className="meanderIndicator" />
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
      </div>
    </div>
  );
};
