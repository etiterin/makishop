export type ProductCategory =
  | 'sticker'
  | 'keychain'
  | 'set'
  | 'print'
  | 'textile'
  | 'ribbon'
  | 'badge'
  | 'swap'
  | 'other';

export type ProductFandom =
  | 'Original'
  | 'Palworld'
  | 'Honkai Star Rail'
  | 'Monologue Apothecary'
  | 'Made in Abyss'
  | 'Animals'
  | 'Creepy'
  | 'Fantasy'
  | 'Nature'
  | 'Evangelion'
  | 'Pokemon'
  | 'Genshin Impact'
  | 'Other';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: ProductCategory;
  fandoms?: ProductFandom[];
  images: string[];
  description?: string;
  detailsTitle?: string;
  detailsItems?: string[];
  inStock: boolean;
}
