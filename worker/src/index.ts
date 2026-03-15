import { md5 } from "@noble/hashes/legacy.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import productsData from "../../src/app/data/products.json";

type Env = {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
  ROBO_MODE?: string;
  ROBO_TEST_MODE?: string;
  ROBO_MERCHANT_LOGIN?: string;
  ROBO_MERCHANT_LOGIN_TEST?: string;
  ROBO_MERCHANT_LOGIN_LIVE?: string;
  ROBO_PASS1?: string;
  ROBO_PASS2?: string;
  ROBO_PASS1_TEST?: string;
  ROBO_PASS2_TEST?: string;
  ROBO_PASS1_LIVE?: string;
  ROBO_PASS2_LIVE?: string;
  ROBO_SUCCESS_URL?: string;
  ROBO_FAIL_URL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  RESEND_REPLY_TO?: string;
  ORDERS_NOTIFICATION_EMAIL?: string;
};

type CreateCheckoutItem = {
  id: number;
  quantity: number;
};

type CreateCheckoutPayload = {
  items: CreateCheckoutItem[];
  customer?: {
    email?: string;
    name?: string;
    contact?: string;
    comment?: string;
    deliveryMode?: string;
  };
};

type CatalogProduct = {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
};

type RoboMode = "test" | "live";

type RoboConfig = {
  mode: RoboMode;
  isTest: boolean;
  merchantLogin: string;
  pass1: string;
  pass2: string;
};

type DbOrder = {
  id: string;
  status: string;
  amount_kopecks: number;
  payment_mode: string | null;
};

type OrderEmailData = {
  id: string;
  inv_id: number;
  amount_rub: string;
  items_json: string;
  customer_json: string | null;
  email_sent_at: string | null;
};

type OrderCustomer = {
  email?: string;
  name?: string;
  contact?: string;
  comment?: string;
  deliveryMode?: string;
};

type OrderLineItem = {
  name: string;
  quantity: number;
  price: number;
};

const catalog = new Map<number, CatalogProduct>(
  (productsData.products as CatalogProduct[]).map((product) => [product.id, product]),
);

function md5Hex(value: string): string {
  return bytesToHex(md5(new TextEncoder().encode(value)));
}

function nowIso(): string {
  return new Date().toISOString();
}

function toKopecks(amountRub: number): number {
  return Math.round(amountRub * 100);
}

function parseAmountToKopecks(amount: string): number {
  const normalized = Number(amount.replace(",", "."));
  if (!Number.isFinite(normalized) || normalized <= 0) return 0;
  return Math.round(normalized * 100);
}

function formatAmountFromKopecks(kopecks: number): string {
  return (kopecks / 100).toFixed(2);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseJsonObject<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed;
  } catch {
    return null;
  }
}

function parseCustomer(raw: string | null): OrderCustomer | null {
  const parsed = parseJsonObject<Partial<OrderCustomer>>(raw);
  if (!parsed || typeof parsed !== "object") return null;

  return {
    email: typeof parsed.email === "string" ? parsed.email : undefined,
    name: typeof parsed.name === "string" ? parsed.name : undefined,
    contact: typeof parsed.contact === "string" ? parsed.contact : undefined,
    comment: typeof parsed.comment === "string" ? parsed.comment : undefined,
    deliveryMode: typeof parsed.deliveryMode === "string" ? parsed.deliveryMode : undefined,
  };
}

function parseOrderItems(raw: string): OrderLineItem[] {
  const parsed = parseJsonObject<Array<Partial<OrderLineItem>>>(raw);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => ({
      name: typeof item.name === "string" ? item.name : "",
      quantity: Number(item.quantity ?? 0),
      price: Number(item.price ?? 0),
    }))
    .filter((item) => item.name && Number.isFinite(item.quantity) && item.quantity > 0 && Number.isFinite(item.price) && item.price >= 0);
}

function formatDeliveryMode(mode: string | undefined): string {
  if (!mode) return "Уточняется";
  if (mode === "manual_confirmation") return "Уточнение после оплаты";
  if (mode === "russian_post") return "Почта России";
  if (mode === "cdek") return "СДЭК";
  return mode;
}

function parseStoredMode(value: string | null | undefined): RoboMode | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "test") return "test";
  if (normalized === "live") return "live";
  return null;
}

function normalizeRoboMode(value: string | undefined): RoboMode {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (["live", "prod", "production", "0", "false"].includes(normalized)) {
    return "live";
  }
  return "test";
}

function getActiveRoboMode(env: Env): RoboMode {
  if (env.ROBO_MODE) {
    return normalizeRoboMode(env.ROBO_MODE);
  }

  if (typeof env.ROBO_TEST_MODE === "string" && env.ROBO_TEST_MODE.length > 0) {
    return normalizeRoboMode(env.ROBO_TEST_MODE === "1" ? "test" : env.ROBO_TEST_MODE);
  }

  // Без явной конфигурации остаемся в тестовом режиме по умолчанию.
  return "test";
}

function resolveRoboConfig(env: Env, mode: RoboMode): RoboConfig | null {
  const merchantLogin = mode === "test"
    ? (env.ROBO_MERCHANT_LOGIN_TEST ?? env.ROBO_MERCHANT_LOGIN ?? "")
    : (env.ROBO_MERCHANT_LOGIN_LIVE ?? env.ROBO_MERCHANT_LOGIN ?? "");

  const pass1 = mode === "test"
    ? (env.ROBO_PASS1_TEST ?? env.ROBO_PASS1 ?? "")
    : (env.ROBO_PASS1_LIVE ?? env.ROBO_PASS1 ?? "");

  const pass2 = mode === "test"
    ? (env.ROBO_PASS2_TEST ?? env.ROBO_PASS2 ?? "")
    : (env.ROBO_PASS2_LIVE ?? env.ROBO_PASS2 ?? "");

  if (!merchantLogin || !pass1 || !pass2) {
    return null;
  }

  return {
    mode,
    isTest: mode === "test",
    merchantLogin,
    pass1,
    pass2,
  };
}

function getFallbackMode(mode: RoboMode): RoboMode {
  return mode === "test" ? "live" : "test";
}

function getResultVerificationConfigs(env: Env, storedMode: string | null | undefined): RoboConfig[] {
  const modes: RoboMode[] = [];
  const stored = parseStoredMode(storedMode);
  const active = getActiveRoboMode(env);

  if (stored) {
    modes.push(stored);
  }
  modes.push(active);
  modes.push(getFallbackMode(active));

  const uniqueModes = Array.from(new Set(modes));
  const configs = uniqueModes
    .map((mode) => resolveRoboConfig(env, mode))
    .filter((config): config is RoboConfig => Boolean(config));

  return configs;
}

function buildShpSignatureTail(params: URLSearchParams): string {
  const shpEntries = Array.from(params.entries())
    .filter(([key]) => key.toLowerCase().startsWith("shp_"))
    .sort(([a], [b]) => a.localeCompare(b));

  if (shpEntries.length === 0) {
    return "";
  }

  return shpEntries.map(([key, value]) => `:${key}=${value}`).join("");
}

function isMissingColumnError(error: unknown, columnName: string): boolean {
  const message = String((error as Error)?.message ?? error).toLowerCase();
  const normalizedColumn = columnName.toLowerCase();
  return message.includes(`no such column: ${normalizedColumn}`)
    || message.includes(`has no column named ${normalizedColumn}`);
}

async function loadOrderByInvId(env: Env, invId: number): Promise<DbOrder | null> {
  try {
    return await env.DB.prepare(
      "SELECT id, status, amount_kopecks, payment_mode FROM orders WHERE inv_id = ? LIMIT 1",
    )
      .bind(invId)
      .first<DbOrder>();
  } catch (error) {
    if (!isMissingColumnError(error, "payment_mode")) {
      throw error;
    }

    const legacyOrder = await env.DB.prepare(
      "SELECT id, status, amount_kopecks FROM orders WHERE inv_id = ? LIMIT 1",
    )
      .bind(invId)
      .first<{ id: string; status: string; amount_kopecks: number }>();

    if (!legacyOrder) {
      return null;
    }

    return {
      ...legacyOrder,
      payment_mode: null,
    };
  }
}

async function markOrderPaid(env: Env, orderId: string, paymentMode: RoboMode): Promise<void> {
  const now = nowIso();

  try {
    await env.DB.prepare(
      "UPDATE orders SET status = 'paid', payment_mode = COALESCE(payment_mode, ?), paid_at = ?, updated_at = ? WHERE id = ?",
    )
      .bind(paymentMode, now, now, orderId)
      .run();
  } catch (error) {
    if (!isMissingColumnError(error, "payment_mode")) {
      throw error;
    }

    await env.DB.prepare(
      "UPDATE orders SET status = 'paid', paid_at = ?, updated_at = ? WHERE id = ?",
    )
      .bind(now, now, orderId)
      .run();
  }
}

async function loadOrderEmailData(env: Env, invId: number): Promise<OrderEmailData | null> {
  try {
    return await env.DB.prepare(
      "SELECT id, inv_id, amount_rub, items_json, customer_json, email_sent_at FROM orders WHERE inv_id = ? LIMIT 1",
    )
      .bind(invId)
      .first<OrderEmailData>();
  } catch (error) {
    if (!isMissingColumnError(error, "email_sent_at")) {
      throw error;
    }

    const legacyOrder = await env.DB.prepare(
      "SELECT id, inv_id, amount_rub, items_json, customer_json FROM orders WHERE inv_id = ? LIMIT 1",
    )
      .bind(invId)
      .first<{
        id: string;
        inv_id: number;
        amount_rub: string;
        items_json: string;
        customer_json: string | null;
      }>();

    if (!legacyOrder) {
      return null;
    }

    return {
      ...legacyOrder,
      email_sent_at: null,
    };
  }
}

async function markOrderEmailSent(env: Env, orderId: string): Promise<void> {
  const now = nowIso();
  try {
    await env.DB.prepare(
      "UPDATE orders SET email_sent_at = ?, updated_at = ? WHERE id = ?",
    )
      .bind(now, now, orderId)
      .run();
  } catch (error) {
    if (isMissingColumnError(error, "email_sent_at")) {
      return;
    }
    throw error;
  }
}

async function sendOrderPaidEmail(env: Env, order: OrderEmailData): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.RESEND_FROM?.trim();
  if (!apiKey || !from) {
    return false;
  }

  const customer = parseCustomer(order.customer_json);
  const customerEmail = customer?.email?.trim().toLowerCase() ?? "";
  if (!isValidEmail(customerEmail)) {
    return false;
  }

  const items = parseOrderItems(order.items_json);
  const itemsLines = items.length > 0
    ? items.map((item) => `- ${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(0)} ₽`).join("\n")
    : "- Состав заказа уточняется";

  const textParts = [
    `Оплата заказа #${order.inv_id} подтверждена.`,
    "",
    "Состав заказа:",
    itemsLines,
    "",
    `Итого: ${order.amount_rub} ₽`,
    `Доставка: ${formatDeliveryMode(customer?.deliveryMode)}`,
  ];

  if (customer?.name) {
    textParts.push(`Имя: ${customer.name}`);
  }
  if (customer?.contact) {
    textParts.push(`Контакт: ${customer.contact}`);
  }
  if (customer?.comment) {
    textParts.push(`Комментарий: ${customer.comment}`);
  }

  textParts.push("", "Спасибо за заказ!");

  const bcc = env.ORDERS_NOTIFICATION_EMAIL?.trim();
  const payload = {
    from,
    to: [customerEmail],
    bcc: bcc ? [bcc] : undefined,
    reply_to: env.RESEND_REPLY_TO?.trim() || undefined,
    subject: `Заказ #${order.inv_id}: оплата получена`,
    text: textParts.join("\n"),
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error("Resend send failed", response.status, await response.text());
    return false;
  }

  return true;
}

function buildCorsHeaders(request: Request, env: Env): Headers {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = [
    env.ALLOWED_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter(Boolean) as string[];

  const allowOrigin = allowedOrigins.includes(origin)
    ? origin
    : (env.ALLOWED_ORIGIN || "http://localhost:5173");

  return new Headers({
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  });
}

function jsonResponse(request: Request, env: Env, body: unknown, status = 200): Response {
  const headers = buildCorsHeaders(request, env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

function textResponse(request: Request, env: Env, body: string, status = 200): Response {
  const headers = buildCorsHeaders(request, env);
  headers.set("Content-Type", "text/plain; charset=utf-8");
  return new Response(body, { status, headers });
}

function badRequest(request: Request, env: Env, message: string): Response {
  return jsonResponse(request, env, { error: message }, 400);
}

function generateStatusToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function generateInvId(): number {
  const timePart = Number(String(Date.now()).slice(-8));
  const randomPart = Math.floor(Math.random() * 900) + 100;
  return Number(`${timePart}${randomPart}`);
}

async function handleCreateCheckout(request: Request, env: Env): Promise<Response> {
  let payload: CreateCheckoutPayload;
  try {
    payload = await request.json<CreateCheckoutPayload>();
  } catch {
    return badRequest(request, env, "Некорректный JSON");
  }

  if (!payload?.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    return badRequest(request, env, "Корзина пуста");
  }

  const normalizedEmail = payload.customer?.email?.trim().toLowerCase() ?? "";
  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return badRequest(request, env, "Укажите корректный email для отправки чека");
  }

  const normalizedCustomer = {
    email: normalizedEmail,
    name: payload.customer?.name?.trim() || undefined,
    contact: payload.customer?.contact?.trim() || undefined,
    comment: payload.customer?.comment?.trim() || undefined,
    deliveryMode: payload.customer?.deliveryMode?.trim() || undefined,
  };

  const paymentMode = getActiveRoboMode(env);
  const roboConfig = resolveRoboConfig(env, paymentMode);
  if (!roboConfig) {
    return jsonResponse(
      request,
      env,
      { error: `Не настроены учетные данные Robokassa для режима ${paymentMode}` },
      500,
    );
  }

  const merged = new Map<number, number>();
  for (const item of payload.items) {
    if (!Number.isInteger(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      return badRequest(request, env, "Некорректные позиции корзины");
    }
    merged.set(item.id, (merged.get(item.id) ?? 0) + item.quantity);
  }

  const lineItems: Array<{ id: number; name: string; quantity: number; price: number; lineKopecks: number }> = [];
  let totalKopecks = 0;

  for (const [id, quantity] of merged.entries()) {
    const product = catalog.get(id);
    if (!product) {
      return badRequest(request, env, `Товар с id=${id} не найден`);
    }
    if (!product.inStock) {
      return jsonResponse(request, env, { error: `Товар "${product.name}" сейчас не в наличии` }, 409);
    }
    const lineKopecks = toKopecks(product.price) * quantity;
    totalKopecks += lineKopecks;
    lineItems.push({
      id,
      name: product.name,
      quantity,
      price: product.price,
      lineKopecks,
    });
  }

  if (totalKopecks <= 0) {
    return badRequest(request, env, "Сумма заказа должна быть больше нуля");
  }

  const orderId = crypto.randomUUID().replace(/-/g, "");
  const statusToken = generateStatusToken();
  const createdAt = nowIso();
  const amountRub = formatAmountFromKopecks(totalKopecks);

  let invId = 0;
  let inserted = false;
  let useLegacySchema = false;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    invId = generateInvId();
    try {
      if (!useLegacySchema) {
        await env.DB.prepare(
          `INSERT INTO orders (id, inv_id, status, payment_mode, amount_kopecks, amount_rub, items_json, customer_json, status_token, created_at, updated_at)
           VALUES (?, ?, 'pending_payment', ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            orderId,
            invId,
            paymentMode,
            totalKopecks,
            amountRub,
            JSON.stringify(lineItems),
            JSON.stringify(normalizedCustomer),
            statusToken,
            createdAt,
            createdAt,
          )
          .run();
      } else {
        await env.DB.prepare(
          `INSERT INTO orders (id, inv_id, status, amount_kopecks, amount_rub, items_json, customer_json, status_token, created_at, updated_at)
           VALUES (?, ?, 'pending_payment', ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            orderId,
            invId,
            totalKopecks,
            amountRub,
            JSON.stringify(lineItems),
            JSON.stringify(normalizedCustomer),
            statusToken,
            createdAt,
            createdAt,
          )
          .run();
      }

      inserted = true;
      break;
    } catch (error) {
      if (!useLegacySchema && isMissingColumnError(error, "payment_mode")) {
        useLegacySchema = true;
        attempt -= 1;
        continue;
      }

      lastError = error;
    }
  }

  if (!inserted) {
    console.error("Failed to create order", lastError);
    return jsonResponse(request, env, { error: "Не удалось создать заказ, попробуйте еще раз" }, 500);
  }

  const signature = md5Hex(
    `${roboConfig.merchantLogin}:${amountRub}:${invId}:${roboConfig.pass1}`,
  );

  const paymentParams = new URLSearchParams({
    MerchantLogin: roboConfig.merchantLogin,
    OutSum: amountRub,
    InvId: String(invId),
    Description: `Оплата заказа ${orderId.slice(0, 8)}`,
    SignatureValue: signature,
    Culture: "ru",
  });

  if (roboConfig.isTest) {
    paymentParams.set("IsTest", "1");
  }
  paymentParams.set("Email", normalizedEmail);
  if (env.ROBO_SUCCESS_URL) {
    paymentParams.set("SuccessURL", env.ROBO_SUCCESS_URL);
  }
  if (env.ROBO_FAIL_URL) {
    paymentParams.set("FailURL", env.ROBO_FAIL_URL);
  }

  return jsonResponse(request, env, {
    orderId,
    invId,
    statusToken,
    amountRub,
    paymentMode: roboConfig.mode,
    paymentUrl: `https://auth.robokassa.ru/Merchant/Index.aspx?${paymentParams.toString()}`,
  });
}

async function readRobokassaParams(request: Request): Promise<URLSearchParams> {
  if (request.method === "GET") {
    return new URL(request.url).searchParams;
  }

  const contentType = request.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      params.set(key, String(value));
    }
    return params;
  }

  return new URL(request.url).searchParams;
}

async function handleResult(request: Request, env: Env, executionContext: ExecutionContext): Promise<Response> {
  const params = await readRobokassaParams(request);
  const outSum = params.get("OutSum");
  const invIdRaw = params.get("InvId");
  const signatureRaw = params.get("SignatureValue");

  if (!outSum || !invIdRaw || !signatureRaw) {
    return textResponse(request, env, "Missing params", 400);
  }

  const invId = Number(invIdRaw);
  if (!Number.isInteger(invId)) {
    return textResponse(request, env, "Bad InvId", 400);
  }

  const order = await loadOrderByInvId(env, invId);
  if (!order) {
    return textResponse(request, env, "Order not found", 404);
  }

  const verificationConfigs = getResultVerificationConfigs(env, order.payment_mode);
  if (verificationConfigs.length === 0) {
    return textResponse(request, env, "Payment config missing", 500);
  }

  const shpTail = buildShpSignatureTail(params);
  const matchedConfig = verificationConfigs.find((config) => {
    const expected = md5Hex(`${outSum}:${invIdRaw}:${config.pass2}${shpTail}`).toLowerCase();
    return expected === signatureRaw.toLowerCase();
  });

  if (!matchedConfig) {
    return textResponse(request, env, "Bad signature", 400);
  }

  const amountKopecks = parseAmountToKopecks(outSum);
  if (amountKopecks !== order.amount_kopecks) {
    return textResponse(request, env, "Amount mismatch", 400);
  }

  if (order.status !== "paid") {
    await markOrderPaid(env, order.id, matchedConfig.mode);
  }

  executionContext.waitUntil((async () => {
    try {
      const orderEmailData = await loadOrderEmailData(env, invId);
      if (!orderEmailData || orderEmailData.email_sent_at) {
        return;
      }

      const sent = await sendOrderPaidEmail(env, orderEmailData);
      if (sent) {
        await markOrderEmailSent(env, orderEmailData.id);
      }
    } catch (error) {
      console.error("Failed to send order email", error);
    }
  })());

  return textResponse(request, env, `OK${invIdRaw}`);
}

async function handleStatus(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("id");
  const token = url.searchParams.get("token");

  if (!orderId || !token) {
    return badRequest(request, env, "id и token обязательны");
  }

  const order = await env.DB.prepare(
    "SELECT id, inv_id, status, amount_rub, items_json, created_at, paid_at FROM orders WHERE id = ? AND status_token = ? LIMIT 1",
  )
    .bind(orderId, token)
    .first<{
      id: string;
      inv_id: number;
      status: string;
      amount_rub: string;
      items_json: string;
      created_at: string;
      paid_at: string | null;
    }>();

  if (!order) {
    return jsonResponse(request, env, { error: "Заказ не найден" }, 404);
  }

  const items = parseOrderItems(order.items_json).map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    lineTotal: Number((item.price * item.quantity).toFixed(2)),
  }));

  return jsonResponse(request, env, {
    id: order.id,
    invId: order.inv_id,
    status: order.status,
    amountRub: order.amount_rub,
    items,
    createdAt: order.created_at,
    paidAt: order.paid_at,
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: buildCorsHeaders(request, env), status: 204 });
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return jsonResponse(request, env, { ok: true, paymentMode: getActiveRoboMode(env) });
    }

    if (url.pathname === "/api/checkout/create" && request.method === "POST") {
      return handleCreateCheckout(request, env);
    }

    if (url.pathname === "/api/checkout/result" && (request.method === "POST" || request.method === "GET")) {
      return handleResult(request, env, ctx);
    }

    if (url.pathname === "/api/checkout/status" && request.method === "GET") {
      return handleStatus(request, env);
    }

    return jsonResponse(request, env, { error: "Not found" }, 404);
  },
};
