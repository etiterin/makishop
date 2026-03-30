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
  ROBO_RECEIPT_TAX?: string;
  TRACK_BASE_URL?: string;
  ADMIN_STATUS_API_KEY?: string;
  TELEGRAM_BOT_TOKEN?: string;
  BOT_TOKEN?: string;
  TELEGRAM_ADMIN_CHAT_IDS?: string;
  ADMIN_CHAT_IDS?: string;
  TELEGRAM_GROUP_ID?: string;
  GROUP_ID?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  RESEND_REPLY_TO?: string;
  ORDERS_NOTIFICATION_EMAIL?: string;
};

type CreateCheckoutItem = {
  id: number;
  quantity: number;
};

type DeliveryMode = "manual_confirmation" | "russian_post" | "cdek" | "ozon" | "yandex";
type DeliveryProvider = Exclude<DeliveryMode, "manual_confirmation">;

type DeliverySelectionPayload = {
  mode?: string;
  destinationCity?: string;
  destinationPostalCode?: string;
  destinationAddress?: string;
  optionCode?: string;
  optionLabel?: string;
  amountRub?: number;
  etaMinDays?: number;
  etaMaxDays?: number;
};

type CreateCheckoutPayload = {
  items: CreateCheckoutItem[];
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
    telegram?: string;
    contact?: string;
    comment?: string;
    deliveryMode?: DeliveryMode | string;
    delivery?: DeliverySelectionPayload;
  };
};

type DeliveryQuotePayload = {
  items: CreateCheckoutItem[];
  destination?: {
    city?: string;
    postalCode?: string;
  };
  providers?: Array<DeliveryProvider | string>;
};

type AdminUpdateStatusPayload = {
  orderId?: string;
  fulfillmentStatus?: string;
};

type TelegramUpdate = {
  update_id?: number;
  message?: {
    message_id?: number;
    text?: string;
    chat?: {
      id?: number | string;
      type?: string;
    };
    from?: {
      id?: number;
      username?: string;
    };
  };
  edited_message?: {
    message_id?: number;
    text?: string;
    chat?: {
      id?: number | string;
      type?: string;
    };
    from?: {
      id?: number;
      username?: string;
    };
  };
};

type OrderRecord = {
  id: string;
  inv_id: number;
  status: string;
  fulfillment_status: string | null;
  fulfillment_status_updated_at: string | null;
  amount_rub: string;
  items_json: string;
  customer_json: string | null;
  status_token: string;
  created_at: string;
  paid_at: string | null;
};

type CatalogProduct = {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  category?: string;
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

type FulfillmentStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "canceled";

type OrderEmailData = {
  id: string;
  inv_id: number;
  amount_rub: string;
  items_json: string;
  customer_json: string | null;
  status_token: string;
  email_sent_at: string | null;
};

type OrderCustomer = {
  email?: string;
  name?: string;
  phone?: string;
  telegram?: string;
  contact?: string;
  comment?: string;
  deliveryMode?: DeliveryMode | string;
  delivery?: OrderCustomerDelivery;
};

type OrderLineItem = {
  name: string;
  quantity: number;
  price: number;
};

type CheckoutLineItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  lineKopecks: number;
};

type OrderCustomerDelivery = {
  mode: DeliveryProvider;
  destinationCity?: string;
  destinationPostalCode?: string;
  destinationAddress?: string;
  optionCode: string;
  optionLabel: string;
  amountRub: number;
  etaMinDays: number;
  etaMaxDays: number;
};

type DeliveryQuoteOption = {
  mode: DeliveryProvider;
  optionCode: string;
  optionLabel: string;
  amountRub: number;
  etaMinDays: number;
  etaMaxDays: number;
};

type ShipmentMetrics = {
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  itemCount: number;
};

type ProductShippingProfile = {
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

type ReceiptTax = "none" | "vat0" | "vat10" | "vat110" | "vat20" | "vat22" | "vat120" | "vat122" | "vat5" | "vat7" | "vat105" | "vat107";

type RateLimitUpsertResult = {
  count: number;
  window_start: number;
};

const catalog = new Map<number, CatalogProduct>(
  (productsData.products as CatalogProduct[]).map((product) => [product.id, product]),
);

const DEFAULT_SHIPPING_PROFILE: ProductShippingProfile = {
  weightGrams: 180,
  lengthCm: 24,
  widthCm: 18,
  heightCm: 2,
};

const CATEGORY_SHIPPING_PROFILES: Record<string, ProductShippingProfile> = {
  sticker: { weightGrams: 60, lengthCm: 20, widthCm: 14, heightCm: 1 },
  keychain: { weightGrams: 90, lengthCm: 12, widthCm: 10, heightCm: 3 },
  set: { weightGrams: 260, lengthCm: 26, widthCm: 20, heightCm: 4 },
  print: { weightGrams: 120, lengthCm: 33, widthCm: 24, heightCm: 2 },
  textile: { weightGrams: 340, lengthCm: 30, widthCm: 25, heightCm: 6 },
  ribbon: { weightGrams: 120, lengthCm: 22, widthCm: 18, heightCm: 3 },
  badge: { weightGrams: 70, lengthCm: 10, widthCm: 10, heightCm: 2 },
  swap: { weightGrams: 110, lengthCm: 16, widthCm: 14, heightCm: 3 },
  other: { weightGrams: 200, lengthCm: 24, widthCm: 18, heightCm: 4 },
};

const FREE_DELIVERY_THRESHOLD_RUB = 1700;
const FIXED_DELIVERY_RATES_RUB: Record<Exclude<DeliveryProvider, "cdek">, number> = {
  russian_post: 400,
  ozon: 300,
  yandex: 300,
};
const DEFAULT_RECEIPT_TAX: ReceiptTax = "none";
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_RETENTION_SECONDS = 60 * 60 * 24;
const RATE_LIMITS = {
  checkoutCreate: 3,
  deliveryQuotes: 5,
  orderTrack: 7,
} as const;

function normalizeDeliveryMode(value: string | undefined): DeliveryMode {
  if (
    value === "cdek"
    || value === "russian_post"
    || value === "ozon"
    || value === "yandex"
    || value === "manual_confirmation"
  ) {
    return value;
  }
  return "manual_confirmation";
}

function isDeliveryProvider(value: string | undefined): value is DeliveryProvider {
  return value === "cdek" || value === "russian_post" || value === "ozon" || value === "yandex";
}

function sanitizeText(value: string | undefined, maxLength = 120): string | undefined {
  const normalized = value?.trim();
  if (!normalized) return undefined;
  return normalized.slice(0, maxLength);
}

function isValidRussianPostalCode(value: string | undefined): boolean {
  if (!value) return false;
  return /^\d{6}$/.test(value.trim());
}

function getShippingProfile(product: CatalogProduct): ProductShippingProfile {
  if (!product.category) {
    return DEFAULT_SHIPPING_PROFILE;
  }
  return CATEGORY_SHIPPING_PROFILES[product.category] ?? DEFAULT_SHIPPING_PROFILE;
}

function buildShipmentMetrics(mergedItems: Map<number, number>): ShipmentMetrics {
  let weightGrams = 0;
  let lengthCm = 0;
  let widthCm = 0;
  let heightCm = 0;
  let itemCount = 0;

  for (const [id, quantity] of mergedItems.entries()) {
    const product = catalog.get(id);
    if (!product) continue;
    const profile = getShippingProfile(product);
    itemCount += quantity;
    weightGrams += profile.weightGrams * quantity;
    lengthCm = Math.max(lengthCm, profile.lengthCm);
    widthCm = Math.max(widthCm, profile.widthCm);
    heightCm += profile.heightCm * quantity;
  }

  return {
    weightGrams: Math.max(100, weightGrams),
    lengthCm: Math.max(10, Math.min(60, lengthCm)),
    widthCm: Math.max(10, Math.min(60, widthCm)),
    heightCm: Math.max(2, Math.min(60, heightCm)),
    itemCount,
  };
}

function buildEstimatedQuotes(args: {
  destinationCity?: string;
  subtotalRub: number;
  providers: DeliveryProvider[];
}): DeliveryQuoteOption[] {
  const { destinationCity, providers, subtotalRub } = args;
  const uniqueProviders = Array.from(new Set(providers));
  const isFreeDelivery = subtotalRub >= FREE_DELIVERY_THRESHOLD_RUB;

  const options: DeliveryQuoteOption[] = [];

  if (uniqueProviders.includes("russian_post")) {
    options.push({
      mode: "russian_post",
      optionCode: "post_phone",
      optionLabel: destinationCity
        ? `Почта России, по номеру телефона (${destinationCity})`
        : "Почта России, по номеру телефона",
      amountRub: isFreeDelivery ? 0 : FIXED_DELIVERY_RATES_RUB.russian_post,
      etaMinDays: 4,
      etaMaxDays: 10,
    });
    options.push({
      mode: "russian_post",
      optionCode: "post_address",
      optionLabel: destinationCity
        ? `Почта России, по индексу и адресу (${destinationCity})`
        : "Почта России, по индексу и адресу",
      amountRub: isFreeDelivery ? 0 : FIXED_DELIVERY_RATES_RUB.russian_post,
      etaMinDays: 4,
      etaMaxDays: 10,
    });
  }

  if (uniqueProviders.includes("yandex")) {
    options.push({
      mode: "yandex",
      optionCode: "yandex_pickup",
      optionLabel: destinationCity
        ? `Яндекс Доставка, пункт выдачи (${destinationCity})`
        : "Яндекс Доставка, пункт выдачи",
      amountRub: isFreeDelivery ? 0 : FIXED_DELIVERY_RATES_RUB.yandex,
      etaMinDays: 2,
      etaMaxDays: 7,
    });
  }

  if (uniqueProviders.includes("ozon")) {
    options.push({
      mode: "ozon",
      optionCode: "ozon_pickup",
      optionLabel: destinationCity
        ? `Ozon Доставка, пункт выдачи (${destinationCity})`
        : "Ozon Доставка, пункт выдачи",
      amountRub: isFreeDelivery ? 0 : FIXED_DELIVERY_RATES_RUB.ozon,
      etaMinDays: 2,
      etaMaxDays: 7,
    });
  }

  return options;
}

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

function isLikelyPhone(value: string | undefined): boolean {
  if (!value) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10;
}

function normalizeReceiptTax(value: string | undefined): ReceiptTax {
  if (
    value === "none"
    || value === "vat0"
    || value === "vat10"
    || value === "vat110"
    || value === "vat20"
    || value === "vat22"
    || value === "vat120"
    || value === "vat122"
    || value === "vat5"
    || value === "vat7"
    || value === "vat105"
    || value === "vat107"
  ) {
    return value;
  }
  return DEFAULT_RECEIPT_TAX;
}

function sanitizeReceiptItemName(value: string): string {
  const normalized = value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.slice(0, 128) || "Товар";
}

function buildRobokassaReceipt(args: {
  lineItems: CheckoutLineItem[];
  delivery?: OrderCustomerDelivery;
  tax: ReceiptTax;
}): string {
  const { lineItems, delivery, tax } = args;
  const items: Array<{
    name: string;
    quantity: number;
    sum: number;
    tax: ReceiptTax;
    payment_method: "full_payment";
    payment_object: "commodity" | "service";
  }> = [];

  for (const line of lineItems) {
    if (line.lineKopecks <= 0 || line.quantity <= 0) continue;
    items.push({
      name: sanitizeReceiptItemName(line.name),
      quantity: line.quantity,
      sum: Number((line.lineKopecks / 100).toFixed(2)),
      tax,
      payment_method: "full_payment",
      payment_object: "commodity",
    });
  }

  if (delivery && delivery.amountRub > 0) {
    items.push({
      name: "Доставка",
      quantity: 1,
      sum: Number(delivery.amountRub.toFixed(2)),
      tax,
      payment_method: "full_payment",
      payment_object: "service",
    });
  }

  if (items.length === 0) {
    throw new Error("Receipt must contain at least one item");
  }

  return JSON.stringify({ items });
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

  const rawDelivery = parsed.delivery as Partial<OrderCustomerDelivery> | undefined;
  let delivery: OrderCustomerDelivery | undefined;
  if (rawDelivery && typeof rawDelivery === "object") {
    const mode = rawDelivery.mode;
    const optionCode = typeof rawDelivery.optionCode === "string" ? rawDelivery.optionCode : "";
    const optionLabel = typeof rawDelivery.optionLabel === "string" ? rawDelivery.optionLabel : "";
    const destinationPostalCodeRaw = typeof rawDelivery.destinationPostalCode === "string"
      ? rawDelivery.destinationPostalCode.trim()
      : "";
    const destinationPostalCode = isValidRussianPostalCode(destinationPostalCodeRaw)
      ? destinationPostalCodeRaw
      : undefined;
    const destinationAddress = sanitizeText(
      typeof rawDelivery.destinationAddress === "string" ? rawDelivery.destinationAddress : undefined,
      200,
    );
    const amountRub = Number(rawDelivery.amountRub ?? NaN);
    const etaMinDays = Number(rawDelivery.etaMinDays ?? NaN);
    const etaMaxDays = Number(rawDelivery.etaMaxDays ?? NaN);

    if (isDeliveryProvider(mode) && optionCode && optionLabel
      && Number.isFinite(amountRub) && amountRub >= 0
      && Number.isFinite(etaMinDays) && etaMinDays >= 0
      && Number.isFinite(etaMaxDays) && etaMaxDays >= etaMinDays) {
      delivery = {
        mode,
        optionCode,
        optionLabel,
        destinationPostalCode,
        destinationAddress,
        destinationCity: sanitizeText(
          typeof rawDelivery.destinationCity === "string" ? rawDelivery.destinationCity : undefined,
          80,
        ),
        amountRub,
        etaMinDays,
        etaMaxDays,
      };
    }
  }

  const phone = typeof parsed.phone === "string" ? parsed.phone : undefined;
  const telegram = typeof parsed.telegram === "string" ? parsed.telegram : undefined;
  const contact = typeof parsed.contact === "string" ? parsed.contact : (phone ?? telegram);

  return {
    email: typeof parsed.email === "string" ? parsed.email : undefined,
    name: typeof parsed.name === "string" ? parsed.name : undefined,
    phone,
    telegram,
    contact,
    comment: typeof parsed.comment === "string" ? parsed.comment : undefined,
    deliveryMode: normalizeDeliveryMode(
      typeof parsed.deliveryMode === "string" ? parsed.deliveryMode : undefined,
    ),
    delivery,
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
  if (mode === "ozon") return "Ozon Доставка";
  if (mode === "yandex") return "Яндекс Доставка";
  return mode;
}

function formatDeliverySummary(customer: OrderCustomer | null): string {
  const modeLabel = formatDeliveryMode(customer?.deliveryMode);
  if (!customer?.delivery) {
    return modeLabel;
  }

  const destinationParts = [
    customer.delivery.destinationAddress,
    customer.delivery.destinationCity,
    customer.delivery.destinationPostalCode,
  ].filter(Boolean);
  const destination = destinationParts.join(", ");
  const eta = `${customer.delivery.etaMinDays}-${customer.delivery.etaMaxDays} дн.`;

  return `${customer.delivery.optionLabel}${destination ? `, ${destination}` : ""} (${formatRub(customer.delivery.amountRub)}, ${eta})`;
}

function normalizeFulfillmentStatus(value: string | null | undefined): FulfillmentStatus {
  if (isFulfillmentStatus(value)) {
    return value;
  }
  return "pending_payment";
}

function isFulfillmentStatus(value: string | null | undefined): value is FulfillmentStatus {
  return value === "pending_payment"
    || value === "paid"
    || value === "processing"
    || value === "shipped"
    || value === "delivered"
    || value === "completed"
    || value === "canceled";
}

function formatFulfillmentStatus(status: FulfillmentStatus): string {
  if (status === "pending_payment") return "Ожидает оплату";
  if (status === "paid") return "Оплачен";
  if (status === "processing") return "В обработке";
  if (status === "shipped") return "Передан в доставку";
  if (status === "delivered") return "Доставлен";
  if (status === "completed") return "Завершен";
  if (status === "canceled") return "Отменен";
  return status;
}

function getTelegramBotToken(env: Env): string {
  return env.TELEGRAM_BOT_TOKEN?.trim() || env.BOT_TOKEN?.trim() || "";
}

function parseTelegramChatIds(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getTelegramAdminChatIds(env: Env): string[] {
  return parseTelegramChatIds(env.TELEGRAM_ADMIN_CHAT_IDS ?? env.ADMIN_CHAT_IDS);
}

function getTelegramGroupId(env: Env): string | undefined {
  const value = env.TELEGRAM_GROUP_ID?.trim() || env.GROUP_ID?.trim();
  return value || undefined;
}

function isTelegramConfigured(env: Env): boolean {
  return Boolean(getTelegramBotToken(env));
}

function buildTrackingUrl(env: Env, orderId: string, statusToken: string): string {
  return `${getTrackBaseUrl(env)}/track?id=${encodeURIComponent(orderId)}&token=${encodeURIComponent(statusToken)}`;
}

function formatTelegramItems(items: OrderLineItem[]): string {
  if (items.length === 0) return "- Состав уточняется";

  const lines = items.slice(0, 10).map((item) => {
    const lineTotal = item.price * item.quantity;
    return `- ${item.name} ×${item.quantity} = ${lineTotal.toFixed(0)} ₽`;
  });

  if (items.length > 10) {
    lines.push(`- ... и еще ${items.length - 10} поз.`);
  }

  return lines.join("\n");
}

function buildTelegramOrderMessage(args: {
  title: string;
  env: Env;
  orderId: string;
  invId: number;
  amountRub: string;
  paymentStatus: string;
  fulfillmentStatus: FulfillmentStatus;
  items: OrderLineItem[];
  customer: OrderCustomer | null;
  statusToken: string;
}): string {
  const {
    title,
    env,
    orderId,
    invId,
    amountRub,
    paymentStatus,
    fulfillmentStatus,
    items,
    customer,
    statusToken,
  } = args;

  const paymentLabel = paymentStatus === "paid" ? "Оплачено" : "Ожидает оплату";
  const trackingUrl = buildTrackingUrl(env, orderId, statusToken);
  const customerLines: string[] = [];
  if (customer?.email) customerLines.push(`Email: ${customer.email}`);
  if (customer?.name) customerLines.push(`Имя: ${customer.name}`);
  if (customer?.phone) customerLines.push(`Телефон: ${customer.phone}`);
  if (customer?.telegram) customerLines.push(`Telegram: ${customer.telegram}`);
  if (!customer?.phone && !customer?.telegram && customer?.contact) {
    customerLines.push(`Контакт: ${customer.contact}`);
  }
  if (customer?.comment) customerLines.push(`Комментарий: ${customer.comment}`);

  const lines = [
    `🧾 ${title}`,
    `Заказ #${invId}`,
    `ID: ${orderId}`,
    `Оплата: ${paymentLabel}`,
    `Статус: ${formatFulfillmentStatus(fulfillmentStatus)}`,
    `Сумма: ${amountRub} ₽`,
    `Доставка: ${formatDeliverySummary(customer)}`,
    "",
    "Состав:",
    formatTelegramItems(items),
  ];

  lines.push("", "Контакты заказчика:");
  if (customerLines.length > 0) {
    lines.push(...customerLines);
  } else {
    lines.push("- не указаны");
  }

  lines.push("", `Трекинг: ${trackingUrl}`);

  return lines.join("\n");
}

async function sendTelegramMessage(env: Env, chatId: string, text: string): Promise<boolean> {
  const botToken = getTelegramBotToken(env);
  if (!botToken) return false;

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 4000),
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    console.error("Telegram sendMessage failed", response.status, await response.text());
    return false;
  }

  return true;
}

async function notifyTelegramTargets(env: Env, text: string, excludeChatId?: string): Promise<void> {
  if (!isTelegramConfigured(env)) return;

  const groupId = getTelegramGroupId(env);
  const targets = new Set<string>();

  // If group is configured, notifications go only there.
  if (groupId) {
    targets.add(groupId);
  } else {
    for (const adminId of getTelegramAdminChatIds(env)) {
      targets.add(adminId);
    }
  }

  if (excludeChatId) {
    targets.delete(excludeChatId);
  }

  await Promise.all(
    Array.from(targets).map(async (chatId) => {
      try {
        await sendTelegramMessage(env, chatId, text);
      } catch (error) {
        console.error("Telegram notify failed", { chatId, error });
      }
    }),
  );
}

function getTrackBaseUrl(env: Env): string {
  const explicit = env.TRACK_BASE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const successUrl = env.ROBO_SUCCESS_URL?.trim();
  if (successUrl) {
    try {
      return new URL(successUrl).origin;
    } catch {
      // Ignore invalid URL and fallback to default domain.
    }
  }

  return "https://makinari.art";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatRub(value: number | string): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) return "0 ₽";
  return `${amount.toFixed(0)} ₽`;
}

function buildOrderEmailHtml(args: {
  invId: number;
  amountRub: string;
  items: OrderLineItem[];
  customer: OrderCustomer | null;
  trackingUrl: string;
}): string {
  const { invId, amountRub, items, customer, trackingUrl } = args;
  const deliveryText = formatDeliverySummary(customer);
  const rows = items.length > 0
    ? items
      .map((item) => {
        const lineTotal = item.price * item.quantity;
        return `
          <tr>
            <td class="line item-name" style="padding: 10px 0; border-bottom: 1px solid #e6e9ef; color: #1f2937; font-size: 14px;">
              ${escapeHtml(item.name)}
            </td>
            <td class="line item-muted" style="padding: 10px 0; border-bottom: 1px solid #e6e9ef; color: #4b5563; font-size: 14px; text-align: center;">
              ${item.quantity}
            </td>
            <td class="line item-name" style="padding: 10px 0; border-bottom: 1px solid #e6e9ef; color: #1f2937; font-size: 14px; text-align: right;">
              ${formatRub(lineTotal)}
            </td>
          </tr>
        `;
      })
      .join("")
    : `
      <tr>
        <td colspan="3" class="item-muted" style="padding: 14px 0; color: #4b5563; font-size: 14px;">
          Состав заказа уточняется.
        </td>
      </tr>
    `;

  const customerBlocks: string[] = [];
  if (customer?.name) {
    customerBlocks.push(`<p class="item-name" style="margin: 0 0 4px; color: #1f2937; font-size: 14px;">Имя: ${escapeHtml(customer.name)}</p>`);
  }
  if (customer?.phone) {
    customerBlocks.push(`<p class="item-name" style="margin: 0 0 4px; color: #1f2937; font-size: 14px;">Телефон: ${escapeHtml(customer.phone)}</p>`);
  }
  if (customer?.telegram) {
    customerBlocks.push(`<p class="item-name" style="margin: 0 0 4px; color: #1f2937; font-size: 14px;">Telegram: ${escapeHtml(customer.telegram)}</p>`);
  }
  if (!customer?.phone && !customer?.telegram && customer?.contact) {
    customerBlocks.push(`<p class="item-name" style="margin: 0 0 4px; color: #1f2937; font-size: 14px;">Контакт: ${escapeHtml(customer.contact)}</p>`);
  }
  if (customer?.comment) {
    customerBlocks.push(`<p class="item-name" style="margin: 0; color: #1f2937; font-size: 14px;">Комментарий: ${escapeHtml(customer.comment)}</p>`);
  }
  if (customer?.delivery?.destinationPostalCode) {
    customerBlocks.push(`<p class="item-name" style="margin: 4px 0 0; color: #1f2937; font-size: 14px;">Индекс доставки: ${escapeHtml(customer.delivery.destinationPostalCode)}</p>`);
  }
  if (customer?.delivery?.destinationAddress) {
    customerBlocks.push(`<p class="item-name" style="margin: 4px 0 0; color: #1f2937; font-size: 14px;">Адрес доставки/ПВЗ: ${escapeHtml(customer.delivery.destinationAddress)}</p>`);
  }

  const customerDetails = customerBlocks.length > 0
    ? `
      <div class="chip" style="margin-top: 18px; padding: 14px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 10px;">
        <p class="item-muted" style="margin: 0 0 8px; color: #4b5563; font-size: 13px; font-weight: 600;">Данные заказа</p>
        ${customerBlocks.join("")}
      </div>
    `
    : "";

  return `
    <!doctype html>
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>
          body, .email-bg {
            background: #f4f6f9 !important;
          }
          .card {
            background: #ffffff !important;
            border: 1px solid #e5e7eb !important;
          }
          .header {
            background: #f9fafb !important;
            border-bottom: 1px solid #eef1f5 !important;
          }
          .brand {
            color: #6b7280 !important;
          }
          .title {
            color: #111827 !important;
          }
          .item-name {
            color: #1f2937 !important;
          }
          .item-muted {
            color: #4b5563 !important;
          }
          .line {
            border-color: #e6e9ef !important;
          }
          .chip {
            background: #f3f4f6 !important;
            border-color: #e5e7eb !important;
          }
          @media (prefers-color-scheme: dark) {
            body, .email-bg {
              background: #0f1115 !important;
            }
            .card {
              background: #171b24 !important;
              border-color: #2b3342 !important;
            }
            .header {
              background: #1c2230 !important;
              border-bottom-color: #2b3342 !important;
            }
            .brand {
              color: #9aa6ba !important;
            }
            .title {
              color: #f9fafb !important;
            }
            .item-name {
              color: #f3f4f6 !important;
            }
            .item-muted {
              color: #c2cad8 !important;
            }
            .line {
              border-color: #2b3342 !important;
            }
            .chip {
              background: #1f2634 !important;
              border-color: #31394a !important;
            }
          }
        </style>
      </head>
      <body style="margin:0; padding:0;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="email-bg" style="background: #f4f6f9; padding: 24px 8px;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="card" style="max-width: 620px; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e5e7eb;">
              <tr>
                <td class="header" style="padding: 24px 26px 16px; background: #f9fafb; border-bottom: 1px solid #eef1f5;">
                  <p class="brand" style="margin: 0 0 8px; color: #6b7280; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">
                    Лавка Макинари
                  </p>
                  <h1 class="title" style="margin: 0; color: #111827; font-size: 24px; line-height: 1.3; font-weight: 700;">
                    Оплата получена
                  </h1>
                  <p class="item-muted" style="margin: 8px 0 0; color: #4b5563; font-size: 14px;">
                    Спасибо за заказ! Ниже его подтверждение.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 26px 8px;">
                  <div class="chip" style="padding: 14px; border: 1px solid #e5e7eb; border-radius: 10px; margin-top: 14px;">
                    <p class="item-name" style="margin: 0 0 6px; color: #1f2937; font-size: 14px;">
                      Номер заказа: <strong>#${invId}</strong>
                    </p>
                    <p class="item-name" style="margin: 0; color: #1f2937; font-size: 14px;">
                      Доставка: <strong>${escapeHtml(deliveryText)}</strong>
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 26px 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                    <thead>
                      <tr>
                        <th align="left" class="line item-muted" style="padding: 10px 0; border-bottom: 1px solid #e6e9ef; color: #4b5563; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600;">Товар</th>
                        <th align="center" class="line item-muted" style="padding: 10px 0; border-bottom: 1px solid #e6e9ef; color: #4b5563; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600;">Кол-во</th>
                        <th align="right" class="line item-muted" style="padding: 10px 0; border-bottom: 1px solid #e6e9ef; color: #4b5563; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600;">Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows}
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 14px 26px 0;">
                  <p class="title" style="margin: 0; color: #111827; font-size: 16px; font-weight: 700;">
                    Итого: ${escapeHtml(formatRub(amountRub))}
                  </p>
                  ${customerDetails}
                </td>
              </tr>
              <tr>
                <td style="padding: 22px 26px 26px;">
                  <p style="margin: 0 0 12px;">
                    <a
                      href="${escapeHtml(trackingUrl)}"
                      style="display:inline-block; text-decoration:none; background:#111827; color:#ffffff; padding:10px 16px; border-radius:10px; font-size:14px; font-weight:600;"
                    >
                      Отследить заказ
                    </a>
                  </p>
                  <p class="item-muted" style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.55;">
                    Если нужно изменить данные доставки, просто ответьте на это письмо.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      </body>
    </html>
  `;
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

function getResultVerificationConfigs(env: Env, storedMode: string | null | undefined): RoboConfig[] {
  const stored = parseStoredMode(storedMode);
  const strictMode = stored ?? getActiveRoboMode(env);
  const config = resolveRoboConfig(env, strictMode);

  return config ? [config] : [];
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

async function loadOrderRecordById(env: Env, orderId: string): Promise<OrderRecord | null> {
  return await env.DB.prepare(
    `SELECT id, inv_id, status, fulfillment_status, fulfillment_status_updated_at,
            amount_rub, items_json, customer_json, status_token, created_at, paid_at
     FROM orders
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(orderId)
    .first<OrderRecord>();
}

async function loadOrderRecordByIdentifier(env: Env, identifier: string): Promise<OrderRecord | null> {
  const normalized = identifier.trim();
  if (!normalized) return null;

  const byId = await loadOrderRecordById(env, normalized);
  if (byId) {
    return byId;
  }

  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  return await env.DB.prepare(
    `SELECT id, inv_id, status, fulfillment_status, fulfillment_status_updated_at,
            amount_rub, items_json, customer_json, status_token, created_at, paid_at
     FROM orders
     WHERE inv_id = ?
     LIMIT 1`,
  )
    .bind(Number(normalized))
    .first<OrderRecord>();
}

async function updateOrderFulfillmentStatus(env: Env, orderId: string, nextStatus: FulfillmentStatus): Promise<{
  order: OrderRecord;
  previousStatus: FulfillmentStatus;
  updatedAt: string;
} | null> {
  const existingOrder = await loadOrderRecordById(env, orderId);
  if (!existingOrder) {
    return null;
  }

  const previousStatus = normalizeFulfillmentStatus(existingOrder.fulfillment_status);
  const updatedAt = nowIso();

  await env.DB.prepare(
    "UPDATE orders SET fulfillment_status = ?, fulfillment_status_updated_at = ?, updated_at = ? WHERE id = ?",
  )
    .bind(nextStatus, updatedAt, updatedAt, orderId)
    .run();

  return {
    order: {
      ...existingOrder,
      fulfillment_status: nextStatus,
      fulfillment_status_updated_at: updatedAt,
    },
    previousStatus,
    updatedAt,
  };
}

async function markOrderPaid(env: Env, orderId: string, paymentMode: RoboMode): Promise<void> {
  const now = nowIso();

  try {
    await env.DB.prepare(
      `UPDATE orders
       SET status = 'paid',
           fulfillment_status = CASE
             WHEN fulfillment_status IS NULL OR fulfillment_status = 'pending_payment'
               THEN 'paid'
             ELSE fulfillment_status
           END,
           fulfillment_status_updated_at = CASE
             WHEN fulfillment_status IS NULL OR fulfillment_status = 'pending_payment'
               THEN ?
             ELSE fulfillment_status_updated_at
           END,
           payment_mode = COALESCE(payment_mode, ?),
           paid_at = ?,
           updated_at = ?
       WHERE id = ?`,
    )
      .bind(now, paymentMode, now, now, orderId)
      .run();
  } catch (error) {
    if (!isMissingColumnError(error, "payment_mode")) {
      throw error;
    }

    await env.DB.prepare(
      `UPDATE orders
       SET status = 'paid',
           fulfillment_status = CASE
             WHEN fulfillment_status IS NULL OR fulfillment_status = 'pending_payment'
               THEN 'paid'
             ELSE fulfillment_status
           END,
           fulfillment_status_updated_at = CASE
             WHEN fulfillment_status IS NULL OR fulfillment_status = 'pending_payment'
               THEN ?
             ELSE fulfillment_status_updated_at
           END,
           paid_at = ?,
           updated_at = ?
       WHERE id = ?`,
    )
      .bind(now, now, now, orderId)
      .run();
  }
}

async function loadOrderEmailData(env: Env, invId: number): Promise<OrderEmailData | null> {
  try {
    return await env.DB.prepare(
      "SELECT id, inv_id, amount_rub, items_json, customer_json, status_token, email_sent_at FROM orders WHERE inv_id = ? LIMIT 1",
    )
      .bind(invId)
      .first<OrderEmailData>();
  } catch (error) {
    if (!isMissingColumnError(error, "email_sent_at")) {
      throw error;
    }

    const legacyOrder = await env.DB.prepare(
      "SELECT id, inv_id, amount_rub, items_json, customer_json, status_token FROM orders WHERE inv_id = ? LIMIT 1",
    )
      .bind(invId)
      .first<{
        id: string;
        inv_id: number;
        amount_rub: string;
        items_json: string;
        customer_json: string | null;
        status_token: string;
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
    console.error("Resend config missing", {
      hasApiKey: Boolean(apiKey),
      hasFrom: Boolean(from),
    });
    return false;
  }

  const customer = parseCustomer(order.customer_json);
  const customerEmail = customer?.email?.trim().toLowerCase() ?? "";
  if (!isValidEmail(customerEmail)) {
    return false;
  }

  const items = parseOrderItems(order.items_json);
  const trackingUrl = buildTrackingUrl(env, order.id, order.status_token);
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
    `Доставка: ${formatDeliverySummary(customer)}`,
    `Отследить заказ: ${trackingUrl}`,
  ];

  if (customer?.name) {
    textParts.push(`Имя: ${customer.name}`);
  }
  if (customer?.phone) {
    textParts.push(`Телефон: ${customer.phone}`);
  }
  if (customer?.telegram) {
    textParts.push(`Telegram: ${customer.telegram}`);
  }
  if (!customer?.phone && !customer?.telegram && customer?.contact) {
    textParts.push(`Контакт: ${customer.contact}`);
  }
  if (customer?.comment) {
    textParts.push(`Комментарий: ${customer.comment}`);
  }

  textParts.push("", "Спасибо за заказ!");

  const html = buildOrderEmailHtml({
    invId: order.inv_id,
    amountRub: order.amount_rub,
    items,
    customer,
    trackingUrl,
  });

  const bcc = env.ORDERS_NOTIFICATION_EMAIL?.trim();
  const payload = {
    from,
    to: [customerEmail],
    bcc: bcc ? [bcc] : undefined,
    reply_to: env.RESEND_REPLY_TO?.trim() || undefined,
    subject: `Заказ #${order.inv_id}: оплата получена`,
    text: textParts.join("\n"),
    html,
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

function unauthorized(request: Request, env: Env): Response {
  return jsonResponse(request, env, { error: "Unauthorized" }, 401);
}

function hasAdminAccess(request: Request, env: Env): boolean {
  const expected = env.ADMIN_STATUS_API_KEY?.trim();
  if (!expected) return false;

  const auth = request.headers.get("Authorization")?.trim();
  if (auth && auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim() === expected;
  }

  const headerToken = request.headers.get("x-admin-key")?.trim();
  return Boolean(headerToken && headerToken === expected);
}

function getClientIp(request: Request): string {
  const cfIp = request.headers.get("CF-Connecting-IP")?.trim();
  if (cfIp) return cfIp;

  const forwarded = request.headers.get("X-Forwarded-For")?.trim();
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return "unknown";
}

function buildRateLimitBucketKey(scope: string, ip: string): string {
  return `${scope}:${ip.slice(0, 120)}`;
}

async function consumeRateLimit(args: {
  env: Env;
  bucketKey: string;
  limit: number;
  windowSeconds: number;
}): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const { env, bucketKey, limit, windowSeconds } = args;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const windowStart = nowSeconds - (nowSeconds % windowSeconds);
  const now = nowIso();

  try {
    const row = await env.DB.prepare(
      `INSERT INTO rate_limits (bucket_key, window_start, count, updated_at)
       VALUES (?, ?, 1, ?)
       ON CONFLICT(bucket_key) DO UPDATE SET
         count = CASE
           WHEN rate_limits.window_start = excluded.window_start THEN rate_limits.count + 1
           ELSE 1
         END,
         window_start = CASE
           WHEN rate_limits.window_start = excluded.window_start THEN rate_limits.window_start
           ELSE excluded.window_start
         END,
         updated_at = excluded.updated_at
       RETURNING count, window_start`,
    )
      .bind(bucketKey, windowStart, now)
      .first<RateLimitUpsertResult>();

    // Opportunistic cleanup to keep table small.
    if (Math.random() < 0.02) {
      const minWindowStart = nowSeconds - RATE_LIMIT_RETENTION_SECONDS;
      await env.DB.prepare("DELETE FROM rate_limits WHERE window_start < ?")
        .bind(minWindowStart)
        .run();
    }

    const count = Number(row?.count ?? 1);
    const currentWindowStart = Number(row?.window_start ?? windowStart);
    const retryAfterSeconds = Math.max(1, currentWindowStart + windowSeconds - nowSeconds);
    return {
      allowed: count <= limit,
      retryAfterSeconds,
    };
  } catch (error) {
    // Fail open if rate-limit storage is temporarily unavailable.
    console.error("Rate limit check failed", { bucketKey, error });
    return {
      allowed: true,
      retryAfterSeconds: 1,
    };
  }
}

async function applyRateLimit(args: {
  request: Request;
  env: Env;
  scope: string;
  limit: number;
}): Promise<Response | null> {
  const { request, env, scope, limit } = args;
  const ip = getClientIp(request);
  const bucketKey = buildRateLimitBucketKey(scope, ip);
  const result = await consumeRateLimit({
    env,
    bucketKey,
    limit,
    windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
  });

  if (result.allowed) return null;

  const response = jsonResponse(
    request,
    env,
    {
      error: "Слишком много запросов. Попробуйте чуть позже.",
      retryAfterSeconds: result.retryAfterSeconds,
    },
    429,
  );
  response.headers.set("Retry-After", String(result.retryAfterSeconds));
  return response;
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

async function handleDeliveryQuotes(request: Request, env: Env): Promise<Response> {
  let payload: DeliveryQuotePayload;
  try {
    payload = await request.json<DeliveryQuotePayload>();
  } catch {
    return badRequest(request, env, "Некорректный JSON");
  }

  if (!payload?.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    return badRequest(request, env, "Нужна хотя бы одна позиция в корзине");
  }

  const destinationPostalCode = payload.destination?.postalCode?.trim();
  if (destinationPostalCode && !isValidRussianPostalCode(destinationPostalCode)) {
    return badRequest(request, env, "Индекс должен состоять из 6 цифр");
  }

  const destinationCity = sanitizeText(payload.destination?.city, 80);

  const merged = new Map<number, number>();
  for (const item of payload.items) {
    if (!Number.isInteger(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      return badRequest(request, env, "Некорректные позиции корзины");
    }
    merged.set(item.id, (merged.get(item.id) ?? 0) + item.quantity);
  }

  let subtotalRub = 0;
  for (const [id, quantity] of merged.entries()) {
    const product = catalog.get(id);
    if (!product) {
      return badRequest(request, env, `Товар с id=${id} не найден`);
    }
    if (!product.inStock) {
      return jsonResponse(request, env, { error: `Товар "${product.name}" сейчас не в наличии` }, 409);
    }
    subtotalRub += product.price * quantity;
  }

  const providers = Array.isArray(payload.providers) && payload.providers.length > 0
    ? payload.providers.filter((provider): provider is DeliveryProvider => isDeliveryProvider(provider))
    : ["russian_post", "ozon", "yandex"];

  if (providers.length === 0) {
    return badRequest(request, env, "Нужно выбрать хотя бы одну службу доставки");
  }

  const shipment = buildShipmentMetrics(merged);
  const options = buildEstimatedQuotes({
    destinationCity,
    subtotalRub,
    providers,
  }).sort((a, b) => a.amountRub - b.amountRub);

  return jsonResponse(request, env, {
    destination: {
      city: destinationCity ?? null,
      postalCode: destinationPostalCode ?? null,
    },
    shipment,
    subtotalRub,
    options,
    note: "Фиксированные тарифы: Почта России — 400 ₽, Ozon и Яндекс — 300 ₽. Бесплатная доставка от 1700 ₽.",
  });
}

async function handleCreateCheckout(request: Request, env: Env, executionContext: ExecutionContext): Promise<Response> {
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
  const requestedDeliveryMode = normalizeDeliveryMode(
    payload.customer?.delivery?.mode ?? payload.customer?.deliveryMode,
  );

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

  const lineItems: CheckoutLineItem[] = [];
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
  const subtotalRub = totalKopecks / 100;
  const normalizedLegacyContact = sanitizeText(payload.customer?.contact, 80);
  const normalizedPhone = sanitizeText(payload.customer?.phone, 80) ?? normalizedLegacyContact;
  const normalizedTelegram = sanitizeText(payload.customer?.telegram, 80);
  const normalizedContact = normalizedLegacyContact ?? normalizedPhone ?? normalizedTelegram;

  if (!isDeliveryProvider(requestedDeliveryMode)) {
    return badRequest(request, env, "Выберите корректный способ доставки");
  }

  let selectedDelivery: OrderCustomerDelivery | undefined;
  {
    const destinationCity = sanitizeText(payload.customer?.delivery?.destinationCity, 80);
    const destinationPostalCodeRaw = payload.customer?.delivery?.destinationPostalCode?.trim();
    const destinationPostalCode = isValidRussianPostalCode(destinationPostalCodeRaw)
      ? destinationPostalCodeRaw
      : undefined;
    const destinationAddress = sanitizeText(payload.customer?.delivery?.destinationAddress, 200);
    const quoteOptionCode = payload.customer?.delivery?.optionCode?.trim();
    if (!quoteOptionCode) {
      return badRequest(request, env, "Выберите тариф доставки");
    }

    const availableOptions = buildEstimatedQuotes({
      destinationCity,
      subtotalRub,
      providers: [requestedDeliveryMode],
    });

    const selectedOption = availableOptions.find((option) => option.optionCode === quoteOptionCode);
    if (!selectedOption) {
      return badRequest(request, env, "Выбранный тариф доставки устарел, пересчитайте доставку");
    }

    if (requestedDeliveryMode === "russian_post") {
      if (selectedOption.optionCode === "post_phone" && !isLikelyPhone(normalizedPhone)) {
        return badRequest(request, env, "Для Почты России (по телефону) укажите корректный номер телефона");
      }
      if (selectedOption.optionCode === "post_address" && (!destinationPostalCode || !destinationAddress)) {
        return badRequest(request, env, "Для Почты России по адресу нужны индекс (6 цифр) и адрес");
      }
    }

    if ((requestedDeliveryMode === "ozon" || requestedDeliveryMode === "yandex") && !isLikelyPhone(normalizedPhone)) {
      return badRequest(request, env, "Для Ozon и Яндекс доставки нужен корректный номер телефона");
    }

    if ((requestedDeliveryMode === "ozon" || requestedDeliveryMode === "yandex") && !destinationAddress) {
      return badRequest(request, env, "Для Ozon и Яндекс доставки укажите адрес пункта выдачи");
    }

    totalKopecks += toKopecks(selectedOption.amountRub);
    selectedDelivery = {
      mode: selectedOption.mode,
      destinationCity,
      destinationPostalCode,
      destinationAddress,
      optionCode: selectedOption.optionCode,
      optionLabel: selectedOption.optionLabel,
      amountRub: selectedOption.amountRub,
      etaMinDays: selectedOption.etaMinDays,
      etaMaxDays: selectedOption.etaMaxDays,
    };
  }

  const normalizedCustomer: OrderCustomer = {
    email: normalizedEmail,
    name: sanitizeText(payload.customer?.name, 80),
    phone: normalizedPhone,
    telegram: normalizedTelegram,
    contact: normalizedContact,
    comment: sanitizeText(payload.customer?.comment, 500),
    deliveryMode: requestedDeliveryMode,
    delivery: selectedDelivery,
  };

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
          `INSERT INTO orders (id, inv_id, status, fulfillment_status, fulfillment_status_updated_at, payment_mode, amount_kopecks, amount_rub, items_json, customer_json, status_token, created_at, updated_at)
           VALUES (?, ?, 'pending_payment', 'pending_payment', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            orderId,
            invId,
            createdAt,
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
          `INSERT INTO orders (id, inv_id, status, fulfillment_status, fulfillment_status_updated_at, amount_kopecks, amount_rub, items_json, customer_json, status_token, created_at, updated_at)
           VALUES (?, ?, 'pending_payment', 'pending_payment', ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            orderId,
            invId,
            createdAt,
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

  if (isTelegramConfigured(env)) {
    const telegramItems: OrderLineItem[] = lineItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));
    const message = buildTelegramOrderMessage({
      title: "Новый заказ",
      env,
      orderId,
      invId,
      amountRub,
      paymentStatus: "pending_payment",
      fulfillmentStatus: "pending_payment",
      items: telegramItems,
      customer: normalizedCustomer,
      statusToken,
    });
    executionContext.waitUntil(notifyTelegramTargets(env, message));
  }

  let receiptJson = "";
  try {
    receiptJson = buildRobokassaReceipt({
      lineItems,
      delivery: selectedDelivery,
      tax: normalizeReceiptTax(env.ROBO_RECEIPT_TAX),
    });
  } catch (error) {
    console.error("Failed to build receipt", error);
    return jsonResponse(request, env, { error: "Не удалось сформировать чек для оплаты" }, 500);
  }

  const receiptEncoded = encodeURIComponent(receiptJson);

  const successUrl2 = env.ROBO_SUCCESS_URL?.trim();
  const failUrl2 = env.ROBO_FAIL_URL?.trim();

  const signatureParts = [
    roboConfig.merchantLogin,
    amountRub,
    String(invId),
    receiptEncoded,
  ];

  // SuccessUrl2/FailUrl2 must be included in signature when they are sent.
  if (successUrl2) {
    signatureParts.push(successUrl2, "GET");
  }
  if (failUrl2) {
    signatureParts.push(failUrl2, "GET");
  }
  signatureParts.push(roboConfig.pass1);

  const signature = md5Hex(signatureParts.join(":"));

  const paymentParams = new URLSearchParams({
    MerchantLogin: roboConfig.merchantLogin,
    OutSum: amountRub,
    InvId: String(invId),
    Description: `Оплата заказа ${orderId.slice(0, 8)}`,
    SignatureValue: signature,
    Culture: "ru",
    Encoding: "UTF-8",
  });

  if (roboConfig.isTest) {
    paymentParams.set("IsTest", "1");
  }
  paymentParams.set("Email", normalizedEmail);
  if (successUrl2) {
    paymentParams.set("SuccessUrl2", successUrl2);
    paymentParams.set("SuccessUrl2Method", "GET");
  }
  if (failUrl2) {
    paymentParams.set("FailUrl2", failUrl2);
    paymentParams.set("FailUrl2Method", "GET");
  }

  const paymentFormFields: Record<string, string> = Object.fromEntries(paymentParams.entries());
  paymentFormFields.Receipt = receiptEncoded;
  const paymentAction = "https://auth.robokassa.ru/Merchant/Index.aspx";
  const paymentQuery = `${paymentParams.toString()}&Receipt=${receiptEncoded}`;

  return jsonResponse(request, env, {
    orderId,
    invId,
    statusToken,
    trackingUrl: buildTrackingUrl(env, orderId, statusToken),
    amountRub,
    delivery: selectedDelivery ?? null,
    paymentMode: roboConfig.mode,
    paymentForm: {
      action: paymentAction,
      method: "POST",
      fields: paymentFormFields,
    },
    paymentUrl: `https://auth.robokassa.ru/Merchant/Index.aspx?${paymentQuery}`,
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

  const becamePaid = order.status !== "paid";
  if (becamePaid) {
    await markOrderPaid(env, order.id, matchedConfig.mode);
  }

  executionContext.waitUntil((async () => {
    try {
      const orderEmailData = await loadOrderEmailData(env, invId);
      if (orderEmailData && !orderEmailData.email_sent_at) {
        const sent = await sendOrderPaidEmail(env, orderEmailData);
        if (sent) {
          await markOrderEmailSent(env, orderEmailData.id);
        }
      }

      if (becamePaid && isTelegramConfigured(env)) {
        const paidOrder = await loadOrderRecordById(env, order.id);
        if (paidOrder) {
          const message = buildTelegramOrderMessage({
            title: "Оплата подтверждена",
            env,
            orderId: paidOrder.id,
            invId: paidOrder.inv_id,
            amountRub: paidOrder.amount_rub,
            paymentStatus: "paid",
            fulfillmentStatus: normalizeFulfillmentStatus(paidOrder.fulfillment_status),
            items: parseOrderItems(paidOrder.items_json),
            customer: parseCustomer(paidOrder.customer_json),
            statusToken: paidOrder.status_token,
          });
          await notifyTelegramTargets(env, message);
        }
      }
    } catch (error) {
      console.error("Failed to process paid-order side effects", error);
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
    "SELECT id, inv_id, status, fulfillment_status, fulfillment_status_updated_at, amount_rub, items_json, customer_json, created_at, paid_at FROM orders WHERE id = ? AND status_token = ? LIMIT 1",
  )
    .bind(orderId, token)
    .first<{
      id: string;
      inv_id: number;
      status: string;
      fulfillment_status: string | null;
      fulfillment_status_updated_at: string | null;
      amount_rub: string;
      items_json: string;
      customer_json: string | null;
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
  const customer = parseCustomer(order.customer_json);
  const fulfillmentStatus = normalizeFulfillmentStatus(order.fulfillment_status);

  const timeline = [
    { key: "pending_payment", at: order.created_at },
    { key: "paid", at: order.paid_at },
    { key: fulfillmentStatus, at: order.fulfillment_status_updated_at ?? order.paid_at ?? order.created_at },
  ].filter((event, index, arr) => arr.findIndex((item) => item.key === event.key) === index);

  const response = jsonResponse(request, env, {
    id: order.id,
    invId: order.inv_id,
    status: order.status,
    fulfillmentStatus,
    fulfillmentStatusUpdatedAt: order.fulfillment_status_updated_at,
    amountRub: order.amount_rub,
    items,
    delivery: customer?.delivery
      ? {
        mode: customer.delivery.mode,
        label: customer.delivery.optionLabel,
        amountRub: customer.delivery.amountRub,
        destinationCity: customer.delivery.destinationCity ?? null,
        destinationPostalCode: customer.delivery.destinationPostalCode ?? null,
        destinationAddress: customer.delivery.destinationAddress ?? null,
        etaMinDays: customer.delivery.etaMinDays,
        etaMaxDays: customer.delivery.etaMaxDays,
      }
      : null,
    timeline,
    createdAt: order.created_at,
    paidAt: order.paid_at,
  });

  response.headers.set("Cache-Control", "no-store");
  return response;
}

async function handleAdminUpdateStatus(request: Request, env: Env): Promise<Response> {
  if (!hasAdminAccess(request, env)) {
    return unauthorized(request, env);
  }

  let payload: AdminUpdateStatusPayload;
  try {
    payload = await request.json<AdminUpdateStatusPayload>();
  } catch {
    return badRequest(request, env, "Некорректный JSON");
  }

  const orderId = payload.orderId?.trim();
  if (!orderId) {
    return badRequest(request, env, "orderId обязателен");
  }

  if (!payload.fulfillmentStatus) {
    return badRequest(request, env, "fulfillmentStatus обязателен");
  }
  if (!isFulfillmentStatus(payload.fulfillmentStatus)) {
    return badRequest(request, env, "Некорректный fulfillmentStatus");
  }
  const nextStatus = payload.fulfillmentStatus;

  const updateResult = await updateOrderFulfillmentStatus(env, orderId, nextStatus);
  if (!updateResult) {
    return jsonResponse(request, env, { error: "Заказ не найден" }, 404);
  }

  if (isTelegramConfigured(env) && updateResult.previousStatus !== nextStatus) {
    const message = buildTelegramOrderMessage({
      title: `Статус обновлен: ${formatFulfillmentStatus(nextStatus)}`,
      env,
      orderId: updateResult.order.id,
      invId: updateResult.order.inv_id,
      amountRub: updateResult.order.amount_rub,
      paymentStatus: updateResult.order.status,
      fulfillmentStatus: nextStatus,
      items: parseOrderItems(updateResult.order.items_json),
      customer: parseCustomer(updateResult.order.customer_json),
      statusToken: updateResult.order.status_token,
    });
    await notifyTelegramTargets(env, message);
  }

  return jsonResponse(request, env, {
    ok: true,
    orderId,
    invId: updateResult.order.inv_id,
    status: updateResult.order.status,
    fulfillmentStatus: nextStatus,
    updatedAt: updateResult.updatedAt,
  });
}

function getTelegramWebhookSecret(env: Env): string {
  return env.TELEGRAM_WEBHOOK_SECRET?.trim() || "";
}

function isTelegramAdminChat(env: Env, chatId: string): boolean {
  const admins = getTelegramAdminChatIds(env);
  return admins.includes(chatId);
}

function parseTelegramCommand(text: string): { command: string; args: string[] } {
  const [rawCommand, ...args] = text.trim().split(/\s+/);
  const command = rawCommand.split("@")[0]?.toLowerCase() ?? "";
  return { command, args };
}

function buildTelegramHelpMessage(): string {
  return [
    "Команды:",
    "/help - справка",
    "/order <id|invId> - показать заказ",
    "/status <id|invId> <pending_payment|paid|processing|shipped|delivered|completed|canceled> - сменить статус",
  ].join("\n");
}

async function handleTelegramOrderCommand(env: Env, chatId: string, identifier: string): Promise<void> {
  const order = await loadOrderRecordByIdentifier(env, identifier);
  if (!order) {
    await sendTelegramMessage(env, chatId, "Заказ не найден");
    return;
  }

  const message = buildTelegramOrderMessage({
    title: "Детали заказа",
    env,
    orderId: order.id,
    invId: order.inv_id,
    amountRub: order.amount_rub,
    paymentStatus: order.status,
    fulfillmentStatus: normalizeFulfillmentStatus(order.fulfillment_status),
    items: parseOrderItems(order.items_json),
    customer: parseCustomer(order.customer_json),
    statusToken: order.status_token,
  });
  await sendTelegramMessage(env, chatId, message);
}

async function handleTelegramStatusCommand(env: Env, chatId: string, identifier: string, statusRaw: string): Promise<void> {
  if (!isFulfillmentStatus(statusRaw)) {
    await sendTelegramMessage(
      env,
      chatId,
      "Некорректный статус. Допустимо: pending_payment, paid, processing, shipped, delivered, completed, canceled",
    );
    return;
  }

  const order = await loadOrderRecordByIdentifier(env, identifier);
  if (!order) {
    await sendTelegramMessage(env, chatId, "Заказ не найден");
    return;
  }

  const updateResult = await updateOrderFulfillmentStatus(env, order.id, statusRaw);
  if (!updateResult) {
    await sendTelegramMessage(env, chatId, "Не удалось обновить статус");
    return;
  }

  const confirmation = [
    "Статус обновлен",
    `Заказ #${updateResult.order.inv_id}`,
    `Новый статус: ${formatFulfillmentStatus(statusRaw)}`,
    `Обновлено: ${updateResult.updatedAt}`,
  ].join("\n");
  await sendTelegramMessage(env, chatId, confirmation);

  const broadcast = buildTelegramOrderMessage({
    title: `Статус обновлен: ${formatFulfillmentStatus(statusRaw)}`,
    env,
    orderId: updateResult.order.id,
    invId: updateResult.order.inv_id,
    amountRub: updateResult.order.amount_rub,
    paymentStatus: updateResult.order.status,
    fulfillmentStatus: statusRaw,
    items: parseOrderItems(updateResult.order.items_json),
    customer: parseCustomer(updateResult.order.customer_json),
    statusToken: updateResult.order.status_token,
  });
  await notifyTelegramTargets(env, broadcast, chatId);
}

async function handleTelegramWebhook(request: Request, env: Env, pathname: string): Promise<Response> {
  if (!isTelegramConfigured(env)) {
    return jsonResponse(request, env, { error: "Telegram not configured" }, 503);
  }

  const expectedSecret = getTelegramWebhookSecret(env);
  if (!expectedSecret) {
    return jsonResponse(request, env, { error: "Telegram webhook secret is required" }, 503);
  }

  const actualSecret = pathname.replace("/api/telegram/webhook", "").replace(/^\/+/, "");
  if (actualSecret !== expectedSecret) {
    return unauthorized(request, env);
  }

  let update: TelegramUpdate;
  try {
    update = await request.json<TelegramUpdate>();
  } catch {
    return badRequest(request, env, "Некорректный JSON");
  }

  const message = update.message ?? update.edited_message;
  const text = message?.text?.trim() ?? "";
  const chatId = String(message?.chat?.id ?? "");

  if (!text || !chatId) {
    return jsonResponse(request, env, { ok: true });
  }

  if (!isTelegramAdminChat(env, chatId)) {
    return jsonResponse(request, env, { ok: true });
  }

  const { command, args } = parseTelegramCommand(text);
  if (command === "/start" || command === "/help") {
    await sendTelegramMessage(env, chatId, buildTelegramHelpMessage());
    return jsonResponse(request, env, { ok: true });
  }

  if (command === "/order") {
    const identifier = args[0];
    if (!identifier) {
      await sendTelegramMessage(env, chatId, "Использование: /order <id|invId>");
      return jsonResponse(request, env, { ok: true });
    }
    await handleTelegramOrderCommand(env, chatId, identifier);
    return jsonResponse(request, env, { ok: true });
  }

  if (command === "/status") {
    const identifier = args[0];
    const nextStatus = args[1]?.toLowerCase();
    if (!identifier || !nextStatus) {
      await sendTelegramMessage(env, chatId, "Использование: /status <id|invId> <status>");
      return jsonResponse(request, env, { ok: true });
    }
    await handleTelegramStatusCommand(env, chatId, identifier, nextStatus);
    return jsonResponse(request, env, { ok: true });
  }

  await sendTelegramMessage(env, chatId, buildTelegramHelpMessage());
  return jsonResponse(request, env, { ok: true });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: buildCorsHeaders(request, env), status: 204 });
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return jsonResponse(request, env, {
        ok: true,
        paymentMode: getActiveRoboMode(env),
        emailEnabled: Boolean(env.RESEND_API_KEY?.trim() && env.RESEND_FROM?.trim()),
        deliveryEnabled: true,
        telegramEnabled: isTelegramConfigured(env),
      });
    }

    if ((url.pathname === "/api/telegram/webhook" || url.pathname.startsWith("/api/telegram/webhook/")) && request.method === "POST") {
      return handleTelegramWebhook(request, env, url.pathname);
    }

    if (url.pathname === "/api/delivery/quotes" && request.method === "POST") {
      const limited = await applyRateLimit({
        request,
        env,
        scope: "delivery_quotes",
        limit: RATE_LIMITS.deliveryQuotes,
      });
      if (limited) return limited;
      return handleDeliveryQuotes(request, env);
    }

    if (url.pathname === "/api/checkout/create" && request.method === "POST") {
      const limited = await applyRateLimit({
        request,
        env,
        scope: "checkout_create",
        limit: RATE_LIMITS.checkoutCreate,
      });
      if (limited) return limited;
      return handleCreateCheckout(request, env, ctx);
    }

    if (url.pathname === "/api/checkout/result" && (request.method === "POST" || request.method === "GET")) {
      return handleResult(request, env, ctx);
    }

    if (url.pathname === "/api/checkout/status" && request.method === "GET") {
      return handleStatus(request, env);
    }

    if (url.pathname === "/api/orders/track" && request.method === "GET") {
      const limited = await applyRateLimit({
        request,
        env,
        scope: "orders_track",
        limit: RATE_LIMITS.orderTrack,
      });
      if (limited) return limited;
      return handleStatus(request, env);
    }

    if (url.pathname === "/api/admin/orders/status" && request.method === "POST") {
      return handleAdminUpdateStatus(request, env);
    }

    return jsonResponse(request, env, { error: "Not found" }, 404);
  },
};
