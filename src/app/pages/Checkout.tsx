import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useCart } from '../context/CartContext';
import { getApiBaseUrl } from '../lib/api';
import { toast } from 'sonner';
import { Check, Minus, Plus, Trash2, Truck } from 'lucide-react';

type CreateCheckoutResponse = {
  paymentUrl?: string;
  paymentForm?: {
    action: string;
    method?: string;
    fields: Record<string, string>;
  };
  orderId: string;
  statusToken: string;
};

type DeliveryMode = 'russian_post' | 'ozon' | 'yandex';
type DeliveryProvider = DeliveryMode;
type PostDeliveryMethod = 'phone' | 'address';

type DeliveryQuoteOption = {
  mode: DeliveryProvider;
  optionCode: string;
  optionLabel: string;
  amountRub: number;
  etaMinDays: number;
  etaMaxDays: number;
};

type CheckoutDraft = {
  email: string;
  name: string;
  phone: string;
  telegram: string;
  comment: string;
  deliveryMode: DeliveryMode;
  destinationPostalCode: string;
  destinationAddress: string;
  postDeliveryMethod: PostDeliveryMethod;
};

const DELIVERY_OPTIONS: Array<{
  value: DeliveryMode;
  label: string;
}> = [
  {
    value: 'russian_post',
    label: 'Почта России',
  },
  {
    value: 'ozon',
    label: 'Ozon Доставка',
  },
  {
    value: 'yandex',
    label: 'Яндекс Доставка',
  },
];

const FREE_DELIVERY_THRESHOLD_RUB = 1700;
const FIXED_DELIVERY_RATES_RUB: Record<DeliveryProvider, number> = {
  russian_post: 400,
  ozon: 300,
  yandex: 300,
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPostalCode(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}

function isLikelyPhone(value: string): boolean {
  return value.replace(/\D/g, '').length >= 10;
}

function formatDeliveryAmount(amountRub: number): string {
  return amountRub <= 0 ? 'бесплатно' : `${amountRub} ₽`;
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

function submitPaymentForm(args: {
  action: string;
  method?: string;
  fields: Record<string, string>;
}): void {
  const form = document.createElement('form');
  form.method = (args.method ?? 'POST').toUpperCase();
  form.action = args.action;
  form.acceptCharset = 'UTF-8';
  form.style.display = 'none';

  Object.entries(args.fields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

const CHECKOUT_DRAFT_STORAGE_KEY = 'checkoutDraft';

function getDeliveryToneClass(mode: DeliveryMode): string {
  if (mode === 'ozon') {
    return 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300';
  }
  if (mode === 'yandex') {
    return 'border-yellow-500/50 bg-yellow-500/15 text-yellow-800 dark:text-yellow-300';
  }
  if (mode === 'russian_post') {
    return 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300';
  }
  return 'border-border bg-muted/30 text-muted-foreground';
}

function buildSelectedDeliveryOption(
  mode: DeliveryMode,
  postMethod: PostDeliveryMethod,
  subtotalRub: number,
): DeliveryQuoteOption {
  const isFree = subtotalRub >= FREE_DELIVERY_THRESHOLD_RUB;

  if (mode === 'russian_post') {
    return {
      mode: 'russian_post',
      optionCode: postMethod === 'phone' ? 'post_phone' : 'post_address',
      optionLabel:
        postMethod === 'phone'
          ? 'Почта России, по номеру телефона'
          : 'Почта России, по индексу и адресу',
      amountRub: isFree ? 0 : FIXED_DELIVERY_RATES_RUB.russian_post,
      etaMinDays: 4,
      etaMaxDays: 10,
    };
  }

  if (mode === 'ozon') {
    return {
      mode: 'ozon',
      optionCode: 'ozon_pickup',
      optionLabel: 'Ozon Доставка, пункт выдачи',
      amountRub: isFree ? 0 : FIXED_DELIVERY_RATES_RUB.ozon,
      etaMinDays: 2,
      etaMaxDays: 7,
    };
  }

  return {
    mode: 'yandex',
    optionCode: 'yandex_pickup',
    optionLabel: 'Яндекс Доставка, пункт выдачи',
    amountRub: isFree ? 0 : FIXED_DELIVERY_RATES_RUB.yandex,
    etaMinDays: 2,
    etaMaxDays: 7,
  };
}

function getCheckoutDraft(): CheckoutDraft | null {
  try {
    const raw = localStorage.getItem(CHECKOUT_DRAFT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;
    const deliveryMode: DeliveryMode =
      parsed.deliveryMode === 'russian_post'
      || parsed.deliveryMode === 'ozon'
      || parsed.deliveryMode === 'yandex'
        ? parsed.deliveryMode
        : 'russian_post';

    return {
      email: String(parsed.email ?? ''),
      name: String(parsed.name ?? ''),
      phone: String(parsed.phone ?? (parsed as { contact?: string }).contact ?? ''),
      telegram: String(parsed.telegram ?? ''),
      comment: String(parsed.comment ?? ''),
      deliveryMode,
      destinationPostalCode: String(parsed.destinationPostalCode ?? ''),
      destinationAddress: String(parsed.destinationAddress ?? ''),
      postDeliveryMethod:
        parsed.postDeliveryMethod === 'address' || parsed.postDeliveryMethod === 'phone'
          ? parsed.postDeliveryMethod
          : 'phone',
    };
  } catch {
    return null;
  }
}

export function Checkout() {
  const navigate = useNavigate();
  const { cartItems, addToCart, decreaseQuantity, removeFromCart } = useCart();
  const draft = useMemo(() => getCheckoutDraft(), []);
  const [email, setEmail] = useState(() => draft?.email ?? '');
  const [name, setName] = useState(() => draft?.name ?? '');
  const [phone, setPhone] = useState(() => draft?.phone ?? '');
  const [telegram, setTelegram] = useState(() => draft?.telegram ?? '');
  const [comment, setComment] = useState(() => draft?.comment ?? '');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(
    () => draft?.deliveryMode ?? 'russian_post',
  );
  const [destinationPostalCode, setDestinationPostalCode] = useState(() => draft?.destinationPostalCode ?? '');
  const [destinationAddress, setDestinationAddress] = useState(() => draft?.destinationAddress ?? '');
  const [postDeliveryMethod, setPostDeliveryMethod] = useState<PostDeliveryMethod>(
    () => draft?.postDeliveryMethod ?? 'phone',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems],
  );

  const totalCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems],
  );

  const selectedDeliveryOption = useMemo(
    () => buildSelectedDeliveryOption(deliveryMode, postDeliveryMethod, total),
    [deliveryMode, postDeliveryMethod, total],
  );
  const deliveryAmount = selectedDeliveryOption.amountRub;
  const totalWithDelivery = total + deliveryAmount;
  const isPhoneRequired = deliveryMode === 'ozon'
    || deliveryMode === 'yandex'
    || (deliveryMode === 'russian_post' && postDeliveryMethod === 'phone');
  const isPostalAddressRequired = deliveryMode === 'russian_post' && postDeliveryMethod === 'address';
  const isPickupAddressRequired = deliveryMode === 'ozon' || deliveryMode === 'yandex';

  useEffect(() => {
    try {
      localStorage.setItem(
        CHECKOUT_DRAFT_STORAGE_KEY,
        JSON.stringify({
          email,
          name,
          phone,
          telegram,
          comment,
          deliveryMode,
          destinationPostalCode,
          destinationAddress,
          postDeliveryMethod,
        } satisfies CheckoutDraft),
      );
    } catch {
      // Ignore storage errors (private mode / quota), checkout should still work.
    }
  }, [comment, deliveryMode, destinationAddress, destinationPostalCode, email, name, phone, postDeliveryMethod, telegram]);

  const handleOnlinePayment = async () => {
    if (cartItems.length === 0 || isSubmitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      toast.error('Нужен корректный email', {
        description: 'На него Robokassa отправит чек и уведомление об оплате.',
      });
      return;
    }

    const normalizedPhone = phone.trim();
    const normalizedTelegram = telegram.trim();
    const normalizedAddress = destinationAddress.trim();
    const normalizedPostalCode = destinationPostalCode.trim();

    if (isPhoneRequired && !isLikelyPhone(normalizedPhone)) {
      toast.error('Нужен номер телефона', {
        description: 'Для выбранного способа доставки укажи корректный номер телефона.',
      });
      return;
    }

    if (isPostalAddressRequired) {
      if (!isValidPostalCode(normalizedPostalCode) || !normalizedAddress) {
        toast.error('Нужны индекс и адрес', {
          description: 'Для Почты России по адресу укажи индекс из 6 цифр и адрес.',
        });
        return;
      }
    }

    if (isPickupAddressRequired && !normalizedAddress) {
      toast.error('Нужен адрес пункта выдачи', {
        description: 'Для Ozon и Яндекс доставки укажи адрес ПВЗ.',
      });
      return;
    }

    setIsSubmitting(true);
    const apiBase = getApiBaseUrl();

    try {
      const response = await fetch(`${apiBase}/api/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          customer: {
            email: normalizedEmail,
            name: name.trim() || undefined,
            phone: normalizedPhone || undefined,
            telegram: normalizedTelegram || undefined,
            contact: normalizedPhone || normalizedTelegram || undefined,
            comment: comment.trim() || undefined,
            deliveryMode,
            delivery: {
              mode: deliveryMode,
              destinationPostalCode:
                deliveryMode === 'russian_post' && postDeliveryMethod === 'address'
                  ? normalizedPostalCode
                  : undefined,
              destinationAddress:
                deliveryMode === 'russian_post' && postDeliveryMethod === 'phone'
                  ? undefined
                  : normalizedAddress || undefined,
              optionCode: selectedDeliveryOption.optionCode,
              optionLabel: selectedDeliveryOption.optionLabel,
              amountRub: selectedDeliveryOption.amountRub,
              etaMinDays: selectedDeliveryOption.etaMinDays,
              etaMaxDays: selectedDeliveryOption.etaMaxDays,
            },
          },
        }),
      });

      const data = await parseJsonResponse<Partial<CreateCheckoutResponse> & { error?: string }>(response);
      if (!response.ok || !data.orderId || !data.statusToken) {
        throw new Error(data.error || 'Не удалось создать заказ для онлайн-оплаты');
      }

      localStorage.setItem(
        'lastCheckout',
        JSON.stringify({
          id: data.orderId,
          token: data.statusToken,
          email: normalizedEmail,
        }),
      );

      if (data.paymentForm?.action && data.paymentForm?.fields) {
        submitPaymentForm({
          action: data.paymentForm.action,
          method: data.paymentForm.method,
          fields: data.paymentForm.fields,
        });
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      throw new Error('Не удалось подготовить форму оплаты');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка при создании заказа';
      toast.error('Не получилось перейти к оплате', {
        description: message,
      });
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-card border border-border/60 rounded-3xl p-6 sm:p-8 space-y-6 text-center">
          <h1 className="text-3xl">Оформлять пока нечего</h1>
          <p className="text-muted-foreground">Добавь товары в корзину, и здесь появится форма заказа.</p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link to="/shop">Перейти в каталог</Link>
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Назад
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl">Оформление заказа</h1>
          <p className="text-muted-foreground mt-2">Заполни контакты, выбери способ доставки и перейди к оплате.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 lg:gap-8">
          <div className="space-y-6">
            <section className="bg-card border border-border/60 rounded-3xl p-5 sm:p-6 space-y-4">
              <h2 className="text-2xl">Контакты</h2>
              <div className="space-y-2">
                <label htmlFor="checkout-email" className="text-sm font-medium">
                  Email для чека <span className="text-destructive">*</span>
                </label>
                <Input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Этот email передаем в Robokassa для отправки чека.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="checkout-name" className="text-sm font-medium">Имя</label>
                  <Input
                    id="checkout-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Как к тебе обращаться"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="checkout-phone" className="text-sm font-medium">
                    Телефон {isPhoneRequired && <span className="text-destructive">*</span>}
                  </label>
                  <Input
                    id="checkout-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+7..."
                    autoComplete="tel"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="checkout-telegram" className="text-sm font-medium">Telegram</label>
                <Input
                  id="checkout-telegram"
                  value={telegram}
                  onChange={(event) => setTelegram(event.target.value)}
                  placeholder="@username"
                  autoComplete="off"
                />
              </div>
            </section>

            <section className="bg-card border border-border/60 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-2xl">Доставка</h2>
              </div>

              <div className="space-y-2">
                <label htmlFor="checkout-delivery-mode" className="text-sm font-medium">Способ доставки</label>
                <select
                  id="checkout-delivery-mode"
                  value={deliveryMode}
                  onChange={(event) => setDeliveryMode(event.target.value as DeliveryMode)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {DELIVERY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 rounded-2xl border border-border/70 p-4">
                {deliveryMode === 'russian_post' && (
                  <div className="space-y-2">
                    <label htmlFor="checkout-post-method" className="text-sm font-medium">Вариант Почты России</label>
                    <select
                      id="checkout-post-method"
                      value={postDeliveryMethod}
                      onChange={(event) => setPostDeliveryMethod(event.target.value as PostDeliveryMethod)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="phone">По номеру телефона</option>
                      <option value="address">По индексу и адресу</option>
                    </select>
                  </div>
                )}

                <div className={`rounded-xl border px-3 py-2 text-sm ${getDeliveryToneClass(deliveryMode)}`}>
                  <p className="font-medium">{selectedDeliveryOption.optionLabel}</p>
                  <p className="text-xs opacity-90">
                    {formatDeliveryAmount(selectedDeliveryOption.amountRub)} • срок {selectedDeliveryOption.etaMinDays}-{selectedDeliveryOption.etaMaxDays} дн.
                  </p>
                </div>

                {isPostalAddressRequired && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="checkout-destination-postal-code" className="text-sm font-medium">
                        Индекс <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="checkout-destination-postal-code"
                        inputMode="numeric"
                        maxLength={6}
                        value={destinationPostalCode}
                        onChange={(event) => setDestinationPostalCode(event.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                        placeholder="101000"
                        autoComplete="postal-code"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="checkout-destination-address" className="text-sm font-medium">
                        Адрес <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="checkout-destination-address"
                        value={destinationAddress}
                        onChange={(event) => setDestinationAddress(event.target.value)}
                        placeholder="Улица, дом, квартира"
                        autoComplete="street-address"
                      />
                    </div>
                  </>
                )}

                {isPickupAddressRequired && (
                  <div className="space-y-2">
                    <label htmlFor="checkout-pickup-address" className="text-sm font-medium">
                      Адрес пункта выдачи <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="checkout-pickup-address"
                      value={destinationAddress}
                      onChange={(event) => setDestinationAddress(event.target.value)}
                      placeholder="Адрес выбранного ПВЗ"
                    />
                  </div>
                )}

                {isPhoneRequired && (
                  <p className="text-xs text-muted-foreground">
                    Для этого способа обязателен корректный номер телефона в поле «Телефон».
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Бесплатная доставка при сумме товаров от 1700 ₽.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="checkout-comment" className="text-sm font-medium">Комментарий к заказу</label>
                <Textarea
                  id="checkout-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Например, пожелания по упаковке или доставке"
                />
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 h-fit bg-card border border-border/60 rounded-3xl p-5 sm:p-6 space-y-5">
            <h2 className="text-2xl">Твой заказ</h2>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="border border-border/60 rounded-2xl p-3">
                  <div className="flex gap-3">
                    <img src={item.images[0]} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.price} ₽ за штуку</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 border border-border rounded-full p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 rounded-full"
                        onClick={() => decreaseQuantity(item.id)}
                      >
                        {item.quantity === 1 ? <Trash2 className="w-4 h-4 text-destructive" /> : <Minus className="w-4 h-4" />}
                      </Button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 rounded-full"
                        onClick={() => addToCart(item)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="font-medium">{item.price * item.quantity} ₽</p>
                  </div>

                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-destructive mt-2"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Товаров</span>
                <span>{totalCount} шт.</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Товары</span>
                <span>{total} ₽</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Доставка</span>
                <span>{formatDeliveryAmount(selectedDeliveryOption.amountRub)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Итого</span>
                <span>{totalWithDelivery} ₽</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Стоимость доставки фиксируется в заказе перед оплатой. От 1700 ₽ доставка бесплатная.
              </p>
            </div>

            <Button
              className="w-full"
              onClick={handleOnlinePayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Переходим к оплате...' : 'Оплатить онлайн'}
            </Button>

            <Button variant="outline" className="w-full" asChild>
              <Link to="/shop">
                Продолжить покупки
              </Link>
            </Button>

            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              После оплаты ты увидишь страницу подтверждения заказа.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
