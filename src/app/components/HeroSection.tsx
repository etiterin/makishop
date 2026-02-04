import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import productsData from '../data/products.json';

const products = productsData.products;

export function HeroSection() {
  const navigate = useNavigate();
  
  // Select a few featured products for the hero
  const featuredProducts = products.filter(p => p.inStock).slice(0, 3);
  
  return (
    <section className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/5 pt-24">
      {/* Background artwork */}
      <div className="absolute inset-0 opacity-20">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1628586431263-44040b966252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc2NjMzNjk1NHww&ixlib.rb-4.1.0&q=80&w=1080"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Brand text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 z-10"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-5xl md:text-7xl leading-tight"
              >
                Добро пожаловать,
                <br />
                <span className="text-accent">Путник</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-muted-foreground max-w-md leading-relaxed"
              >
                Располагайся у костра. Мой караван полон сокровищ, милых штучек и красивых безделушек для твоего инвентаря.
              </motion.p>
            </div>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              onClick={() => navigate('/shop')}
              className="bg-accent hover:bg-accent/80 text-accent-foreground px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-medium tracking-wide"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Посмотреть товары
            </motion.button>
          </motion.div>
          
          {/* Right side - Interactive polaroid products */}
          <div className="relative h-[600px] hidden lg:block">
            {featuredProducts.map((product, index) => {
              const positions = [
                { top: '10%', left: '15%', rotate: -8 },
                { top: '35%', left: '45%', rotate: 5 },
                { top: '55%', left: '10%', rotate: -3 },
              ];
              
              const pos = positions[index];
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: pos.rotate,
                  }}
                  transition={{
                    delay: 0.8 + index * 0.2,
                    duration: 0.6,
                    type: 'spring',
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: 0,
                    zIndex: 10,
                    transition: { duration: 0.2 },
                  }}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="absolute cursor-pointer group"
                  style={{
                    top: pos.top,
                    left: pos.left,
                  }}
                >
                  {/* Polaroid frame */}
                  <div className="bg-card p-4 pb-16 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 w-64 transform group-hover:-translate-y-2">
                    <div className="aspect-square bg-muted rounded-xl overflow-hidden">
                      <ImageWithFallback
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Polaroid caption */}
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground font-medium">{product.name}</p>
                    </div>
                  </div>
                  
                  {/* Pin/tape effect */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-6 bg-accent/40 rounded-sm rotate-3 opacity-80" />
                </motion.div>
              );
            })}
            
            {/* Decorative elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7, duration: 1 }}
              className="absolute bottom-0 left-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
