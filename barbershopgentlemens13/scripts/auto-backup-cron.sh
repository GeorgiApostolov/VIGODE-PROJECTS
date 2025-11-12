#!/bin/bash

# Автоматичен backup скрипт за cron job
# Добави в crontab: 0 3 * * * /path/to/auto-backup-cron.sh

cd "$(dirname "$0")/.."

# Зареди environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Изпълни backup
node scripts/backup-mongodb.js

# Опционално: изпрати backup на cloud storage (Dropbox, Google Drive, S3)
# rclone copy backups/ remote:barbershop-backups/
