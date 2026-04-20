import { createCheckoutSession } from '@/lib/stripe';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const stripeSession = await createCheckoutSession(
      session.user.email,
      session.user.id
    );

    return new Response(JSON.stringify({ url: stripeSession.url }), { status: 200 });
  } catch (error) {
    console.error('Checkout Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), { status: 500 });
  }
}
