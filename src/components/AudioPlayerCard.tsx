import { useEffect, useRef, useState } from 'react';

type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;
};

const PLAYLIST: Track[] = [
  {
    id: '1',
    title: 'Lofi Chill Refreshment',
    artist: 'Smart Vending Ambient',
    src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  },
  {
    id: '2',
    title: 'Morning Promo Rotation',
    artist: 'Kiosk Audio Fleet',
    src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73181.mp3?filename=chill-abstract-intention-12099.mp3',
  },
  {
    id: '3',
    title: 'Summer Breeze Funk',
    artist: 'Beverage Lounge',
    src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tropical-house-11394.mp3',
  },
];

type AudioPlayerCardProps = {
  machineState?: string;
};

export function AudioPlayerCard({ machineState = 'IDLE' }: AudioPlayerCardProps) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [userVolume, setUserVolume] = useState(70);
  const [effectiveVolume, setEffectiveVolume] = useState(70);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = PLAYLIST[trackIndex];

  // Handle state-based Audio Ducking / Auto Pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (machineState === 'DISPENSING' || machineState === 'MOTOR_STARTING') {
      // Pause audio during dispensing motor operations
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (machineState === 'PAYMENT_PENDING' || machineState === 'ITEM_SELECTED') {
      // Duck volume to 20% during payment
      const duckedVol = Math.round(userVolume * 0.2);
      setEffectiveVolume(duckedVol);
      audioRef.current.volume = duckedVol / 100;
    } else {
      // Restore normal user volume & resume playback if previously playing
      setEffectiveVolume(userVolume);
      audioRef.current.volume = userVolume / 100;
      if (!isPlaying && (machineState === 'SUCCESS' || machineState === 'IDLE')) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  }, [machineState, userVolume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    setTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    setProgress(0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setUserVolume(val);
    setEffectiveVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
    }
  };

  return (
    <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-md">
      <audio
        ref={audioRef}
        src={currentTrack.src}
        autoPlay
        loop
        onTimeUpdate={() => {
          if (audioRef.current && audioRef.current.duration) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        }}
      />

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/40">
          Smart Kiosk Audio Controller
        </span>
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600">
          {machineState === 'DISPENSING'
            ? 'Paused (Dispensing)'
            : machineState === 'PAYMENT_PENDING'
              ? 'Ducked (20%)'
              : isPlaying
                ? 'Playing'
                : 'Paused'}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold text-ink">{currentTrack.title}</h3>
          <p className="text-xs text-ink/60">{currentTrack.artist}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-mist text-ink/70 hover:bg-mist/80 transition-colors"
          >
            ⏮
          </button>
          <button
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white shadow-md hover:scale-105 transition-all"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={handleNext}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-mist text-ink/70 hover:bg-mist/80 transition-colors"
          >
            ⏭
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-mist">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Volume Slider */}
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-ink/60">
        <span className="shrink-0 font-medium">🔊 Vol: {effectiveVolume}%</span>
        <input
          type="range"
          min="0"
          max="100"
          value={userVolume}
          onChange={handleVolumeChange}
          className="h-1.5 w-full cursor-pointer accent-indigo-600"
        />
      </div>
    </section>
  );
}
