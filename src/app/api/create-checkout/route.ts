import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

interface CartItem {
  priceId: string;
  quantity: number;
}

interface CheckoutRequest {
  cartItems: CartItem[];
  deliveryMethod: 'ship' | 'pickup';
}

export async function POST(request: Request) {
  const { cartItems, deliveryMethod } = await request.json() as CheckoutRequest;

  if (!cartItems || cartItems.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Cart is empty' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // --- Calculate shipping ---
    let shippingLineItem = null;

    if (deliveryMethod === 'ship') {
      const totalBags = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      let shippingCost = 0;

      if (totalBags >= 1 && totalBags <= 4) {
        shippingCost = 1000; // $10.00 in cents
      } else if (totalBags >= 5 && totalBags <= 8) {
        shippingCost = 1200; // $12.00 in cents
      } else {
        shippingCost = 1500; // Optional: flat $15.00 for 9+
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

    // --- Build session ---
    const lineItems = cartItems.map((item) => ({
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
      success_url: `https://coffee-cart-akczqdw61-kais-projects-0b9109dd.vercel.app/success`,
      cancel_url: `https://coffee-cart-akczqdw61-kais-projects-0b9109dd.vercel.app/cancel`,
      
      ...(deliveryMethod === 'ship' && {
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
      }),

      metadata: {
        delivery_method: deliveryMethod
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    console.error('Stripe error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


