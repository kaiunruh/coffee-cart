'use client';

import React from 'react';

type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type CartProps = {
  cart: CartItem[];
  show: boolean;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
};

export default function Cart({
  cart,
  show,
  onClose,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  isCheckingOut,
}: CartProps) {
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
