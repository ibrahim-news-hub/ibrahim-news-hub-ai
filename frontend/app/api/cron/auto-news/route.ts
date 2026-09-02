import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function cleanText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getCategory(title: string) {
  const text = title.toLowerCase();

  if (
    /nigeria|abuja|kaduna|kano|lagos|governor|president|senate|house of representatives/.test(
      text
    )
  ) {
    return "Nigeria";
  }

  if (/ai|artificial intelligence|technology|tech|google|apple|microsoft|meta/.test(text)) {
    return "Technology";
  }

  if (/business|economy|market|bank|oil|finance|dollar/.test(text)) {
    return "Business";
  }

  if (/football|soccer|sport|match|league|player/.test(text)) {
    return "Sports";
  }

  return "World";
}

async function getFeedItems() {
  const feeds = [
    {
      name: "BBC",
      url: "https://feeds.bbci.co.uk/news/rss.xml",
    },
    {
      name: "Al Jazeera",
      url: "https://www.aljazeera.com/xml/rss/all.xml",
    },
  ];

  const allItems: {
    title: string;
    description: string;
    link: string;
    source: string;
  }[] = [];

  for (const feed of feeds) {
    try {
      const response = await fetch(feed.url, {
        cache: "no-store",
        headers: {
          "User-Agent": "Ibrahim-News-Hub-AI/1.0",
        },
      });

      if (!response.ok) continue;

      const xml = await response.text();

      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

      for (const match of items.slice(0, 10)) {
        const item = match[1];

        const title =
          item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i)?.[1] ||
          item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ||
          "";

        const description =
          item.match(
            /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i
          )?.[1] ||
          item.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ||
          "";

        const link =
          item.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim() || "";

        if (!title.trim() || !link) continue;

        allItems.push({
          title: cleanText(title),
          description: cleanText(description),
          link,
          source: feed.name,
        });
      }
    } catch (error) {
      console.error(`Feed error: ${feed.name}`, error);
    }
  }

  return allItems;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET is missing." },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const items = await getFeedItems();

    if (!items.length) {
      return NextResponse.json({
        success: true,
        message: "No news items found.",
      });
    }

    let publishedCount = 0;

    for (const item of items) {
      const normalized = normalizeTitle(item.title);

      const { data: recentNews } = await supabase
        .from("news")
        .select("id,title")
        .order("created_at", { ascending: false })
        .limit(50);

      const duplicate = (recentNews || []).some(
        (news) => normalizeTitle(news.title) === normalized
      );

      if (duplicate) continue;

      const apiKey = process.env.GROQ_API_KEY;

      if (!apiKey) {
        return NextResponse.json(
          { error: "GROQ_API_KEY is missing." },
          { status: 500 }
        );
      }

      const prompt = `
Kai ƙwararren ɗan jarida ne na Ibrahim News Hub AI.

Rubuta sabon labarin Hausa daga bayanan da ke ƙasa.

Muhimman ƙa'idoji:
- Kada ka ƙirƙiri bayanan da ba su cikin source.
- Kada ka ƙara jita-jita a matsayin gaskiya.
- Kada ka fara da taken labarin.
- Kada ka yi Markdown.
- Rubuta sakin layi 4 zuwa 6.
- Hausa ta kasance mai sauƙin fahimta.
- Ka kiyaye ainihin ma'anar rahoton.
- Kada ka ambaci cewa AI ne ya rubuta labarin.

Source:
${item.source}

Take:
${item.title}

Bayanin:
${item.description}
`;

      const aiResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.4,
          }),
        }
      );

      if (!aiResponse.ok) {
        console.error("Groq error:", await aiResponse.text());
        continue;
      }

      const result = await aiResponse.json();

      let article =
        result.choices?.[0]?.message?.content ||
        "";

      article = article
        .replace(/\*\*/g, "")
        .replace(/^#+\s*/gm, "")
        .trim();

      if (!article) continue;

      const category = getCategory(item.title);

      const { error: insertError } = await supabase
        .from("news")
        .insert({
          title: item.title,
          content: article,
          source: `${item.source} — ${item.link}`,
          category,
          image_url: "",
          published: true,
          views: 0,
          is_breaking: false,
        });

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        continue;
      }

      publishedCount++;

      // Publish only one story per daily run for the first safe version.
      break;
    }

    return NextResponse.json({
      success: true,
      found: items.length,
      published: publishedCount,
    });
  } catch (error) {
    console.error("AUTO NEWS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Auto-news failed.",
      },
      { status: 500 }
    );
  }
}
