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
  const [filter, setFilter] = useState<'all' | 'sticker' | 'keychain' | 'set'>('all');
  
  const filteredProducts = filter === 'all'
    ? products
    : products.filter((p) => p.category === filter);
  
  const categories = [
    { value: 'all' as const, label: 'All' },
    { value: 'sticker' as const, label: 'Stickers' },
    { value: 'keychain' as const, label: 'Keychains' },
    { value: 'set' as const, label: 'Sets' },
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
          <h1 className="text-5xl mb-4">Our Collection</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Each piece is lovingly crafted by hand, making every item unique and special
          </p>
        </motion.div>
        
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center gap-3 mb-16"
        >
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-6 py-3 rounded-full transition-all duration-200 ${
                filter === cat.value
                  ? 'bg-accent text-accent-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
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
    toast.success(`${product.name} added to cart`);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (itemInCart) {
      if (itemInCart.quantity === 1) {
        removeFromCart(product.id);
        toast.error(`${product.name} removed from cart`);
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.6 }}
      whileHover={{ y: -8 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-muted to-accent/10 overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {itemInCart && (
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
                {itemInCart.quantity}
            </div>
        )}
      </div>
      
      {/* Details */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 leading-snug">{product.name}</h3>
          <span className="px-3 py-1 bg-accent/20 text-accent-foreground rounded-full text-sm whitespace-nowrap">
            {product.category}
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4">
          <p className="text-2xl text-foreground">{product.price}</p>

          <div className="flex items-center justify-end">
            {!itemInCart ? (
                <button
                    onClick={handleAddToCart}
                    className="w-10 h-10 flex items-center justify-center bg-accent text-accent-foreground rounded-full transition-all duration-200"
                    title="Add to Cart"
                >
                    <ShoppingCart className="w-5 h-5" />
                </button>
            ) : (
                <div className="flex items-center gap-1 bg-background border rounded-full p-1">
                    <button onClick={handleDecrease} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted">
                         {itemInCart.quantity === 1 ? <Trash2 className="w-4 h-4 text-destructive" /> : <Minus className="w-4 h-4" />}
                    </button>
                    <span className="w-8 text-center font-medium">{itemInCart.quantity}</span>
                    <button onClick={handleIncrease} className="w-8 h-8 flex items-center justify-center bg-accent text-accent-foreground rounded-full">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
