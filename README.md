# MT Guide - Escuela de Montaña

Plataforma web completa para una escuela de montañismo que ofrece experiencias educativas, expediciones y guías personalizados en las montañas de México.

## 🏔️ Características

- **Experiencias de Montaña**: Caminatas, cursos y expediciones
- **Sistema de Reservas**: Booking online con pagos integrados
- **Blog Educativo**: Contenido sobre montañismo y preparación
- **Panel de Administración**: Gestión completa de experiencias y reservas
- **Autenticación 2FA**: Seguridad avanzada para administradores
- **Integración Social**: Sincronización automática con Instagram

## 🛠️ Tecnologías

### Backend
- **Node.js** con **Express.js**
- **TypeScript** para type safety
- **Prisma ORM** con **PostgreSQL**
- **JWT** para autenticación
- **Stripe** para pagos
- **AWS S3** para almacenamiento
- **Redis** para caché
- **Resend** para emails

### Frontend
- **React 18** con **TypeScript**
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **Zustand** para estado global
- **React Query** para cache de datos
- **Stripe Elements** para pagos

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+
- PostgreSQL
- Redis
- Cuentas en servicios externos (Stripe, AWS, Resend, Instagram)

### Backend

```bash
cd backend
npm install
cp env.example .env
# Configurar variables de entorno en .env
npm run db:generate
npm run db:migrate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
# Configurar VITE_API_URL en .env
npm run dev
```

## 📁 Estructura del Proyecto

```
MTGuide/
├── backend/                 # API REST con Express
│   ├── src/
│   │   ├── routes/         # Endpoints de la API
│   │   ├── middleware/     # Middlewares de autenticación y validación
│   │   ├── services/       # Servicios externos (email, storage, etc.)
│   │   └── server.ts       # Servidor principal
│   ├── prisma/            # Esquema de base de datos
│   └── package.json
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── stores/        # Estado global con Zustand
│   │   ├── lib/           # Utilidades y configuración
│   │   └── App.tsx        # Componente principal
│   └── package.json
└── README.md
```

## 🔧 Configuración

### Variables de Entorno (Backend)

```env
# Servidor
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/mtguide"

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Redis
REDIS_URL=redis://localhost:6379

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com

# Instagram
INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token
INSTAGRAM_USER_ID=your-instagram-user-id
```

### Variables de Entorno (Frontend)

```env
VITE_API_URL=http://localhost:5000
```

## 📊 Base de Datos

El proyecto utiliza Prisma ORM con PostgreSQL. Los modelos principales incluyen:

- **Users**: Usuarios y administradores
- **Experiences**: Experiencias de montaña
- **ExperienceDates**: Fechas disponibles
- **Bookings**: Reservas de clientes
- **Testimonials**: Reseñas y testimonios
- **Posts**: Blog y contenido educativo
- **ContactForms**: Formularios de contacto

## 🔐 Autenticación

- **JWT** para sesiones
- **Autenticación de dos factores** (2FA) para administradores
- **Códigos de respaldo** para recuperación
- **Middleware de autorización** por roles

## 💳 Pagos

Integración completa con **Stripe**:
- Payment Intents para pagos seguros
- Webhooks para confirmaciones automáticas
- Reembolsos y gestión de pagos
- Soporte para múltiples monedas

## 📧 Notificaciones

Sistema de emails automáticos con **Resend**:
- Confirmaciones de reserva
- Recordatorios de experiencias
- Notificaciones de contacto
- Emails administrativos

## 🚀 Despliegue

### Backend en Railway

1. **Crear cuenta en Railway**: Ve a [railway.app](https://railway.app) y conéctate con GitHub
2. **Crear nuevo proyecto**: "Deploy from GitHub repo"
3. **Seleccionar el repositorio**: `Vaios0x/MTGuide`
4. **Configurar variables de entorno** en Railway:
   ```env
   DATABASE_URL=tu_url_de_postgresql
   JWT_SECRET=tu_jwt_secret
   STRIPE_SECRET_KEY=tu_stripe_key
   AWS_ACCESS_KEY_ID=tu_aws_key
   AWS_SECRET_ACCESS_KEY=tu_aws_secret
   REDIS_URL=tu_redis_url
   RESEND_API_KEY=tu_resend_key
   INSTAGRAM_ACCESS_TOKEN=tu_instagram_token
   ```
5. **Railway detectará automáticamente** que es un proyecto Node.js y lo desplegará

### Frontend en Vercel

1. **Crear cuenta en Vercel**: Ve a [vercel.com](https://vercel.com) y conéctate con GitHub
2. **Importar proyecto**: Selecciona tu repositorio `Vaios0x/MTGuide`
3. **Configurar variables de entorno** en Vercel:
   ```env
   VITE_API_URL=https://tu-backend-railway-url.up.railway.app
   ```
4. **Vercel detectará automáticamente** la configuración y desplegará el frontend

### URLs de Producción

- **Frontend**: `https://tu-proyecto.vercel.app`
- **Backend**: `https://tu-proyecto-railway.up.railway.app`

### Desarrollo Local

```bash
# Backend
cd backend
npm install
cp env.example .env
# Configurar variables en .env
npm run dev

# Frontend
cd frontend
npm install
cp env.example .env
# Configurar VITE_API_URL en .env
npm run dev
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Email**: info@mtguide.com
- **Website**: https://mtguide.com
- **Instagram**: @mtguide

---

Desarrollado con ❤️ para la comunidad montañista de México 