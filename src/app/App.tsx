import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { CartProvider } from './context/CartContext';
import { ScrollToTop } from './components/ScrollToTop';
import { Toaster } from 'sonner';
import { SiteFooter } from './components/SiteFooter';

const Shop = lazy(() => import('./pages/Shop').then((module) => ({ default: module.Shop })));
const ProductDetail = lazy(() =>
  import('./pages/ProductDetail').then((module) => ({ default: module.ProductDetail })),
);
const About = lazy(() => import('./pages/About').then((module) => ({ default: module.About })));
const Contact = lazy(() => import('./pages/Contact').then((module) => ({ default: module.Contact })));
const Delivery = lazy(() => import('./pages/Delivery').then((module) => ({ default: module.Delivery })));
const PrivacyPolicy = lazy(() =>
  import('./pages/PrivacyPolicy').then((module) => ({ default: module.PrivacyPolicy })),
);
const PublicOffer = lazy(() =>
  import('./pages/PublicOffer').then((module) => ({ default: module.PublicOffer })),
);
const PaymentSuccess = lazy(() =>
  import('./pages/PaymentSuccess').then((module) => ({ default: module.PaymentSuccess })),
);
const PaymentFail = lazy(() =>
  import('./pages/PaymentFail').then((module) => ({ default: module.PaymentFail })),
);
const Checkout = lazy(() => import('./pages/Checkout').then((module) => ({ default: module.Checkout })));
const TrackOrder = lazy(() =>
  import('./pages/TrackOrder').then((module) => ({ default: module.TrackOrder })),
);

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <Toaster position="top-center" richColors />
        <div className="relative min-h-screen flex flex-col">
          <div aria-hidden className="fixed inset-0 -z-10">
            <img
              src="/images/background.jpg"
              alt=""
              className="w-full h-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-background/88" />
          </div>
          <Navigation />
          <main className="flex-1">
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Загрузка...</div>}>
              <Routes>
                <Route path="/" element={<Shop />} />
                <Route path="/shop" element={<Navigate to="/" replace />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/delivery" element={<Delivery />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
                <Route path="/offer" element={<PublicOffer />} />
                <Route path="/oferta" element={<Navigate to="/offer" replace />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/track" element={<TrackOrder />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/fail" element={<PaymentFail />} />
                {/* Catch-all route for 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <SiteFooter />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
