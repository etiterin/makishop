import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { products } from '../data/products';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const product = products.find((p) => p.id === Number(id));
  
  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">Product not found</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-accent text-accent-foreground rounded-full hover:bg-accent/80 transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }
  
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
          Back to Shop
        </motion.button>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="aspect-square bg-card rounded-3xl overflow-hidden shadow-lg">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
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
                <span className="px-4 py-2 bg-accent/20 text-accent-foreground rounded-full text-sm">
                  {product.category}
                </span>
              </div>
              
              <p className="text-3xl text-accent-foreground">{product.price}</p>
            </div>
            
            <div className="prose prose-lg">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-6 bg-muted rounded-2xl space-y-3">
                <h3 className="text-lg">Product Details</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Handmade with care</li>
                  <li>✓ Original design</li>
                  <li>✓ High-quality materials</li>
                  <li>✓ Waterproof & durable</li>
                </ul>
              </div>
              
              <button
                onClick={() => navigate('/contact')}
                className="w-full bg-accent hover:bg-accent/80 text-accent-foreground px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Message to Order</span>
              </button>
              
              <p className="text-sm text-muted-foreground text-center">
                Each item is made to order. Please allow 3-5 business days for creation.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
