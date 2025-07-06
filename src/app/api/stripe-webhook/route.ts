import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { google } from 'googleapis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];
const PROJECT_ID = 'your-project-id'; // Replace with your Firebase project ID

async function sendFcmMessage(fcmToken: string, title: string, body: string) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'src/credentials/service-account.json',
    scopes: SCOPES,
  });

  const client = await auth.getClient();

  const url = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

  const message = {
    message: {
      token: fcmToken,
      notification: {
        title,
        body,
      },
    },
  };

  const res = await client.request({
    url,
    method: 'POST',
    data: message,
  });

  console.log('✅ FCM sent:', res.data);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;

  try {
    const rawBody = await req.text();

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    if (err instanceof Error) {
      console.error('❌ Stripe webhook signature failed:', err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    } else {
      console.error('❌ Unknown error in webhook:', err);
      return NextResponse.json({ error: 'Unknown error' }, { status: 400 });
    }
  }

  if (event.type === 'checkout.session.completed') {
    // Extend session type to include optional shipping safely
    const session = event.data.object as Stripe.Checkout.Session & {
      shipping?: {
        name: string | null;
        address: {
          line1: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
        } | null;
      } | null;
      metadata?: { [key: string]: string };
    };

    const amount = (session.amount_total! / 100).toFixed(2);
    const currency = session.currency?.toUpperCase();
    const deliveryMethod = session.metadata?.delivery_method || 'pickup';

    let orderDetails = `Payment received: ${amount} ${currency}`;

    if (deliveryMethod === 'ship' && session.shipping) {
      const shipping = session.shipping;
      const address = shipping.address;
      orderDetails += `\nShipping to: ${shipping.name ?? ''}, ${address?.line1 ?? ''}, ${address?.city ?? ''}, ${address?.state ?? ''}, ${address?.postal_code ?? ''}`;
    } else {
      orderDetails += `\nThis is a pickup order.`;
    }

    try {
      await sendFcmMessage(
        process.env.FCM_DEVICE_TOKEN!,
        '☕ New Coffee Order!',
        orderDetails
      );
    } catch (err) {
      console.error('❌ Failed to send FCM:', err);
    }
  }

  return NextResponse.json({ received: true });
}
