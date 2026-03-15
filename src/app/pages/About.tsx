import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Heart, Palette, Sparkles, Scroll, Star, Users } from 'lucide-react';

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
          <h1 className="text-5xl">Лавка Макинари</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Добро пожаловать в караван с сокровищами и авторским мерчем
          </p>
        </motion.div>
        
        {/* Intro Section */}
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

        {/* 2024 Recap / Chronicles */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-muted/30 rounded-3xl p-8 md:p-12 space-y-8"
        >
            <div className="text-center space-y-2">
                <h2 className="text-3xl flex items-center justify-center gap-2">
                    <Star className="w-6 h-6 text-accent" />
                    Хроники Пути
                    <Star className="w-6 h-6 text-accent" />
                </h2>
                <p className="text-muted-foreground">История о росте, магии творчества и теплых встречах</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6 text-muted-foreground leading-relaxed">
                    <p>
                        Этот год стал для меня очень насыщенным, тёплым и по-настоящему продуктивным.
                        Годом, в котором было много рисования, сомнений, радостей, маленьких побед и большого роста.
                    </p>
                    <p>
                        Я создала множество красивых и вдохновляющих работ — и каждая из них стала частью моего пути как художника. (★^O^★)
                    </p>
                    <p>
                         Особое место заняли коллаборации с моим любимым маркетом <strong>Заря</strong> и солнечной маскоткой — <strong>Мандаринкой</strong>.
                        Это была целая история про доверие, поддержку и удовольствие от совместного творчества. ᕙʕಠᴥಠʔᕗ
                    </p>
                    <p>
                        В этом году я наконец исполнила свою давнюю задумку — сделала мерч по <strong>«Евангелиону»</strong> и <strong>«Покемонам»</strong> 🤍o.(+･`ω･+).o.
                        Это мои самые любимые фандомы, и вложить в них часть себя было особенно ценно.
                    </p>
                </div>
                <div className="space-y-6">
                     <h3 className="text-xl font-medium flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Маркеты и встречи
                     </h3>
                     <p className="text-muted-foreground">
                        Этот год подарил мне много опыта и знакомств. Я посетила маркеты <strong>Заря</strong>, <strong>Кико</strong>, <strong>ФурМаркет</strong>, <strong>Ласковый Маркет</strong>.
                        Познакомилась с невероятными авторами и посетителями — каждое общение вдохновляло продолжать. ╰(˵ヘωヘ✿)╯
                     </p>
                     
                     <div className="bg-background rounded-xl p-6 shadow-sm border border-border/50">
                        <h4 className="font-medium mb-3">Новые полочки:</h4>
                        <div className="flex flex-wrap gap-2">
                            {['Созвездие', 'Арт Хаус', 'Ушастая Полка'].map(shelf => (
                                <span key={shelf} className="px-3 py-1 bg-accent/10 text-accent-foreground rounded-full text-sm">
                                    ✶ {shelf}
                                </span>
                            ))}
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Это особенное чувство — видеть, как твои работы находят свой дом. (^_^)ヾ(^^ )
                        </p>
                     </div>
                </div>
            </div>
        </motion.div>
        
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
        
        {/* Workspace Image / Artwork Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-3xl text-center">Итоги года в артах</h2>
          <div className="aspect-video bg-card rounded-3xl overflow-hidden shadow-xl relative group">
             {/* Placeholder for Artwork Summary */}
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1080&auto=format&fit=crop"
              alt="2024 Artwork Summary"
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">Место для вашего коллажа с итогами года</span>
            </div>
          </div>
          <p className="text-center text-muted-foreground">
             Каждая работа — это маленькая победа и шаг вперед.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
