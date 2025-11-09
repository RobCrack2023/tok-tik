'use client';

import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface TopBarProps {
  activeTab: 'forYou' | 'following';
  setActiveTab: (tab: 'forYou' | 'following') => void;
}

export default function TopBar({ activeTab, setActiveTab }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo móvil */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden">
            <Bars3Icon className="w-6 h-6 text-white" />
          </button>
          <h1 className="lg:hidden text-2xl font-bold bg-gradient-to-r from-tok-tik-pink to-tok-tik-cyan bg-clip-text text-transparent">
            Tok-Tik
          </h1>
        </div>

        {/* Tabs */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => setActiveTab('forYou')}
            className={`text-lg font-semibold pb-1 transition-all ${
              activeTab === 'forYou'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Para ti
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`text-lg font-semibold pb-1 transition-all ${
              activeTab === 'following'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Siguiendo
          </button>
        </div>

        {/* Búsqueda */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-gray-900 rounded-full px-4 py-2">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent text-white outline-none w-64"
            />
          </div>
          <button className="md:hidden">
            <MagnifyingGlassIcon className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
