import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, name } = await request.json();

    // Validaciones
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, contraseña y nombre de usuario son requeridos' },
        { status: 400 }
      );
    }

    // Verificar límite de usuarios
    const userCount = await prisma.user.count();
    const maxUsers = parseInt(process.env.MAX_USERS || '30');

    if (userCount >= maxUsers) {
      return NextResponse.json(
        { error: `Se ha alcanzado el límite máximo de ${maxUsers} usuarios` },
        { status: 403 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email o nombre de usuario ya está en uso' },
        { status: 409 }
      );
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        name: name || username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        createdAt: true,
      }
    });

    return NextResponse.json(
      { message: 'Usuario creado exitosamente', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
