'use client';

import { useState } from 'react';
import VideoFeed from '@/components/VideoFeed';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');

  return (
    <main className="flex h-screen overflow-hidden bg-black">
      {/* Sidebar izquierda */}
      <Sidebar />

      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col">
        {/* Barra superior */}
        <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Feed de videos */}
        <VideoFeed activeTab={activeTab} />
      </div>
    </main>
  );
}
