import { NextResponse } from "next/server";
import '../../../../envConfig';
import { insertShortLinkPair } from "@/data/shortLinkDal";

/** Passes data to be inserted to dto */
export async function POST(request: Request) {
  const data = await request.json();

  if (data.slug && data.longLink) {
    try {
      const result = await insertShortLinkPair({
        slug: data.slug
        ,longLink: data.longLink
      });
    } catch (sqlError: any) {
      return NextResponse.json({message: "Error inserting values. Please try again later."}, {status: 500});
    }

    return NextResponse.json({ message: "Values Inserted." }, { status: 200 });
  } else {
    return NextResponse.json({ message: "Expected JSON keys not found. Please try again later." }, { status: 400 });
  }
}