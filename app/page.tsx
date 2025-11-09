'use client';

import { useState } from 'react';
import VideoFeed from '@/components/VideoFeed';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');

  return (
    <main className="flex h-screen overflow-hidden bg-black">
      {/* Sidebar izquierda - solo desktop */}
      <Sidebar />

      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col w-full">
        {/* Barra superior */}
        <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Feed de videos */}
        <VideoFeed activeTab={activeTab} />

        {/* Navegación inferior - solo móvil */}
        <BottomNav />
      </div>
    </main>
  );
}
