# Cloudflare Backend (Robokassa + D1)

## Что реализовано
- `POST /api/delivery/quotes` — расчет вариантов доставки (СДЭК/Почта России) по индексу и корзине.
- `POST /api/checkout/create` — создает заказ в D1, пересчитывает сумму по каталогу и отдает ссылку на оплату Robokassa.
- `POST|GET /api/checkout/result` — webhook от Robokassa, проверка подписи и обновление статуса заказа.
- `GET /api/checkout/status?id=...&token=...` — статус заказа для фронта.
- `GET /api/orders/track?id=...&token=...` — публичный трекинг заказа по персональной ссылке.
- `POST /api/admin/orders/status` — смена трекинг-статуса заказа (с `Authorization: Bearer <ADMIN_STATUS_API_KEY>`).
- `POST /api/telegram/webhook/<secret>` — webhook Telegram-бота для уведомлений и команд `/order`, `/status`.
- `GET /api/health` — health check.

## Режимы оплаты (test/live)
Переключение делается через `ROBO_MODE`:
- `test` — используются тестовые пароли и к ссылке оплаты добавляется `IsTest=1`.
- `live` — боевой режим без `IsTest`.

Рекомендуемые переменные:
- `ROBO_MODE`
- `ROBO_MERCHANT_LOGIN`
- `ROBO_PASS1_TEST`, `ROBO_PASS2_TEST`
- `ROBO_PASS1_LIVE`, `ROBO_PASS2_LIVE`

Поддерживается fallback для старых переменных:
- `ROBO_PASS1`, `ROBO_PASS2`
- `ROBO_TEST_MODE` (`1` => `test`, иначе `live`)

## 1. Создать D1 базу
```bash
npx wrangler d1 create makishop_orders
```

Скопируйте `database_id` в `wrangler.toml` (`database_id = "..."`).

## 2. Применить миграции
```bash
npx wrangler d1 migrations apply makishop_orders --local
npx wrangler d1 migrations apply makishop_orders --remote
```

## 3. Настроить секреты
```bash
npx wrangler secret put ROBO_MERCHANT_LOGIN
npx wrangler secret put ROBO_PASS1_TEST
npx wrangler secret put ROBO_PASS2_TEST
npx wrangler secret put ROBO_PASS1_LIVE
npx wrangler secret put ROBO_PASS2_LIVE
npx wrangler secret put ROBO_MODE
```

Опционально:
- `ALLOWED_ORIGIN` = `https://makinari.art`
- `ROBO_SUCCESS_URL` = `https://makinari.art/payment/success`
- `ROBO_FAIL_URL` = `https://makinari.art/payment/fail`
- `TRACK_BASE_URL` = `https://makinari.art` (база для трекинг-ссылки в письме)
- `ADMIN_STATUS_API_KEY` = секрет для защищенного API смены статусов
- `CDEK_ORIGIN_POSTAL_CODE` = индекс отправления для расчетов СДЭК (например, `101000`)
- `POST_ORIGIN_POSTAL_CODE` = индекс отправления для расчетов Почты России (например, `101000`)
- `TELEGRAM_BOT_TOKEN` = токен бота от BotFather
- `TELEGRAM_ADMIN_CHAT_IDS` = список chat_id админов через запятую
- `TELEGRAM_GROUP_ID` = chat_id группы для уведомлений (опционально)
- `TELEGRAM_WEBHOOK_SECRET` = произвольный секрет в URL webhook (рекомендуется)
- `RESEND_API_KEY` = API-ключ Resend (`re_...`)
- `RESEND_FROM` = адрес отправителя, например `orders@mail.makinari.art`
- `RESEND_REPLY_TO` = адрес для ответов, например `orders@makinari.art`
- `ORDERS_NOTIFICATION_EMAIL` = копия письма о заказе вам на почту

Для локальной разработки можно использовать `.dev.vars`.

## 4. Telegram webhook
После деплоя воркера поставьте webhook:
```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  --data '{"url":"https://makishop-api.icemage-bk.workers.dev/api/telegram/webhook/<TELEGRAM_WEBHOOK_SECRET>"}'
```

Проверка:
```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

Команды для админов в Telegram:
- `/help`
- `/order <id|invId>`
- `/status <id|invId> <pending_payment|paid|processing|shipped|delivered|completed|canceled>`

## 5. Переключить режим на уже задеплоенном воркере
```bash
# тестовый режим
printf "test" | npx wrangler secret put ROBO_MODE

# боевой режим
printf "live" | npx wrangler secret put ROBO_MODE
```

## 6. Запуск локально
```bash
npm run worker:dev
```

## 7. Деплой
```bash
npm run worker:deploy
```
