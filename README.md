# Tok-Tik

Una aplicación de videos cortos inspirada en TikTok, diseñada para máximo 30 usuarios con un frontend moderno y backend completo.

## Características

### Frontend
- **Feed de Videos Infinito**: Scroll vertical con snap para navegar entre videos
- **Interfaz Moderna**: Diseño responsive similar a TikTok con Tailwind CSS
- **Interacciones**: Sistema de likes, comentarios y compartir
- **Búsqueda**: Búsqueda de videos y usuarios en tiempo real
- **Navegación Intuitiva**: Sidebar en desktop y Bottom Navigation en móvil
- **Auto-play Inteligente**: Los videos se reproducen automáticamente al entrar en vista
- **Reproducción Rápida**: Long-press para reproducir a 2x velocidad
- **Control de Volumen**: Botón de mute integrado en los controles del video
- **Diseño Responsive**: Optimizado para móvil, tablet y desktop

### Backend
- **Autenticación**: Sistema completo con NextAuth.js
- **Base de Datos**: Prisma ORM con PostgreSQL
- **API REST**: Endpoints completos para usuarios, videos, comentarios, likes y búsqueda
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
- **PostgreSQL** - Base de datos relacional
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
│   │   ├── search/       # Búsqueda de videos y usuarios
│   │   └── upload/       # Upload de archivos
│   ├── login/            # Página de login
│   ├── register/         # Página de registro
│   ├── profile/[id]/     # Perfil de usuario
│   ├── search/           # Página de búsqueda
│   ├── settings/         # Edición de perfil
│   ├── upload/           # Página de subida de videos
│   ├── globals.css       # Estilos globales
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Página de inicio (feed)
├── components/
│   ├── BottomNav.tsx     # Navegación inferior (móvil)
│   ├── Comments.tsx      # Panel de comentarios
│   ├── Providers.tsx     # Providers de sesión
│   ├── Sidebar.tsx       # Barra lateral (desktop)
│   ├── TopBar.tsx        # Barra superior con tabs y búsqueda
│   ├── VideoCard.tsx     # Tarjeta individual de video
│   └── VideoFeed.tsx     # Feed de videos
├── lib/
│   ├── prisma.ts         # Cliente de Prisma
│   ├── auth.ts           # Configuración de NextAuth
│   └── upload.ts         # Utilidades de upload
├── prisma/
│   ├── schema.prisma     # Schema de base de datos
│   └── seed.ts           # Datos de prueba
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

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/toktik?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-string-aleatorio-seguro-con-openssl"
MAX_USERS=30
MAX_FILE_SIZE=104857600
```

> **Nota**: Para generar `NEXTAUTH_SECRET` usa: `openssl rand -base64 32`

### 3. Configurar Base de Datos PostgreSQL

```bash
# 1. Crear base de datos y usuario en PostgreSQL
sudo -u postgres psql
CREATE DATABASE toktik;
CREATE USER toktik_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE toktik TO toktik_user;
\q

# 2. Generar cliente de Prisma y aplicar schema
npx prisma generate
npx prisma db push

# 3. (Opcional) Poblar con datos de prueba
npm run db:seed
```

Para más detalles sobre la migración, consulta la [Guía de Migración a PostgreSQL](MIGRACION_POSTGRESQL.md).

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

### Búsqueda
- `GET /api/search?q=término` - Buscar videos y usuarios

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
- [x] **Base de datos con Prisma** - PostgreSQL
- [x] **Feed de videos** - Integrado con API real
- [x] **Sistema de likes** - Funcional con optimistic updates
- [x] **Sistema de comentarios** - Con moderación (eliminar comentarios propios)
- [x] **Upload de videos** - UI completa para subir videos (hasta 100MB)
- [x] **Perfiles de usuario** - Página de perfil con videos del usuario
- [x] **Edición de perfil** - Página de configuración para editar nombre, bio y avatar
- [x] **Búsqueda** - Búsqueda de videos y usuarios en tiempo real
- [x] **Reproducción rápida** - Long-press para velocidad 2x
- [x] **Control de mute** - Botón de mute en los controles del video
- [x] **Diseño responsive completo** - Optimizado para móvil, tablet y desktop
- [x] **Navegación móvil** - Bottom navigation bar estilo TikTok
- [x] **Preview para usuarios anónimos** - 5 segundos de vista previa + modal de registro
- [x] **Sidebar con autenticación** - Login/logout funcional

### Próximas Características

- [ ] Notificaciones en tiempo real
- [ ] Mensajería entre usuarios
- [ ] Compartir videos en redes sociales
- [ ] Analytics de videos (vistas, engagement)
- [ ] Videos recomendados con IA
- [ ] Trending/Tendencias

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
psql -U toktik_user toktik < backup.sql
```

### Migraciones

```bash
# Push directo del schema (desarrollo)
npm run db:push

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
sudo apt install nodejs nginx postgresql

# 2. Configurar PostgreSQL
sudo -u postgres psql
CREATE DATABASE toktik;
CREATE USER toktik_user WITH PASSWORD 'password_seguro';
GRANT ALL PRIVILEGES ON DATABASE toktik TO toktik_user;

# 3. Clonar y configurar
git clone https://github.com/RobCrack2023/tok-tik.git
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

- **Tok-Tik Pink**: `#FE2C55`
- **Tok-Tik Cyan**: `#00F2EA`
- **Tok-Tik Black**: `#000000`

## Documentación Adicional

- [Guía Rápida](GUIA_RAPIDA.md) - Primeros pasos
- [Documentación de API](API.md) - Referencia completa de endpoints
- [Guía de Producción](PRODUCCION.md) - Deploy con Nginx y PM2
- [Migración a PostgreSQL](MIGRACION_POSTGRESQL.md) - Guía de migración de SQLite a PostgreSQL

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría realizar.
