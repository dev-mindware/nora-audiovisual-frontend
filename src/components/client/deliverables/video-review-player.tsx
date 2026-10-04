'use client';

import { useState, useRef } from 'react';
import { Button, Badge } from '@/components';
import { ReviewComment } from '@/types';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  MessageSquare,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface VideoReviewPlayerProps {
  videoUrl: string;
  comments: ReviewComment[];
  onAddComment: (timecodeSeconds: number, text: string) => void;
  onResolveComment?: (commentId: string) => void;
}

function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * 25); // 25 fps audiovisual standard
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(frames).padStart(2, '0')}`;
}

export function VideoReviewPlayer({
  videoUrl,
  comments,
  onAddComment,
  onResolveComment,
}: VideoReviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [commentText, setCommentText] = useState('');

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const seek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const jump = (delta: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
      seek(newTime);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(currentTime, commentText.trim());
    setCommentText('');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Player de Vídeo Principal */}
      <div className="flex flex-col rounded-2xl border border-border bg-black overflow-hidden lg:col-span-2 shadow-lg">
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            className="h-full w-full object-contain"
          />

          {/* Timecode HUD Overlay */}
          <div className="absolute top-3 left-3 rounded-lg bg-black/70 px-2.5 py-1 font-mono text-xs font-semibold text-white tracking-widest backdrop-blur-md">
            TC: {formatTimecode(currentTime)}
          </div>
        </div>

        {/* Controlos de Transporte de Reprodução */}
        <div className="flex flex-col gap-2 bg-muted/80 p-4 text-foreground">
          {/* Timeline Scrubber */}
          <div className="relative w-full">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.04}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />

            {/* Marcadores de comentários na timeline */}
            {comments.map((c) => {
              const leftPercent = duration > 0 ? (c.timecodeSeconds / duration) * 100 : 0;
              return (
                <button
                  key={c.id}
                  onClick={() => seek(c.timecodeSeconds)}
                  title={`${c.timecodeFormatted}: ${c.content}`}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-primary border border-white hover:scale-125 transition-transform"
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => jump(-1)}
                className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                title="Retroceder 1s"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={togglePlay}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-9 p-0 rounded-xl"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-primary-foreground" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => jump(1)}
                className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                title="Avançar 1s"
              >
                <RotateCw className="h-4 w-4" />
              </Button>

              <span className="font-mono text-xs text-muted-foreground ml-2">
                {formatTimecode(currentTime)} / {formatTimecode(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">25.00 FPS • Pro Res Proxy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Painel Lateral: Anotações com Timecode */}
      <div className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-xs h-full max-h-[500px]">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Anotações do Copião</h3>
          </div>
          <Badge variant="outline" className="text-xs border-border text-muted-foreground">
            {comments.length} notas
          </Badge>
        </div>

        {/* Lista de Comentários */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
              <Clock className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <span>Sem notas registradas neste copião.</span>
              <span>Pausar o vídeo e introduzir feedback no timecode.</span>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                onClick={() => seek(comment.timecodeSeconds)}
                className="cursor-pointer rounded-xl border border-border bg-muted/40 p-3 text-xs transition-all hover:border-primary/40 hover:bg-card"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {comment.timecodeFormatted}
                    </span>
                    <span className="font-semibold text-foreground">{comment.authorName}</span>
                  </div>
                  {comment.resolved && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3 w-3" /> Resolvido
                    </span>
                  )}
                </div>

                <p className="text-foreground leading-relaxed">{comment.content}</p>

                {!comment.resolved && onResolveComment && (
                  <div className="flex justify-end pt-2 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolveComment(comment.id);
                      }}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-emerald-600 transition-colors"
                    >
                      Marcar como corrigido
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Formulário de Adição de Comentário */}
        <form onSubmit={handleSubmitComment} className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Nota no timecode:</span>
            <span className="font-mono font-semibold text-primary">
              {formatTimecode(currentTime)}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Corrigir reflexo na lente neste frame..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            />
            <Button
              type="submit"
              size="sm"
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Comentar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
