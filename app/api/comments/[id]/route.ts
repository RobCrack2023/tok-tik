import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Eliminar comentario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      include: { video: true }
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comentario no encontrado' },
        { status: 404 }
      );
    }

    const userId = (session.user as any).id;

    // Solo el autor del comentario o del video pueden eliminar el comentario
    if (comment.userId !== userId && comment.video.userId !== userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Comentario eliminado' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar comentario' },
      { status: 500 }
    );
  }
}
