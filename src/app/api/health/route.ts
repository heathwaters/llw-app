import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return NextResponse.json({
    hasUrl: Boolean(url),
    hasKey: Boolean(key),
    urlLength: url?.length ?? 0,
    keyLength: key?.length ?? 0,
    urlPrefix: url ? url.slice(0, 8) + '...' + url.slice(-6) : null,
    nodeEnv: process.env.NODE_ENV ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    region: process.env.VERCEL_REGION ?? null,
  });
}
