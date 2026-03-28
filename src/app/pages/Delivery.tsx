import { motion } from 'motion/react';
import { Truck, Package, CreditCard } from 'lucide-react';

export function Delivery() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-muted p-4 rounded-2xl mb-4">
            <Truck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl mb-4">Доставка и оплата</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Информация о том, как получить и оплатить ваши сокровища.
          </p>
        </motion.div>

        <div className="space-y-12">
          {/* Delivery Rates Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 bg-card rounded-3xl shadow-sm"
          >
            <div className="flex items-center gap-4 mb-6">
              <Package className="w-8 h-8 text-accent-foreground" />
              <div>
                <h2 className="text-2xl sm:text-3xl">Способы доставки</h2>
                <p className="text-muted-foreground">Единые тарифы для заказов по России.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-accent/10 text-accent-foreground p-4 rounded-xl font-medium">
                Бесплатная доставка от 1700 ₽
              </div>
              <ul className="space-y-3 text-lg">
                <li className="flex justify-between"><span>🦊 Почта России</span> <span>400 ₽</span></li>
                <li className="flex justify-between"><span>🦊 Яндекс Доставка</span> <span>300 ₽</span></li>
                <li className="flex justify-between"><span>🦊 Ozon Доставка</span> <span>300 ₽</span></li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Стоимость фиксируется на этапе оформления перед оплатой.
              </p>
            </div>
          </motion.div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-8 bg-card rounded-3xl shadow-sm"
          >
            <div className="flex items-start gap-4 mb-4">
              <CreditCard className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
              <h2 className="text-2xl sm:text-3xl">Оплата</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-lg text-muted-foreground">
                <CreditCard className="w-5 h-5 flex-shrink-0" />
                <span>Перевод на банковскую карту</span>
              </div>
              <div className="flex items-center gap-3 text-lg text-muted-foreground">
                <img src="/images/SBP.svg" alt="SBP Logo" className="w-5 h-5 flex-shrink-0" />
                <span>Система Быстрых Платежей (СБП)</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
