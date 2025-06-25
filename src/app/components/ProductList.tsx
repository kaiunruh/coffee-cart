'use client';

import React from 'react';
import Image from 'next/image';

type Product = {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  priceId: string;
  price: number;
};

type ProductListProps = {
  products: Product[];
  onAddToCart: (product: Product) => void;
};

export default function ProductList({ products, onAddToCart }: ProductListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="rounded p-3 flex flex-col items-center bg-white bg-opacity-60 shadow-sm"
          style={{ border: '1px solid transparent' }}
        >
          {product.images.length > 0 && (
            <Image
              src={product.images[0]}
              alt={product.name}
              width={112}    // same as w-28 (28 * 4px)
              height={112}   // same as h-28
              className="mb-3 rounded object-cover"
              priority={false}
              style={{ borderRadius: '0.375rem' }} // rounded corners
            />
          )}
          <h2 className="font-semibold text-md mb-1 text-center">{product.name}</h2>
          <p className="text-xs text-gray-600 mb-3 text-center line-clamp-2">
            {product.description}
          </p>
          <p className="font-semibold mb-3">${(product.price / 100).toFixed(2)}</p>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-black text-white px-4 py-1 rounded hover:bg-gray-800 transition text-sm"
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}
