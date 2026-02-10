import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Cart } from './Cart';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Главная' },
    { path: '/shop', label: 'Магазин' },
    { path: '/delivery', label: 'Доставка' },
    { path: '/about', label: 'О нас' },
    { path: '/contact', label: 'Контакты' },
  ];
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="group" onClick={() => setMobileMenuOpen(false)}>
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <span className="text-lg sm:text-xl text-foreground tracking-wide font-medium">Makinari Shop</span>
            </motion.div>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-full transition-colors duration-200 text-sm font-medium ${
                        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      }`}
                    >
                      {item.label}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Cart */}
            <Cart />

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm">
                  <div className="flex flex-col h-full">
                    <div className="border-b pb-4">
                       <Link to="/" className="group" onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                              <span className="text-xl">✨</span>
                            </div>
                            <span className="text-xl text-foreground tracking-wide font-medium">Makinari Shop</span>
                          </div>
                       </Link>
                    </div>
                    <div className="flex flex-col gap-2 py-6">
                      {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <SheetClose asChild key={item.path}>
                            <Link to={item.path}>
                              <div
                                className={`px-4 py-3 rounded-lg text-lg font-medium transition-colors duration-200 ${
                                  isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                                }`}
                              >
                                {item.label}
                              </div>
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
