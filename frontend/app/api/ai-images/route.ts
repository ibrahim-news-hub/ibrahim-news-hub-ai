import sharp from "sharp";
import { NextResponse } from "next/server";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

async function addISNLogo(imageBuffer: Buffer) {
  const logoPath = path.join(
    process.cwd(),
    "public",
    "ibrahim-sani-news-logo-transparent.png"
  );

  const metadata = await sharp(imageBuffer, {
    limitInputPixels: 40_000_000,
  }).rotate().metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Ba a iya karanta hoton ba.");
  }

  const width = metadata.width;
  const height = metadata.height;
  const logoWidth = Math.min(180, Math.max(80, Math.round(width * 0.12)));

  const logoBuffer = await sharp(logoPath)
    .resize({
      width: logoWidth,
      height: logoWidth,
      fit: "inside",
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();

  const logoMetadata = await sharp(logoBuffer).metadata();

  if (!logoMetadata.width || !logoMetadata.height) {
    throw new Error("Ba a iya karanta tambarin ISN ba.");
  }

  const margin = Math.max(16, Math.round(width * 0.025));
  const left = Math.max(0, width - logoMetadata.width - margin);
  const top = margin;

  return sharp(imageBuffer, { limitInputPixels: 40_000_000 })
    .rotate()
    .composite([{ input: logoBuffer, left, top }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("image");

      if (!(file instanceof File)) {
        return jsonError("Da fatan za ka zaɓi hoto.");
      }

      if (!file.type.startsWith("image/")) {
        return jsonError("Fayil ɗin da ka zaɓa ba hoto ba ne.");
      }

      if (file.size === 0) {
        return jsonError("Hoton babu bayanai a cikinsa.");
      }

      if (file.size > MAX_UPLOAD_SIZE) {
        return jsonError("Girman hoto ya wuce 10 MB.");
      }

      const input = Buffer.from(await file.arrayBuffer());
      const metadata = await sharp(input, {
        limitInputPixels: 40_000_000,
      }).metadata();

      if (!metadata.format || !["jpeg", "png", "webp", "avif", "tiff", "gif"].includes(metadata.format)) {
        return jsonError("Ba a goyi bayan tsarin hoton ba.");
      }

      const output = await addISNLogo(input);

      return NextResponse.json({
        success: true,
        image: `data:image/jpeg;base64,${output.toString("base64")}`,
        message: "An sanya tambarin ISN a saman gefen dama na hoto.",
      });
    }

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const prompt = String(body?.prompt || "").trim();

      if (!prompt) {
        return jsonError("Da fatan ka rubuta bayanin hoton.");
      }

      if (prompt.length > 2000) {
        return jsonError("Bayanin hoton ya wuce haruffa 2000.");
      }

      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        return jsonError(
          "OPENAI_API_KEY bai samu ba. Za ka iya ɗora hoton da ka samar ta wani AI.",
          503
        );
      }

      const imagePrompt = `
Create a professional editorial image for IBRAHIM SANI NEWS (ISN).
Image description: ${prompt}
Requirements:
- Professional news photography.
- Landscape composition suitable for Facebook.
- Realistic lighting and clear visual focus.
- Do not invent real people's identities or present fictional scenes as real news.
- No logos, watermarks, captions, or long text.
- No graphic gore.
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
          signal: AbortSignal.timeout(50_000),
        }
      );

      if (!response.ok) {
        const details = await response.text();
        console.error("ISN image generation failed:", response.status, details.slice(0, 500));

        return jsonError(
          `AI bai samar da hoto ba (status ${response.status}). Ka gwada ɗora hoto.`,
          502
        );
      }

      const data = await response.json();
      const imageData = data?.data?.[0]?.b64_json;

      if (typeof imageData !== "string" || !imageData) {
        return jsonError("AI bai dawo da hoton da ake buƙata ba.", 502);
      }

      const output = await addISNLogo(Buffer.from(imageData, "base64"));

      return NextResponse.json({
        success: true,
        image: `data:image/jpeg;base64,${output.toString("base64")}`,
        message: "An samar da hoton AI tare da tambarin ISN.",
      });
    }

    return jsonError("Yi amfani da JSON ko ɗora hoto.", 415);
  } catch (error) {
    console.error("ISN AI Images error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : "An samu kuskure wajen sarrafa hoton.",
      },
      { status: 500 }
    );
  }
}
