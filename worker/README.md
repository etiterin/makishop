# Cloudflare Backend (Robokassa + D1)

## Что реализовано
- `POST /api/checkout/create` — создает заказ в D1, пересчитывает сумму по каталогу и отдает ссылку на оплату Robokassa.
- `POST|GET /api/checkout/result` — webhook от Robokassa, проверка подписи и обновление статуса заказа.
- `GET /api/checkout/status?id=...&token=...` — статус заказа для фронта.
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

Для локальной разработки можно использовать `.dev.vars`.

## 4. Переключить режим на уже задеплоенном воркере
```bash
# тестовый режим
printf "test" | npx wrangler secret put ROBO_MODE

# боевой режим
printf "live" | npx wrangler secret put ROBO_MODE
```

## 5. Запуск локально
```bash
npm run worker:dev
```

## 6. Деплой
```bash
npm run worker:deploy
```
