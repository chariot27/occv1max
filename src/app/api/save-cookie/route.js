import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import fs from 'fs';
import path from 'path';

const COOKIE_FILE = path.join(process.cwd(), '.linkedin-session.json');

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

    // Save the cookie
    fs.writeFileSync(COOKIE_FILE, JSON.stringify({ cookie: liAtCookie, vanityName }, null, 2));
    console.log('Cookie saved for:', vanityName);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Save cookie error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save cookie' }), { status: 500 });
  }
}
