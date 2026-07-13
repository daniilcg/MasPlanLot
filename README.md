# MasPlanLot — маркетинговый сайт

Отдельный статический лендинг. **Не связан** с CRM-приложением (Next.js).

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

- `js/config.js` — генерируется: `node scripts/sync-marketing-config.js`
- `APP_URL` в config — адрес CRM-приложения
- Ссылки на CRM .exe / .dmg — в `DOWNLOADS.crm`

## Деплой

Загрузите содержимое папки `site/` на любой статический хостинг (GitHub Pages, Netlify, nginx).

CRM приложение: `npm run dev` → http://localhost:3000 → сразу `/login`
