'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ArrowUpTrayIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  if (isLoading) {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Inicia sesión para subir videos</h2>
          <p className="text-gray-400 mb-6">
            Necesitas tener una cuenta para compartir tu contenido
          </p>
          <Link
            href="/login"
            className="inline-block bg-tok-tik-pink hover:bg-pink-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('video/')) {
      setError('Por favor selecciona un archivo de video válido');
      return;
    }

    // Validar tamaño (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('El video no debe superar 50MB');
      return;
    }

    setVideoFile(file);
    setError('');

    // Crear preview
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      setError('Por favor selecciona un video');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // 1. Subir el archivo
      const formData = new FormData();
      formData.append('video', videoFile);

      const uploadResponse = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json();
        throw new Error(data.error || 'Error al subir video');
      }

      const { videoUrl } = await uploadResponse.json();
      setUploadProgress(50);

      // 2. Crear el video en la base de datos (no publicado por defecto)
      const createResponse = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          caption: caption.trim() || undefined,
          isPublic: false, // Por defecto no publicado
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Error al guardar video');
      }

      setUploadProgress(100);

      const videoData = await createResponse.json();

      // Redirigir al perfil para que pueda publicar el video
      setTimeout(() => {
        alert('Video subido como borrador. Ve a tu perfil para publicarlo.');
        router.push(`/profile/${(videoData as any).userId}`);
      }, 500);
    } catch (err: any) {
      setError(err.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-white mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Subir Video</h1>
          <p className="text-gray-400">Comparte tus momentos con la comunidad</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload area */}
          <div className="bg-gray-900 rounded-lg p-8 border-2 border-dashed border-gray-700">
            {!videoFile ? (
              <label className="flex flex-col items-center cursor-pointer">
                <VideoCameraIcon className="w-16 h-16 text-gray-500 mb-4" />
                <p className="text-gray-400 mb-2">Haz click para seleccionar un video</p>
                <p className="text-sm text-gray-500 mb-4">MP4, WebM u OGG (máx. 50MB)</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="bg-tok-tik-pink hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors">
                  Seleccionar Video
                </span>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {preview && (
                      <video
                        src={preview}
                        className="w-32 h-32 object-cover rounded-lg bg-black"
                        controls
                      />
                    )}
                    <div>
                      <p className="text-white font-medium">{videoFile.name}</p>
                      <p className="text-sm text-gray-400">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoFile(null);
                      setPreview(null);
                    }}
                    className="text-red-500 hover:text-red-400"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Escribe una descripción para tu video..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-tok-tik-pink transition-colors resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">{caption.length}/500 caracteres</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subiendo video...</span>
                <span className="text-white">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-tok-tik-pink h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!videoFile || uploading}
            className="w-full flex items-center justify-center gap-3 bg-tok-tik-pink hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpTrayIcon className="w-6 h-6" />
            {uploading ? 'Subiendo...' : 'Publicar Video'}
          </button>
        </form>
      </div>
    </div>
  );
}
