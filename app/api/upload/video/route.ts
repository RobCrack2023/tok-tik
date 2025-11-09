import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún video' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedTypes.includes(videoFile.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se permiten videos MP4, WebM, OGG' },
        { status: 400 }
      );
    }

    // Validar tamaño (50MB)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '52428800');
    if (videoFile.size > maxSize) {
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Máximo ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Directory already exists
    }

    // Generar nombre único
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(videoFile.name);
    const filename = `${timestamp}-${random}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Guardar archivo
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const videoUrl = `/uploads/${filename}`;

    return NextResponse.json({
      videoUrl,
      thumbnailUrl: null,
      size: videoFile.size,
      originalFilename: videoFile.name,
    });
  } catch (error) {
    console.error('Error al subir video:', error);
    return NextResponse.json(
      { error: 'Error al subir video' },
      { status: 500 }
    );
  }
}
