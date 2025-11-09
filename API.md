# Documentación de API - Tok-Tik

## Autenticación

Todas las rutas protegidas requieren autenticación mediante NextAuth. La sesión se maneja automáticamente mediante cookies.

## Endpoints

### Autenticación

#### Registrar Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123",
  "username": "usuario",
  "name": "Nombre Usuario"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "id": "...",
    "email": "usuario@example.com",
    "username": "usuario",
    "name": "Nombre Usuario",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errores:**
- 400: Datos faltantes
- 403: Límite de usuarios alcanzado
- 409: Email o username ya existe

---

### Usuarios

#### Obtener Perfil
```http
GET /api/users/:id
```

**Respuesta (200):**
```json
{
  "id": "...",
  "username": "usuario1",
  "name": "Usuario 1",
  "bio": "Mi biografía",
  "avatar": "/uploads/avatar.jpg",
  "verified": true,
  "_count": {
    "videos": 10,
    "followers": 50,
    "following": 30
  }
}
```

#### Actualizar Perfil
```http
PATCH /api/users/:id
Content-Type: application/json
Authorization: Required

{
  "name": "Nuevo Nombre",
  "bio": "Nueva biografía",
  "avatar": "/uploads/new-avatar.jpg"
}
```

#### Seguir Usuario
```http
POST /api/users/:id/follow
Authorization: Required
```

#### Dejar de Seguir
```http
DELETE /api/users/:id/follow
Authorization: Required
```

---

### Videos

#### Listar Videos (Feed)
```http
GET /api/videos?page=1&limit=10
```

**Parámetros de query:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Videos por página (default: 10)
- `userId` (opcional): Filtrar por usuario
- `following` (opcional): `true` para ver solo videos de seguidos

**Respuesta (200):**
```json
{
  "videos": [
    {
      "id": "...",
      "caption": "Mi video",
      "videoUrl": "/uploads/video.mp4",
      "thumbnailUrl": "/uploads/thumb.jpg",
      "views": 1000,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "...",
        "username": "usuario1",
        "name": "Usuario 1",
        "avatar": "/uploads/avatar.jpg",
        "verified": true
      },
      "_count": {
        "likes": 100,
        "comments": 20
      },
      "isLiked": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Crear Video
```http
POST /api/videos
Content-Type: application/json
Authorization: Required

{
  "caption": "Mi nuevo video",
  "videoUrl": "/uploads/video.mp4",
  "thumbnailUrl": "/uploads/thumb.jpg",
  "duration": 15
}
```

#### Dar Like
```http
POST /api/videos/:id/like
Authorization: Required
```

#### Quitar Like
```http
DELETE /api/videos/:id/like
Authorization: Required
```

#### Actualizar Video
```http
PATCH /api/videos/:id
Content-Type: application/json
Authorization: Required

{
  "caption": "Nuevo caption",
  "isPublic": true
}
```

#### Eliminar Video
```http
DELETE /api/videos/:id
Authorization: Required
```

---

### Comentarios

#### Listar Comentarios
```http
GET /api/videos/:id/comments?page=1&limit=20
```

**Respuesta (200):**
```json
{
  "comments": [
    {
      "id": "...",
      "text": "Gran video!",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "...",
        "username": "usuario2",
        "name": "Usuario 2",
        "avatar": "/uploads/avatar2.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

#### Crear Comentario
```http
POST /api/videos/:id/comments
Content-Type: application/json
Authorization: Required

{
  "text": "Excelente video!"
}
```

#### Eliminar Comentario
```http
DELETE /api/comments/:id
Authorization: Required
```

---

### Upload

#### Subir Video
```http
POST /api/upload/video
Content-Type: multipart/form-data
Authorization: Required

FormData:
  - video: archivo de video (MP4, WebM, OGG)
  - thumbnail: (opcional) imagen de thumbnail
```

**Respuesta (200):**
```json
{
  "videoUrl": "/uploads/video-123.mp4",
  "thumbnailUrl": "/uploads/thumb-123.jpg",
  "size": 5242880,
  "originalFilename": "mi-video.mp4"
}
```

**Límites:**
- Tamaño máximo: 50MB (configurable en MAX_FILE_SIZE)
- Formatos permitidos: MP4, WebM, OGG, QuickTime

---

## Códigos de Estado

- **200**: Éxito
- **201**: Creado
- **400**: Bad Request (datos inválidos)
- **401**: No autenticado
- **403**: Prohibido
- **404**: No encontrado
- **409**: Conflicto (duplicado)
- **500**: Error del servidor

## Ejemplos de Uso

### Flujo Completo de Usuario

1. **Registrarse**
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'nuevo@example.com',
    password: 'password123',
    username: 'nuevousuario',
    name: 'Nuevo Usuario'
  })
});
```

2. **Iniciar Sesión**
```javascript
import { signIn } from 'next-auth/react';

await signIn('credentials', {
  email: 'nuevo@example.com',
  password: 'password123',
  redirect: false
});
```

3. **Subir Video**
```javascript
const formData = new FormData();
formData.append('video', videoFile);
formData.append('thumbnail', thumbnailFile);

const uploadResponse = await fetch('/api/upload/video', {
  method: 'POST',
  body: formData
});

const { videoUrl, thumbnailUrl } = await uploadResponse.json();
```

4. **Crear Post de Video**
```javascript
await fetch('/api/videos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    caption: 'Mi primer video!',
    videoUrl,
    thumbnailUrl,
    duration: 15
  })
});
```

5. **Obtener Feed**
```javascript
const response = await fetch('/api/videos?page=1&limit=10');
const { videos, pagination } = await response.json();
```
