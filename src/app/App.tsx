import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Delivery } from './pages/Delivery';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { PublicOffer } from './pages/PublicOffer';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentFail } from './pages/PaymentFail';
import { Checkout } from './pages/Checkout';
import { TrackOrder } from './pages/TrackOrder';
import { CartProvider } from './context/CartContext';
import { ScrollToTop } from './components/ScrollToTop';
import { Toaster } from 'sonner';
import { SiteFooter } from './components/SiteFooter';

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
          </main>
          <SiteFooter />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
