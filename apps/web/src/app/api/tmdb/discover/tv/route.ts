import { NextResponse } from 'next/server';
import { discoverTv } from '@/lib/tmdb/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => { params[key] = value; });
  try {
    const data = await discoverTv(params);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to discover TV' }, { status: 500 });
  }
}
