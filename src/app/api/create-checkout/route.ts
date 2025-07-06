import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

type CartItem = {
  priceId: string;
  quantity: number;
  name: string;  // for metadata summary
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cartItems: CartItem[] = body.cartItems;
    const deliveryMethod: 'ship' | 'pickup' = body.deliveryMethod;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'No cart items provided' }, { status: 400 });
    }

    // Build a human-readable summary of the cart
    const cartSummary = cartItems
      .map(item => `${item.name} x${item.quantity}`)
      .join(', ');

    // Calculate total quantity for shipping cost
    const totalBags = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    let shippingLineItem: Stripe.Checkout.SessionCreateParams.LineItem | null = null;

    if (deliveryMethod === 'ship') {
      let shippingCost = 0;
      if (totalBags >= 1 && totalBags <= 4) {
        shippingCost = 1000; // $10.00
      } else if (totalBags >= 5 && totalBags <= 8) {
        shippingCost = 1200; // $12.00
      } else {
        shippingCost = 1500; // $15.00
      }

      shippingLineItem = {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: shippingCost,
        },
        quantity: 1,
      };
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map(item => ({
      price: item.priceId,
      quantity: item.quantity,
    }));

    if (shippingLineItem) {
      lineItems.push(shippingLineItem);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'], // adjust as needed
      },
      metadata: {
        delivery_method: deliveryMethod,
        cart_summary: cartSummary,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}



