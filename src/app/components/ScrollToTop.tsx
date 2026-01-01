import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();
  const action = useNavigationType();

  useEffect(() => {
    // Скроллим вверх только если это не переход "Назад" (POP)
    if (action !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, action]);

  return null;
}
