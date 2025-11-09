# Tok-Tik

Una aplicación de videos cortos inspirada en TikTok, diseñada para máximo 30 usuarios con un frontend moderno y backend completo.

## Características

### Frontend
- **Feed de Videos Infinito**: Scroll vertical con snap para navegar entre videos
- **Interfaz Moderna**: Diseño responsive similar a TikTok con Tailwind CSS
- **Interacciones**: Sistema de likes, comentarios y compartir
- **Navegación Intuitiva**: Sidebar con menú principal y tabs "Para ti" / "Siguiendo"
- **Auto-play Inteligente**: Los videos se reproducen automáticamente al entrar en vista
- **Diseño Responsive**: Optimizado para móvil, tablet y desktop

### Backend
- **Autenticación**: Sistema completo con NextAuth.js
- **Base de Datos**: Prisma ORM con PostgreSQL
- **API REST**: Endpoints completos para usuarios, videos, comentarios y likes
- **Upload de Videos**: Sistema de subida de archivos con validación (hasta 100MB)
- **Relaciones Sociales**: Sistema de seguimiento entre usuarios
- **Límite de Usuarios**: Configurado para máximo 30 usuarios
- **Preview Anónimo**: Los usuarios no registrados pueden ver 5 segundos de cada video

## Tecnologías

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático para mayor seguridad
- **Tailwind CSS** - Estilos utility-first
- **Heroicons** - Iconos SVG de alta calidad

### Backend
- **Prisma** - ORM moderno y type-safe
- **NextAuth.js** - Autenticación completa
- **PostgreSQL** - Base de datos relacional (producción)
- **bcryptjs** - Encriptación de contraseñas
- **Next.js API Routes** - Endpoints RESTful

## Estructura del Proyecto

```
tok-tik/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Autenticación
│   │   ├── users/        # Endpoints de usuarios
│   │   ├── videos/       # Endpoints de videos
│   │   ├── comments/     # Endpoints de comentarios
│   │   └── upload/       # Upload de archivos
│   ├── generated/        # Prisma Client
│   ├── globals.css       # Estilos globales
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Página de inicio
├── components/
│   ├── Sidebar.tsx       # Barra lateral de navegación
│   ├── TopBar.tsx        # Barra superior con tabs
│   ├── VideoFeed.tsx     # Feed de videos
│   └── VideoCard.tsx     # Tarjeta individual de video
├── lib/
│   ├── prisma.ts         # Cliente de Prisma
│   ├── auth.ts           # Configuración de NextAuth
│   └── upload.ts         # Utilidades de upload
├── prisma/
│   ├── schema.prisma     # Schema de base de datos
│   ├── seed.ts           # Datos de prueba
│   └── migrations/       # Migraciones
├── types/
│   └── index.ts          # Tipos TypeScript
└── public/
    └── uploads/          # Videos subidos
```

## Instalación y Configuración

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:

**Para Desarrollo (SQLite):**
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tok-tik-super-secret-key-change-in-production"
MAX_USERS=30
MAX_FILE_SIZE=104857600
```

**Para Producción (PostgreSQL):**
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/toktik?schema=public"
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="genera-un-string-aleatorio-seguro-con-openssl"
MAX_USERS=30
MAX_FILE_SIZE=104857600
NODE_ENV=production
```

> **Nota**: Para generar `NEXTAUTH_SECRET` usa: `openssl rand -base64 32`

### 3. Configurar Base de Datos

**Para Desarrollo (SQLite):**
```bash
# Generar cliente de Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate dev

# Poblar con datos de prueba
npm run db:seed
```

**Para Producción (PostgreSQL):**
```bash
# 1. Instalar PostgreSQL (si no está instalado)
# Ubuntu/Debian: sudo apt install postgresql postgresql-contrib
# macOS: brew install postgresql

# 2. Crear base de datos y usuario
sudo -u postgres psql
CREATE DATABASE toktik;
CREATE USER toktik_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE toktik TO toktik_user;
\q

# 3. Actualizar schema.prisma para PostgreSQL
# Cambiar: provider = "sqlite"
# Por: provider = "postgresql"

# 4. Generar cliente y migrar
npx prisma generate
npx prisma migrate deploy

# 5. (Opcional) Poblar con datos de prueba
npm run db:seed
```

### 4. Iniciar Servidor
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm start` - Iniciar en producción
- `npm run lint` - Ejecutar linter
- `npm run db:push` - Push schema a BD
- `npm run db:migrate` - Crear migración
- `npm run db:seed` - Poblar BD con datos de prueba
- `npm run db:studio` - Abrir Prisma Studio

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/signin` - Iniciar sesión
- `POST /api/auth/signout` - Cerrar sesión

### Usuarios
- `GET /api/users/:id` - Obtener perfil de usuario
- `PATCH /api/users/:id` - Actualizar perfil
- `POST /api/users/:id/follow` - Seguir usuario
- `DELETE /api/users/:id/follow` - Dejar de seguir

### Videos
- `GET /api/videos` - Listar videos (feed)
- `GET /api/videos?following=true` - Videos de usuarios seguidos
- `GET /api/videos/:id` - Obtener video específico
- `POST /api/videos` - Crear video (metadata)
- `PATCH /api/videos/:id` - Actualizar video
- `DELETE /api/videos/:id` - Eliminar video
- `POST /api/videos/:id/like` - Dar like
- `DELETE /api/videos/:id/like` - Quitar like

### Comentarios
- `GET /api/videos/:id/comments` - Listar comentarios
- `POST /api/videos/:id/comments` - Crear comentario
- `DELETE /api/comments/:id` - Eliminar comentario

### Upload
- `POST /api/upload/video` - Subir video

## Usuarios de Prueba

Después de ejecutar `npm run db:seed`, tendrás 5 usuarios:

| Email | Usuario | Password |
|-------|---------|----------|
| usuario1@toktik.com | usuario1 | password123 |
| usuario2@toktik.com | usuario2 | password123 |
| usuario3@toktik.com | usuario3 | password123 |
| usuario4@toktik.com | usuario4 | password123 |
| usuario5@toktik.com | usuario5 | password123 |

## Estado del Proyecto

### Completado ✅

- [x] **Sistema de autenticación completo** - Login y registro funcionando
- [x] **Backend con API REST** - Todos los endpoints implementados
- [x] **Base de datos con Prisma** - PostgreSQL en producción, SQLite en desarrollo
- [x] **Feed de videos** - Integrado con API real
- [x] **Sistema de likes** - Funcional con optimistic updates
- [x] **Upload de videos** - UI completa para subir videos (hasta 100MB)
- [x] **Perfiles de usuario** - Página de perfil con videos del usuario
- [x] **Diseño responsive completo** - Optimizado para móvil, tablet y desktop
- [x] **Navegación móvil** - Bottom navigation bar estilo TikTok
- [x] **Preview para usuarios anónimos** - 5 segundos de vista previa + modal de registro
- [x] **Sidebar con autenticación** - Login/logout funcional

### Próximas Características

- [ ] Sistema de comentarios en tiempo real
- [ ] Búsqueda de videos y usuarios
- [ ] Sistema de seguimiento funcional (botón "Seguir")
- [ ] Trending/Tendencias
- [ ] Notificaciones en tiempo real
- [ ] Mensajería entre usuarios
- [ ] Compartir videos en redes sociales
- [ ] Analytics de videos (vistas, engagement)
- [ ] Edición de perfil de usuario
- [ ] Videos recomendados con IA

## Configuración

La aplicación corre por defecto en `http://localhost:3000`

## Base de Datos

### Gestión de la Base de Datos

**Prisma Studio** - Interfaz visual para explorar y editar datos:
```bash
npm run db:studio
```
Esto abrirá Prisma Studio en `http://localhost:5555`

**PostgreSQL** - Conexión directa:
```bash
# Conectar a PostgreSQL
psql -U toktik_user -d toktik

# Backup de la base de datos
pg_dump -U toktik_user toktik > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U toktik_user toktik < backup_20231109.sql
```

### Migraciones

```bash
# Crear nueva migración
npm run db:migrate

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear base de datos (⚠️ CUIDADO: elimina todos los datos)
npx prisma migrate reset
```

## Despliegue en Producción

Para desplegar en producción con Ubuntu/Nginx/PM2, consulta la [Guía de Producción](PRODUCCION.md) completa.

**Resumen rápido:**
```bash
# 1. Instalar dependencias del sistema
sudo apt install nodejs nginx postgresql pm2

# 2. Configurar PostgreSQL
sudo -u postgres psql
CREATE DATABASE toktik;
CREATE USER toktik_user WITH PASSWORD 'password_seguro';
GRANT ALL PRIVILEGES ON DATABASE toktik TO toktik_user;

# 3. Clonar y configurar
git clone https://github.com/tu-usuario/tok-tik.git
cd tok-tik
npm install
# Configurar .env con datos de producción

# 4. Migrar base de datos
npx prisma generate
npx prisma migrate deploy

# 5. Build y deploy
npm run build
pm2 start npm --name "toktik" -- start
pm2 save
pm2 startup

# 6. Configurar Nginx y SSL
# Ver PRODUCCION.md para configuración completa
```

**Actualizar en producción:**
```bash
git pull origin main
npm install
npm run build
pm2 restart toktik
```

## Colores de Marca

- **Tok-Tik Pink**: #FE2C55
- **Tok-Tik Cyan**: #00F2EA
- **Tok-Tik Black**: #000000

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría realizar.

## Soporte

Si encuentras algún problema o tienes preguntas:
- Revisa la [Guía Rápida](GUIA_RAPIDA.md)
- Consulta la [Documentación de API](API.md)
- Revisa la [Guía de Producción](PRODUCCION.md)
