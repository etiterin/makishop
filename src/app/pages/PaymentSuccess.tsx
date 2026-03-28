import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { useCart } from "../context/CartContext";
import { getApiBaseUrl } from "../lib/api";

type CheckoutRef = {
  id: string;
  token: string;
};

type CheckoutStatus = {
  id: string;
  invId: number;
  status: "pending_payment" | "paid" | string;
  amountRub: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    lineTotal: number;
  }>;
  delivery: {
    mode: "cdek" | "russian_post" | "ozon" | "yandex";
    label: string;
    amountRub: number;
    destinationCity: string | null;
    destinationPostalCode: string | null;
    destinationAddress: string | null;
    etaMinDays: number;
    etaMaxDays: number;
  } | null;
  paidAt: string | null;
};

type ViewState = "loading" | "pending" | "paid" | "missing" | "error";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 12;
const CHECKOUT_DRAFT_STORAGE_KEY = "checkoutDraft";

function formatDeliveryAmount(amountRub: number): string {
  return amountRub <= 0 ? "бесплатно" : `${amountRub} ₽`;
}

function normalizeDeliveryMode(value: unknown): "cdek" | "russian_post" | "ozon" | "yandex" {
  if (value === "cdek" || value === "russian_post" || value === "ozon" || value === "yandex") {
    return value;
  }
  return "russian_post";
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  if (!raw) {
    throw new Error(`Пустой ответ сервера (HTTP ${response.status})`);
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Сервер вернул некорректный JSON (HTTP ${response.status})`);
  }
}

function getLastCheckout(): CheckoutRef | null {
  try {
    const raw = localStorage.getItem("lastCheckout");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutRef>;
    if (!parsed.id || !parsed.token) return null;
    return { id: parsed.id, token: parsed.token };
  } catch {
    return null;
  }
}

export function PaymentSuccess() {
  const { clearCart } = useCart();
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [statusData, setStatusData] = useState<CheckoutStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const attemptsRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const checkoutRef = useMemo(() => getLastCheckout(), []);
  const trackingLink = useMemo(() => {
    if (!checkoutRef) return null;
    return `/track?id=${encodeURIComponent(checkoutRef.id)}&token=${encodeURIComponent(checkoutRef.token)}`;
  }, [checkoutRef]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!checkoutRef) {
      setViewState("missing");
      return;
    }

    const apiBase = getApiBaseUrl();

    const fetchStatus = async () => {
      try {
        attemptsRef.current += 1;
        const response = await fetch(
          `${apiBase}/api/checkout/status?id=${encodeURIComponent(checkoutRef.id)}&token=${encodeURIComponent(checkoutRef.token)}`,
        );
        const data = await parseJsonResponse<Partial<CheckoutStatus> & { error?: string }>(response);

        if (!response.ok) {
          throw new Error(data.error || "Не удалось получить статус платежа");
        }

        const nextData: CheckoutStatus = {
          id: String(data.id ?? checkoutRef.id),
          invId: Number(data.invId ?? 0),
          status: String(data.status ?? "pending_payment"),
          amountRub: String(data.amountRub ?? "0.00"),
          items: Array.isArray(data.items) ? data.items.map((item) => ({
            name: String(item?.name ?? ""),
            quantity: Number(item?.quantity ?? 0),
            price: Number(item?.price ?? 0),
            lineTotal: Number(item?.lineTotal ?? 0),
          })).filter((item) => item.name && item.quantity > 0) : [],
          delivery: data.delivery
            ? {
              mode: normalizeDeliveryMode(data.delivery.mode),
              label: String(data.delivery.label ?? ""),
              amountRub: Number(data.delivery.amountRub ?? 0),
              destinationCity: data.delivery.destinationCity ? String(data.delivery.destinationCity) : null,
              destinationPostalCode: data.delivery.destinationPostalCode ? String(data.delivery.destinationPostalCode) : null,
              destinationAddress: data.delivery.destinationAddress ? String(data.delivery.destinationAddress) : null,
              etaMinDays: Number(data.delivery.etaMinDays ?? 0),
              etaMaxDays: Number(data.delivery.etaMaxDays ?? 0),
            }
            : null,
          paidAt: (data.paidAt ?? null) as string | null,
        };

        setStatusData(nextData);

        if (nextData.status === "paid") {
          setViewState("paid");
          clearCart();
          localStorage.removeItem("lastCheckout");
          localStorage.removeItem(CHECKOUT_DRAFT_STORAGE_KEY);
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
          }
          return;
        }

        setViewState("pending");

        if (attemptsRef.current >= MAX_POLL_ATTEMPTS && intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Ошибка при проверке оплаты";
        setErrorMessage(message);
        setViewState("error");
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }
      }
    };

    fetchStatus();
    intervalRef.current = window.setInterval(fetchStatus, POLL_INTERVAL_MS);
  }, [checkoutRef, clearCart]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 space-y-6">
          {viewState === "loading" && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p>Проверяем статус оплаты...</p>
            </div>
          )}

          {viewState === "pending" && (
            <div className="space-y-3">
              <h1 className="text-3xl">Оплата обрабатывается</h1>
              <p className="text-muted-foreground">
                Платеж принят, ожидаем подтверждение от платежного сервиса.
              </p>
              {statusData && <OrderSummary statusData={statusData} />}
            </div>
          )}

          {viewState === "paid" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle2 className="w-7 h-7" />
                <h1 className="text-3xl text-foreground">Оплата прошла успешно</h1>
              </div>
              <p className="text-muted-foreground">
                Спасибо за заказ! Я скоро свяжусь с тобой для подтверждения деталей доставки.
              </p>
              {statusData && <OrderSummary statusData={statusData} />}
            </div>
          )}

          {viewState === "missing" && (
            <div className="space-y-3">
              <h1 className="text-3xl">Заказ не найден в браузере</h1>
              <p className="text-muted-foreground">
                Не удалось найти данные последнего заказа для проверки оплаты.
              </p>
            </div>
          )}

          {viewState === "error" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-6 h-6" />
                <h1 className="text-3xl text-foreground">Не удалось проверить оплату</h1>
              </div>
              <p className="text-muted-foreground">
                {errorMessage || "Попробуй снова через несколько минут."}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/shop">В каталог</Link>
            </Button>
            {trackingLink && (
              <Button variant="outline" asChild>
                <Link to={trackingLink}>Отследить заказ</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/contact">Написать по заказу</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ statusData }: { statusData: CheckoutStatus }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/60 p-4">
      <p className="text-sm">
        Номер заказа: <span className="font-medium">#{statusData.invId || statusData.id.slice(0, 8)}</span>
      </p>
      <div className="space-y-2">
        <p className="text-sm font-medium">Состав заказа:</p>
        {statusData.items.length > 0 ? (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {statusData.items.map((item, index) => (
              <li key={`${item.name}-${index}`} className="flex items-start justify-between gap-4">
                <span>{item.name} × {item.quantity}</span>
                <span>{item.lineTotal.toFixed(0)} ₽</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Состав уточняется.</p>
        )}
      </div>
      {statusData.delivery && (
        <div className="space-y-1 rounded-xl bg-muted/40 p-3">
          <p className="text-sm font-medium">Доставка</p>
          <p className="text-sm text-muted-foreground">
            {statusData.delivery.label} • {formatDeliveryAmount(statusData.delivery.amountRub)}
          </p>
          <p className="text-sm text-muted-foreground">
            {statusData.delivery.destinationAddress
              ? statusData.delivery.destinationAddress
              : `${statusData.delivery.destinationCity ? `${statusData.delivery.destinationCity}, ` : ""}${statusData.delivery.destinationPostalCode ?? ''}`} • {statusData.delivery.etaMinDays}-{statusData.delivery.etaMaxDays} дн.
          </p>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        Сумма заказа: <span className="font-medium text-foreground">{statusData.amountRub} ₽</span>
      </p>
    </div>
  );
}
