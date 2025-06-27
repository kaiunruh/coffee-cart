'use client';

import React from 'react';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartProps = {
  cart: CartItem[];
  show: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
  deliveryMethod: 'ship' | 'pickup';
  setDeliveryMethod: React.Dispatch<React.SetStateAction<'ship' | 'pickup'>>;
};

export default function Cart({
  cart,
  show,
  onClose,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  isCheckingOut,
  deliveryMethod,
  setDeliveryMethod,
}: CartProps) {
  if (!show) return null;

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-4 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Your Cart</h2>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-black">
          Close
        </button>
      </div>

      {cart.length === 0 ? (
        <p className="text-sm text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} className="border-b pb-2 mb-2">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm">${(item.price / 100).toFixed(2)} x {item.quantity}</p>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="px-2 py-1 border rounded"
                >
                  -
                </button>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 border rounded"
                >
                  +
                </button>
              </div>
            </div>
          ))}

          {/* Delivery method UI */}
          <div className="my-4">
            <h3 className="font-semibold mb-2">Delivery Method</h3>
            <label className="mr-4">
              <input
                type="radio"
                name="delivery"
                value="ship"
                checked={deliveryMethod === 'ship'}
                onChange={() => setDeliveryMethod('ship')}
              />{' '}
              Ship
            </label>
            <label>
              <input
                type="radio"
                name="delivery"
                value="pickup"
                checked={deliveryMethod === 'pickup'}
                onChange={() => setDeliveryMethod('pickup')}
              />{' '}
              Pickup
            </label>
          </div>

          <button
            onClick={onCheckout}
            disabled={isCheckingOut}
            className="w-full mt-4 bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            {isCheckingOut ? 'Processing...' : 'Checkout'}
          </button>
        </>
      )}
    </div>
  );
}
