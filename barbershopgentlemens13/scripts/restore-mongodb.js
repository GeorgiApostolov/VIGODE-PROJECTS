#!/usr/bin/env node

/**
 * MongoDB Restore Script
 * Възстановява backup на базата данни
 * Използване: node scripts/restore-mongodb.js <backup-file>
 */

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://username:password@cluster.mongodb.net/dbname";
const BACKUP_DIR = path.join(__dirname, "..", "backups");

// Проверка за backup файл аргумент
const backupFile = process.argv[2];

if (!backupFile) {
  console.error("❌ Моля, укажи backup файл!");
  console.log("\nИзползване: node scripts/restore-mongodb.js <backup-file>");
  console.log("\nНалични backup-и:");

  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((file) => file.startsWith("backup-") && file.endsWith(".gz"))
    .sort()
    .reverse();

  files.forEach((file, index) => {
    const stats = fs.statSync(path.join(BACKUP_DIR, file));
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const date = new Date(stats.mtime).toLocaleString("bg-BG");
    console.log(`   ${index + 1}. ${file} (${sizeMB} MB) - ${date}`);
  });

  process.exit(1);
}

const backupPath = path.join(BACKUP_DIR, backupFile);

if (!fs.existsSync(backupPath)) {
  console.error(`❌ Backup файлът не съществува: ${backupPath}`);
  process.exit(1);
}

// Потвърждение преди restore
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("⚠️  ВНИМАНИЕ! Това ще замени текущата база данни!");
console.log(`📁 Backup файл: ${backupFile}`);
console.log(`🔗 Destination: ${MONGO_URI.split("@")[1]}`);

rl.question("\n❓ Сигурен ли си? (yes/no): ", (answer) => {
  if (answer.toLowerCase() !== "yes") {
    console.log("❌ Restore отменен.");
    rl.close();
    process.exit(0);
  }

  console.log("\n🚀 Започване на restore...");

  const restoreCommand = `mongorestore --uri="${MONGO_URI}" --archive="${backupPath}" --gzip --drop`;

  exec(restoreCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Грешка при restore:", error);
      rl.close();
      process.exit(1);
    }

    if (stderr) {
      console.log("⚠️ Предупреждения:", stderr);
    }

    console.log("✅ Restore завършен успешно!");
    console.log(stdout);
    rl.close();
  });
});
