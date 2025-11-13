'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [isAuthenticated, isLoading, user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${(user as any).id}`);
      if (!response.ok) throw new Error('Error al cargar perfil');

      const data = await response.json();
      setFormData({
        name: data.name || '',
        bio: data.bio || '',
        avatar: data.avatar || '',
      });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error al cargar el perfil' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);

    try {
      const response = await fetch(`/api/users/${(user as any).id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar perfil');
      }

      const updatedUser = await response.json();
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });

      // Redirigir al perfil después de 1 segundo
      setTimeout(() => {
        router.push(`/profile/${(user as any).id}`);
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error al actualizar el perfil. Por favor intenta de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-tok-tik-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href={`/profile/${(user as any)?.id}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver al perfil
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Editar Perfil</h1>

        {/* Preview Avatar */}
        <div className="flex justify-center mb-8">
          {formData.avatar ? (
            <img
              src={formData.avatar}
              alt="Avatar preview"
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-tok-tik-pink to-tok-tik-cyan flex items-center justify-center text-4xl font-bold">
              {(user as any)?.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Nombre de usuario
            </label>
            <input
              type="text"
              value={`@${(user as any)?.username}`}
              disabled
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">El nombre de usuario no se puede cambiar</p>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ingresa tu nombre completo"
              maxLength={50}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-tok-tik-pink focus:outline-none transition-colors"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-2">
              Biografía
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Cuéntale a los demás sobre ti"
              maxLength={200}
              rows={4}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-tok-tik-pink focus:outline-none transition-colors resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length}/200 caracteres
            </p>
          </div>

          {/* Avatar URL */}
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-400 mb-2">
              <PhotoIcon className="w-5 h-5 inline mr-2" />
              URL de avatar
            </label>
            <input
              type="url"
              id="avatar"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="https://ejemplo.com/mi-foto.jpg"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-tok-tik-pink focus:outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingresa la URL de tu foto de perfil
            </p>
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`px-4 py-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/10 border border-green-500 text-green-500'
                  : 'bg-red-500/10 border border-red-500 text-red-500'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-tok-tik-pink hover:bg-pink-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </span>
              ) : (
                'Guardar Cambios'
              )}
            </button>
            <Link
              href={`/profile/${(user as any)?.id}`}
              className="px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-900 transition-colors text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
