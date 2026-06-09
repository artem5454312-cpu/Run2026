# Kawaii Run Tracker

Милое PWA-friendly веб-приложение в стиле pixel-art / retro Tamagotchi для подготовки к забегу 20 июня.

## Что внутри

- Vite + React + TypeScript
- Tailwind CSS
- Framer Motion
- localStorage без бэкенда и базы данных
- вход пользователя по PIN
- админ-вход по логину/паролю
- создание профилей в админ-панели
- PIN профилей не показывается в интерфейсе, только маскируется точками
- план тренировок на 2 недели
- отметки выполненных дней
- ввод времени и дистанции после бега
- авторасчёт темпа мин/км
- мини-график динамики темпа
- PWA manifest + простой service worker
- Express-сервер для Railway, который раздаёт `dist` и слушает `process.env.PORT`

## Админ-доступ для теста

```text
Логин: admin_luna_26
Пароль: RunPixel!620
```

Важно: это приложение без бэкенда. Для быстрого теста логин/пароль проверяются на клиенте, поэтому в production с реальной защитой их нужно вынести на сервер.

## Локальный запуск

```bash
npm install
npm run dev
```

Открой адрес из терминала, обычно:

```bash
http://localhost:5173
```

## Production build локально

```bash
npm run build
npm run start
```

После этого приложение будет доступно на:

```bash
http://localhost:3000
```

## Как пользоваться

1. На стартовом экране пользователь вводит свой PIN.
2. Если профиля ещё нет, нажми `вход для админа`.
3. Войди в админку по логину/паролю из раздела выше.
4. Создай профиль: имя + PIN.
5. После этого человек заходит по PIN, а имя сразу отображается на платформе.
6. На главной отображается имя активного профиля, прогресс, средний темп и дни до забега.
7. В плане тренировок отмечай дни и вводи дистанцию/время после беговой тренировки.

## Как залить на GitHub

### Вариант через терминал

1. Создай новый пустой репозиторий на GitHub.
2. В терминале открой папку проекта:

```bash
cd kawaii-run-tracker
```

3. Инициализируй git:

```bash
git init
git add .
git commit -m "Initial kawaii run tracker"
```

4. Подключи свой GitHub-репозиторий:

```bash
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

Замени `USERNAME` и `REPOSITORY` на свои значения.

### Вариант через GitHub Desktop

1. Открой GitHub Desktop.
2. Нажми `File` → `Add local repository`.
3. Выбери папку `kawaii-run-tracker`.
4. Нажми `Publish repository`.

## Как задеплоить на Railway

1. Зайди на Railway.
2. Нажми `New Project`.
3. Выбери `Deploy from GitHub repo`.
4. Подключи репозиторий с этим проектом.
5. Railway увидит `railway.json`.
6. Build command: `npm install && npm run build`.
7. Start command: `npm run start`.
8. После деплоя открой домен Railway.

## Важные файлы для Railway

### `railway.json`

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### `server.js`

Express раздаёт папку `dist`, а порт берёт из `process.env.PORT`:

```js
const port = process.env.PORT || 3000;
```

## Структура

```text
kawaii-run-tracker/
  public/
    manifest.webmanifest
    pwa-icon.svg
    service-worker.js
  src/
    data/
      trainingPlan.ts
    hooks/
      useLocalStorage.ts
    lib/
      metrics.ts
      storage.ts
    App.tsx
    index.css
    main.tsx
    types.ts
    vite-env.d.ts
  .gitignore
  index.html
  package.json
  postcss.config.cjs
  railway.json
  README.md
  server.js
  tailwind.config.cjs
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
```

## Что можно быстро поменять

- Админ-логин и пароль: `src/App.tsx`, константы `ADMIN_LOGIN` и `ADMIN_PASSWORD`.
- Дата забега: `src/data/trainingPlan.ts`, константа `TARGET_RACE_DATE`.
- План тренировок: `src/data/trainingPlan.ts`, массив `trainingPlan`.
- Цвета и пиксельный стиль: `src/index.css` и `tailwind.config.cjs`.

## Railway quick fix

The included `railway.json` uses separate commands:

- Build command: `npm run build`
- Start command: `npm run start`

If Railway dashboard has custom commands set, do not set Build and Start to the same value. Clear the dashboard overrides or use the exact values above.


## Railway fix note

Все build-инструменты (`vite`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `@vitejs/plugin-react`) перенесены в `dependencies`, потому что Railway иногда ставит только production-зависимости. Поэтому сборка не падает с ошибкой `tsc: not found` / `vite: not found`.

В Railway должны стоять команды:

```bash
Build Command: npm run build
Start Command: npm run start
```

Не ставь `npm install && npm run build` в Start Command и не ставь одинаковые команды в Build/Start.
