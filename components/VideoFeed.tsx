'use client';

import { useRef, useEffect, useState } from 'react';
import VideoCard from './VideoCard';
import { Video } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface VideoFeedProps {
  activeTab: 'forYou' | 'following';
}

export default function VideoFeed({ activeTab }: VideoFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchVideos();
  }, [activeTab]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const fetchVideos = async () => {
    setLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '20',
      });

      if (activeTab === 'following' && isAuthenticated) {
        queryParams.append('following', 'true');
      }

      const response = await fetch(`/api/videos?${queryParams}`);

      if (!response.ok) {
        throw new Error('Error al cargar videos');
      }

      const data = await response.json();
      setVideos(data.videos);
    } catch (err: any) {
      setError(err.message);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-tok-tik-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchVideos}
            className="px-6 py-2 bg-tok-tik-pink rounded-lg hover:bg-pink-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-scroll snap-y-mandatory no-scrollbar pb-16 lg:pb-0"
    >
      {videos.length > 0 ? (
        videos.map((video) => (
          <VideoCard key={video.id} video={video} onUpdate={fetchVideos} />
        ))
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center px-4">
            <p className="text-gray-400 text-lg sm:text-xl mb-2">
              {activeTab === 'following' ? 'No hay videos de tus seguidos' : 'No hay videos todavía'}
            </p>
            <p className="text-gray-500 text-sm sm:text-base">
              {activeTab === 'following'
                ? 'Sigue a otros usuarios para ver su contenido'
                : 'Sé el primero en subir un video'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
