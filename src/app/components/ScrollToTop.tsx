import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Отключаем автоматическое восстановление скролла браузером,
    // чтобы оно не мешало нашему принудительному скроллу вверх.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
