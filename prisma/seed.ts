import { PrismaClient } from '../app/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // Crear usuarios de prueba
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
      where: { email: `usuario${i}@toktik.com` },
      update: {},
      create: {
        email: `usuario${i}@toktik.com`,
        username: `usuario${i}`,
        password: hashedPassword,
        name: `Usuario ${i}`,
        bio: `¡Hola! Soy el usuario ${i} en Tok-Tik`,
        verified: i === 1,
      },
    });

    users.push(user);
    console.log(`Usuario creado: ${user.username}`);
  }

  // Crear algunos follows
  const follows = [
    { followerId: users[0].id, followingId: users[1].id },
    { followerId: users[0].id, followingId: users[2].id },
    { followerId: users[1].id, followingId: users[0].id },
    { followerId: users[2].id, followingId: users[0].id },
  ];

  for (const follow of follows) {
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: follow.followerId,
          followingId: follow.followingId,
        },
      },
      update: {},
      create: follow,
    });
  }

  console.log('Relaciones de seguimiento creadas');

  console.log('Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
