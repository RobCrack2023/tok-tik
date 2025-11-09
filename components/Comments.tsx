'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PaperAirplaneIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Comment } from '@/types';

interface CommentsProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Comments({ videoId, isOpen, onClose }: CommentsProps) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, videoId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/videos/${videoId}/comments?limit=50`);
      if (!response.ok) throw new Error('Error al cargar comentarios');
      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment.trim() }),
      });

      if (!response.ok) throw new Error('Error al publicar comentario');

      const comment = await response.json();
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al publicar comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('¿Eliminar este comentario?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar comentario');
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar comentario');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Ahora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return commentDate.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md max-h-[60vh] flex flex-col z-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold">{comments.length} Comentarios</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-tok-tik-pink border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {/* Avatar */}
              {comment.user?.avatar ? (
                <img
                  src={comment.user.avatar}
                  alt={comment.user.username}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tok-tik-pink to-tok-tik-cyan flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">
                    {comment.user?.username?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">@{comment.user?.username}</span>
                  <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-200">{comment.text}</p>
              </div>

              {/* Delete button - only for own comments */}
              {isAuthenticated && (user as any)?.id === comment.userId && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No hay comentarios todavía</p>
            <p className="text-sm mt-2">Sé el primero en comentar</p>
          </div>
        )}
      </div>

      {/* Input - only if authenticated */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Agrega un comentario..."
              maxLength={500}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-tok-tik-pink transition-colors"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="bg-tok-tik-pink hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-2 transition-colors"
            >
              <PaperAirplaneIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t border-gray-800 text-center text-gray-400 text-sm">
          Inicia sesión para comentar
        </div>
      )}
    </div>
  );
}
