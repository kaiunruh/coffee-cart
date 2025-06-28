import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', // adjust to your Stripe version
});

export async function POST(request: Request) {
  try {
    const { cartItems, deliveryMethod } = await request.json();

    // Validate input
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'No cart items provided' }, { status: 400 });
    }

    // Calculate shipping cost based on total bags (quantities)
    let shippingLineItem: Stripe.Checkout.SessionCreateParams.LineItem | null = null;

    if (deliveryMethod === 'ship') {
      const totalBags = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

      let shippingCost = 0;
      if (totalBags >= 1 && totalBags <= 4) {
        shippingCost = 1000; // $10.00 in cents
      } else if (totalBags >= 5 && totalBags <= 8) {
        shippingCost = 1200; // $12.00 in cents
      } else {
        shippingCost = 1500; // Default or higher shipping cost
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

    // Map cart items to Stripe line items (price + quantity)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map((item: any) => ({
      price: item.priceId,
      quantity: item.quantity,
    }));

    // Add shipping line item if applicable
    if (shippingLineItem) {
      lineItems.push(shippingLineItem);
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}


