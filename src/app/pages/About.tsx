import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ChevronLeft, ChevronRight, MapPin, MessageCircle, Palette, Scroll, Sparkles, X } from 'lucide-react';

const reviewImages = [
  { src: '/images/reviews/review-1.jpeg', alt: 'Отзыв покупателя 1' },
  { src: '/images/reviews/review-2.jpeg', alt: 'Отзыв покупателя 2' },
  { src: '/images/reviews/review-3.jpeg', alt: 'Отзыв покупателя 3' },
  { src: '/images/reviews/review-4.jpeg', alt: 'Отзыв покупателя 4' },
  { src: '/images/reviews/review-5.jpeg', alt: 'Отзыв покупателя 5' },
  { src: '/images/reviews/review-6.jpeg', alt: 'Отзыв покупателя 6' },
  { src: '/images/reviews/review-7.jpeg', alt: 'Отзыв покупателя 7' },
];

export function About() {
  const [activeReviewIndex, setActiveReviewIndex] = useState<number | null>(null);
  const reviewSwipeStartX = useRef<number | null>(null);

  const values = [
    {
      icon: Palette,
      title: 'Оригинальный и фан-арт',
      description: 'От оригинальных персонажей до любимых героев аниме, игр и мультфильмов.',
    },
    {
      icon: Sparkles,
      title: 'Ручная работа',
      description: 'Каждый принт и мерч создан мной лично. Никаких картинок из интернета — только авторское творчество.',
    },
    {
      icon: Scroll,
      title: 'Ограниченный тираж',
      description: 'Тираж всех позиций ограничен. Успей пополнить свой инвентарь уникальным лутом.',
    },
  ];

  useEffect(() => {
    if (activeReviewIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveReviewIndex(null);
      } else if (event.key === 'ArrowRight') {
        setActiveReviewIndex((prev) => (prev === null ? 0 : (prev + 1) % reviewImages.length));
      } else if (event.key === 'ArrowLeft') {
        setActiveReviewIndex((prev) => (prev === null ? 0 : (prev - 1 + reviewImages.length) % reviewImages.length));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeReviewIndex]);

  const goToPreviousReview = () => {
    setActiveReviewIndex((prev) => (prev === null ? 0 : (prev - 1 + reviewImages.length) % reviewImages.length));
  };

  const goToNextReview = () => {
    setActiveReviewIndex((prev) => (prev === null ? 0 : (prev + 1) % reviewImages.length));
  };

  const activeReview = activeReviewIndex === null ? null : reviewImages[activeReviewIndex];
  
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
                src="/images/author-portrait.webp"
                alt="Фото автора"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl flex items-center justify-center gap-2">
              <MessageCircle className="w-6 h-6 text-accent" />
              Отзывы
            </h2>
            <p className="text-muted-foreground">
              Скролль ленту, а по клику открывай скриншот в полном размере.
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {reviewImages.map((review, index) => (
              <button
                type="button"
                key={review.src}
                onClick={() => setActiveReviewIndex(index)}
                className="snap-start shrink-0 w-[240px] sm:w-[280px] md:w-[320px] rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Открыть ${review.alt}`}
              >
                <div className="h-[320px] sm:h-[360px] md:h-[400px] p-3 bg-muted/20 flex items-center justify-center">
                  <ImageWithFallback
                    src={review.src}
                    alt={review.alt}
                    className="max-w-full max-h-full object-contain rounded-xl"
                  />
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Offline Shelves */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-muted/30 rounded-3xl p-8 md:p-12 space-y-8"
        >
            <div className="text-center space-y-2">
                <h2 className="text-3xl flex items-center justify-center gap-2">
                    <MapPin className="w-6 h-6 text-accent" />
                    Полочки
                </h2>
                <p className="text-muted-foreground">Где можно купить мои товары офлайн</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-background rounded-xl p-6 shadow-sm border border-border/50 space-y-4">
                    <h3 className="text-xl font-medium">Москва</h3>
                    <div className="space-y-4">
                        <div className="border-b border-border/60 pb-4">
                            <p className="font-medium">1. Ушастая Полка</p>
                            <p className="text-sm text-muted-foreground">Адрес: ул. 2-я Тверская-Ямская, д.54, Москва</p>
                            <p className="text-sm text-muted-foreground">Метро Белорусская, выход с кольцевой линии метро №3</p>
                            <p className="text-sm text-muted-foreground">Номер полки: L 7.5</p>
                        </div>
                        <div>
                            <p className="font-medium">2. Арт-хаус</p>
                            <p className="text-sm text-muted-foreground">Адрес: Воронцовская 13/14с3, Москва</p>
                            <p className="text-sm text-muted-foreground">Метро Марксистская, выход из метро №5</p>
                            <p className="text-sm text-muted-foreground">Номер полки: 24.3</p>
                        </div>
                    </div>
                </div>

                <div className="bg-background rounded-xl p-6 shadow-sm border border-border/50 space-y-4">
                    <h3 className="text-xl font-medium">Санкт-Петербург</h3>
                    <div>
                        <p className="font-medium">3. Созвездие</p>
                        <p className="text-sm text-muted-foreground">
                            Адрес: Лиговский проспект, 111-113-115Б / Печатника Григорьева, 8 (бизнес-центр «Рост»)
                        </p>
                        <p className="text-sm text-muted-foreground">Метро Лиговский проспект</p>
                        <p className="text-sm text-muted-foreground">Номер полки: 36.5</p>
                    </div>
                </div>

                <div className="bg-background rounded-xl p-6 shadow-sm border border-border/50 space-y-4 md:col-span-2">
                    <h3 className="text-xl font-medium">Новосибирск</h3>
                    <div>
                        <p className="font-medium">4. Лисья Полка</p>
                        <p className="text-sm text-muted-foreground">Адрес: Новосибирск, Красный проспект, 186</p>
                        <p className="text-sm text-muted-foreground">Номер полки: 26.4</p>
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
      </div>

      {activeReview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center gap-2"
          onClick={() => setActiveReviewIndex(null)}
        >
          <button
            type="button"
            className="absolute top-3 right-3 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-black/35 text-white flex items-center justify-center hover:bg-black/55 transition"
            onClick={() => setActiveReviewIndex(null)}
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/35 text-white items-center justify-center hover:bg-black/55 transition"
            onClick={(event) => {
              event.stopPropagation();
              goToPreviousReview();
            }}
            aria-label="Предыдущий отзыв"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            className="w-full max-w-5xl max-h-[90vh] rounded-2xl bg-card p-2 sm:p-4"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => {
              reviewSwipeStartX.current = event.changedTouches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              const startX = reviewSwipeStartX.current;
              const endX = event.changedTouches[0]?.clientX ?? null;
              reviewSwipeStartX.current = null;

              if (startX === null || endX === null) {
                return;
              }

              const deltaX = endX - startX;
              if (Math.abs(deltaX) < 40) {
                return;
              }

              if (deltaX > 0) {
                goToPreviousReview();
              } else {
                goToNextReview();
              }
            }}
          >
            <div className="h-full max-h-[86vh] flex items-center justify-center bg-muted/20 rounded-xl">
              <ImageWithFallback
                src={activeReview.src}
                alt={activeReview.alt}
                className="max-w-full max-h-[84vh] object-contain rounded-xl"
              />
            </div>
          </div>

          <button
            type="button"
            className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/35 text-white items-center justify-center hover:bg-black/55 transition"
            onClick={(event) => {
              event.stopPropagation();
              goToNextReview();
            }}
            aria-label="Следующий отзыв"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
