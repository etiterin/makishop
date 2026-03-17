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
  CDEK_ORIGIN_POSTAL_CODE?: string;
  POST_ORIGIN_POSTAL_CODE?: string;
};

type CreateCheckoutItem = {
  id: number;
  quantity: number;
};

type DeliveryMode = "manual_confirmation" | "russian_post" | "cdek";
type DeliveryProvider = Exclude<DeliveryMode, "manual_confirmation">;

type DeliverySelectionPayload = {
  mode?: string;
  destinationCity?: string;
  destinationPostalCode?: string;
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
  deliveryMode?: DeliveryMode | string;
  delivery?: OrderCustomerDelivery;
};

type OrderLineItem = {
  name: string;
  quantity: number;
  price: number;
};

type OrderCustomerDelivery = {
  mode: DeliveryProvider;
  destinationCity?: string;
  destinationPostalCode: string;
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

function normalizeDeliveryMode(value: string | undefined): DeliveryMode {
  if (value === "cdek" || value === "russian_post" || value === "manual_confirmation") {
    return value;
  }
  return "manual_confirmation";
}

function isDeliveryProvider(value: string | undefined): value is DeliveryProvider {
  return value === "cdek" || value === "russian_post";
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

function getDistanceTier(originPostalCode: string, destinationPostalCode: string): 0 | 1 | 2 {
  if (originPostalCode === destinationPostalCode) return 0;
  if (originPostalCode.slice(0, 2) === destinationPostalCode.slice(0, 2)) return 0;
  if (originPostalCode.slice(0, 1) === destinationPostalCode.slice(0, 1)) return 1;
  return 2;
}

function roundRub(value: number): number {
  return Math.max(0, Math.round(value));
}

function buildEstimatedQuotes(args: {
  env: Env;
  destinationCity?: string;
  destinationPostalCode: string;
  shipment: ShipmentMetrics;
  providers: DeliveryProvider[];
}): DeliveryQuoteOption[] {
  const { env, destinationCity, destinationPostalCode, shipment, providers } = args;
  const cdekOrigin = env.CDEK_ORIGIN_POSTAL_CODE?.trim() || "101000";
  const postOrigin = env.POST_ORIGIN_POSTAL_CODE?.trim() || "101000";
  const uniqueProviders = Array.from(new Set(providers));

  const cdekTier = getDistanceTier(cdekOrigin, destinationPostalCode);
  const postTier = getDistanceTier(postOrigin, destinationPostalCode);
  const weightOverBase = Math.max(0, shipment.weightGrams - 250);
  const weightUnits = Math.ceil(weightOverBase / 100);
  const volumeFactor = Math.max(0, shipment.lengthCm * shipment.widthCm * shipment.heightCm - 2500) / 500;

  const options: DeliveryQuoteOption[] = [];

  if (uniqueProviders.includes("cdek")) {
    options.push({
      mode: "cdek",
      optionCode: "cdek_pickup_standard",
      optionLabel: destinationCity
        ? `СДЭК, пункт выдачи (${destinationCity})`
        : "СДЭК, пункт выдачи",
      amountRub: roundRub(240 + cdekTier * 120 + weightUnits * 10 + volumeFactor * 6),
      etaMinDays: 2 + cdekTier,
      etaMaxDays: 4 + cdekTier * 2,
    });
    options.push({
      mode: "cdek",
      optionCode: "cdek_courier_standard",
      optionLabel: destinationCity
        ? `СДЭК, курьер (${destinationCity})`
        : "СДЭК, курьер",
      amountRub: roundRub(360 + cdekTier * 140 + weightUnits * 12 + volumeFactor * 8),
      etaMinDays: 1 + cdekTier,
      etaMaxDays: 3 + cdekTier * 2,
    });
  }

  if (uniqueProviders.includes("russian_post")) {
    options.push({
      mode: "russian_post",
      optionCode: "post_office_parcel",
      optionLabel: destinationCity
        ? `Почта России, отделение (${destinationCity})`
        : "Почта России, отделение",
      amountRub: roundRub(210 + postTier * 105 + weightUnits * 8 + volumeFactor * 5),
      etaMinDays: 3 + postTier,
      etaMaxDays: 6 + postTier * 2,
    });
    options.push({
      mode: "russian_post",
      optionCode: "post_courier_ems",
      optionLabel: destinationCity
        ? `Почта России EMS (${destinationCity})`
        : "Почта России EMS",
      amountRub: roundRub(390 + postTier * 135 + weightUnits * 11 + volumeFactor * 7),
      etaMinDays: 2 + postTier,
      etaMaxDays: 5 + postTier * 2,
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
    const destinationPostalCode = typeof rawDelivery.destinationPostalCode === "string"
      ? rawDelivery.destinationPostalCode
      : "";
    const amountRub = Number(rawDelivery.amountRub ?? NaN);
    const etaMinDays = Number(rawDelivery.etaMinDays ?? NaN);
    const etaMaxDays = Number(rawDelivery.etaMaxDays ?? NaN);

    if (isDeliveryProvider(mode) && optionCode && optionLabel && isValidRussianPostalCode(destinationPostalCode)
      && Number.isFinite(amountRub) && amountRub >= 0
      && Number.isFinite(etaMinDays) && etaMinDays >= 0
      && Number.isFinite(etaMaxDays) && etaMaxDays >= etaMinDays) {
      delivery = {
        mode,
        optionCode,
        optionLabel,
        destinationPostalCode,
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

  return {
    email: typeof parsed.email === "string" ? parsed.email : undefined,
    name: typeof parsed.name === "string" ? parsed.name : undefined,
    contact: typeof parsed.contact === "string" ? parsed.contact : undefined,
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
  return mode;
}

function formatDeliverySummary(customer: OrderCustomer | null): string {
  const modeLabel = formatDeliveryMode(customer?.deliveryMode);
  if (!customer?.delivery) {
    return modeLabel;
  }

  const destinationParts = [
    customer.delivery.destinationCity,
    customer.delivery.destinationPostalCode,
  ].filter(Boolean);
  const destination = destinationParts.join(", ");
  const eta = `${customer.delivery.etaMinDays}-${customer.delivery.etaMaxDays} дн.`;

  return `${customer.delivery.optionLabel}${destination ? `, ${destination}` : ""} (${formatRub(customer.delivery.amountRub)}, ${eta})`;
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
}): string {
  const { invId, amountRub, items, customer } = args;
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
  if (customer?.contact) {
    customerBlocks.push(`<p class="item-name" style="margin: 0 0 4px; color: #1f2937; font-size: 14px;">Контакт: ${escapeHtml(customer.contact)}</p>`);
  }
  if (customer?.comment) {
    customerBlocks.push(`<p class="item-name" style="margin: 0; color: #1f2937; font-size: 14px;">Комментарий: ${escapeHtml(customer.comment)}</p>`);
  }
  if (customer?.delivery?.destinationPostalCode) {
    customerBlocks.push(`<p class="item-name" style="margin: 4px 0 0; color: #1f2937; font-size: 14px;">Индекс доставки: ${escapeHtml(customer.delivery.destinationPostalCode)}</p>`);
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

  const html = buildOrderEmailHtml({
    invId: order.inv_id,
    amountRub: order.amount_rub,
    items,
    customer,
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
  if (!isValidRussianPostalCode(destinationPostalCode)) {
    return badRequest(request, env, "Укажите индекс доставки (6 цифр)");
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
    : ["cdek", "russian_post"];

  if (providers.length === 0) {
    return badRequest(request, env, "Нужно выбрать хотя бы одну службу доставки");
  }

  const shipment = buildShipmentMetrics(merged);
  const options = buildEstimatedQuotes({
    env,
    destinationCity,
    destinationPostalCode,
    shipment,
    providers,
  }).sort((a, b) => a.amountRub - b.amountRub);

  return jsonResponse(request, env, {
    destination: {
      city: destinationCity ?? null,
      postalCode: destinationPostalCode,
    },
    shipment,
    subtotalRub,
    options,
    note: "Расчет на основе интеграционного тарификатора (СДЭК/Почта), финальная стоимость фиксируется в заказе.",
  });
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

  let selectedDelivery: OrderCustomerDelivery | undefined;
  if (isDeliveryProvider(requestedDeliveryMode)) {
    const destinationPostalCode = payload.customer?.delivery?.destinationPostalCode?.trim() ?? "";
    if (!isValidRussianPostalCode(destinationPostalCode)) {
      return badRequest(request, env, "Для доставки нужен корректный индекс (6 цифр)");
    }

    const destinationCity = sanitizeText(payload.customer?.delivery?.destinationCity, 80);
    const quoteOptionCode = payload.customer?.delivery?.optionCode?.trim();
    if (!quoteOptionCode) {
      return badRequest(request, env, "Выберите тариф доставки");
    }

    const shipment = buildShipmentMetrics(merged);
    const availableOptions = buildEstimatedQuotes({
      env,
      destinationCity,
      destinationPostalCode,
      shipment,
      providers: [requestedDeliveryMode],
    });

    const selectedOption = availableOptions.find((option) => option.optionCode === quoteOptionCode);
    if (!selectedOption) {
      return badRequest(request, env, "Выбранный тариф доставки устарел, пересчитайте доставку");
    }

    totalKopecks += toKopecks(selectedOption.amountRub);
    selectedDelivery = {
      mode: selectedOption.mode,
      destinationCity,
      destinationPostalCode,
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
    contact: sanitizeText(payload.customer?.contact, 80),
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
    delivery: selectedDelivery ?? null,
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
    "SELECT id, inv_id, status, amount_rub, items_json, customer_json, created_at, paid_at FROM orders WHERE id = ? AND status_token = ? LIMIT 1",
  )
    .bind(orderId, token)
    .first<{
      id: string;
      inv_id: number;
      status: string;
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

  return jsonResponse(request, env, {
    id: order.id,
    invId: order.inv_id,
    status: order.status,
    amountRub: order.amount_rub,
    items,
    delivery: customer?.delivery
      ? {
        mode: customer.delivery.mode,
        label: customer.delivery.optionLabel,
        amountRub: customer.delivery.amountRub,
        destinationCity: customer.delivery.destinationCity ?? null,
        destinationPostalCode: customer.delivery.destinationPostalCode,
        etaMinDays: customer.delivery.etaMinDays,
        etaMaxDays: customer.delivery.etaMaxDays,
      }
      : null,
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
      return jsonResponse(request, env, {
        ok: true,
        paymentMode: getActiveRoboMode(env),
        emailEnabled: Boolean(env.RESEND_API_KEY?.trim() && env.RESEND_FROM?.trim()),
        deliveryEnabled: true,
      });
    }

    if (url.pathname === "/api/delivery/quotes" && request.method === "POST") {
      return handleDeliveryQuotes(request, env);
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
