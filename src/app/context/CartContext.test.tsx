import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import type { Product } from '../types/product';

const baseProduct: Product = {
  id: 1,
  name: 'Тестовый стикер',
  price: 300,
  category: 'sticker',
  fandoms: ['Pokemon'],
  images: ['/images/uploads/test.jpg'],
  description: 'Тестовое описание',
  inStock: true,
};

const secondProduct: Product = {
  ...baseProduct,
  id: 2,
  name: 'Второй товар',
};

function CartTestConsumer() {
  const { cartItems, addToCart, decreaseQuantity, removeFromCart, clearCart } = useCart();

  return (
    <div>
      <button type="button" onClick={() => addToCart(baseProduct)}>
        add-first
      </button>
      <button type="button" onClick={() => addToCart(secondProduct)}>
        add-second
      </button>
      <button type="button" onClick={() => decreaseQuantity(baseProduct.id)}>
        decrease-first
      </button>
      <button type="button" onClick={() => removeFromCart(baseProduct.id)}>
        remove-first
      </button>
      <button type="button" onClick={clearCart}>
        clear
      </button>
      <output data-testid="cart-json">{JSON.stringify(cartItems)}</output>
    </div>
  );
}

function renderCart() {
  return render(
    <CartProvider>
      <CartTestConsumer />
    </CartProvider>,
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads cart from localStorage on mount', () => {
    const savedCart = [{ ...baseProduct, quantity: 2 }];
    window.localStorage.setItem('cartItems', JSON.stringify(savedCart));

    renderCart();

    expect(screen.getByTestId('cart-json')).toHaveTextContent('"quantity":2');
    expect(screen.getByTestId('cart-json')).toHaveTextContent(baseProduct.name);
  });

  it('adds product and increases quantity for duplicates', async () => {
    renderCart();

    fireEvent.click(screen.getByText('add-first'));
    fireEvent.click(screen.getByText('add-first'));

    await waitFor(() => {
      const parsed = JSON.parse(screen.getByTestId('cart-json').textContent || '[]');
      expect(parsed).toHaveLength(1);
      expect(parsed[0].quantity).toBe(2);
    });
  });

  it('decreases quantity and removes product when quantity reaches zero', async () => {
    renderCart();

    fireEvent.click(screen.getByText('add-first'));
    fireEvent.click(screen.getByText('add-first'));
    fireEvent.click(screen.getByText('decrease-first'));

    await waitFor(() => {
      const parsed = JSON.parse(screen.getByTestId('cart-json').textContent || '[]');
      expect(parsed[0].quantity).toBe(1);
    });

    fireEvent.click(screen.getByText('decrease-first'));

    await waitFor(() => {
      const parsed = JSON.parse(screen.getByTestId('cart-json').textContent || '[]');
      expect(parsed).toHaveLength(0);
    });
  });

  it('removes specific item from cart', async () => {
    renderCart();

    fireEvent.click(screen.getByText('add-first'));
    fireEvent.click(screen.getByText('add-second'));
    fireEvent.click(screen.getByText('remove-first'));

    await waitFor(() => {
      const parsed = JSON.parse(screen.getByTestId('cart-json').textContent || '[]');
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe(secondProduct.id);
    });
  });

  it('clears the whole cart', async () => {
    renderCart();

    fireEvent.click(screen.getByText('add-first'));
    fireEvent.click(screen.getByText('add-second'));
    fireEvent.click(screen.getByText('clear'));

    await waitFor(() => {
      expect(screen.getByTestId('cart-json')).toHaveTextContent('[]');
    });
  });

  it('persists cart updates to localStorage', async () => {
    renderCart();

    fireEvent.click(screen.getByText('add-first'));

    await waitFor(() => {
      const storedValue = window.localStorage.getItem('cartItems');
      expect(storedValue).not.toBeNull();
      const parsed = JSON.parse(storedValue || '[]');
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe(baseProduct.id);
      expect(parsed[0].quantity).toBe(1);
    });
  });
});
