import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, PackageSearch } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { getApiBaseUrl } from '../lib/api';

type FulfillmentStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'canceled';

type TrackOrderResponse = {
  id: string;
  invId: number;
  status: string;
  fulfillmentStatus: FulfillmentStatus;
  fulfillmentStatusUpdatedAt: string | null;
  amountRub: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    lineTotal: number;
  }>;
  delivery: {
    mode: 'cdek' | 'russian_post';
    label: string;
    amountRub: number;
    destinationCity: string | null;
    destinationPostalCode: string;
    etaMinDays: number;
    etaMaxDays: number;
  } | null;
  timeline: Array<{
    key: string;
    at: string | null;
  }>;
  createdAt: string;
  paidAt: string | null;
};

const STATUS_FLOW: FulfillmentStatus[] = [
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'completed',
];

const STATUS_LABELS: Record<FulfillmentStatus, string> = {
  pending_payment: 'Ожидает оплату',
  paid: 'Оплачен',
  processing: 'В обработке',
  shipped: 'Передан в доставку',
  delivered: 'Доставлен',
  completed: 'Завершен',
  canceled: 'Отменен',
};

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

function formatDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleString('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(() => searchParams.get('id') ?? '');
  const [token, setToken] = useState(() => searchParams.get('token') ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState<TrackOrderResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const currentStatus = statusData?.fulfillmentStatus ?? 'pending_payment';
  const currentStatusIndex = STATUS_FLOW.indexOf(currentStatus === 'canceled' ? 'pending_payment' : currentStatus);

  const timelineMap = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const event of statusData?.timeline ?? []) {
      if (!map.has(event.key)) {
        map.set(event.key, event.at ?? null);
      }
    }
    return map;
  }, [statusData]);

  const loadTracking = async (nextOrderId: string, nextToken: string) => {
    const normalizedOrderId = nextOrderId.trim();
    const normalizedToken = nextToken.trim();
    if (!normalizedOrderId || !normalizedToken) {
      setErrorMessage('Нужны id заказа и token из письма.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setStatusData(null);

    const apiBase = getApiBaseUrl();
    try {
      const response = await fetch(
        `${apiBase}/api/orders/track?id=${encodeURIComponent(normalizedOrderId)}&token=${encodeURIComponent(normalizedToken)}`,
      );
      const data = await parseJsonResponse<Partial<TrackOrderResponse> & { error?: string }>(response);
      if (!response.ok || !data.id || !data.fulfillmentStatus) {
        throw new Error(data.error || 'Не удалось загрузить статус заказа');
      }

      setStatusData({
        id: String(data.id),
        invId: Number(data.invId ?? 0),
        status: String(data.status ?? ''),
        fulfillmentStatus: (data.fulfillmentStatus as FulfillmentStatus) ?? 'pending_payment',
        fulfillmentStatusUpdatedAt: data.fulfillmentStatusUpdatedAt ? String(data.fulfillmentStatusUpdatedAt) : null,
        amountRub: String(data.amountRub ?? '0.00'),
        items: Array.isArray(data.items)
          ? data.items.map((item) => ({
            name: String(item?.name ?? ''),
            quantity: Number(item?.quantity ?? 0),
            price: Number(item?.price ?? 0),
            lineTotal: Number(item?.lineTotal ?? 0),
          })).filter((item) => item.name && item.quantity > 0)
          : [],
        delivery: data.delivery
          ? {
            mode: data.delivery.mode === 'cdek' ? 'cdek' : 'russian_post',
            label: String(data.delivery.label ?? ''),
            amountRub: Number(data.delivery.amountRub ?? 0),
            destinationCity: data.delivery.destinationCity ? String(data.delivery.destinationCity) : null,
            destinationPostalCode: String(data.delivery.destinationPostalCode ?? ''),
            etaMinDays: Number(data.delivery.etaMinDays ?? 0),
            etaMaxDays: Number(data.delivery.etaMaxDays ?? 0),
          }
          : null,
        timeline: Array.isArray(data.timeline)
          ? data.timeline.map((event) => ({
            key: String(event?.key ?? ''),
            at: event?.at ? String(event.at) : null,
          })).filter((event) => event.key)
          : [],
        createdAt: String(data.createdAt ?? ''),
        paidAt: data.paidAt ? String(data.paidAt) : null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить статус заказа';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const idFromQuery = searchParams.get('id') ?? '';
    const tokenFromQuery = searchParams.get('token') ?? '';
    if (!idFromQuery || !tokenFromQuery) return;

    setOrderId(idFromQuery);
    setToken(tokenFromQuery);
    loadTracking(idFromQuery, tokenFromQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const normalizedOrderId = orderId.trim();
    const normalizedToken = token.trim();
    setSearchParams({
      id: normalizedOrderId,
      token: normalizedToken,
    });
    loadTracking(normalizedOrderId, normalizedToken);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <section className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <PackageSearch className="w-6 h-6 text-muted-foreground" />
            <h1 className="text-3xl">Отслеживание заказа</h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Вставь данные из письма подтверждения: `id` и `token`.
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
            <Input
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="id заказа"
            />
            <Input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="token заказа"
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Проверяем...' : 'Показать статус'}
              </Button>
              <Button asChild variant="outline">
                <Link to="/shop">В магазин</Link>
              </Button>
            </div>
          </form>
        </section>

        {isLoading && (
          <section className="bg-card border border-border/60 rounded-3xl p-6 flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p>Загружаем статус заказа...</p>
          </section>
        )}

        {errorMessage && (
          <section className="bg-card border border-destructive/40 rounded-3xl p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <p className="text-sm sm:text-base">{errorMessage}</p>
          </section>
        )}

        {statusData && (
          <section className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Заказ #{statusData.invId || statusData.id.slice(0, 8)}
              </p>
              <p className="text-xl sm:text-2xl">
                Статус: <span className="font-semibold">{STATUS_LABELS[currentStatus]}</span>
              </p>
              {statusData.fulfillmentStatusUpdatedAt && (
                <p className="text-sm text-muted-foreground">
                  Обновлено: {formatDateTime(statusData.fulfillmentStatusUpdatedAt)}
                </p>
              )}
            </div>

            {currentStatus !== 'canceled' ? (
              <ol className="space-y-3">
                {STATUS_FLOW.map((step, index) => {
                  const completed = index <= currentStatusIndex;
                  const isCurrent = step === currentStatus;
                  const stepDate = formatDateTime(timelineMap.get(step) ?? null);
                  return (
                    <li key={step} className="flex items-start gap-3">
                      <span className="mt-0.5">
                        {completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <span className="inline-block w-5 h-5 rounded-full border border-muted-foreground/40" />
                        )}
                      </span>
                      <div>
                        <p className={isCurrent ? 'font-semibold' : 'text-muted-foreground'}>
                          {STATUS_LABELS[step]}
                        </p>
                        {stepDate && <p className="text-xs text-muted-foreground">{stepDate}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                Заказ отменен. Если нужна помощь, напиши в контакты магазина.
              </div>
            )}

            <div className="space-y-2 rounded-2xl border border-border/60 p-4">
              <p className="font-medium">Состав заказа</p>
              {statusData.items.length > 0 ? (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {statusData.items.map((item, index) => (
                    <li key={`${item.name}-${index}`} className="flex justify-between gap-3">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{item.lineTotal.toFixed(0)} ₽</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Состав уточняется.</p>
              )}
              <p className="text-sm text-muted-foreground">
                Сумма заказа: <span className="font-medium text-foreground">{statusData.amountRub} ₽</span>
              </p>
            </div>

            {statusData.delivery && (
              <div className="space-y-1 rounded-2xl border border-border/60 p-4">
                <p className="font-medium">Доставка</p>
                <p className="text-sm text-muted-foreground">
                  {statusData.delivery.label} • {statusData.delivery.amountRub} ₽
                </p>
                <p className="text-sm text-muted-foreground">
                  {statusData.delivery.destinationCity ? `${statusData.delivery.destinationCity}, ` : ''}
                  {statusData.delivery.destinationPostalCode}
                </p>
                <p className="text-sm text-muted-foreground">
                  Ориентировочный срок: {statusData.delivery.etaMinDays}-{statusData.delivery.etaMaxDays} дн.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
