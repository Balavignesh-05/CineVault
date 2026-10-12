import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || searchParams.get('query') || '';
  const page = searchParams.get('page') || '1';

  if (!q.trim()) {
    return NextResponse.json({ items: [], total: 0 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiUrl}/collections?search=${encodeURIComponent(q.trim())}&page=${page}&limit=20`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const json = await res.json();
    return NextResponse.json(json?.data || { items: [], total: 0 });
  } catch (error) {
    console.error('Collections search proxy error:', error);
    return NextResponse.json({ items: [], total: 0 });
  }
}
