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
  paymentUrl: string;
  orderId: string;
  statusToken: string;
};

type CheckoutDraft = {
  email: string;
  name: string;
  contact: string;
  comment: string;
  deliveryMode: DeliveryMode;
};

type DeliveryMode = 'manual_confirmation' | 'russian_post' | 'cdek';

const DELIVERY_OPTIONS: Array<{
  value: DeliveryMode;
  label: string;
  description: string;
  disabled?: boolean;
}> = [
  {
    value: 'manual_confirmation',
    label: 'Уточнить после оплаты',
    description: 'Сейчас подтверждаем способ доставки в личной переписке.',
  },
  {
    value: 'russian_post',
    label: 'Почта России (скоро)',
    description: 'Добавим расчет и выбор отделения прямо на этом шаге.',
    disabled: true,
  },
  {
    value: 'cdek',
    label: 'СДЭК (скоро)',
    description: 'Позже добавим выбор пункта выдачи на карте.',
    disabled: true,
  },
];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const CHECKOUT_DRAFT_STORAGE_KEY = 'checkoutDraft';

function getCheckoutDraft(): CheckoutDraft | null {
  try {
    const raw = localStorage.getItem(CHECKOUT_DRAFT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;
    const deliveryMode: DeliveryMode =
      parsed.deliveryMode === 'russian_post' || parsed.deliveryMode === 'cdek'
        ? parsed.deliveryMode
        : 'manual_confirmation';

    return {
      email: String(parsed.email ?? ''),
      name: String(parsed.name ?? ''),
      contact: String(parsed.contact ?? ''),
      comment: String(parsed.comment ?? ''),
      deliveryMode,
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
  const [contact, setContact] = useState(() => draft?.contact ?? '');
  const [comment, setComment] = useState(() => draft?.comment ?? '');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(
    () => draft?.deliveryMode ?? 'manual_confirmation',
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

  useEffect(() => {
    try {
      localStorage.setItem(
        CHECKOUT_DRAFT_STORAGE_KEY,
        JSON.stringify({
          email,
          name,
          contact,
          comment,
          deliveryMode,
        } satisfies CheckoutDraft),
      );
    } catch {
      // Ignore storage errors (private mode / quota), checkout should still work.
    }
  }, [comment, contact, deliveryMode, email, name]);

  const handleOnlinePayment = async () => {
    if (cartItems.length === 0 || isSubmitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      toast.error('Нужен корректный email', {
        description: 'На него Robokassa отправит чек и уведомление об оплате.',
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
            contact: contact.trim() || undefined,
            comment: comment.trim() || undefined,
            deliveryMode,
          },
        }),
      });

      const data = await response.json() as Partial<CreateCheckoutResponse> & { error?: string };
      if (!response.ok || !data.paymentUrl || !data.orderId || !data.statusToken) {
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

      window.location.href = data.paymentUrl;
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
                  <label htmlFor="checkout-contact" className="text-sm font-medium">Телеграм / телефон</label>
                  <Input
                    id="checkout-contact"
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    placeholder="@username или +7..."
                    autoComplete="tel"
                  />
                </div>
              </div>
            </section>

            <section className="bg-card border border-border/60 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-2xl">Доставка</h2>
              </div>

              <div className="space-y-3">
                {DELIVERY_OPTIONS.map((option) => {
                  const selected = deliveryMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      } ${option.disabled ? 'opacity-55 cursor-not-allowed hover:border-border' : ''}`}
                      onClick={() => {
                        if (option.disabled) return;
                        setDeliveryMode(option.value);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1 inline-flex w-4 h-4 rounded-full border ${
                            selected ? 'border-primary bg-primary' : 'border-muted-foreground/60'
                          }`}
                        />
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
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
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Итого</span>
                <span>{total} ₽</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Стоимость доставки пока подтверждается отдельно.
              </p>
            </div>

            <Button className="w-full" onClick={handleOnlinePayment} disabled={isSubmitting}>
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
