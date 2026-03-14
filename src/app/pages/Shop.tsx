import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import productsData from '../data/products.json';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import type { Product, ProductCategory, ProductFandom } from '../types/product';

const products = productsData.products;

// Map values to Russian labels
const categoryLabels: { [key in ProductCategory]: string } = {
  sticker: 'Стикеры', keychain: 'Брелоки', set: 'Сеты',
  print: 'Принты', textile: 'Текстиль', ribbon: 'Ленты',
  badge: 'Значки', swap: 'Свопки', other: 'Другое'
};

const fandomLabels: { [key in ProductFandom]: string } = {
  Original: 'Ориджинал', Palworld: 'Palworld', 'Honkai Star Rail': 'Honkai Star Rail',
  'Monologue Apothecary': 'Монолог Фармацевта', 'Made in Abyss': 'Made in Abyss',
  Animals: 'Животные', Creepy: 'Крипота', Fantasy: 'Фентези',
  Nature: 'Природа', Evangelion: 'Evangelion', Pokemon: 'Pokemon',
  'Genshin Impact': 'Genshin Impact', Other: 'Другое'
};

export function Shop() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | ProductCategory>('all');
  const [fandomFilter, setFandomFilter] = useState<'all' | ProductFandom>('all');
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);
  
  const getSortedProducts = () => {
    let filtered: Product[] = [...products];
    
    if (filter !== 'all') {
        filtered = filtered.filter((p) => p.category === filter);
    }

    // Updated filtering logic for array
    if (fandomFilter !== 'all') {
        filtered = filtered.filter((p) => p.fandoms && p.fandoms.includes(fandomFilter));
    }
    
    return filtered.sort((a, b) => {
      if (a.inStock === b.inStock) return 0;
      return a.inStock ? -1 : 1;
    });
  };

  const filteredProducts = getSortedProducts();

  const categories = Object.entries(categoryLabels).map(([value, label]) => ({ value: value as ProductCategory, label }));
  categories.unshift({ value: 'all', label: 'Все товары' });

  const fandoms = Object.entries(fandomLabels).map(([value, label]) => ({ value: value as ProductFandom, label }));
  fandoms.unshift({ value: 'all', label: 'Все фандомы' });

  const hasActiveFilters = filter !== 'all' || fandomFilter !== 'all';
  const activeFilterCount = Number(filter !== 'all') + Number(fandomFilter !== 'all');
  const selectedCategoryLabel = filter === 'all' ? 'Все товары' : categoryLabels[filter];
  const selectedFandomLabel = fandomFilter === 'all' ? 'Все фандомы' : fandomLabels[fandomFilter];
  
  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 bg-card rounded-3xl border border-border/60 shadow-sm p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setAreFiltersOpen((prev) => !prev)}
            aria-expanded={areFiltersOpen}
            className="w-full flex items-center justify-between gap-4 rounded-2xl px-4 py-3 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-accent/20 text-accent-foreground inline-flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </span>
              <div className="text-left">
                <p className="font-medium">Категории и фильтры</p>
                <p className="text-sm text-muted-foreground">
                  {hasActiveFilters ? `Активно фильтров: ${activeFilterCount}` : 'Фильтры не выбраны'}
                </p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${areFiltersOpen ? 'rotate-180' : ''}`} />
          </button>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
              <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">{selectedCategoryLabel}</span>
              <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">{selectedFandomLabel}</span>
            </div>
          )}

          {areFiltersOpen && (
            <div className="space-y-6 pt-6">
              <div className="flex justify-center flex-wrap gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setFilter(cat.value)}
                    className={`px-6 py-2 rounded-full transition-all duration-200 border border-transparent ${
                      filter === cat.value ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
                      fandomFilter === fan.value ? 'bg-accent/20 border-accent text-accent-foreground font-medium' : 'bg-transparent border-border text-muted-foreground hover:border-accent/50'
                    }`}
                  >
                    {fan.label}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setFilter('all');
                      setFandomFilter('all');
                    }}
                    className="text-sm text-accent hover:underline"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
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

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { cartItems, addToCart, decreaseQuantity, removeFromCart } = useCart();
  const itemInCart = cartItems.find((item) => item.id === product.id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const totalImages = product.images.length;
  const hasMultipleImages = totalImages > 1;
  const currentImage = product.images[currentImageIndex] ?? product.images[0] ?? '';

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const showPreviousImage = () => {
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const showNextImage = () => {
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer"
    >
      <div className="relative aspect-square bg-gradient-to-br from-muted to-accent/10 overflow-hidden">
        <ImageWithFallback src={currentImage} alt={product.name} className={`w-full h-full object-cover transition-transform duration-500 ${product.inStock ? 'group-hover:scale-110' : 'grayscale'}`} />

        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={(e) => handleAction(e, showPreviousImage)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/18 text-white/80 flex items-center justify-center backdrop-blur-[1px] hover:bg-black/28 hover:text-white transition-colors"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => handleAction(e, showNextImage)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/18 text-white/80 flex items-center justify-center backdrop-blur-[1px] hover:bg-black/28 hover:text-white transition-colors"
              aria-label="Следующее фото"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/35">
              {product.images.map((_, index) => (
                <button
                  type="button"
                  key={`${product.id}-dot-${index}`}
                  onClick={(e) => handleAction(e, () => setCurrentImageIndex(index))}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-3' : 'bg-white/60 hover:bg-white/90'}`}
                  aria-label={`Показать фото ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {!product.inStock && (
             <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold tracking-wider text-lg bg-black/50 px-4 py-2 rounded-lg">Нет в наличии</span>
            </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-1 space-y-2">
            <h3 className="leading-snug font-medium">{product.name}</h3>
            <div className="flex flex-wrap gap-1">
                 <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${!product.inStock ? 'bg-secondary text-secondary-foreground' : 'bg-accent/10 text-accent-foreground'}`}>
                    {categoryLabels[product.category] || product.category}
                  </span>
                  {product.fandoms?.map(fandom => (
                      <span key={fandom} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {fandomLabels[fandom] || fandom}
                      </span>
                  ))}
            </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <p className={`text-xl font-semibold ${!product.inStock ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{product.price} ₽</p>
          <div className="flex items-center justify-end h-10">
            {product.inStock ? (
                 !itemInCart ? (
                    <button onClick={(e) => handleAction(e, () => { addToCart(product); toast.success(`${product.name} добавлен в корзину`); })} className="w-10 h-10 flex items-center justify-center bg-accent text-accent-foreground rounded-full transition-all duration-200 hover:scale-105 active:scale-95" title="Добавить в корзину">
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                ) : (
                    <div className="flex items-center gap-1 bg-background border rounded-full p-1 shadow-sm">
                        <button onClick={(e) => handleAction(e, () => decreaseQuantity(product.id))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                             {itemInCart.quantity === 1 ? <Trash2 className="w-4 h-4 text-destructive" /> : <Minus className="w-4 h-4" />}
                        </button>
                        <span className="w-6 text-center font-medium text-sm">{itemInCart.quantity}</span>
                        <button onClick={(e) => handleAction(e, () => addToCart(product))} className="w-8 h-8 flex items-center justify-center bg-accent text-accent-foreground rounded-full hover:bg-accent/90 transition-colors">
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
