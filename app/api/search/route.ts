import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!q) {
      return NextResponse.json({
        videos: [],
        users: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    const session = await getServerSession(authOptions);

    let videos: any[] = [];
    let users: any[] = [];
    let totalVideos = 0;
    let totalUsers = 0;

    if (type === 'all' || type === 'videos') {
      const videoWhere = {
        isPublic: true,
        caption: { contains: q, mode: 'insensitive' as const },
      };

      [videos, totalVideos] = await Promise.all([
        prisma.video.findMany({
          where: videoWhere,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
                verified: true,
              },
            },
            _count: {
              select: { likes: true, comments: true },
            },
          },
          orderBy: { views: 'desc' },
          skip,
          take: limit,
        }),
        prisma.video.count({ where: videoWhere }),
      ]);

      if (session) {
        const currentUserId = (session.user as any).id;
        const likes = await prisma.like.findMany({
          where: { userId: currentUserId, videoId: { in: videos.map(v => v.id) } },
        });
        const likedIds = new Set(likes.map(l => l.videoId));
        videos = videos.map(v => ({ ...v, isLiked: likedIds.has(v.id) }));
      }
    }

    if (type === 'all' || type === 'users') {
      const userWhere = {
        OR: [
          { username: { contains: q, mode: 'insensitive' as const } },
          { name: { contains: q, mode: 'insensitive' as const } },
        ],
      };

      [users, totalUsers] = await Promise.all([
        prisma.user.findMany({
          where: userWhere,
          select: {
            id: true,
            username: true,
            name: true,
            bio: true,
            avatar: true,
            verified: true,
            _count: {
              select: { followers: true, following: true, videos: true },
            },
          },
          orderBy: { followers: { _count: 'desc' } },
          skip,
          take: limit,
        }),
        prisma.user.count({ where: userWhere }),
      ]);
    }

    const total = totalVideos + totalUsers;

    return NextResponse.json({
      videos,
      users,
      pagination: {
        page,
        limit,
        total,
        totalVideos,
        totalUsers,
        totalPages: Math.ceil(Math.max(totalVideos, totalUsers) / limit),
      },
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    return NextResponse.json({ error: 'Error al buscar' }, { status: 500 });
  }
}
