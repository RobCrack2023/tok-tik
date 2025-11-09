# Guía de Despliegue en Producción - Tok-Tik

## Servidor: Ubuntu 22.04
## Dominio: tok-tik.iot-robotics.cl

---

## 1. Preparación del Servidor Ubuntu

### Actualizar el sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### Instalar dependencias básicas
```bash
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx
```

---

## 2. Instalar Node.js 20.x LTS

```bash
# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

---

## 3. Instalar PostgreSQL (Recomendado para producción)

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear base de datos y usuario
sudo -u postgres psql << EOF
CREATE DATABASE toktik;
CREATE USER toktik_user WITH ENCRYPTED PASSWORD 'tu_password_seguro_aqui';
GRANT ALL PRIVILEGES ON DATABASE toktik TO toktik_user;
\q
EOF
```

**Nota:** Si prefieres usar SQLite (solo para pruebas), puedes saltarte este paso.

---

## 4. Clonar el Repositorio

```bash
# Ir al directorio home
cd ~

# Clonar el proyecto
git clone https://github.com/RobCrack2023/tok-tik.git
cd tok-tik

# Instalar dependencias
npm install
```

---

## 5. Configurar Variables de Entorno

```bash
# Crear archivo .env
nano .env
```

Agregar el siguiente contenido:

```env
# Base de datos (PostgreSQL)
DATABASE_URL="postgresql://toktik_user:tu_password_seguro_aqui@localhost:5432/toktik?schema=public"

# Si usas SQLite (NO recomendado en producción)
# DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL=https://tok-tik.iot-robotics.cl
NEXTAUTH_SECRET=genera_un_string_random_muy_largo_y_seguro_aqui_min_32_caracteres

# Límite de usuarios
MAX_USERS=30

# Node environment
NODE_ENV=production
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 6. Configurar Prisma y Base de Datos

```bash
# Si usas PostgreSQL, instalar el cliente
npm install @prisma/client

# Actualizar schema.prisma para PostgreSQL
nano prisma/schema.prisma
```

Cambiar el datasource en `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Cambiar de "sqlite" a "postgresql"
  url      = env("DATABASE_URL")
}
```

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Poblar con datos de prueba
npm run db:seed
```

---

## 7. Build de Producción

```bash
# Compilar la aplicación
npm run build

# Crear directorio para uploads
mkdir -p public/uploads
chmod 755 public/uploads
```

---

## 8. Instalar y Configurar PM2

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar la aplicación con PM2
pm2 start npm --name "toktik" -- start

# Configurar PM2 para iniciar al arrancar el sistema
pm2 startup systemd
pm2 save

# Ver logs
pm2 logs toktik

# Otros comandos útiles
pm2 status
pm2 restart toktik
pm2 stop toktik
```

---

## 9. Configurar Nginx como Reverse Proxy

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/toktik
```

Agregar el siguiente contenido:

```nginx
server {
    listen 80;
    server_name tok-tik.iot-robotics.cl;

    # Logs
    access_log /var/log/nginx/toktik_access.log;
    error_log /var/log/nginx/toktik_error.log;

    # Aumentar tamaño máximo de archivo (para videos)
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts para uploads
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
}
```

```bash
# Activar el sitio
sudo ln -s /etc/nginx/sites-available/toktik /etc/nginx/sites-enabled/

# Eliminar sitio por defecto (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 10. Configurar SSL con Let's Encrypt

```bash
# Obtener certificado SSL
sudo certbot --nginx -d tok-tik.iot-robotics.cl

# Seguir las instrucciones en pantalla
# Certbot configurará automáticamente Nginx para usar HTTPS
```

El archivo de Nginx se actualizará automáticamente a algo como:

```nginx
server {
    server_name tok-tik.iot-robotics.cl;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/tok-tik.iot-robotics.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tok-tik.iot-robotics.cl/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = tok-tik.iot-robotics.cl) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name tok-tik.iot-robotics.cl;
    return 404;
}
```

```bash
# Renovación automática del certificado
sudo certbot renew --dry-run
```

---

## 11. Configurar Firewall (UFW)

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow 22

# Permitir HTTP y HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Verificar estado
sudo ufw status
```

---

## 12. Configuración DNS

Asegúrate de que tu dominio `tok-tik.iot-robotics.cl` apunte al servidor:

**En tu proveedor de DNS:**
```
Tipo: A
Nombre: tok-tik (o @)
Valor: [IP_DE_TU_SERVIDOR]
TTL: 3600
```

Verificar DNS:
```bash
dig tok-tik.iot-robotics.cl
nslookup tok-tik.iot-robotics.cl
```

---

## 13. Verificación Final

```bash
# Verificar que la app esté corriendo
pm2 status

# Ver logs
pm2 logs toktik

# Verificar Nginx
sudo systemctl status nginx

# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar puertos
sudo netstat -tulpn | grep LISTEN
```

Acceder a: **https://tok-tik.iot-robotics.cl**

---

## 14. Comandos Útiles de Mantenimiento

### Ver logs de la aplicación
```bash
pm2 logs toktik
pm2 logs toktik --lines 100
```

### Reiniciar la aplicación
```bash
pm2 restart toktik
```

### Actualizar el código
```bash
cd ~/tok-tik
git pull origin main
npm install
npm run build
pm2 restart toktik
```

### Ver logs de Nginx
```bash
sudo tail -f /var/log/nginx/toktik_access.log
sudo tail -f /var/log/nginx/toktik_error.log
```

### Backup de la base de datos (PostgreSQL)
```bash
# Crear backup
pg_dump -U toktik_user toktik > backup_toktik_$(date +%Y%m%d).sql

# Restaurar backup
psql -U toktik_user toktik < backup_toktik_20231109.sql
```

### Monitoreo de recursos
```bash
# Ver uso de CPU y memoria
htop

# Ver espacio en disco
df -h

# Ver uso de disco por carpeta
du -sh ~/tok-tik/*
```

---

## 15. Optimizaciones Adicionales

### Configurar Swap (si tienes poca RAM)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Limitar uploads por IP (Nginx)
```nginx
# En /etc/nginx/sites-available/toktik
limit_req_zone $binary_remote_addr zone=upload_limit:10m rate=5r/m;

location /api/upload {
    limit_req zone=upload_limit burst=10 nodelay;
    # ... resto de configuración
}
```

### Habilitar compresión Gzip
```nginx
# En /etc/nginx/nginx.conf
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

---

## 16. Solución de Problemas Comunes

### La app no inicia
```bash
pm2 logs toktik
# Revisar errores en los logs
```

### Error de permisos en uploads
```bash
sudo chown -R $USER:$USER ~/tok-tik/public/uploads
chmod 755 ~/tok-tik/public/uploads
```

### Nginx muestra 502 Bad Gateway
```bash
# Verificar que la app esté corriendo
pm2 status

# Verificar puertos
sudo netstat -tulpn | grep 3000
```

### Certificado SSL no funciona
```bash
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

---

## Resumen de Comandos Rápidos

```bash
# 1. Preparar servidor
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx postgresql certbot python3-certbot-nginx

# 2. Clonar y configurar
cd ~
git clone https://github.com/RobCrack2023/tok-tik.git
cd tok-tik
npm install

# 3. Configurar .env (editar con tus datos)
nano .env

# 4. Base de datos
npx prisma generate
npx prisma migrate deploy

# 5. Build y PM2
npm run build
sudo npm install -g pm2
pm2 start npm --name "toktik" -- start
pm2 startup systemd
pm2 save

# 6. Nginx
sudo nano /etc/nginx/sites-available/toktik
sudo ln -s /etc/nginx/sites-available/toktik /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 7. SSL
sudo certbot --nginx -d tok-tik.iot-robotics.cl

# 8. Firewall
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
```

---

## Soporte

- **Documentación oficial Next.js:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **PM2 Docs:** https://pm2.keymetrics.io/docs
- **Nginx Docs:** https://nginx.org/en/docs

---

**¡Tu aplicación Tok-Tik estará disponible en https://tok-tik.iot-robotics.cl!**
