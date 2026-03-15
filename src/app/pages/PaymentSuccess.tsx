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
  status: "pending_payment" | "paid" | string;
  amountRub: string;
  paidAt: string | null;
};

type ViewState = "loading" | "pending" | "paid" | "missing" | "error";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 12;

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
        const data = (await response.json()) as Partial<CheckoutStatus> & { error?: string };

        if (!response.ok) {
          throw new Error(data.error || "Не удалось получить статус платежа");
        }

        const nextData: CheckoutStatus = {
          id: String(data.id ?? checkoutRef.id),
          status: String(data.status ?? "pending_payment"),
          amountRub: String(data.amountRub ?? "0.00"),
          paidAt: (data.paidAt ?? null) as string | null,
        };

        setStatusData(nextData);

        if (nextData.status === "paid") {
          setViewState("paid");
          clearCart();
          localStorage.removeItem("lastCheckout");
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
              {statusData && (
                <p className="text-sm text-muted-foreground">
                  Сумма заказа: {statusData.amountRub} ₽
                </p>
              )}
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
              {statusData && (
                <p className="text-sm text-muted-foreground">
                  Сумма заказа: {statusData.amountRub} ₽
                </p>
              )}
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
            <Button variant="outline" asChild>
              <Link to="/contact">Написать по заказу</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
