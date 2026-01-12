import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, MessageCircle, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import productsData from '../data/products.json';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useLayoutEffect } from 'react';

const products = productsData.products;

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Принудительный скролл наверх при открытии страницы товара
  useLayoutEffect(() => {
    // Мгновенный скролл
    window.scrollTo(0, 0);
    
    // Страховочный скролл через минимальную задержку, чтобы компенсировать возможные сдвиги верстки
    const timeout = setTimeout(() => {
        window.scrollTo(0, 0);
    }, 0);
    
    return () => clearTimeout(timeout);
  }, [id]);

  const product = products.find((p) => p.id === Number(id));
  
  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">Товар не найден</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-accent text-accent-foreground rounded-full hover:bg-accent/80 transition-colors"
          >
            Вернуться в магазин
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
      addToCart(product);
      toast.success(`${product.name} добавлен в корзину`);
  };
  
  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Назад в магазин
        </motion.button>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="relative aspect-square bg-card rounded-3xl overflow-hidden shadow-lg">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover ${!product.inStock ? 'grayscale' : ''}`}
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-semibold tracking-wider text-lg bg-black/50 px-4 py-2 rounded-lg">Нет в наличии</span>
                </div>
              )}
            </div>
            
            {/* Additional images placeholder */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted rounded-2xl flex items-center justify-center opacity-40"
                >
                  <span className="text-4xl">✨</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-4xl">{product.name}</h1>
                <span className={`px-4 py-2 rounded-full text-sm ${!product.inStock ? 'bg-secondary text-secondary-foreground' : 'bg-accent/20 text-accent-foreground'}`}>
                  {product.category}
                </span>
              </div>
              
              <p className={`text-3xl ${!product.inStock ? 'text-muted-foreground line-through' : 'text-accent-foreground'}`}>{product.price}</p>
            </div>
            
            <div className="prose prose-lg">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-6 bg-muted rounded-2xl space-y-3">
                <h3 className="text-lg">Детали</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Сделано вручную с любовью</li>
                  <li>✓ Оригинальный дизайн</li>
                  <li>✓ Качественные материалы</li>
                  <li>✓ Водостойкий и прочный</li>
                </ul>
              </div>
              
              <div className="flex flex-col gap-3">
                {product.inStock ? (
                    <Button
                      onClick={handleAddToCart}
                      size="lg"
                      className="w-full text-lg h-14 rounded-full shadow-lg"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      В корзину
                    </Button>
                ) : (
                  <Button size="lg" disabled className="w-full text-lg h-14 rounded-full">
                    Нет в наличии
                  </Button>
                )}
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate('/contact')}
                    size="lg"
                    className="w-full text-lg h-14 rounded-full"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Написать по заказу
                  </Button>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Каждое изделие создается под заказ. Пожалуйста, ожидайте 3-5 дней на изготовление.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
