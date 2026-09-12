import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json([]);
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiUrl}/users/search?q=${encodeURIComponent(q)}&limit=20`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 },
    });

    if (!res.ok) return NextResponse.json([]);

    const data = await res.json();
    return NextResponse.json(data?.data?.items || data?.data || []);
  } catch {
    return NextResponse.json([]);
  }
}
