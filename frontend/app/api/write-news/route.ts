import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { headline } = await request.json();

    const response = await openai.responses.create({
      model: "gpt-5.5",
      input: `Rubuta cikakken labarin Hausa mai ƙwarewa game da wannan take: ${headline}`,
    });

    return NextResponse.json({
      news: response.output_text,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to generate news" },
      { status: 500 }
    );
  }
}
