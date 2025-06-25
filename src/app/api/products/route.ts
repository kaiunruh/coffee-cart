import Stripe from 'stripe';
console.log('🔑 Stripe Key starts with:', process.env.STRIPE_SECRET_KEY?.slice(0, 10));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function GET() {
  console.log('🔑 Stripe Key starts with:', process.env.STRIPE_SECRET_KEY?.slice(0, 10)); // Mask for safety

  const prices = await stripe.prices.list({
    active: true,
    limit: 100,
    expand: ['data.product'],
  });

  const products = prices.data.map((price) => {
    const product = price.product as Stripe.Product;
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images,
      priceId: price.id,
      price: price.unit_amount ?? 0,
    };
  });

  console.log('📦 Products returned:', products);

  return new Response(JSON.stringify({ products }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
