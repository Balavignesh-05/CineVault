import { NextResponse } from 'next/server';
import { getPersonDetails } from '@/lib/tmdb/client';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await getPersonDetails(Number(id));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch person' }, { status: 500 });
  }
}
