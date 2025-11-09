'use client';

import {
  HomeIcon,
  PlusCircleIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-black border-t border-gray-800 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Inicio */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center flex-1 py-2"
        >
          {pathname === '/' ? (
            <HomeIconSolid className="w-7 h-7 text-white" />
          ) : (
            <HomeIcon className="w-7 h-7 text-gray-400" />
          )}
          <span className={`text-xs mt-1 ${pathname === '/' ? 'text-white font-semibold' : 'text-gray-400'}`}>
            Inicio
          </span>
        </Link>

        {/* Subir (solo si está autenticado) */}
        {isAuthenticated ? (
          <Link
            href="/upload"
            className="flex flex-col items-center justify-center flex-1 py-2"
          >
            <div className="bg-gradient-to-r from-tok-tik-pink to-tok-tik-cyan p-2 rounded-lg">
              <PlusCircleIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs mt-1 text-gray-400">Subir</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center justify-center flex-1 py-2"
          >
            <div className="bg-gradient-to-r from-tok-tik-pink to-tok-tik-cyan p-2 rounded-lg">
              <PlusCircleIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs mt-1 text-gray-400">Subir</span>
          </Link>
        )}

        {/* Perfil o Login */}
        {isAuthenticated ? (
          <Link
            href={`/profile/${(user as any)?.id}`}
            className="flex flex-col items-center justify-center flex-1 py-2"
          >
            {pathname?.startsWith('/profile') ? (
              <UserCircleIconSolid className="w-7 h-7 text-white" />
            ) : (
              <UserCircleIcon className="w-7 h-7 text-gray-400" />
            )}
            <span className={`text-xs mt-1 ${pathname?.startsWith('/profile') ? 'text-white font-semibold' : 'text-gray-400'}`}>
              Perfil
            </span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center justify-center flex-1 py-2"
          >
            <ArrowRightOnRectangleIcon className="w-7 h-7 text-gray-400" />
            <span className="text-xs mt-1 text-gray-400">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
