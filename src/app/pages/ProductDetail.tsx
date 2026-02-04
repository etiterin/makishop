import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, MessageCircle, ShoppingCart } from 'lucide-react';
import productsData from '../data/products.json';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useLayoutEffect } from 'react';
import { ProductImageGallery } from '../components/ProductImageGallery';
import { Product } from './Shop'; // Import Product type for consistency

const products: Product[] = productsData.products;

const categoryLabels: { [key: string]: string } = {
  sticker: 'Стикеры', keychain: 'Брелоки', set: 'Сеты',
  print: 'Принты', textile: 'Текстиль', ribbon: 'Ленты',
  badge: 'Значки', swap: 'Свопки'
};

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const product = products.find((p) => p.id === Number(id));
  
  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
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
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 md:mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Назад в магазин
        </motion.button>
        
        <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProductImageGallery 
              images={product.images} 
              productName={product.name} 
              inStock={product.inStock} 
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6 md:space-y-8 mt-6 md:mt-0"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl md:text-4xl break-words">{product.name}</h1>
                <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap mt-1 ${!product.inStock ? 'bg-secondary text-secondary-foreground' : 'bg-accent/20 text-accent-foreground'}">
                  {categoryLabels[product.category] || product.category}
                </span>
              </div>
              
              <p className={`text-2xl md:text-3xl ${!product.inStock ? 'text-muted-foreground line-through' : 'text-accent-foreground'}`}>{product.price} ₽</p>
            </div>
            
            <div className="prose prose-base md:prose-lg">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-5 bg-muted rounded-2xl space-y-3">
                <h3 className="text-lg">Детали</h3>
                <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
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
                      className="w-full text-base md:text-lg h-12 md:h-14 rounded-full shadow-lg"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      В корзину
                    </Button>
                ) : (
                  <Button size="lg" disabled className="w-full text-base md:text-lg h-12 md:h-14 rounded-full">
                    Нет в наличии
                  </Button>
                )}
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate('/contact')}
                    size="lg"
                    className="w-full text-base md:text-lg h-12 md:h-14 rounded-full"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Написать по заказу
                  </Button>
              </div>
              
              <p className="text-sm text-muted-foreground text-center px-4">
                Каждое изделие создается под заказ. Пожалуйста, ожидайте 3-5 дней на изготовление.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
