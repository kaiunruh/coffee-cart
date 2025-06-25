// src/app/api/create-checkout/route.ts

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

interface CartItem {
  priceId: string;
  quantity: number;
}

export async function POST(request: Request) {
  const { cartItems } = await request.json() as { cartItems: CartItem[] };

  if (!cartItems || cartItems.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Cart is empty' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: cartItems.map((item: CartItem) => ({
        price: item.priceId,
        quantity: item.quantity,
      })),
      success_url: `https://coffee-cart-akczqdw61-kais-projects-0b9109dd.vercel.app/success`,
      cancel_url: `https://coffee-cart-akczqdw61-kais-projects-0b9109dd.vercel.app/cancel`,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    console.error('Stripe error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
