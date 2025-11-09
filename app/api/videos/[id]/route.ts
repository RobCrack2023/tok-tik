import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Obtener video específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video no encontrado' },
        { status: 404 }
      );
    }

    // Incrementar vistas
    await prisma.video.update({
      where: { id: params.id },
      data: { views: { increment: 1 } }
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error al obtener video:', error);
    return NextResponse.json(
      { error: 'Error al obtener video' },
      { status: 500 }
    );
  }
}

// Actualizar video
export async function PATCH(
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

    const video = await prisma.video.findUnique({
      where: { id: params.id }
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video no encontrado' },
        { status: 404 }
      );
    }

    if (video.userId !== (session.user as any).id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { caption, isPublic } = await request.json();

    const updatedVideo = await prisma.video.update({
      where: { id: params.id },
      data: {
        ...(caption !== undefined && { caption }),
        ...(isPublic !== undefined && { isPublic }),
      }
    });

    return NextResponse.json(updatedVideo);
  } catch (error) {
    console.error('Error al actualizar video:', error);
    return NextResponse.json(
      { error: 'Error al actualizar video' },
      { status: 500 }
    );
  }
}

// Eliminar video
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

    const video = await prisma.video.findUnique({
      where: { id: params.id }
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video no encontrado' },
        { status: 404 }
      );
    }

    if (video.userId !== (session.user as any).id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    await prisma.video.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Video eliminado' });
  } catch (error) {
    console.error('Error al eliminar video:', error);
    return NextResponse.json(
      { error: 'Error al eliminar video' },
      { status: 500 }
    );
  }
}
