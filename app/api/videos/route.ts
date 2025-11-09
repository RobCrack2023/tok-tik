import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Listar videos (feed)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');
    const following = searchParams.get('following') === 'true';

    const session = await getServerSession(authOptions);
    const skip = (page - 1) * limit;

    let whereClause: any = { isPublic: true };

    // Si se solicita feed de siguiendo
    if (following && session) {
      const currentUserId = (session.user as any).id;
      const followingUsers = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true }
      });

      whereClause = {
        userId: {
          in: followingUsers.map(f => f.followingId)
        },
        isPublic: true,
      };
    }

    // Si se filtran por usuario
    if (userId) {
      // Si es el propio usuario autenticado, mostrar todos sus videos
      // Si no, solo mostrar videos públicos
      const isOwnProfile = session && (session.user as any).id === userId;
      whereClause = {
        userId,
        ...(isOwnProfile ? {} : { isPublic: true })
      };
    }

    const videos = await prisma.video.findMany({
      where: whereClause,
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
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Si hay sesión, verificar qué videos ha dado like el usuario
    let videosWithLikeStatus = videos;
    if (session) {
      const currentUserId = (session.user as any).id;
      const likes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          videoId: { in: videos.map(v => v.id) }
        }
      });

      const likedVideoIds = new Set(likes.map(l => l.videoId));

      videosWithLikeStatus = videos.map(video => ({
        ...video,
        isLiked: likedVideoIds.has(video.id),
      }));
    }

    const total = await prisma.video.count({ where: whereClause });

    return NextResponse.json({
      videos: videosWithLikeStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Error al obtener videos:', error);
    return NextResponse.json(
      { error: 'Error al obtener videos' },
      { status: 500 }
    );
  }
}

// Crear video (metadata)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { caption, videoUrl, thumbnailUrl, duration } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'URL del video es requerida' },
        { status: 400 }
      );
    }

    const video = await prisma.video.create({
      data: {
        userId: (session.user as any).id,
        caption,
        videoUrl,
        thumbnailUrl,
        duration,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          }
        }
      }
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error('Error al crear video:', error);
    return NextResponse.json(
      { error: 'Error al crear video' },
      { status: 500 }
    );
  }
}
