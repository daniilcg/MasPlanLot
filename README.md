# MasPlanLot — маркетинговый сайт

Отдельный статический лендинг. **Не связан** с CRM/CAD приложением (Next.js).

## Запуск локально

```bash
npm run site:dev
```

Откройте **http://localhost:8080**

## Структура

```
site/
  index.html      — страница
  css/styles.css  — стили
  js/main.js      — конфиг, табы, меню
  assets/         — иконки и скриншоты
```

## Настройка

В `js/main.js`:

- `APP_URL` — адрес CRM-приложения (`http://localhost:3000` или продакшен)
- `CRM_DOWNLOAD` / `CAD_DOWNLOAD` — ссылки на .exe

## Деплой

Загрузите содержимое папки `site/` на любой статический хостинг (GitHub Pages, Netlify, nginx).

CRM приложение: `npm run dev` → http://localhost:3000 → сразу `/login`
