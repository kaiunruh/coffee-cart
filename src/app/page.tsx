'use client';

import React, { useEffect, useState } from 'react';
import ProductList from './components/ProductList';

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
    setShowCart(true); // open cart when adding item
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

    setIsCheckingOut(true);

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: cart.map((item) => ({
            priceId: item.priceId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
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
    <main className="relative">
      <div className="flex justify-between items-center px-4 py-4">
        <h1 className="text-2xl font-bold">Coffee</h1>
        <button
          onClick={() => setShowCart(!showCart)}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </div>

      <ProductList products={products} onAddToCart={handleAddToCart} />

      <Cart
        cart={cart}
        show={showCart}
        onClose={() => setShowCart(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
      />
    </main>
  );
}

function Cart({
  cart,
  show,
  onClose,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  isCheckingOut,
}: {
  cart: CartItem[];
  show: boolean;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
}) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        show ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">Your Cart</h2>
        <button onClick={onClose} className="text-xl font-bold">
          &times;
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[70vh]">
        {cart.length === 0 ? (
          <p className="text-sm text-gray-600">Your cart is empty.</p>
        ) : (
          <ul className="space-y-4">
            {cart.map((item) => (
              <li key={item.id} className="flex flex-col border-b pb-2">
                <div className="font-medium">{item.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="text-right text-sm text-gray-700 mt-1">
                  ${(item.price * item.quantity / 100).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t">
        <p className="font-semibold mb-2">
          Total: ${(total / 100).toFixed(2)}
        </p>
        <button
          onClick={onCheckout}
          disabled={cart.length === 0 || isCheckingOut}
          className={`w-full py-2 rounded transition ${
            cart.length === 0 || isCheckingOut
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-900'
          }`}
        >
          {isCheckingOut ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}

