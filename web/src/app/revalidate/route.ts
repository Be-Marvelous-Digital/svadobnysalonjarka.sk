import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { CONTENT_TAGS } from '@/lib/content';

const TAGS: readonly string[] = Object.values(CONTENT_TAGS);

export async function POST(request: NextRequest) {
    const secret = process.env.REVALIDATE_SECRET;
    if (!secret || request.headers.get('x-revalidate-secret') !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tag } = (await request.json().catch(() => ({}))) as { tag?: string };
    if (!tag || !TAGS.includes(tag)) return NextResponse.json({ error: 'Unknown tag' }, { status: 400 });

    revalidateTag(tag, { expire: 0 });
    return NextResponse.json({ revalidated: tag });
}
