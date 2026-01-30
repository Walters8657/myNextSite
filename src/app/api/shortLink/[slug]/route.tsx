import { getShortLinkPair } from "@/data/shortLink-dto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest
    ,{ params }: { params: Promise<{ slug: string }>}
) {
    const slug = (await params).slug;
    let shortLinks = await getShortLinkPair(slug);

    return NextResponse.json({ shortLinks: shortLinks }, { status: 200 });
}