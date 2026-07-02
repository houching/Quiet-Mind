import React, { useEffect, useRef, useState } from 'react';

interface SoundPlayerProps {
  soundKey: string;
  volume: number;
  globalVolume: number;
  isPlaying: boolean;
  onLoaded: () => void;
}

export const SoundPlayer: React.FC<SoundPlayerProps> = ({
  soundKey,
  volume,
  globalVolume,
  isPlaying,
  onLoaded
}) => {
  const mainRef = useRef<HTMLAudioElement | null>(null);
  const glueRef = useRef<HTMLAudioElement | null>(null);

  const [glueDuration, setGlueDuration] = useState<number>(10);
  const [canBeginPlay, setCanBeginPlay] = useState<boolean>(false);

  const glueShouldPlayRef = useRef<boolean>(false);
  const haveDoneHandleCanBeginPlayRef = useRef<boolean>(false);

  const getAudioSrc = (key: string, type: 'main' | 'glue') => {
    return `/assets/p/content/${key}/${type}-${key}.mp4`;
  };


  const calculatedVolume = volume * globalVolume;

  // Handle volume changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.volume = calculatedVolume;
    }
    if (glueRef.current) {
      glueRef.current.volume = calculatedVolume;
    }
  }, [calculatedVolume]);

  // Handle Play/Stop transitions
  useEffect(() => {
    if (!isPlaying) {
      if (mainRef.current) mainRef.current.pause();
      if (glueRef.current) glueRef.current.pause();
      return;
    }

    if (canBeginPlay && calculatedVolume > 0.02) {
      // If playing is toggled on, start with glue or main
      if (glueRef.current && mainRef.current) {
        if (glueShouldPlayRef.current) {
          glueRef.current.play().catch(() => {});
        } else {
          mainRef.current.play().catch(() => {});
        }
      }
    }
  }, [isPlaying, canBeginPlay, calculatedVolume]);

  const playMain = () => {
    if (glueShouldPlayRef.current && mainRef.current && mainRef.current.paused && glueRef.current) {
      glueShouldPlayRef.current = false;
      glueRef.current.currentTime = 0;
      try {
        mainRef.current.currentTime = 5; // A Soft Murmur skips first 5s to loop smoothly
      } catch (err) {}
    }
    if (calculatedVolume > 0.02 && isPlaying && mainRef.current) {
      mainRef.current.volume = calculatedVolume;
      mainRef.current.play().catch(() => {});
    }
  };

  const playGlue = () => {
    if (calculatedVolume > 0.02 && isPlaying && glueRef.current) {
      glueRef.current.volume = calculatedVolume;
      if (glueShouldPlayRef.current) {
        glueRef.current.play().catch(() => {});
      }
    }
  };

  const handleCanPlayThrough = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    if (!haveDoneHandleCanBeginPlayRef.current) {
      haveDoneHandleCanBeginPlayRef.current = true;
      setCanBeginPlay(true);
      onLoaded();

      const duration = (e.target as HTMLAudioElement).duration;
      if (duration) {
        setGlueDuration(duration);
      }

      if (isPlaying && calculatedVolume > 0.02 && glueRef.current) {
        glueRef.current.volume = calculatedVolume;
        glueRef.current.play().catch(() => {});
      }
    }
  };

  const handleGlueTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const target = e.target as HTMLAudioElement;
    const duration = target.duration;
    if (target.currentTime > duration / 2) {
      playMain();
      glueShouldPlayRef.current = false;
    }
  };

  const handleMainTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const target = e.target as HTMLAudioElement;
    const duration = target.duration;
    const currentTime = target.currentTime;

    if (!glueShouldPlayRef.current && currentTime > duration - glueDuration / 2) {
      if (glueRef.current) {
        glueRef.current.currentTime = 0;
      }
      glueShouldPlayRef.current = true;
      playGlue();
    }
  };

  return (
    <div className="SoundPlayer" style={{ display: 'none' }}>
      <audio
        ref={mainRef}
        src={getAudioSrc(soundKey, 'main')}
        preload="auto"
        loop
        onTimeUpdate={handleMainTimeUpdate}
      />
      <audio
        ref={glueRef}
        src={getAudioSrc(soundKey, 'glue')}
        preload="auto"
        onCanPlayThrough={handleCanPlayThrough}
        onTimeUpdate={handleGlueTimeUpdate}
      />
    </div>
  );
};
