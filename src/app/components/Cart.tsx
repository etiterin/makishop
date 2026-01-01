import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

export const Cart = () => {
  const { cartItems, addToCart, decreaseQuantity, removeFromCart, clearCart } = useCart();

  const total = cartItems.reduce((acc, item) => {
    // Удаляем все нечисловые символы, кроме точки, чтобы получить цену
    const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
    return acc + price * item.quantity;
  }, 0);

  const checkoutMessage = () => {
    let message = "Привет! Я хочу оформить заказ:\n\n";
    cartItems.forEach(item => {
      message += `- ${item.name} (x${item.quantity}) - ${item.price}\n`;
    });
    message += `\nИтого: ${total} ₽`;
    return message;
  };

  const handleCheckout = () => {
    const message = checkoutMessage();
    // Copy to clipboard or open a messaging app
    // For MVP, let's alert and copy to clipboard, or open a mailto link
    // Here we will copy to clipboard and maybe open a new tab for telegram if we had a username
    navigator.clipboard.writeText(message).then(() => {
        alert("Текст заказа скопирован! Отправь его мне в Telegram или VK.");
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Корзина</SheetTitle>
          <SheetDescription>
            Проверь свой заказ перед оформлением.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden py-4">
             {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
                    <p>Корзина пуста</p>
                </div>
             ) : (
                 <ScrollArea className="h-[calc(100vh-200px)] px-4">
                     <div className="space-y-4">
                         {cartItems.map((item) => (
                             <div key={item.id} className="flex gap-4 items-center border-b pb-4">
                                 <img src={item.image} alt={item.name} className="h-16 w-16 object-cover rounded-md" />
                                 <div className="flex-1">
                                     <h4 className="font-medium text-sm">{item.name}</h4>
                                     <p className="text-sm text-muted-foreground">{item.price}</p>
                                     <div className="flex items-center gap-2 mt-2">
                                         <Button
                                             variant="outline"
                                             size="icon"
                                             className="h-6 w-6"
                                             onClick={() => decreaseQuantity(item.id)}
                                         >
                                             <Minus className="h-3 w-3" />
                                         </Button>
                                         <span className="text-sm w-4 text-center">{item.quantity}</span>
                                          <Button
                                             variant="outline"
                                             size="icon"
                                             className="h-6 w-6"
                                             onClick={() => addToCart(item)}
                                         >
                                             <Plus className="h-3 w-3" />
                                         </Button>
                                     </div>
                                 </div>
                                 <Button
                                     variant="ghost"
                                     size="icon"
                                     className="h-8 w-8 text-destructive hover:text-destructive/90"
                                     onClick={() => removeFromCart(item.id)}
                                 >
                                     <Trash2 className="h-4 w-4" />
                                 </Button>
                             </div>
                         ))}
                     </div>
                 </ScrollArea>
             )}
        </div>
        {cartItems.length > 0 && (
            <SheetFooter>
                <div className="w-full space-y-4">
                    <div className="flex justify-between font-medium">
                        <span>Итого</span>
                        <span>{total} ₽</span>
                    </div>
                    <Button className="w-full" onClick={handleCheckout}>
                        Скопировать заказ
                    </Button>
                    <Button variant="outline" className="w-full" onClick={clearCart}>
                        Очистить корзину
                    </Button>
                </div>
            </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
