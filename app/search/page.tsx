'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleOvalLeftIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';

type Tab = 'all' | 'videos' | 'users';

interface VideoResult {
  id: string;
  caption: string | null;
  thumbnailUrl: string | null;
  views: number;
  isLiked?: boolean;
  user: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
    verified: boolean;
  };
  _count: { likes: number; comments: number };
}

interface UserResult {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatar: string | null;
  verified: boolean;
  _count: { followers: number; following: number; videos: number };
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [inputValue, setInputValue] = useState(initialQ);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string, tab: Tab) => {
    if (!q.trim()) {
      setVideos([]);
      setUsers([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${tab}`);
      const data = await res.json();
      setVideos(data.videos || []);
      setUsers(data.users || []);
    } catch {
      setVideos([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    setInputValue(q);
    doSearch(q, activeTab);
  }, [searchParams, doSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    doSearch(query, tab);
  };

  const showVideos = activeTab === 'all' || activeTab === 'videos';
  const showUsers = activeTab === 'all' || activeTab === 'users';
  const isEmpty = searched && !loading && videos.length === 0 && users.length === 0;

  return (
    <main className="flex h-screen overflow-hidden bg-black">
      <Sidebar />

      <div className="flex-1 flex flex-col w-full overflow-y-auto pb-20 lg:pb-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-md border-b border-gray-800 px-4 py-3">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="flex-1 flex items-center bg-gray-900 rounded-full px-4 py-2">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Buscar videos, usuarios..."
                className="bg-transparent text-white outline-none flex-1 text-sm"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-tok-tik-pink to-tok-tik-cyan rounded-full text-white text-sm font-semibold"
            >
              Buscar
            </button>
          </form>

          {/* Tabs */}
          {searched && (
            <div className="flex gap-6 mt-3">
              {(['all', 'videos', 'users'] as Tab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`text-sm font-semibold pb-1 transition-all ${
                    activeTab === tab
                      ? 'text-white border-b-2 border-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab === 'all' ? 'Todo' : tab === 'videos' ? 'Videos' : 'Usuarios'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-4 max-w-3xl mx-auto w-full">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-tok-tik-pink border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">
                No se encontraron resultados para{' '}
                <span className="text-white font-semibold">"{query}"</span>
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Intenta con otras palabras clave
              </p>
            </div>
          )}

          {/* Initial state */}
          {!searched && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-700 mb-4" />
              <p className="text-gray-500 text-lg">Busca videos y usuarios</p>
              <p className="text-gray-600 text-sm mt-1">
                Escribe algo en el campo de búsqueda
              </p>
            </div>
          )}

          {/* Users section */}
          {!loading && showUsers && users.length > 0 && (
            <div className="mb-8">
              {activeTab === 'all' && (
                <h2 className="text-white font-semibold text-base mb-3">Usuarios</h2>
              )}
              <div className="space-y-3">
                {users.map(user => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/60 hover:bg-gray-800 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tok-tik-pink to-tok-tik-cyan shrink-0 overflow-hidden">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.username}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-white font-semibold text-sm truncate">
                          @{user.username}
                        </span>
                        {user.verified && (
                          <CheckBadgeIcon className="w-4 h-4 text-tok-tik-cyan shrink-0" />
                        )}
                      </div>
                      {user.name && (
                        <p className="text-gray-400 text-xs truncate">{user.name}</p>
                      )}
                      {user.bio && (
                        <p className="text-gray-500 text-xs truncate mt-0.5">{user.bio}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-0.5">
                        {user._count.followers.toLocaleString()} seguidores ·{' '}
                        {user._count.videos} videos
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Videos section */}
          {!loading && showVideos && videos.length > 0 && (
            <div>
              {activeTab === 'all' && (
                <h2 className="text-white font-semibold text-base mb-3">Videos</h2>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {videos.map(video => (
                  <Link
                    key={video.id}
                    href={`/?video=${video.id}`}
                    className="group relative rounded-xl overflow-hidden bg-gray-900 aspect-[9/16]"
                  >
                    {/* Thumbnail */}
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.caption || 'Video'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      {video.caption && (
                        <p className="text-white text-xs line-clamp-2 mb-1">
                          {video.caption}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-xs truncate">@{video.user.username}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5 text-gray-400">
                          <EyeIcon className="w-3 h-3" />
                          <span className="text-xs">{video.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-gray-400">
                          <HeartIcon className="w-3 h-3" />
                          <span className="text-xs">{video._count.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-gray-400">
                          <ChatBubbleOvalLeftIcon className="w-3 h-3" />
                          <span className="text-xs">{video._count.comments.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="flex h-screen overflow-hidden bg-black items-center justify-center">
        <div className="w-8 h-8 border-2 border-tok-tik-pink border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <SearchContent />
    </Suspense>
  );
}
