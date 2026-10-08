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
            content:
              "Kai kwararren editan labaran Hausa na Ibrahim Sani News (ISN). Ka sake rubuta labarin cikin Hausa mai sauki, sahihiya kuma ta jarida. Kada ka kirkiri bayanan da babu su a asalin labarin. Ka dawo da JSON kawai mai dauke da title, article da caption.",
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
  let contentType = "image/png";

  if (image.startsWith("data:")) {
    const match = image.match(
      /^data:([^;]+);base64,(.+)$/
    );

    if (!match) {
      throw new Error(
        "Invalid base64 image returned by OpenAI."
      );
    }

    contentType = match[1];
    buffer = Buffer.from(match[2], "base64");
  } else {
    const imageResponse = await fetch(image);

    if (!imageResponse.ok) {
      throw new Error(
        `Could not download generated image: ${imageResponse.status}`
      );
    }

    contentType =
      imageResponse.headers.get(
        "content-type"
      ) || "image/png";

    buffer = Buffer.from(
      await imageResponse.arrayBuffer()
    );
  }

  const extension =
    contentType.includes("jpeg") ||
    contentType.includes("jpg")
      ? "jpg"
      : "png";

  const path = `isn-${queueId}-${Date.now()}.${extension}`;

  const { error } =
    await supabase.storage
      .from("news-images")
      .upload(path, buffer, {
        contentType,
        upsert: false,
      });

  if (error) {
    throw error;
  }

  const { data } =
    supabase.storage
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
