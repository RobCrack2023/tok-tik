import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Seguir a un usuario
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

    const followerId = (session.user as any).id;
    const followingId = params.id;

    if (followerId === followingId) {
      return NextResponse.json(
        { error: 'No puedes seguirte a ti mismo' },
        { status: 400 }
      );
    }

    // Verificar si ya sigue
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        }
      }
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Ya sigues a este usuario' },
        { status: 409 }
      );
    }

    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      }
    });

    return NextResponse.json({ message: 'Siguiendo', follow });
  } catch (error) {
    console.error('Error al seguir usuario:', error);
    return NextResponse.json(
      { error: 'Error al seguir usuario' },
      { status: 500 }
    );
  }
}

// Dejar de seguir a un usuario
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

    const followerId = (session.user as any).id;
    const followingId = params.id;

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        }
      }
    });

    return NextResponse.json({ message: 'Dejaste de seguir' });
  } catch (error) {
    console.error('Error al dejar de seguir:', error);
    return NextResponse.json(
      { error: 'Error al dejar de seguir' },
      { status: 500 }
    );
  }
}
