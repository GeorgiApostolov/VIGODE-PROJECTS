# 📝 GIT COMMIT CHECKLIST

## Преди всеки commit проверете:

### ✅ Файлове за изключване

- [ ] `.env` файлове НЕ са добавени
- [ ] `.htaccess` с реални credentials НЕ е добавен
- [ ] `uploads/` директория НЕ е добавена
- [ ] `backups/` директория НЕ е добавена
- [ ] `node_modules/` НЕ е добавен
- [ ] Лични снимки и файлове НЕ са добавени

### ✅ Code review

- [ ] Няма hardcoded passwords в кода
- [ ] Няма hardcoded API keys
- [ ] Няма MongoDB connection strings
- [ ] Няма email passwords
- [ ] Няма JWT secrets

### 📋 Команди за проверка

```bash
# Проверка какво ще се commit-не
git status

# Виж съдържанието на файловете
git diff --cached

# Проверка за чувствителна информация
grep -r "password.*=" --include="*.js" --include="*.ts"
grep -r "secret.*=" --include="*.js" --include="*.ts"
grep -r "mongodb://" --include="*.js" --include="*.ts"
```

### 🚫 Ако сте добавили грешен файл

```bash
# Премахни файл от staging area
git reset HEAD path/to/file

# Или премахни всички
git reset HEAD .
```

### ✅ Safe commit flow

```bash
# 1. Провери статуса
git status

# 2. Добави само нужните файлове (не използвай git add .)
git add src/components/MyComponent.tsx
git add src/pages/MyPage.tsx

# 3. Провери отново
git status
git diff --cached

# 4. Commit
git commit -m "feat: Add new component"

# 5. Push
git push
```

## ⚠️ НИКОГА не правете:

```bash
# ОПАСНО - добавя ВСИЧКИ файлове включително .env
git add .
git add -A
git add --all

# Винаги използвайте .gitignore или добавяйте файлове поотделно
```

## 🔥 Emergency: Премахване на чувствителна информация

Ако сте commit-нали чувствителна информация:

1. **ВЕДНАГА сменете credentials**
2. **Премахнете от Git история:**

```bash
# Инсталирайте BFG Repo-Cleaner
brew install bfg

# Премахнете файл от историята
bfg --delete-files .env
bfg --delete-files .htaccess

# Или премахнете текст/password
bfg --replace-text passwords.txt

# Почистете
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (ВНИМАНИЕ: ще презапише историята)
git push --force
```

## 📚 Полезни ресурси

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Git-filter-repo](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
