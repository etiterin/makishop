import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Heart, Palette, Sparkles, Sword, Ghost, Scroll } from 'lucide-react';

export function About() {
  const values = [
    {
      icon: Palette,
      title: 'Original & Fan Art',
      description: 'От оригинальных персонажей до любимых героев аниме, игр и мультфильмов.',
    },
    {
      icon: Sparkles,
      title: 'Handmade Exclusive',
      description: 'Каждый принт и мерч создан мной лично. Никаких картинок из интернета — только авторское творчество.',
    },
    {
      icon: Scroll,
      title: 'Limited Edition',
      description: 'Тираж всех позиций ограничен. Успей пополнить свой инвентарь уникальным лутом.',
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
          <h1 className="text-5xl">Makinari Shop</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Добро пожаловать в караван с сокровищами и авторским мерчем
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
            <h2 className="text-3xl">Приветствую, путник!</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Рада видеть тебя. Меня зовут <strong>Маки</strong> или <strong>Makinari</strong>. Добро пожаловать, располагайся у костра. 
                Мой караван с мерчем полон разных сокровищ, милых штучек и красивых безделушек.
              </p>
              <p>
                Все, что ты видишь на прилавке — плоды моего творчества. Это не просто перепечатка картинок из интернета, 
                а эксклюзивный товар, который я создаю сама. В моем шатре есть как оригинальные сюжеты и персонажи, 
                так и фан-арт по различным вселенным, которые я искренне люблю.
              </p>
              <p>
                Можно встретить работы по аниме фандомам, по различным играм и мультфильмам. Ну и куда же без животных — 
                эта тема одна из основных в моем творчестве.
              </p>
              <p>
                Глаза разбегаются, да? Не стесняйся, выбирай на здоровье, рассмотри все хорошенько, и ты обязательно 
                захочешь взять что-то в свой инвентарь. Безопасной дороги и приятных странствий!
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
            Особенности лавки
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
          <h2 className="text-3xl text-center">Мастерская</h2>
          <div className="aspect-video bg-card rounded-3xl overflow-hidden shadow-xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1628586431263-44040b966252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc2NjMzNjk1NHww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Workspace"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-center text-muted-foreground">
            Место, где создается магия — уютный уголок, полный вдохновения
          </p>
        </motion.div>
      </div>
    </div>
  );
}
