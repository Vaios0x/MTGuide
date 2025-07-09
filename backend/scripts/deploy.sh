#!/bin/bash

echo "🚀 Iniciando despliegue en Railway..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Generar cliente de Prisma
echo "🗄️ Generando cliente de Prisma..."
npx prisma generate

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones de base de datos..."
npx prisma migrate deploy

# Construir el proyecto
echo "🔨 Construyendo el proyecto..."
npm run build

echo "✅ Despliegue completado!" 