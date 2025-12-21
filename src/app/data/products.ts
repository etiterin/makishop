export interface Product {
  id: number;
  name: string;
  price: string;
  category: 'sticker' | 'keychain' | 'set';
  image: string;
  description: string;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Sakura Dreams Sticker',
    price: '$4.50',
    category: 'sticker',
    image: 'https://images.unsplash.com/photo-1764344814867-d7a6916e1a37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwc3RpY2tlcnMlMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc2NjMzNjk1NXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'A delicate cherry blossom design, hand-drawn with watercolor touches. Perfect for journals and laptops.',
    inStock: true,
  },
  {
    id: 2,
    name: 'Moonlight Cat Keychain',
    price: '$8.00',
    category: 'keychain',
    image: 'https://images.unsplash.com/photo-1760733672584-475e728f09c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYXdhaWklMjBrZXljaGFpbiUyMHBhc3RlbHxlbnwxfHx8fDE3NjYzMzY5NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'A cute acrylic keychain featuring a sleepy cat under the moon. Comes with a pastel pink charm.',
    inStock: true,
  },
  {
    id: 3,
    name: 'Cozy Corner Sticker',
    price: '$4.00',
    category: 'sticker',
    image: 'https://images.unsplash.com/photo-1617646160236-db27e21e4efe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kbWFkZSUyMGNyYWZ0JTIwYXJ0fGVufDF8fHx8MTc2NjMzNjk1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Illustrated with warm colors and soft lines. Brings a cozy vibe to any surface.',
    inStock: true,
  },
  {
    id: 4,
    name: 'Cloud Nine Keychain',
    price: '$7.50',
    category: 'keychain',
    image: 'https://images.unsplash.com/photo-1628586431263-44040b966252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc2NjMzNjk1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Fluffy cloud design with a dreamy aesthetic. Made with durable clear acrylic.',
    inStock: true,
  },
  {
    id: 5,
    name: 'Pastel Garden Set',
    price: '$12.00',
    category: 'set',
    image: 'https://images.unsplash.com/photo-1764344814867-d7a6916e1a37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwc3RpY2tlcnMlMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc2NjMzNjk1NXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'A collection of 5 botanical stickers in soft pastel colors. Each one hand-illustrated.',
    inStock: true,
  },
  {
    id: 6,
    name: 'Starlight Bear Keychain',
    price: '$8.50',
    category: 'keychain',
    image: 'https://images.unsplash.com/photo-1760733672584-475e728f09c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYXdhaWklMjBrZXljaGFpbiUyMHBhc3RlbHxlbnwxfHx8fDE3NjYzMzY5NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'An adorable bear holding a tiny star. Perfect companion for your keys or bag.',
    inStock: true,
  },
  {
    id: 7,
    name: 'Tea Time Sticker',
    price: '$4.50',
    category: 'sticker',
    image: 'https://images.unsplash.com/photo-1617646160236-db27e21e4efe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kbWFkZSUyMGNyYWZ0JTIwYXJ0fGVufDF8fHx8MTc2NjMzNjk1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'A calming tea cup illustration with delicate steam swirls. Waterproof and fade-resistant.',
    inStock: true,
  },
  {
    id: 8,
    name: 'Mini Moments Set',
    price: '$15.00',
    category: 'set',
    image: 'https://images.unsplash.com/photo-1764344814867-d7a6916e1a37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwc3RpY2tlcnMlMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc2NjMzNjk1NXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: '8 tiny stickers celebrating everyday moments. From coffee cups to cozy blankets.',
    inStock: false,
  },
];
