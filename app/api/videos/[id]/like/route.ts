import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Dar like a un video
export async function POST(
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

    const userId = (session.user as any).id;
    const videoId = params.id;

    // Verificar si ya dio like
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        }
      }
    });

    if (existingLike) {
      return NextResponse.json(
        { error: 'Ya diste like a este video' },
        { status: 409 }
      );
    }

    const like = await prisma.like.create({
      data: {
        userId,
        videoId,
      }
    });

    // Obtener conteo actualizado de likes
    const likesCount = await prisma.like.count({
      where: { videoId }
    });

    return NextResponse.json({ like, likesCount });
  } catch (error) {
    console.error('Error al dar like:', error);
    return NextResponse.json(
      { error: 'Error al dar like' },
      { status: 500 }
    );
  }
}

// Quitar like de un video
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

    const userId = (session.user as any).id;
    const videoId = params.id;

    await prisma.like.delete({
      where: {
        userId_videoId: {
          userId,
          videoId,
        }
      }
    });

    // Obtener conteo actualizado de likes
    const likesCount = await prisma.like.count({
      where: { videoId }
    });

    return NextResponse.json({ message: 'Like eliminado', likesCount });
  } catch (error) {
    console.error('Error al quitar like:', error);
    return NextResponse.json(
      { error: 'Error al quitar like' },
      { status: 500 }
    );
  }
}
