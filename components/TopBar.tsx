'use client';

import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface TopBarProps {
  activeTab: 'forYou' | 'following';
  setActiveTab: (tab: 'forYou' | 'following') => void;
}

export default function TopBar({ activeTab, setActiveTab }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 bg-black/95 backdrop-blur-md border-b border-gray-800">
      <div className="flex flex-col">
        {/* Fila superior: Logo y búsqueda */}
        <div className="flex items-center justify-between px-4 py-2 lg:py-3">
          {/* Logo */}
          <h1 className="text-xl sm:text-2xl lg:hidden font-bold bg-gradient-to-r from-tok-tik-pink to-tok-tik-cyan bg-clip-text text-transparent">
            Tok-Tik
          </h1>

          {/* Tabs Desktop */}
          <div className="hidden lg:flex items-center gap-8">
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
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center bg-gray-900 rounded-full px-3 sm:px-4 py-2">
              <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-transparent text-white outline-none w-32 sm:w-64 text-sm"
              />
            </div>
            <button className="md:hidden p-2">
              <MagnifyingGlassIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs móvil */}
        <div className="flex lg:hidden items-center justify-center gap-8 px-4 pb-2 border-t border-gray-800/50">
          <button
            onClick={() => setActiveTab('forYou')}
            className={`text-sm sm:text-base font-semibold py-2 transition-all ${
              activeTab === 'forYou'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400'
            }`}
          >
            Para ti
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`text-sm sm:text-base font-semibold py-2 transition-all ${
              activeTab === 'following'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400'
            }`}
          >
            Siguiendo
          </button>
        </div>
      </div>
    </header>
  );
}
