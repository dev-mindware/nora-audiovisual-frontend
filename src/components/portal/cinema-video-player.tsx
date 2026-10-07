'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  PictureInPicture,
  Film,
  Download,
  Settings,
  ChevronRight,
  ChevronLeft,
  Lock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CinemaVideoPlayerProps {
  src: string;
  poster?: string | null;
  title?: string;
  filename?: string;
  downloadUrl?: string | null;
  aspectRatio?: string;
  qualityBadge?: string;
  canDownloadMaster?: boolean;
  onRequestMasterDownload?: () => void;
}

export function CinemaVideoPlayer({
  src,
  poster,
  title,
  filename,
  downloadUrl,
  aspectRatio = '16/9',
  qualityBadge,
  canDownloadMaster = false,
  onRequestMasterDownload,
}: CinemaVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timecode calculation (25 fps standard broadcast)
  const formatSMPTE = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00:00:00';
    const fps = 25;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const f = Math.floor((seconds % 1) * fps);
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f
      .toString()
      .padStart(2, '0')}`;
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const seekRelative = useCallback((deltaSeconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + deltaSeconds)
    );
  }, []);

  const stepFrame = useCallback((direction: 1 | -1) => {
    if (!videoRef.current) return;
    const frameDuration = 1 / 25; // 25 fps
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + direction * frameDuration)
    );
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      // Browser does not support PiP or permission denied
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          togglePlay();
          break;
        case 'j':
        case 'J':
          e.preventDefault();
          seekRelative(-5);
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          seekRelative(5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepFrame(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepFrame(1);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePiP();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekRelative, stepFrame, toggleMute, toggleFullscreen, togglePiP]);

  // Sync video events
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (videoRef.current.buffered.length > 0) {
      setBufferedEnd(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  };

  const handleRateChange = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (bufferedEnd / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="group relative w-full overflow-hidden rounded-2xl border border-border/80 bg-black shadow-2xl select-none"
      style={{ aspectRatio }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        playsInline
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="h-full w-full object-contain cursor-pointer"
      />

      {/* Broadcast SMPTE Timecode Badge & Quality HUD (Top-Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-black/75 px-3 py-1.5 backdrop-blur-md border border-white/10 font-mono text-xs text-white shadow-lg">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-zinc-400 font-medium">TC (25fps)</span>
          <span className="font-semibold tracking-wider text-amber-400">{formatSMPTE(currentTime)}</span>
          <span className="text-zinc-500">/</span>
          <span className="text-zinc-400">{formatSMPTE(duration)}</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg bg-black/75 px-2.5 py-1.5 backdrop-blur-md border border-white/10 text-xs font-semibold text-amber-300 shadow-lg">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>{qualityBadge || '720p Proxy (Modo de Aprovação)'}</span>
        </div>
      </div>

      {/* Top-Right Info & Master Download / Protection Badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {canDownloadMaster ? (
          onRequestMasterDownload ? (
            <button
              type="button"
              onClick={onRequestMasterDownload}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 backdrop-blur-md border border-emerald-400/30 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-lg cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Descarregar Master</span>
            </button>
          ) : downloadUrl ? (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              download={filename || 'master.mp4'}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 backdrop-blur-md text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-lg"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Descarregar Master</span>
            </a>
          ) : null
        ) : (
          <div
            className="flex items-center gap-1.5 rounded-lg bg-black/80 px-3 py-1.5 backdrop-blur-md border border-amber-500/30 text-xs font-medium text-amber-300 shadow-lg cursor-help"
            title="O master original em alta resolução (1080p/4K) será liberado após a validação final e liquidação."
          >
            <Lock className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Master Protegido</span>
          </div>
        )}
      </div>

      {/* Center Big Play Button (When Paused) */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black/25 backdrop-blur-[1px] transition-all"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-2xl transition hover:scale-110 active:scale-95">
            <Play className="h-8 w-8 ml-1 fill-current" />
          </div>
        </div>
      )}

      {/* Floating Control Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubbing Bar */}
        <div
          onClick={handleSeek}
          className="group/scrub relative mb-3 h-2 w-full cursor-pointer rounded-full bg-white/20 transition-all hover:h-3"
        >
          {/* Buffer Progress */}
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-white/30"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Playback Progress */}
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-primary relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-md opacity-0 group-hover/scrub:opacity-100 transition" />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Left Controls: Play, Step, Seek, Volume */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white"
              title="Play/Pause (Espaço ou K)"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => stepFrame(-1)}
              className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10 hidden sm:flex"
              title="Voltar 1 frame (Seta Esquerda)"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => seekRelative(-5)}
              className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10"
              title="Retroceder 5s (J)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => seekRelative(5)}
              className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10"
              title="Avançar 5s (L)"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => stepFrame(1)}
              className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10 hidden sm:flex"
              title="Avançar 1 frame (Seta Direita)"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1.5 ml-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white"
                title="Mudo (M)"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-red-400" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (videoRef.current) {
                    videoRef.current.volume = val;
                    videoRef.current.muted = val === 0;
                    setIsMuted(val === 0);
                  }
                }}
                className="w-16 sm:w-20 accent-primary h-1.5 cursor-pointer bg-white/20 rounded-lg"
              />
            </div>
          </div>

          {/* Right Controls: Speed, PiP, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Speed Selector */}
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="h-8 px-2 text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-md"
              >
                {playbackRate}x
              </Button>

              {showSpeedMenu && (
                <div className="absolute bottom-10 right-0 z-40 w-24 rounded-xl border border-white/10 bg-zinc-900/95 p-1 backdrop-blur-md shadow-2xl text-center">
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleRateChange(rate)}
                      className={`w-full rounded-lg px-2 py-1 text-xs font-medium transition ${
                        playbackRate === rate
                          ? 'bg-primary text-primary-foreground'
                          : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={togglePiP}
              className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10 hidden sm:flex"
              title="Picture in Picture (P)"
            >
              <PictureInPicture className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
