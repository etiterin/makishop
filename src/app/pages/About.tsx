import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Heart, Palette, Sparkles } from 'lucide-react';

export function About() {
  const values = [
    {
      icon: Heart,
      title: 'Handmade with Love',
      description: 'Every piece is carefully crafted by hand, ensuring unique quality and attention to detail.',
    },
    {
      icon: Palette,
      title: 'Original Designs',
      description: 'All artwork is original, drawn and conceptualized from my own imagination and experiences.',
    },
    {
      icon: Sparkles,
      title: 'Small Batches',
      description: 'Limited quantities mean each creation is special and thoughtfully produced.',
    },
  ];
  
  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl">About Studio Luna</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A small creative space where art meets everyday joy
          </p>
        </motion.div>
        
        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="order-2 md:order-1 space-y-6"
          >
            <h2 className="text-3xl">The Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Studio Luna started as a creative outlet during quiet evenings, sketching
                characters and moments that brought me comfort. What began as personal art
                evolved into something I wanted to share with others.
              </p>
              <p>
                Each sticker and keychain is a tiny piece of that creative journey —
                designed to add a touch of warmth and personality to your everyday items.
              </p>
              <p>
                Working from a small studio space, I handle every step of the process:
                from initial sketches to final production. This hands-on approach ensures
                that every product meets my standards and carries the same care I put into
                my personal work.
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="order-1 md:order-2"
          >
            <div className="aspect-square bg-card rounded-3xl overflow-hidden shadow-xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1593382067395-ace3045a1547?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBwb3J0cmFpdCUyMGNyZWF0aXZlfGVufDF8fHx8MTc2NjMwNTE2N3ww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Artist portrait"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
        
        {/* Values */}
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl text-center mb-12"
          >
            What We Stand For
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-card p-8 rounded-3xl shadow-sm space-y-4 text-center"
              >
                <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Workspace Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-3xl text-center">The Workspace</h2>
          <div className="aspect-video bg-card rounded-3xl overflow-hidden shadow-xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1628586431263-44040b966252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc2NjMzNjk1NHww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Workspace"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-center text-muted-foreground">
            Where the magic happens — a cozy corner filled with art supplies and inspiration
          </p>
        </motion.div>
      </div>
    </div>
  );
}
