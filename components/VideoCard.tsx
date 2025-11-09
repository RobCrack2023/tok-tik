'use client';

import { useState, useRef, useEffect } from 'react';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ArrowUpTrayIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Video } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Comments from './Comments';

interface VideoCardProps {
  video: Video;
  onUpdate?: () => void;
}

export default function VideoCard({ video, onUpdate }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(video.isLiked || false);
  const [likesCount, setLikesCount] = useState(video._count?.likes || 0);
  const [commentsCount, setCommentsCount] = useState(video._count?.comments || 0);
  const [liking, setLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [videoWatchTime, setVideoWatchTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated } = useAuth();

  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          await videoRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.log('No se pudo reproducir el video:', error);
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleLike = async () => {
    if (!isAuthenticated || liking) return;

    setLiking(true);
    const previousState = isLiked;
    const previousCount = likesCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await fetch(`/api/videos/${video.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al dar like');
      }

      const data = await response.json();
      setLikesCount(data.likesCount);
    } catch (error) {
      // Revert on error
      setIsLiked(previousState);
      setLikesCount(previousCount);
    } finally {
      setLiking(false);
    }
  };

  // Timer para usuarios anónimos (5 segundos de preview)
  useEffect(() => {
    if (!isAuthenticated && isPlaying) {
      watchTimerRef.current = setInterval(() => {
        setVideoWatchTime((prev) => {
          if (prev >= 5) {
            // Pausar video y mostrar prompt de login después de 5 segundos
            if (videoRef.current) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
            setShowLoginPrompt(true);
            if (watchTimerRef.current) {
              clearInterval(watchTimerRef.current);
            }
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (watchTimerRef.current) {
        clearInterval(watchTimerRef.current);
      }
    };
  }, [isPlaying, isAuthenticated]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            // Resetear timer al entrar en vista
            setVideoWatchTime(0);
            setShowLoginPrompt(false);

            // Intentar reproducir el video con manejo de errores
            try {
              if (videoRef.current) {
                await videoRef.current.play();
                setIsPlaying(true);
              }
            } catch (error) {
              console.log('Autoplay fue bloqueado por el navegador:', error);
              setIsPlaying(false);
            }
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
            // Limpiar timer al salir de vista
            if (watchTimerRef.current) {
              clearInterval(watchTimerRef.current);
            }
          }
        });
      },
      { threshold: 0.7 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
      if (watchTimerRef.current) {
        clearInterval(watchTimerRef.current);
      }
    };
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="relative h-screen snap-start flex items-center justify-center bg-black">
      {/* Video de fondo */}
      <div className="relative w-full h-full lg:max-w-md bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        {video.videoUrl ? (
          <>
            {/* Video real */}
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="w-full h-full object-cover lg:object-contain"
              loop
              playsInline
              muted
              onClick={togglePlay}
            />

            {/* Controles de reproducción */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors"
              >
                <PlayIcon className="w-16 h-16 text-white" />
              </button>
            )}

            {/* Control de volumen */}
            <button
              onClick={toggleMute}
              className="absolute bottom-6 left-4 z-10 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="w-6 h-6 text-white" />
              ) : (
                <SpeakerWaveIcon className="w-6 h-6 text-white" />
              )}
            </button>
          </>
        ) : (
          /* Placeholder cuando no hay video */
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <PlayIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">Video no disponible</p>
              <p className="text-gray-600 text-sm mt-2">El video podría estar procesándose</p>
            </div>
          </div>
        )}
      </div>

      {/* Información del video */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 pb-20 sm:pb-6 bg-gradient-to-t from-black via-black/80 to-transparent lg:max-w-md">
        <div className="w-full pr-16 sm:pr-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            {video.user?.avatar ? (
              <img
                src={video.user.avatar}
                alt={video.user.username}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-tok-tik-pink to-tok-tik-cyan flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                {video.user?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <Link href={`/profile/${video.user?.id}`} className="font-semibold hover:underline text-sm sm:text-base truncate">
              @{video.user?.username}
            </Link>
            {isAuthenticated && (
              <button className="hidden sm:block px-4 py-1 border border-white rounded-md text-sm font-semibold hover:bg-white hover:text-black transition-colors flex-shrink-0">
                Seguir
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2">{video.caption || 'Sin descripción'}</p>
          <p className="text-xs text-gray-400">{formatNumber(video.views)} vistas</p>
        </div>
      </div>

      {/* Acciones laterales */}
      <div className="absolute right-2 sm:right-4 bottom-24 sm:bottom-28 flex flex-col gap-4 sm:gap-6">
        {/* Like */}
        <button
          onClick={toggleLike}
          disabled={!isAuthenticated || liking}
          className="flex flex-col items-center disabled:opacity-50"
          title={!isAuthenticated ? 'Inicia sesión para dar like' : ''}
        >
          {isLiked ? (
            <HeartIconSolid className="w-7 h-7 sm:w-8 sm:h-8 text-tok-tik-pink drop-shadow-lg" />
          ) : (
            <HeartIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white hover:scale-110 transition-transform drop-shadow-lg" />
          )}
          <span className="text-xs mt-1 drop-shadow-lg font-semibold">{formatNumber(likesCount)}</span>
        </button>

        {/* Comentarios */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex flex-col items-center"
        >
          <ChatBubbleOvalLeftIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white hover:scale-110 transition-transform drop-shadow-lg" />
          <span className="text-xs mt-1 drop-shadow-lg font-semibold">{formatNumber(commentsCount)}</span>
        </button>

        {/* Compartir */}
        <button className="flex flex-col items-center">
          <ArrowUpTrayIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white hover:scale-110 transition-transform drop-shadow-lg" />
          <span className="text-xs mt-1 drop-shadow-lg font-semibold">Compartir</span>
        </button>

        {/* Avatar giratorio */}
        <Link href={`/profile/${video.user?.id}`}>
          {video.user?.avatar ? (
            <img
              src={video.user.avatar}
              alt={video.user.username}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white animate-spin-slow shadow-lg"
            />
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-tok-tik-pink to-tok-tik-cyan p-0.5 animate-spin-slow shadow-lg">
              <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold">
                {video.user?.username?.[0]?.toUpperCase() || '?'}
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Comments Panel */}
      <Comments
        videoId={video.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />

      {/* Login Prompt Modal for Anonymous Users */}
      {showLoginPrompt && !isAuthenticated && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 max-w-sm w-full mx-4 shadow-2xl border border-gray-800">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 text-center">
              ¡Regístrate para continuar!
            </h3>
            <p className="text-gray-400 text-center mb-6 text-sm sm:text-base">
              Crea una cuenta gratis para ver videos completos, dar likes y subir tu propio contenido
            </p>
            <div className="space-y-3">
              <Link
                href="/register"
                className="block w-full bg-tok-tik-pink hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
              >
                Registrarse Gratis
              </Link>
              <Link
                href="/login"
                className="block w-full border border-gray-600 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
              >
                Ya tengo cuenta
              </Link>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  setVideoWatchTime(0);
                }}
                className="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors"
              >
                Ver otro video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
