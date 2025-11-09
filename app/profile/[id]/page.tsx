'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/types';
import Link from 'next/link';
import { ArrowLeftIcon, PlayIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface ProfilePageProps {
  params: { id: string };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchUserVideos();
  }, [params.id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`);
      if (!response.ok) throw new Error('Usuario no encontrado');
      const data = await response.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVideos = async () => {
    try {
      const response = await fetch(`/api/videos?userId=${params.id}&limit=50`);
      if (!response.ok) throw new Error('Error al cargar videos');
      const data = await response.json();
      setVideos(data.videos);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-tok-tik-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Perfil no encontrado'}</p>
          <Link href="/" className="text-tok-tik-pink hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = isAuthenticated && (currentUser as any)?.id === params.id;

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este video?')) {
      return;
    }

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar video');
      }

      // Actualizar la lista de videos
      setVideos(videos.filter(v => v.id !== videoId));
      alert('Video eliminado correctamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el video');
    }
  };

  const handleTogglePublish = async (videoId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Error al cambiar estado');
      }

      // Actualizar la lista de videos
      setVideos(videos.map(v =>
        v.id === videoId ? { ...v, isPublic: !currentStatus } : v
      ));

      alert(currentStatus ? 'Video despublicado' : 'Video publicado');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cambiar el estado del video');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeftIcon className="w-5 h-5" />
            Volver
          </Link>
        </div>
      </div>

      {/* Profile Info */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start gap-6 mb-8">
          {/* Avatar */}
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-tok-tik-pink to-tok-tik-cyan flex items-center justify-center text-4xl font-bold">
              {profile.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold">@{profile.username}</h1>
              {profile.verified && (
                <span className="bg-tok-tik-cyan text-black text-xs font-bold px-2 py-1 rounded">
                  VERIFICADO
                </span>
              )}
            </div>

            {profile.name && (
              <p className="text-xl text-gray-300 mb-4">{profile.name}</p>
            )}

            {/* Stats */}
            <div className="flex gap-8 mb-6">
              <div>
                <p className="text-2xl font-bold">{profile._count?.videos || 0}</p>
                <p className="text-gray-400 text-sm">Videos</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profile._count?.followers || 0}</p>
                <p className="text-gray-400 text-sm">Seguidores</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profile._count?.following || 0}</p>
                <p className="text-gray-400 text-sm">Siguiendo</p>
              </div>
            </div>

            {profile.bio && (
              <p className="text-gray-300 mb-6">{profile.bio}</p>
            )}

            {/* Actions */}
            {isOwnProfile ? (
              <Link
                href="/settings"
                className="inline-block px-6 py-2 border border-gray-600 rounded-lg hover:bg-gray-900 transition-colors"
              >
                Editar Perfil
              </Link>
            ) : isAuthenticated && (
              <button className="px-8 py-2 bg-tok-tik-pink hover:bg-pink-600 rounded-lg font-semibold transition-colors">
                Seguir
              </button>
            )}
          </div>
        </div>

        {/* Videos Grid */}
        <div>
          <h2 className="text-xl font-bold mb-4">Videos</h2>
          {videos.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {videos.map((video) => (
                <div key={video.id} className="relative aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden group">
                  <Link
                    href={`/?video=${video.id}`}
                    className="block w-full h-full hover:opacity-80 transition-opacity"
                  >
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.caption}
                        className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayIcon className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <p className="text-xs text-white truncate">
                        {video.caption || 'Sin título'}
                      </p>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs flex items-center gap-1">
                      {formatNumber(video._count?.likes || 0)} ❤️
                    </div>

                    {/* Badge de estado - visible siempre */}
                    {isOwnProfile && (
                      <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-semibold ${
                        video.isPublic
                          ? 'bg-green-600'
                          : 'bg-yellow-600'
                      }`}>
                        {video.isPublic ? '✓ Publicado' : '◷ Borrador'}
                      </div>
                    )}
                  </Link>

                  {/* Botones de control - solo visible para el dueño */}
                  {isOwnProfile && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                      {/* Botón publicar/despublicar */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleTogglePublish(video.id, video.isPublic);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                        }}
                        className={`p-2 rounded-full touch-manipulation ${
                          video.isPublic
                            ? 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800'
                            : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                        }`}
                        title={video.isPublic ? 'Despublicar' : 'Publicar'}
                        aria-label={video.isPublic ? 'Despublicar video' : 'Publicar video'}
                      >
                        {video.isPublic ? (
                          <EyeSlashIcon className="w-4 h-4 text-white pointer-events-none" />
                        ) : (
                          <EyeIcon className="w-4 h-4 text-white pointer-events-none" />
                        )}
                      </button>

                      {/* Botón eliminar */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteVideo(video.id);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                        }}
                        className="bg-red-600 hover:bg-red-700 active:bg-red-800 p-2 rounded-full touch-manipulation"
                        title="Eliminar video"
                        aria-label="Eliminar video"
                      >
                        <TrashIcon className="w-4 h-4 text-white pointer-events-none" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {isOwnProfile ? 'Aún no has subido ningún video' : 'Este usuario no tiene videos'}
              </p>
              {isOwnProfile && (
                <Link
                  href="/upload"
                  className="inline-block mt-4 px-6 py-2 bg-tok-tik-pink hover:bg-pink-600 rounded-lg transition-colors"
                >
                  Subir tu primer video
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
