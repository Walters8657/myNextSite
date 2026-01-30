import { NextResponse } from "next/server";
import '../../../../envConfig';
import { insertShortLinkPair } from "@/data/shortLink-dto";

// To handle a POST request to /api
export async function POST(request: Request) {
  const data = await request.json();

  if (data.slug && data.longLink) {
    try {
      const result = await insertShortLinkPair({
        slug: data.slug
        ,longLink: data.longLink
      });
    } catch (sqlError: any) {
      return NextResponse.json({message: sqlError.message}, {status: 500});
    }

    return NextResponse.json({ message: "Value Inserted" }, { status: 200 });
  } else {
    return NextResponse.json({ message: "Expected JSON keys not found." }, { status: 400 });
  }
}