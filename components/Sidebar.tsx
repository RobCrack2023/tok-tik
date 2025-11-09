'use client';

import {
  HomeIcon,
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-black border-r border-gray-800 p-4">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-tok-tik-pink to-tok-tik-cyan bg-clip-text text-transparent">
          Tok-Tik
        </h1>
      </Link>

      {isAuthenticated ? (
        <>
          {/* Botón subir video */}
          <Link
            href="/upload"
            className="flex items-center gap-3 w-full bg-tok-tik-pink hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg mb-6 transition-colors"
          >
            <PlusCircleIcon className="w-6 h-6" />
            Subir Video
          </Link>

          {/* Menú de navegación */}
          <nav className="flex-1">
            <Link
              href="/"
              className="flex items-center gap-3 w-full py-3 px-4 rounded-lg mb-2 transition-colors bg-gray-800 text-white"
            >
              <HomeIcon className="w-6 h-6" />
              <span className="font-medium">Inicio</span>
            </Link>
          </nav>

          {/* Usuario info */}
          <div className="border-t border-gray-800 pt-4">
            <div className="flex items-center gap-3 mb-4 px-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tok-tik-pink to-tok-tik-cyan flex items-center justify-center text-sm font-bold">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  @{(user as any)?.username || 'usuario'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full py-3 px-4 text-gray-400 hover:bg-gray-900 hover:text-white rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Invitar a login */}
          <div className="flex-1 flex flex-col justify-center items-center text-center p-6">
            <p className="text-gray-400 mb-6">
              Inicia sesión para subir videos y dar likes
            </p>
            <Link
              href="/login"
              className="flex items-center gap-3 w-full bg-tok-tik-pink hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg mb-3 transition-colors justify-center"
            >
              <ArrowLeftOnRectangleIcon className="w-6 h-6" />
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-3 w-full border border-white hover:bg-white hover:text-black text-white font-semibold py-3 px-4 rounded-lg transition-colors justify-center"
            >
              Registrarse
            </Link>
          </div>
        </>
      )}
    </aside>
  );
}
