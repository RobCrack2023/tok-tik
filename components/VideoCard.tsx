'use client';

import { useState, useRef, useEffect } from 'react';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ArrowUpTrayIcon,
  PlayIcon,
  PauseIcon
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
  const [isLiked, setIsLiked] = useState(video.isLiked || false);
  const [likesCount, setLikesCount] = useState(video._count?.likes || 0);
  const [commentsCount, setCommentsCount] = useState(video._count?.comments || 0);
  const [liking, setLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isAuthenticated } = useAuth();

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play();
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
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
      <div className="relative w-full max-w-md h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        {video.videoUrl ? (
          <>
            {/* Video real */}
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="w-full h-full object-contain"
              loop
              playsInline
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
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-3">
            {video.user?.avatar ? (
              <img
                src={video.user.avatar}
                alt={video.user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tok-tik-pink to-tok-tik-cyan flex items-center justify-center text-sm font-bold">
                {video.user?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <Link href={`/profile/${video.user?.id}`} className="font-semibold hover:underline">
              @{video.user?.username}
            </Link>
            {isAuthenticated && (
              <button className="px-4 py-1 border border-white rounded-md text-sm font-semibold hover:bg-white hover:text-black transition-colors">
                Seguir
              </button>
            )}
          </div>
          <p className="text-sm mb-2">{video.caption || 'Sin descripción'}</p>
          <p className="text-xs text-gray-400">{formatNumber(video.views)} vistas</p>
        </div>
      </div>

      {/* Acciones laterales */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-6">
        {/* Like */}
        <button
          onClick={toggleLike}
          disabled={!isAuthenticated || liking}
          className="flex flex-col items-center disabled:opacity-50"
          title={!isAuthenticated ? 'Inicia sesión para dar like' : ''}
        >
          {isLiked ? (
            <HeartIconSolid className="w-8 h-8 text-tok-tik-pink" />
          ) : (
            <HeartIcon className="w-8 h-8 text-white hover:scale-110 transition-transform" />
          )}
          <span className="text-xs mt-1">{formatNumber(likesCount)}</span>
        </button>

        {/* Comentarios */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex flex-col items-center"
        >
          <ChatBubbleOvalLeftIcon className="w-8 h-8 text-white hover:scale-110 transition-transform" />
          <span className="text-xs mt-1">{formatNumber(commentsCount)}</span>
        </button>

        {/* Compartir */}
        <button className="flex flex-col items-center">
          <ArrowUpTrayIcon className="w-8 h-8 text-white hover:scale-110 transition-transform" />
          <span className="text-xs mt-1">Compartir</span>
        </button>

        {/* Avatar giratorio */}
        <Link href={`/profile/${video.user?.id}`}>
          {video.user?.avatar ? (
            <img
              src={video.user.avatar}
              alt={video.user.username}
              className="w-12 h-12 rounded-full object-cover border-2 border-white animate-spin-slow"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tok-tik-pink to-tok-tik-cyan p-0.5 animate-spin-slow">
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
    </div>
  );
}
