import { NextResponse } from "next/server";
import '../../../../envConfig';
import { getAllShortLinks, insertShortLinkPair } from "@/data/shortLink-dto";

// To handle a GET request to /api
export async function GET(request: any) {
  let shortLinks = getAllShortLinks();

  return NextResponse.json({ shortLinks: shortLinks }, { status: 200 });
}

// To handle a POST request to /api
export async function POST(request: Request) {
  const data = await request.json();

  if (data.slug && data.longLink) {
    try {
      const result = insertShortLinkPair({
        slug: data.slug
        ,longLink: data.longLink
      });

      console.log(result);
    } catch (sqlError: any) {
      return NextResponse.json({message: sqlError.message}, {status: 500});
    }

    return NextResponse.json({ message: "Values Inserted" }, { status: 200 });
  } else {
    return NextResponse.json({ message: "Expected JSON keys not found." }, { status: 400 });
  }
}