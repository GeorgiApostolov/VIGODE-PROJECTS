#!/usr/bin/env node

/**
 * MongoDB Backup Script
 * Автоматично прави backup на всички колекции
 * Използване: node scripts/backup-mongodb.js
 */

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Конфигурация
const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://username:password@cluster.mongodb.net/dbname";
const BACKUP_DIR = path.join(__dirname, "..", "backups");
const MAX_BACKUPS = 7; // Пази последните 7 backup-а

// Извличане на DB име от URI
const dbName = MONGO_URI.split("/").pop().split("?")[0];

// Създаване на backup директория ако не съществува
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Генериране на име на файл с timestamp
const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
const backupFileName = `backup-${dbName}-${timestamp}.gz`;
const backupPath = path.join(BACKUP_DIR, backupFileName);

console.log("🚀 Започване на MongoDB backup...");
console.log(`📁 Database: ${dbName}`);
console.log(`💾 Файл: ${backupFileName}`);

// mongodump команда
const dumpCommand = `mongodump --uri="${MONGO_URI}" --archive="${backupPath}" --gzip`;

exec(dumpCommand, (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Грешка при backup:", error);
    process.exit(1);
  }

  if (stderr) {
    console.log("⚠️ Предупреждения:", stderr);
  }

  // Проверка размер на файла
  const stats = fs.statSync(backupPath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log("✅ Backup завършен успешно!");
  console.log(`📊 Размер: ${fileSizeMB} MB`);
  console.log(`📂 Локация: ${backupPath}`);

  // Изтриване на стари backup-и
  cleanOldBackups();
});

/**
 * Изтрива стари backup файлове, пази само MAX_BACKUPS най-нови
 */
function cleanOldBackups() {
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((file) => file.startsWith("backup-") && file.endsWith(".gz"))
    .map((file) => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time); // Сортира по дата (най-нови първи)

  if (files.length > MAX_BACKUPS) {
    console.log(
      `\n🗑️ Изтриване на стари backup-и (пази ${MAX_BACKUPS} най-нови)...`
    );

    const filesToDelete = files.slice(MAX_BACKUPS);
    filesToDelete.forEach((file) => {
      fs.unlinkSync(file.path);
      console.log(`   ❌ Изтрит: ${file.name}`);
    });

    console.log(
      `✅ Запазени ${files.length - filesToDelete.length} backup файла`
    );
  }

  console.log("\n📋 Налични backup-и:");
  files.slice(0, MAX_BACKUPS).forEach((file, index) => {
    const sizeMB = (fs.statSync(file.path).size / (1024 * 1024)).toFixed(2);
    const date = new Date(file.time).toLocaleString("bg-BG");
    console.log(`   ${index + 1}. ${file.name} (${sizeMB} MB) - ${date}`);
  });
}
