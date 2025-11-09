# Migración de SQLite a PostgreSQL

## 📋 Pasos para Producción

### 1. Hacer Pull de los Cambios

```bash
cd ~/tok-tik

# Si tienes cambios locales, guárdalos
git stash

# Hacer pull
git pull origin main

# Verificar que el provider sea postgresql
cat prisma/schema.prisma | grep provider
# Debe mostrar: provider = "postgresql"
```

### 2. Verificar Conexión a PostgreSQL

```bash
# Verificar que la variable DATABASE_URL esté configurada
cat .env | grep DATABASE_URL

# Debe ser algo como:
# DATABASE_URL="postgresql://toktik_user:tu_password@localhost:5432/toktik?schema=public"
```

### 3. Generar Cliente de Prisma

```bash
npx prisma generate
```

### 4. Crear Migración Inicial para PostgreSQL

**OPCIÓN A - Si la base de datos YA TIENE datos (RECOMENDADO):**

```bash
# Marcar el schema actual como aplicado SIN ejecutar cambios
npx prisma migrate resolve --applied 0_init

# Luego aplicar solo el nuevo campo commentsDisabled
npx prisma migrate deploy
```

**OPCIÓN B - Si la base de datos está VACÍA:**

```bash
# Crear migración inicial
npx prisma migrate dev --name init

# Poblar con datos de prueba (opcional)
npm run db:seed
```

**OPCIÓN C - Si quieres empezar de cero (⚠️ ELIMINA TODOS LOS DATOS):**

```bash
# ADVERTENCIA: Esto borrará todos los datos
npx prisma migrate reset

# Poblar con datos de prueba
npm run db:seed
```

### 5. Verificar Migraciones

```bash
# Ver el estado de las migraciones
npx prisma migrate status

# Debe mostrar: Database schema is up to date!
```

### 6. Build y Reiniciar

```bash
# Build de producción
npm run build

# Reiniciar PM2
pm2 restart toktik

# Ver logs
pm2 logs toktik --lines 50
```

## 🔍 Verificación

### Comprobar que PostgreSQL tiene las tablas:

```bash
psql -U toktik_user -d toktik

# Dentro de psql:
\dt                          # Ver todas las tablas
\d "Video"                   # Ver estructura de la tabla Video
SELECT column_name FROM information_schema.columns WHERE table_name = 'Video';

# Debe incluir: commentsDisabled
```

### Verificar en Prisma Studio:

```bash
npx prisma studio
```

Abre http://localhost:5555 y verifica:
- Tabla Video tiene el campo `commentsDisabled`
- Todos los modelos están presentes

## ❌ Solución de Problemas

### Error: "Migration failed"

```bash
# Ver detalles del error
npx prisma migrate status

# Forzar sincronización del schema (sin ejecutar migraciones)
npx prisma db push
```

### Error: "Table already exists"

```bash
# Marcar migración como aplicada sin ejecutarla
npx prisma migrate resolve --applied [nombre_migracion]
```

### Resetear completamente (⚠️ ELIMINA DATOS):

```bash
# Borrar todas las tablas
npx prisma migrate reset

# Volver a crear todo
npx prisma migrate dev --name init
npm run db:seed
```

## 📝 Notas Importantes

- Las migraciones de SQLite fueron removidas del repositorio
- PostgreSQL usa tipos de datos diferentes que SQLite
- El campo `commentsDisabled` fue agregado al modelo Video
- Asegúrate de hacer backup antes de migrar en producción

## 🔄 Rollback (si algo sale mal)

```bash
# Volver al commit anterior
git log --oneline -5
git checkout [commit_anterior]

# Restaurar base de datos desde backup
psql -U toktik_user toktik < backup_YYYYMMDD.sql
```

## ✅ Checklist de Migración

- [ ] Backup de base de datos creado
- [ ] Git pull completado
- [ ] Provider verificado (postgresql)
- [ ] DATABASE_URL correcta en .env
- [ ] Prisma client generado
- [ ] Migraciones aplicadas exitosamente
- [ ] Campo commentsDisabled visible en DB
- [ ] Build completado
- [ ] PM2 reiniciado
- [ ] Aplicación funcionando correctamente
- [ ] Comentarios funcionando
- [ ] Toggle de comentarios funcionando
