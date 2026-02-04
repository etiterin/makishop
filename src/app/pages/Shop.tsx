import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import productsData from '../data/products.json';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const products = productsData.products;

// Define types in one place for consistency
type ProductCategory = 'sticker' | 'keychain' | 'set' | 'print' | 'textile' | 'ribbon' | 'badge' | 'swap';
type ProductFandom = 'Original' | 'Evangelion' | 'Pokemon' | 'Genshin Impact' | 'Other';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: ProductCategory;
  fandom?: ProductFandom;
  images: string[];
  description: string;
  inStock: boolean;
}

// Map values to Russian labels
const categoryLabels: { [key in ProductCategory]: string } = {
  sticker: 'Стикеры',
  keychain: 'Брелоки',
  set: 'Сеты',
  print: 'Принты',
  textile: 'Текстиль',
  ribbon: 'Ленты',
  badge: 'Значки',
  swap: 'Свопки'
};

const fandomLabels: { [key in ProductFandom]: string } = {
  Original: 'Ориджинал',
  Evangelion: 'Evangelion',
  Pokemon: 'Pokemon',
  'Genshin Impact': 'Genshin Impact',
  Other: 'Другое'
};

export function Shop() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | ProductCategory>('all');
  const [fandomFilter, setFandomFilter] = useState<'all' | ProductFandom>('all');
  
  const getSortedProducts = () => {
    let filtered: Product[] = [...products];
    
    if (filter !== 'all') {
        filtered = filtered.filter((p) => p.category === filter);
    }

    if (fandomFilter !== 'all') {
        filtered = filtered.filter((p) => p.fandom === fandomFilter);
    }
    
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
    { value: 'textile' as const, label: 'Текстиль' },
    { value: 'ribbon' as const, label: 'Ленты' },
    { value: 'badge' as const, label: 'Значки' },
    { value: 'swap' as const, label: 'Свопки' },
  ];

  const fandoms = [
      { value: 'all' as const, label: 'Все фандомы' },
      { value: 'Original' as const, label: 'Ориджинал' },
      { value: 'Evangelion' as const, label: 'Evangelion' },
      { value: 'Pokemon' as const, label: 'Pokemon' },
      { value: 'Genshin Impact' as const, label: 'Genshin Impact' },
      { value: 'Other' as const, label: 'Другое' },
  ];
  
  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl mb-4">Коллекция</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Каждая вещь сделана вручную, с любовью и вниманием к деталям
          </p>
        </div>
        
        <div className="space-y-6 mb-16">
            <div className="flex justify-center flex-wrap gap-3">
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
            </div>

            <div className="flex justify-center flex-wrap gap-2">
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
            </div>
        </div>
        
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
      whileHover={{ y: -8 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer"
    >
      <div className="relative aspect-square bg-gradient-to-br from-muted to-accent/10 overflow-hidden">
        <ImageWithFallback
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${product.inStock ? 'group-hover:scale-110' : 'grayscale'}`}
        />
        {!product.inStock && (
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold tracking-wider text-lg bg-black/50 px-4 py-2 rounded-lg">Нет в наличии</span>
            </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 leading-snug font-medium">{product.name}</h3>
          <div className="flex flex-col items-end gap-1">
               <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${!product.inStock ? 'bg-secondary text-secondary-foreground' : 'bg-accent/10 text-accent-foreground'}`}>
                {categoryLabels[product.category] || product.category}
              </span>
              {product.fandom && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {fandomLabels[product.fandom] || product.fandom}
                  </span>
              )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4">
          <p className={`text-xl font-semibold ${!product.inStock ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{product.price} ₽</p>

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
