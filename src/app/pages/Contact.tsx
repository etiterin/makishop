import { motion } from 'motion/react';
import { Instagram, Send, Mail } from 'lucide-react';

export function Contact() {
  const contactMethods = [
    {
      icon: Send,
      title: 'Telegram',
      description: 'Quick and easy messaging',
      link: 'https://t.me/studioluna',
      handle: '@studioluna',
    },
    {
      icon: Instagram,
      title: 'Instagram',
      description: 'See our latest creations',
      link: 'https://instagram.com/studioluna',
      handle: '@studioluna',
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'For detailed inquiries',
      link: 'mailto:hello@studioluna.art',
      handle: 'hello@studioluna.art',
    },
  ];
  
  const steps = [
    {
      number: '01',
      title: 'Choose',
      description: 'Browse our collection and pick your favorite items',
    },
    {
      number: '02',
      title: 'Message',
      description: 'Reach out via Telegram, Instagram, or Email',
    },
    {
      number: '03',
      title: 'Receive',
      description: "We'll pack your order with care and ship it to you",
    },
  ];
  
  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto space-y-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you! Choose your preferred way to connect
          </p>
        </motion.div>
        
        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.title}
              href={method.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-card p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 text-center group"
            >
              <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <method.icon className="w-8 h-8 text-accent-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl">{method.title}</h3>
                <p className="text-sm text-muted-foreground">{method.description}</p>
                <p className="text-foreground">{method.handle}</p>
              </div>
            </motion.a>
          ))}
        </div>
        
        {/* How to Order */}
        <div className="space-y-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl text-center"
          >
            How to Order
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative"
              >
                <div className="bg-card p-8 rounded-3xl shadow-sm space-y-4">
                  <div className="text-6xl font-bold text-accent/20">{step.number}</div>
                  <h3 className="text-xl">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-accent/20" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-muted p-8 md:p-12 rounded-3xl space-y-6"
        >
          <h2 className="text-3xl text-center mb-8">Quick Info</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-lg">Production Time</h3>
              <p className="text-muted-foreground">
                Each item is made to order. Please allow 3-5 business days for creation.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg">Shipping</h3>
              <p className="text-muted-foreground">
                We ship worldwide! Delivery times vary by location (typically 5-14 days).
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg">Custom Orders</h3>
              <p className="text-muted-foreground">
                Interested in a custom design? Reach out and let's discuss your ideas!
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg">Care Instructions</h3>
              <p className="text-muted-foreground">
                Our stickers are waterproof. For keychains, avoid prolonged water exposure.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}