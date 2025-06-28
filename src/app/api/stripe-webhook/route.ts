import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import getRawBody from 'raw-body';
import { google } from 'googleapis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];
const PROJECT_ID = 'your-project-id'; // Replace with your Firebase project ID

async function sendFcmMessage(fcmToken: string, title: string, body: string) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'src/credentials/service-account.json', // path to your file
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
  let event;

  try {
    const rawBody = await getRawBody(req.body as any, {
      length: req.headers.get('content-length'),
      limit: '1mb',
      encoding: 'utf-8',
    });

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('❌ Stripe webhook signature failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const amount = (session.amount_total! / 100).toFixed(2);
    const currency = session.currency?.toUpperCase();

    try {
      await sendFcmMessage(
        process.env.FCM_DEVICE_TOKEN!,
        '☕ New Coffee Order!',
        `Payment received: ${amount} ${currency}`
      );
    } catch (err) {
      console.error('❌ Failed to send FCM:', err);
    }
  }

  return NextResponse.json({ received: true });
}
