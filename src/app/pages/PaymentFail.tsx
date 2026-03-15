import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";

export function PaymentFail() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-6 h-6" />
              <h1 className="text-3xl text-foreground">Оплата не завершена</h1>
            </div>
            <p className="text-muted-foreground">
              Платеж был отменен или не прошел. Можно попробовать снова или написать мне, если нужна помощь с заказом.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/shop">Вернуться в каталог</Link>
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
