# 🔒 SECURITY NOTICE

## Защита на чувствителна информация

Този проект е почистен от чувствителна информация за публикуване в GitHub.

### ✅ Премахнати файлове и информация:

1. **backend/.env** - Изтрит (съдържаше реални passwords и secrets)
2. **backend/.htaccess** - Изтрит (съдържаше MongoDB credentials и JWT secret)
3. **backend/email.js** - Почистен (hardcoded passwords премахнати)
4. **backend/uploads/** - Изтрити всички качени файлове (лични данни)

### 📋 Създадени template файлове:

- `backend/.env.example` - Template за environment variables
- `backend/.htaccess.example` - Template за cPanel/Passenger конфигурация

### ⚠️ ВАЖНО: Преди deployment

1. **Създайте backend/.env файл** със собствените си credentials:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. **Попълнете следните стойности:**

   - `MONGO_URI` - Вашият MongoDB connection string
   - `JWT_SECRET` - Дълъг произволен string за JWT token-и
   - `SMTP_PASS` - Паролата за email сървъра
   - `SMTP_USER` - Email за изпращане

3. **За cPanel hosting създайте backend/.htaccess**:
   ```bash
   cp backend/.htaccess.example backend/.htaccess
   ```
4. **НИКОГА не commit-вайте:**
   - .env файлове
   - .htaccess с реални credentials
   - uploads/ директория с лични файлове
   - backups/ с реални данни

### 🛡️ Best Practices

- ✅ Използвайте силни, произволни пароли
- ✅ Генерирайте JWT_SECRET с поне 32 символа
- ✅ Сменете всички default passwords
- ✅ Включете .env и .htaccess в .gitignore
- ✅ Не споделяйте credentials в Slack/Discord/Email

### 🔑 Генериране на сигурен JWT_SECRET

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 📚 Допълнителни ресурси

- [OWASP Security Best Practices](https://owasp.org/)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**⚠️ Ако случайно commit-нете чувствителна информация:**

1. Сменете ВСИЧКИ credentials веднага
2. Използвайте `git-filter-repo` или `BFG Repo-Cleaner` за изчистване на историята
3. Force push на почистения repository
4. Ротирайте всички API keys, passwords и tokens
