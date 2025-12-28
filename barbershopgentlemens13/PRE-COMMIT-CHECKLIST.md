# ✅ PRE-COMMIT CHECKLIST

## Преди да push-неш в GitHub, провери:

### 🔒 Сигурност

- [x] `.env` файлът е изтрит
- [x] `.htaccess` с credentials е изтрит
- [x] Няма hardcoded пароли в кода
- [x] Всички uploads файлове са изтрити
- [x] `.gitignore` е създаден и конфигуриран
- [x] Template файлове (.env.example, .htaccess.example) са готови

### 📝 Документация

- [x] SECURITY.md е създаден
- [x] GIT-SAFETY.md е създаден
- [x] SUMMARY.md е готов
- [x] README има инструкции за setup

### 🗂️ Файлова структура

- [x] Няма .DS_Store файлове
- [x] Няма node_modules в git
- [x] backend/uploads/ е празна (само .gitkeep)
- [x] Няма backup файлове с данни

### 🚀 Готов за push?

Изпълни следните команди:

```bash
# 1. Stage всички промени
git add .

# 2. Провери какво ще се commit-не
git status

# 3. Провери за чувствителна информация (трябва да върне празно)
git diff --cached | grep -i "password\|secret\|mongodb://"

# 4. Commit
git commit -m "security: Remove sensitive data and prepare for public repository"

# 5. Push
git push origin main
```

---

## ⚠️ СЛЕД PUSH - ВАЖНО!

### На production сървъра:

1. **Сменете всички credentials незабавно:**

   ```bash
   # Генерирайте нов JWT secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **MongoDB:**

   - Сменете паролата на MongoDB user
   - Обновете MONGO_URI в production .env

3. **Email:**

   - Сменете SMTP паролата
   - Обновете SMTP_PASS в production .env

4. **Конфигурация:**
   - Копирайте .env.example → .env
   - Копирайте .htaccess.example → .htaccess
   - Попълнете с НОВИТЕ credentials

---

## 🎉 Готово!

Проектът е 100% безопасен за публикуване в GitHub!

**Не забравяйте:**

- Прочетете SECURITY.md за best practices
- Следвайте GIT-SAFETY.md при бъдещи commits
- Ротирайте credentials редовно
