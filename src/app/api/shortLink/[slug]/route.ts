"use server";

import { getShortLinkPair } from "@/data/shortLinkDal";
import { shortLinkDto } from "@/interfaces";
import { NextRequest, NextResponse } from "next/server";

/** Gets specific slug pair */
export async function GET(
    request: NextRequest
    ,{ params }: { params: Promise<{ slug: string }>}
) {
    const slug = (await params).slug;
    let shortLinks : shortLinkDto = await getShortLinkPair(slug);

    return NextResponse.json({ shortLinks: shortLinks }, { status: 200 });
}