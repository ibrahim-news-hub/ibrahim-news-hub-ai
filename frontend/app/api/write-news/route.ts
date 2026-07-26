import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "News writing API is working"
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    return NextResponse.json({
      message: "News received",
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
