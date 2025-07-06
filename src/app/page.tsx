'use client';

import React, { useEffect, useState } from 'react';
import FcmTokenFetcher from './components/FcmTokenFetcher';
import ProductList from './components/ProductList';
import Cart from './components/Cart';

type Product = {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  priceId: string;
  price: number;
};

type CartItem = Product & {
  quantity: number;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'ship' | 'pickup'>('ship');
  const [customerEmail, setCustomerEmail] = useState<string>(''); // ✅ added

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products);
    }
    fetchProducts();
  }, []);

  function handleAddToCart(product: Product, quantity: number = 1) {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
    setShowCart(true);
  }

  function handleUpdateQuantity(productId: string, quantity: number) {
    setCart((prevCart) => {
      if (quantity <= 0) {
        return prevCart.filter((item) => item.id !== productId);
      }
      return prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  }

  function handleRemove(productId: string) {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }

  async function handleCheckout() {
    if (cart.length === 0) return;
    if (!customerEmail) {
      alert('Please enter your email before checkout.');
      return;
    }

    setIsCheckingOut(true);

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart.map((item) => ({
            priceId: item.priceId,
            quantity: item.quantity,
            name: item.name, // ✅ for Stripe metadata
          })),
          deliveryMethod,
          customerEmail, // ✅ pass email
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
        alert('Something went wrong during checkout.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="relative bg-white text-black dark:bg-black dark:text-white min-h-screen">
      <FcmTokenFetcher />
      <div className="flex justify-between items-center px-4 py-4">
        <h1 className="text-2xl font-bold">Coffee</h1>
        <button
          onClick={() => setShowCart(!showCart)}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </div>

      <div className="px-4 py-2">
        <p className="text-base">Browse our selection of fresh coffee below.</p>
        <div className="mt-2">
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Your Email (for receipt & order confirmation)
          </label>
          <input
            id="email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <div className="px-4 text-black dark:text-white">
        <ProductList products={products} onAddToCart={handleAddToCart} />
      </div>

      <Cart
        cart={cart}
        show={showCart}
        onClose={() => setShowCart(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
        deliveryMethod={deliveryMethod}
        setDeliveryMethod={setDeliveryMethod}
      />
    </main>
  );
}

