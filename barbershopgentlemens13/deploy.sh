#!/bin/bash

# Deploy script за barbershop13
# Качва само променените файлове на сървъра

SERVER="твоя_сървър.com"
USER="твоя_потребител"
REMOTE_PATH="/home/твоя_потребител/public_html"

echo "🚀 Качване на промените на сървъра..."

# Качи backend файлове
echo "📦 Качване на backend/server.js..."
rsync -avz --progress backend/server.js $USER@$SERVER:$REMOTE_PATH/backend/

# Билдни фронтенда
echo "🔨 Билдване на фронтенда..."
npm run build

# Качи dist директорията
echo "📦 Качване на frontend build..."
rsync -avz --progress dist/ $USER@$SERVER:$REMOTE_PATH/

# Рестартирай backend
echo "🔄 Рестартиране на backend..."
ssh $USER@$SERVER "touch $REMOTE_PATH/backend/tmp/restart.txt"

echo "✅ Готово! Промените са качени на сървъра."
