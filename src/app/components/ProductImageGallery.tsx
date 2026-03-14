import React, { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  inStock: boolean;
}

export function ProductImageGallery({ images, productName, inStock }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const selectedImage = images[selectedImageIndex] ?? images[0] ?? '';
  const hasMultipleImages = images.length > 1;

  const showPreviousImage = () => {
    if (!hasMultipleImages) return;
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
    if (!hasMultipleImages) return;
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="space-y-6">
        <div className="relative aspect-square bg-card rounded-3xl overflow-hidden shadow-lg">
          <ImageWithFallback
            src="" // Empty src will trigger the fallback
            alt="No image available"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative aspect-square bg-card rounded-3xl overflow-hidden shadow-lg">
        <ImageWithFallback
          src={selectedImage}
          alt={productName}
          className={`w-full h-full object-cover transition-opacity duration-300 ${!inStock ? 'grayscale' : ''}`}
        />
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/18 text-white/80 flex items-center justify-center backdrop-blur-[1px] hover:bg-black/28 hover:text-white transition-colors"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/18 text-white/80 flex items-center justify-center backdrop-blur-[1px] hover:bg-black/28 hover:text-white transition-colors"
              aria-label="Следующее фото"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold tracking-wider text-lg bg-black/50 px-4 py-2 rounded-lg">Нет в наличии</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, i) => (
            <div
              key={i}
              className={`aspect-square bg-muted rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${selectedImageIndex === i ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-60 hover:opacity-100'}`}
              onClick={() => setSelectedImageIndex(i)}
            >
              <ImageWithFallback
                src={image}
                alt={`${productName} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
