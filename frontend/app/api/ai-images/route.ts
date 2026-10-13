import sharp from "sharp";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY bai samu a server ba.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const prompt = String(body?.prompt || "").trim();

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Da fatan za ka rubuta bayanin hoton da kake so.",
        },
        { status: 400 }
      );
    }

    if (prompt.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          error: "Bayanin hoton ya yi tsawo. Ka rage shi zuwa haruffa 2000.",
        },
        { status: 400 }
      );
    }

    const imagePrompt = `
Create a professional editorial image for IBRAHIM SANI NEWS (ISN).

Image description:
${prompt}

Requirements:
- Professional news photography.
- Landscape composition suitable for Facebook.
- Realistic lighting and clear visual focus.
- Do not invent real people's identities or present fictional scenes as real news.
- Do not add logos, watermarks, captions, or long text.
- No graphic gore.
- Do not imitate a specific photographer's style.
`;

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-2",
          prompt: imagePrompt,
          size: "1536x1024",
          n: 1,
        }),
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        "ISN image generation failed:",
        response.status,
        responseText.slice(0, 1000)
      );

      return NextResponse.json(
        {
          success: false,
          error: `Ba a iya samar da hoto ba. OpenAI ya dawo da status ${response.status}.`,
        },
        { status: 502 }
      );
    }

    let data: any;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error("OpenAI ya dawo da amsa marar ingancin JSON.");
    }

    const imageData = data?.data?.[0]?.b64_json;

    if (!imageData) {
      throw new Error("OpenAI bai dawo da hoton da ake bukata ba.");
    }

    const originalBuffer = Buffer.from(imageData, "base64");

    const logoPath = `${process.cwd()}/public/ibrahim-sani-news-logo.png`;

    const logoBuffer = await sharp(logoPath)
      .rotate()
      .resize({
        width: 180,
        height: 180,
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();

    const imageMetadata = await sharp(originalBuffer)
      .rotate()
      .metadata();

    if (!imageMetadata.width || !imageMetadata.height) {
      throw new Error("Ba a iya karanta girman hoton ba.");
    }

    const logoMetadata = await sharp(logoBuffer).metadata();

    if (!logoMetadata.width || !logoMetadata.height) {
      throw new Error("Ba a iya karanta girman tambarin ISN ba.");
    }

    const margin = 24;

    const left = Math.max(
      0,
      imageMetadata.width - logoMetadata.width - margin
    );

    const top = Math.max(
      0,
      imageMetadata.height - logoMetadata.height - margin
    );

    const finalBuffer = await sharp(originalBuffer)
      .rotate()
      .composite([
        {
          input: logoBuffer,
          left,
          top,
        },
      ])
      .jpeg({
        quality: 90,
        mozjpeg: true,
      })
      .toBuffer();

    return NextResponse.json({
      success: true,
      image: `data:image/jpeg;base64,${finalBuffer.toString("base64")}`,
      message: "An samar da hoton AI tare da tambarin ISN.",
    });
  } catch (error) {
    console.error("ISN AI Images error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Wani kuskure ya faru wajen samar da hoto.",
      },
      { status: 500 }
    );
  }
}
