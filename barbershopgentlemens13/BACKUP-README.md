# 🗄️ MongoDB Backup & Restore Ръководство

## Предварителни изисквания

1. **Инсталирай MongoDB Database Tools:**

   ```bash
   # macOS
   brew install mongodb/brew/mongodb-database-tools

   # Linux (Ubuntu/Debian)
   sudo apt-get install mongodb-database-tools

   # Windows - свали от:
   # https://www.mongodb.com/try/download/database-tools
   ```

2. **Конфигурирай MONGODB_URI:**

   Добави в `.env` файла:

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/barbershop
   ```

## 📦 Backup

### Ръчен Backup

```bash
node scripts/backup-mongodb.js
```

Това ще създаде compressed backup файл в `backups/` директорията.

### Автоматичен Backup (Cron)

**macOS/Linux:**

```bash
# Отвори crontab
crontab -e

# Добави ред за backup всеки ден в 3:00 сутринта
0 3 * * * /path/to/barbershop13/scripts/auto-backup-cron.sh

# Или всеки час:
0 * * * * /path/to/barbershop13/scripts/auto-backup-cron.sh
```

**Windows (Task Scheduler):**

1. Отвори Task Scheduler
2. Create Basic Task
3. Trigger: Daily 3:00 AM
4. Action: Start a program
5. Program: `node`
6. Arguments: `C:\path\to\barbershop13\scripts\backup-mongodb.js`

## 🔄 Restore

### Преглед на backup-и

```bash
ls -lh backups/
```

### Възстановяване от backup

```bash
node scripts/restore-mongodb.js backup-barbershop-2025-11-12T03-00-00.gz
```

⚠️ **ВНИМАНИЕ:** Restore изтрива текущата база и я заменя с backup-а!

## 📤 Upload на Cloud (Препоръчвам!)

### Вариант 1: Google Drive (с rclone)

```bash
# Инсталирай rclone
brew install rclone  # macOS
# или sudo apt install rclone  # Linux

# Конфигурирай Google Drive
rclone config

# Качи backup-ите
rclone sync backups/ gdrive:barbershop-backups/
```

### Вариант 2: Dropbox

```bash
# Инсталирай Dropbox Uploader
curl "https://raw.githubusercontent.com/andreafabrizi/Dropbox-Uploader/master/dropbox_uploader.sh" -o dropbox_uploader.sh
chmod +x dropbox_uploader.sh

# Upload backup
./dropbox_uploader.sh upload backups/ /barbershop-backups/
```

### Вариант 3: AWS S3

```bash
# Инсталирай AWS CLI
brew install awscli  # macOS

# Конфигурирай
aws configure

# Upload
aws s3 sync backups/ s3://your-bucket/barbershop-backups/
```

## 📊 Retention Policy

По подразбиране скриптът пази **последните 7 backup-а**. За да промениш:

Редактирай `scripts/backup-mongodb.js`:

```javascript
const MAX_BACKUPS = 30; // Пази 30 backup-а
```

## 🚨 Emergency Restore

Ако базата се повреди:

1. **НЕ ПАНИКЬОСВАЙ!**
2. Намери последния работещ backup:
   ```bash
   ls -lt backups/
   ```
3. Възстанови:
   ```bash
   node scripts/restore-mongodb.js <backup-file>
   ```

## 💡 Best Practices

1. ✅ Прави backup **преди всяка голяма промяна**
2. ✅ Тествай restore процеса **поне веднъж**
3. ✅ Пази backup-и на **различни места** (local + cloud)
4. ✅ Провери backup файловете **редовно**
5. ✅ Използвай **автоматизация** (cron jobs)

## 📱 Notification при грешка

За да получаваш известие при проблем с backup:

Редактирай `scripts/backup-mongodb.js` и добави в края:

```javascript
// Изпрати email при грешка
if (error) {
  // Използвай SendGrid, Mailgun, или друг email service
  sendEmail("admin@example.com", "Backup Failed", error.message);
}
```

## 🔐 Сигурност

- ❌ Никога не commit-вай backup файловете в Git
- ✅ Добави в `.gitignore`:
  ```
  backups/
  *.gz
  ```
- ✅ Encrypt-вай backup-ите преди cloud upload:
  ```bash
  gpg --encrypt --recipient your@email.com backup.gz
  ```

---

**Въпроси?** Провери документацията или се свържи с dev team.
