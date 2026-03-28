import { Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-sm text-muted-foreground space-y-1">
        <p>Продавец: самозанятый</p>
        <p>ИНН: 772980883172</p>
        <p>Город: Москва</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span>Контакты:</span>
          <a
            href="https://t.me/Makinari"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full border border-border bg-card inline-flex items-center justify-center hover:bg-muted/60 hover:text-foreground transition-colors"
            aria-label="Telegram"
            title="Telegram (@Makinari)"
          >
            <Send className="w-4 h-4" />
          </a>
          <a
            href="https://vk.com/makinari24"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full border border-border bg-card inline-flex items-center justify-center hover:bg-muted/60 hover:text-foreground transition-colors"
            aria-label="ВКонтакте"
            title="ВКонтакте (Makinari)"
          >
            <span className="text-[11px] font-semibold tracking-wide">ВК</span>
          </a>
        </div>
        <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link to="/track" className="hover:text-foreground transition-colors underline underline-offset-4">
            Отследить заказ
          </Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors underline underline-offset-4">
            Политика конфиденциальности
          </Link>
          <Link to="/offer" className="hover:text-foreground transition-colors underline underline-offset-4">
            Публичная оферта
          </Link>
        </div>
      </div>
    </footer>
  );
}
