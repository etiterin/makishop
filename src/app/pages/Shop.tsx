import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { products, Product } from '../data/products';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export function Shop() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'sticker' | 'keychain' | 'set' | 'print'>('all');
  const [fandomFilter, setFandomFilter] = useState<'all' | 'Original' | 'Evangelion' | 'Pokemon'>('all');
  
  const getSortedProducts = () => {
    let filtered = [...products];
    
    // Filter by Category
    if (filter !== 'all') {
        filtered = filtered.filter((p) => p.category === filter);
    }

    // Filter by Fandom
    if (fandomFilter !== 'all') {
        filtered = filtered.filter((p) => p.fandom === fandomFilter);
    }
    
    // Sort by Stock
    return filtered.sort((a, b) => {
      if (a.inStock === b.inStock) return 0;
      return a.inStock ? -1 : 1;
    });
  };

  const filteredProducts = getSortedProducts();

  const categories = [
    { value: 'all' as const, label: 'Все товары' },
    { value: 'sticker' as const, label: 'Стикеры' },
    { value: 'keychain' as const, label: 'Брелоки' },
    { value: 'set' as const, label: 'Сеты' },
    { value: 'print' as const, label: 'Принты' },
  ];

  const fandoms = [
      { value: 'all' as const, label: 'Все фандомы' },
      { value: 'Original' as const, label: 'Ориджинал' },
      { value: 'Evangelion' as const, label: 'Evangelion' },
      { value: 'Pokemon' as const, label: 'Pokemon' },
  ];
  
  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl mb-4">Коллекция</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Каждая вещь сделана вручную, с любовью и вниманием к деталям
          </p>
        </motion.div>
        
        {/* Filters */}
        <div className="space-y-6 mb-16">
            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-center flex-wrap gap-3"
            >
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setFilter(cat.value)}
                  className={`px-6 py-2 rounded-full transition-all duration-200 border border-transparent ${
                    filter === cat.value
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </motion.div>

             {/* Fandom Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex justify-center flex-wrap gap-2"
            >
              <span className="text-sm font-medium text-muted-foreground self-center mr-2">Фандом:</span>
              {fandoms.map((fan) => (
                <button
                  key={fan.value}
                  onClick={() => setFandomFilter(fan.value)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 border ${
                    fandomFilter === fan.value
                      ? 'bg-accent/20 border-accent text-accent-foreground font-medium'
                      : 'bg-transparent border-border text-muted-foreground hover:border-accent/50'
                  }`}
                >
                  {fan.label}
                </button>
              ))}
            </motion.div>
        </div>
        
        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
        ) : (
            <div className="text-center py-20 text-muted-foreground">
                <p>В этой категории пока пусто, но скоро здесь появятся новые сокровища!</p>
                <button onClick={() => {setFilter('all'); setFandomFilter('all')}} className="mt-4 text-accent hover:underline">
                    Показать все товары
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const navigate = useNavigate();
  const { cartItems, addToCart, decreaseQuantity, removeFromCart } = useCart();

  const itemInCart = cartItems.find((item) => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} добавлен в корзину`);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (itemInCart) {
      if (itemInCart.quantity === 1) {
        removeFromCart(product.id);
        toast.error(`${product.name} удален из корзины`);
      } else {
        decreaseQuantity(product.id);
      }
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };
  
  return (
    <motion.div
      // Удалены анимации initial и animate для предотвращения мерцания при навигации
      whileHover={{ y: -8 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-muted to-accent/10 overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${product.inStock ? 'group-hover:scale-110' : 'grayscale'}`}
        />
        {!product.inStock && (
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold tracking-wider text-lg bg-black/50 px-4 py-2 rounded-lg">Нет в наличии</span>
            </div>
        )}
      </div>
      
      {/* Details */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 leading-snug font-medium">{product.name}</h3>
          <div className="flex flex-col items-end gap-1">
               <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${!product.inStock ? 'bg-secondary text-secondary-foreground' : 'bg-accent/10 text-accent-foreground'}`}>
                {product.category}
              </span>
              {product.fandom && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {product.fandom}
                  </span>
              )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4">
          <p className={`text-xl font-semibold ${!product.inStock ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{product.price}</p>

          <div className="flex items-center justify-end h-10">
            {product.inStock ? (
                 !itemInCart ? (
                    <button
                        onClick={handleAddToCart}
                        className="w-10 h-10 flex items-center justify-center bg-accent text-accent-foreground rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                        title="Добавить в корзину"
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                ) : (
                    <div className="flex items-center gap-1 bg-background border rounded-full p-1 shadow-sm">
                        <button onClick={handleDecrease} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                             {itemInCart.quantity === 1 ? <Trash2 className="w-4 h-4 text-destructive" /> : <Minus className="w-4 h-4" />}
                        </button>
                        <span className="w-6 text-center font-medium text-sm">{itemInCart.quantity}</span>
                        <button onClick={handleIncrease} className="w-8 h-8 flex items-center justify-center bg-accent text-accent-foreground rounded-full hover:bg-accent/90 transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                )
            ) : (
                <span className="text-sm text-destructive font-medium bg-destructive/10 px-2 py-1 rounded">Нет в наличии</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
