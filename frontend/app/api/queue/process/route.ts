import sharp from "sharp";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type QueueItem = {
  id: string;
  title: string;
  article: string;
  caption: string | null;
  image_url: string | null;
  category: string | null;
  source_url: string;
  status: string;
  attempts: number;
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(url, key);
}

async function rewriteWithGroq(item: QueueItem) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing.");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        temperature: 0.2,
        max_completion_tokens: 1200,
        response_format: {
          type: "json_object",
        },
        messages: [
  {
    role: "system",
    content: `
Kai ne babban editan labarai na IBRAHIM SANI NEWS (ISN), ƙwararren ɗan jarida mai ƙwarewa a rubutun Hausa.

MANUFARKA:
Ka mayar da bayanan da aka ba ka zuwa ingantaccen labarin Hausa mai sauƙin fahimta, sahihi, ƙwarewa kuma mai jan hankalin masu karatu.

KA'IDOJIN RUBUTU:

1. Ka rubuta cikin ingantacciyar Hausa ta zamani wadda masu karatu a Arewa da sauran masu magana da Hausa za su fahimta.
2. Ka yi amfani da salon ƙwararrun kafafen labarai: bayyananne, tsararre, mai mutunta gaskiya kuma ba mai son zuciya ba.
3. Ka gyara kurakuran nahawu, rubutu, tsarin jimloli da amfani da kalmomi.
4. Ka samar da kanun labari mai jan hankali, amma kada ka yi amfani da kanun yaudara ko ƙarin gishiri.
5. Ka fara labarin da muhimmin abin da ya faru, idan bayanan asali sun tabbatar da shi.
6. Ka raba labari zuwa sakin layi masu gajarta domin ya dace da karatun waya da Facebook.
7. Ka bayyana wanda ya yi magana, abin da ya faru, da inda ko lokacin da ya faru idan bayanan asali sun ƙunshi waɗannan bayanai.
8. Kada ka ƙirƙiri sunaye, lambobi, wurare, ranaku, zarge-zarge, ƙididdiga, maganganu ko wasu bayanai da ba su cikin tushen labarin.
9. Kada ka gabatar da jita-jita ko zargi a matsayin tabbatacciyar gaskiya.
10. Idan bayanai ba su isa tabbatar da wani abu ba, kada ka yi hasashe ko ƙara bayanin da ba a bayar ba.
11. Kada ka sauya ma'anar labarin ko manufar wanda aka ambata.
12. Ka kiyaye sunayen mutane, ƙungiyoyi, kamfanoni da wurare yadda suke a asalin labarin.
13. Kada ka ƙara ra'ayinka na kanka, siyasa, addini ko nuna goyon baya ga wani ɓangare.
14. Kada ka yi amfani da kalmomin “DA DUMI-DUMI” ko “BREAKING NEWS” sai idan bayanan da aka bayar sun nuna cewa labarin sabon abu ne kuma ya cancanci hakan.
15. Idan asalin labarin ya yi gajarta, ka inganta shi ba tare da ƙirƙirar ƙarin bayanai ba.
16. Caption ya zama taƙaitaccen bayani mai jan hankali, ba cikakken labarin da aka maimaita ba.
17. Kada ka saka hashtags masu yawa. Ka yi amfani da #ISN da #IbrahimSaniNews kawai idan sun dace.

ABIN DA ZA KA MAYAR:
Ka mayar da JSON mai ingantattun filaye uku kawai:
- "title": Kanun labari a Hausa.
- "article": Cikakken labari a Hausa.
- "caption": Taƙaitaccen rubutun Facebook a Hausa, tare da #ISN #IbrahimSaniNews.

Ka dawo da JSON kawai. Kada ka ƙara bayanin gabatarwa, Markdown ko wani rubutu a wajen JSON.
`,
  },
  {
    role: "user",
    content: JSON.stringify({
      title: item.title,
      article: item.article,
      category: item.category,
      source_url: item.source_url,
    }),
  },
],
      }),
    }
  );

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`Groq error ${response.status}: ${raw}`);
  }

  let data: any;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Groq returned invalid JSON.");
  }

  const content =
    data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned empty content.");
  }

  let parsed: any;

  try {
    parsed = JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("Groq content was not valid JSON.");
    }

    parsed = JSON.parse(
      content.slice(start, end + 1)
    );
  }

  if (
    !parsed?.title ||
    !parsed?.article
  ) {
    throw new Error(
      "Groq response is missing title or article."
    );
  }

  return {
    title: String(parsed.title).trim(),
    article: String(parsed.article).trim(),
    caption: parsed.caption
      ? String(parsed.caption).trim()
      : `📰 ${String(parsed.title).trim()}\n\n${String(
          parsed.article
        ).trim()}\n\nIBRAHIM SANI NEWS (ISN)\n\n#ISN #IbrahimSaniNews`,
  };
}

async function generateISNImage(
  title: string,
  article: string,
  category: string
) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const prompt = `
Create a professional editorial news image for Ibrahim Sani News (ISN).

Headline:
${title}

Category:
${category}

Context:
${article.slice(0, 1800)}

Requirements:
- Photorealistic editorial news photography
- Nigerian/African newsroom quality
- Visually relevant to the actual story
- Professional composition for Facebook
- 16:9 landscape
- No fake quotes
- No invented people or events
- Do not add logos, watermarks, or source logos
- Do not put long text on the image
- No graphic gore
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
        prompt,
        size: "1536x1024",
        n: 1,
      }),
    }
  );

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(
      `OpenAI image error ${response.status}: ${raw}`
    );
  }

  let data: any;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      "OpenAI returned invalid JSON."
    );
  }

  const image =
    data?.data?.[0]?.b64_json ||
    data?.data?.[0]?.url;

  if (!image) {
    throw new Error(
      "OpenAI did not return an image."
    );
  }

  return image;
}

async function uploadImage(
  supabase: ReturnType<typeof getSupabase>,
  image: string,
  queueId: string
) {
  let buffer: Buffer;

  if (image.startsWith("data:")) {
    const match = image.match(
      /^data:([^;]+);base64,(.+)$/
    );

    if (!match) {
      throw new Error(
        "Invalid base64 image returned by OpenAI."
      );
    }

    buffer = Buffer.from(match[2], "base64");
  } else {
    const imageResponse = await fetch(image);

    if (!imageResponse.ok) {
      throw new Error(
        `Could not download generated image: ${imageResponse.status}`
      );
    }

    buffer = Buffer.from(
      await imageResponse.arrayBuffer()
    );
  }

  const logoPath = `${process.cwd()}/public/ibrahim-sani-news-logo-transparent.png`;

  const logoBuffer = await sharp(logoPath)
    .rotate()
    .resize({
      width: 110,
      height: 110,
      fit: "inside",
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();

  const imageMetadata = await sharp(buffer)
    .rotate()
    .metadata();

  if (!imageMetadata.width || !imageMetadata.height) {
    throw new Error(
      "Could not determine generated image dimensions."
    );
  }

  const logoMetadata = await sharp(logoBuffer).metadata();

  if (!logoMetadata.width || !logoMetadata.height) {
    throw new Error(
      "Could not determine ISN logo dimensions."
    );
  }

  const margin = 24;
  const left = Math.max(
    0,
    imageMetadata.width - logoMetadata.width - margin
  );
  const top = Math.min(
    margin,
    Math.max(0, imageMetadata.height - logoMetadata.height)
  );

  buffer = await sharp(buffer)
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

  const path = `isn-${queueId}-${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from("news-images")
    .upload(path, buffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("news-images")
    .getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error(
      "Could not create public image URL."
    );
  }

  return data.publicUrl;
}

async function sendToMake(payload: {
  title: string;
  article: string;
  caption: string;
  image_url: string;
  category: string;
  source_url: string;
}) {
  const webhookUrl =
    process.env.MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error(
      "MAKE_WEBHOOK_URL is missing."
    );
  }

  const response = await fetch(
    webhookUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Make webhook error ${response.status}: ${text}`
    );
  }
}

export async function GET(
  request: Request
) {
  try {
    const authHeader =
      request.headers.get(
        "authorization"
      );

    const expected =
      `Bearer ${process.env.CRON_SECRET}`;

    if (
      !process.env.CRON_SECRET ||
      authHeader !== expected
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = getSupabase();

    /*
     * IMPORTANT:
     * Process ONE queue item only.
     * This keeps the first production test safe.
     */

    const {
      data: item,
      error: selectError,
    } = await supabase
      .from("news_queue")
      .select("*")
      .eq("status", "queued")
      .order("scheduled_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    if (!item) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: "Queue babu labari a yanzu.",
      });
    }

    const queueItem =
      item as QueueItem;

    const { error: lockError } =
      await supabase
        .from("news_queue")
        .update({
          status: "processing",
          attempts:
            (queueItem.attempts || 0) + 1,
        })
        .eq("id", queueItem.id)
        .eq("status", "queued");

    if (lockError) {
      throw lockError;
    }

    try {
      const rewritten =
        await rewriteWithGroq(
          queueItem
        );

      const imageResult =
        await generateISNImage(
          rewritten.title,
          rewritten.article,
          queueItem.category ||
            "World"
        );

      const imageUrl =
        await uploadImage(
          supabase,
          imageResult,
          queueItem.id
        );

      const caption =
        rewritten.caption ||
        `📰 ${rewritten.title}\n\n${rewritten.article}\n\nIBRAHIM SANI NEWS (ISN)\n\n#ISN #IbrahimSaniNews`;

      await supabase
        .from("news")
        .insert({
          title: rewritten.title,
          article: rewritten.article,
          caption,
          image_url: imageUrl,
          category:
            queueItem.category ||
            "World",
          source_url:
            queueItem.source_url,
        });

      await sendToMake({
        title: rewritten.title,
        article: rewritten.article,
        caption,
        image_url: imageUrl,
        category:
          queueItem.category ||
          "World",
        source_url:
          queueItem.source_url,
      });

      const {
        error: doneError,
      } = await supabase
        .from("news_queue")
        .update({
          status: "published",
          published_at:
            new Date().toISOString(),
          image_url: imageUrl,
          title: rewritten.title,
          article: rewritten.article,
          caption,
          error_message: null,
        })
        .eq("id", queueItem.id);

      if (doneError) {
        throw doneError;
      }

      return NextResponse.json({
        success: true,
        processed: 1,
        queue_id: queueItem.id,
        title: rewritten.title,
        image_url: imageUrl,
        message:
          "An sarrafa labari daya kuma an tura shi zuwa Make.",
      });
    } catch (processingError) {
      const message =
        processingError instanceof Error
          ? processingError.message
          : "Queue processing failed.";

      await supabase
        .from("news_queue")
        .update({
          status: "failed",
          error_message: message,
        })
        .eq("id", queueItem.id);

      throw processingError;
    }
  } catch (error) {
    console.error(
      "QUEUE PROCESSOR ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Queue processor failed.",
      },
      { status: 500 }
    );
  }
}
