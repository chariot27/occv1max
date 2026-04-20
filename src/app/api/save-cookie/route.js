import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch (e) {
      console.error("Session check failed in save-cookie:", e.message);
    }

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const { liAtCookie, vanityName } = body;

    if (!liAtCookie || !vanityName) {
      return new Response(JSON.stringify({ error: 'Missing cookie or vanityName' }), { status: 400 });
    }

    // In serverless environments like Vercel, we don't save to local files.
    // The cookie is passed in the request body to the generate route instead.
    console.log('Cookie received for:', vanityName);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Save cookie error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
}
