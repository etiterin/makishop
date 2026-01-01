import { motion } from 'motion/react';
import { Send, Heart, MessageCircle, ExternalLink } from 'lucide-react';

export function Contact() {
  const contactMethods = [
    {
      icon: Send,
      title: 'Telegram Канал',
      description: 'Новости, скетчи и процессы',
      link: 'https://t.me/makimerch',
      handle: '@makimerch',
    },
    {
      icon: MessageCircle,
      title: 'ВКонтакте',
      description: 'Группа с портфолио и товарами',
      link: 'https://vk.com/makinari_art',
      handle: 'Makinari_art',
    },
    {
      icon: Heart,
      title: 'Boosty',
      description: 'Поддержка творчества и эксклюзивы',
      link: 'https://boosty.to/makinari',
      handle: 'boosty.to/makinari',
    },
  ];
  
  const steps = [
    {
      number: '01',
      title: 'Выбери',
      description: 'Выбери товары в каталоге и добавь их в корзину',
    },
    {
      number: '02',
      title: 'Отправь',
      description: 'Скопируй текст заказа и отправь мне в ЛС Telegram (@Makinari)',
    },
    {
      number: '03',
      title: 'Получи',
      description: "Я все упакую с любовью и отправлю тебе посылочку",
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
          <h1 className="text-5xl">Связь и Заказ</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Здесь можно найти мои соцсети и оформить заказ
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
              className="bg-card p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 text-center group relative overflow-hidden"
            >
              <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <method.icon className="w-8 h-8 text-accent-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl flex items-center justify-center gap-2">
                    {method.title}
                    <ExternalLink className="w-4 h-4 opacity-50" />
                </h3>
                <p className="text-sm text-muted-foreground">{method.description}</p>
                <p className="text-foreground font-medium">{method.handle}</p>
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
            Как сделать заказ
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
                <div className="bg-card p-8 rounded-3xl shadow-sm space-y-4 h-full">
                  <div className="text-6xl font-bold text-accent/20">{step.number}</div>
                  <h3 className="text-xl">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                   {index === 1 && (
                      <a href="https://t.me/Makinari" target="_blank" rel="noreferrer" className="inline-block mt-2 text-accent hover:underline text-sm font-medium">
                          Написать Маки →
                      </a>
                   )}
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
          <h2 className="text-3xl text-center mb-8">Важная информация</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-lg">Сроки изготовления</h3>
              <p className="text-muted-foreground">
                Некоторые товары есть в наличии, другие делаются под заказ. Обычно отправка занимает 3-5 дней.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg">Доставка</h3>
              <p className="text-muted-foreground">
                Отправляю Почтой России или СДЭК. Трек-номер высылаю сразу после отправки.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg">Индивидуальные заказы</h3>
              <p className="text-muted-foreground">
                Хочешь арт или мерч с уникальным дизайном? Напиши мне, обсудим идеи!
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg">Уход за мерчем</h3>
              <p className="text-muted-foreground">
                Стикеры водостойкие. Брелоки лучше не царапать острыми предметами.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
