# 🚀 Guía Rápida - Tok-Tik

## ¡Bienvenido a Tok-Tik!

Esta guía te ayudará a empezar a usar tu aplicación de videos en minutos.

## 📋 Requisitos Previos

- Node.js v20+ instalado ✅
- Navegador web moderno
- Editor de código (opcional)

## 🎬 Inicio Rápido

### 1. La aplicación ya está corriendo

El servidor de desarrollo está activo en:
**http://localhost:3000**

### 2. Inicia Sesión

Puedes usar cualquiera de estos usuarios de prueba:

```
Email: usuario1@toktik.com
Password: password123

Email: usuario2@toktik.com
Password: password123
```

### 3. ¿Qué puedes hacer?

#### Como Usuario No Autenticado:
- ✅ Ver el feed de videos
- ✅ Explorar perfiles
- ❌ Dar likes (requiere login)
- ❌ Subir videos (requiere login)
- ❌ Comentar (requiere login)

#### Como Usuario Autenticado:
- ✅ Ver feed personalizado
- ✅ Subir tus propios videos
- ✅ Dar likes a videos
- ✅ Ver y editar tu perfil
- ✅ Seguir a otros usuarios (próximamente)
- ✅ Comentar videos (próximamente)

## 📱 Páginas Disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Feed principal de videos |
| `/login` | Iniciar sesión |
| `/register` | Crear nueva cuenta |
| `/upload` | Subir un nuevo video (requiere login) |
| `/profile/[id]` | Ver perfil de usuario |

## 🎥 Cómo Subir Tu Primer Video

1. **Inicia sesión** con tu cuenta
2. Haz click en **"Subir Video"** en el sidebar
3. **Selecciona un video** desde tu computadora
   - Formatos: MP4, WebM, OGG
   - Tamaño máximo: 50MB
4. **Agrega una descripción** (opcional)
5. Haz click en **"Publicar Video"**
6. ¡Listo! Tu video aparecerá en el feed

## 🛠️ Comandos Útiles

```bash
# Ver la base de datos visualmente
npm run db:studio

# Agregar más usuarios de prueba
npm run db:seed

# Detener el servidor
Ctrl + C (en la terminal)

# Iniciar nuevamente
npm run dev
```

## 📊 Gestión de la Base de Datos

### Prisma Studio (Interfaz Visual)

```bash
npm run db:studio
```

Esto abrirá una interfaz web en `http://localhost:5555` donde puedes:
- Ver todos los usuarios
- Ver todos los videos
- Editar datos directamente
- Eliminar registros
- Crear nuevos registros

### Comandos de Base de Datos

```bash
# Crear nueva migración
npm run db:migrate

# Sincronizar schema sin crear migración
npm run db:push

# Resetear datos de prueba
npm run db:seed
```

## 🎨 Personalización

### Colores de Marca

Los colores principales están definidos en `tailwind.config.ts`:

```typescript
'tok-tik-pink': '#FE2C55',
'tok-tik-cyan': '#00F2EA',
'tok-tik-black': '#000000',
```

### Límites y Configuración

En el archivo `.env` puedes modificar:

```env
MAX_USERS=30              # Máximo de usuarios
MAX_FILE_SIZE=52428800    # Tamaño máximo de video (50MB)
```

## 🔧 Solución de Problemas

### El video no se sube

- Verifica que el archivo sea menor a 50MB
- Asegúrate de que el formato sea MP4, WebM u OGG
- Revisa que estés autenticado

### No puedo dar likes

- Debes estar autenticado para dar likes
- Verifica que tu sesión no haya expirado

### La página no carga

- Asegúrate de que el servidor esté corriendo (`npm run dev`)
- Limpia el caché del navegador (Ctrl + Shift + R)
- Revisa la consola del navegador para errores

### Error al iniciar sesión

- Verifica que el email y contraseña sean correctos
- Usa uno de los usuarios de prueba listados arriba
- Si creaste una cuenta nueva, asegúrate de recordar la contraseña

## 📖 Recursos Adicionales

- **README.md** - Documentación completa del proyecto
- **API.md** - Documentación de la API REST
- **prisma/schema.prisma** - Esquema de base de datos

## 💡 Consejos

1. **Usa Prisma Studio** para ver y gestionar datos fácilmente
2. **Los videos se guardan** en `public/uploads/`
3. **La base de datos** está en `prisma/dev.db`
4. **Optimistic updates** - Los likes se actualizan instantáneamente
5. **Auto-play** - Los videos se reproducen al hacer scroll

## 🚀 Próximos Pasos

Ahora que conoces lo básico, puedes:

1. **Explorar el código** en `app/` y `components/`
2. **Agregar nuevas características** (ver README.md)
3. **Personalizar el diseño** modificando Tailwind CSS
4. **Integrar con tu propio backend** si lo prefieres
5. **Desplegar en producción** (Vercel, Netlify, etc.)

## 🆘 Soporte

Si encuentras algún problema:

1. Revisa la consola del navegador
2. Revisa los logs del servidor en la terminal
3. Consulta la documentación en README.md
4. Revisa el código de ejemplo en los componentes

---

¡Disfruta creando contenido en Tok-Tik! 🎉
