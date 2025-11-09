'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales inválidas');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-tok-tik-pink to-tok-tik-cyan bg-clip-text text-transparent mb-2">
            Tok-Tik
          </h1>
          <p className="text-gray-400">Inicia sesión para continuar</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-tok-tik-pink transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-tok-tik-pink transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-tok-tik-pink to-pink-600 hover:from-pink-600 hover:to-tok-tik-pink text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          {/* Usuarios de prueba */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
            <p className="text-sm text-gray-400 mb-2 font-medium">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>usuario1@toktik.com / password123</p>
              <p>usuario2@toktik.com / password123</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-tok-tik-pink hover:text-pink-400 font-semibold">
                Regístrate
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
