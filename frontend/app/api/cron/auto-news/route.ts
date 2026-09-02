import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type NewsItem = {
  title: string;
  description: string;
  link: string;
  source: string;
  image_url: string;
  video_url: string;
};

type RewrittenNews = {
  title: string;
  article: string;
};

function cleanText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanUrl(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#47;/gi, "/")
    .trim();
}

function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(value: string, baseUrl: string) {
  if (!value) return "";

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return cleanUrl(value);
  }
}

function getCategory(title: string) {
  const text = title.toLowerCase();

  if (
    /nigeria|abuja|kaduna|kano|lagos|governor|president|senate|house of representatives|tinubu|atiku|pdp|apc/.test(
      text
    )
  ) {
    return "Nigeria";
  }

  if (
    /ai|artificial intelligence|technology|tech|google|apple|microsoft|meta|openai|robot|cyber/.test(
      text
    )
  ) {
    return "Technology";
  }

  if (
    /business|economy|market|bank|oil|finance|dollar|investment|company|economy/.test(
      text
    )
  ) {
    return "Business";
  }

  if (
    /football|soccer|sport|match|league|player|championship|fifa|premier league/.test(
      text
    )
  ) {
    return "Sports";
  }

  return "World";
}

function extractMedia(item: string, articleUrl: string) {
  let image = "";
  let video = "";

  const mediaImages = [
    item.match(
      /<media:content[^>]+medium=["']image["'][^>]+url=["']([^"']+)["']/i
    )?.[1],

    item.match(
      /<media:content[^>]+url=["']([^"']+)["'][^>]+medium=["']image["']/i
    )?.[1],

    item.match(
      /<media:thumbnail[^>]+url=["']([^"']+)["']/i
    )?.[1],

    item.match(
      /<enclosure[^>]+type=["']image\/[^"']+["'][^>]+url=["']([^"']+)["']/i
    )?.[1],

    item.match(
      /<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image\/[^"']+["']/i
    )?.[1],

    item.match(
      /<description[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["']/i
    )?.[1],
  ].find(Boolean);

  const mediaVideos = [
    item.match(
      /<media:content[^>]+medium=["']video["'][^>]+url=["']([^"']+)["']/i
    )?.[1],

    item.match(
      /<media:content[^>]+url=["']([^"']+)["'][^>]+medium=["']video["']/i
    )?.[1],

    item.match(
      /<media:content[^>]+type=["']video\/[^"']+["'][^>]+url=["']([^"']+)["']/i
    )?.[1],

    item.match(
      /<media:content[^>]+url=["']([^"']+)["'][^>]+type=["']video\/[^"']+["']/i
    )?.[1],

    item.match(
      /<enclosure[^>]+type=["']video\/[^"']+["'][^>]+url=["']([^"']+)["']/i
    )?.[1],

    item.match(
      /<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']video\/[^"']+["']/i
    )?.[1],
  ].find(Boolean);

  if (image) {
    image = absoluteUrl(cleanUrl(image), articleUrl);
  }

  if (video) {
    video = absoluteUrl(cleanUrl(video), articleUrl);
  }

  return {
    image_url: image,
    video_url: video,
  };
}

async function getOgMedia(link: string) {
  if (!link) {
    return {
      image_url: "",
      video_url: "",
    };
  }

  try {
    const response = await fetch(link, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Ibrahim-News-Hub-AI/2.0)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return {
        image_url: "",
        video_url: "",
      };
    }

    const html = await response.text();

    const image =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
      )?.[1] ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
      )?.[1] ||
      html.match(
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
      )?.[1] ||
      "";

    const video =
      html.match(
        /<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["']/i
      )?.[1] ||
      html.match(
        /<meta[^>]+property=["']og:video:url["'][^>]+content=["']([^"']+)["']/i
      )?.[1] ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video["']/i
      )?.[1] ||
      "";

    return {
      image_url: absoluteUrl(cleanUrl(image), link),
      video_url: absoluteUrl(cleanUrl(video), link),
    };
  } catch (error) {
    console.error("OG MEDIA ERROR:", error);

    return {
      image_url: "",
      video_url: "",
    };
  }
}

async function getFeedItems(): Promise<NewsItem[]> {
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

  const allItems: NewsItem[] = [];

  for (const feed of feeds) {
    try {
      const response = await fetch(feed.url, {
        cache: "no-store",
        headers: {
          "User-Agent": "Ibrahim-News-Hub-AI/2.0",
          Accept:
            "application/rss+xml, application/xml, text/xml",
        },
      });

      if (!response.ok) {
        console.error(
          `RSS ERROR: ${feed.name}: ${response.status}`
        );
        continue;
      }

      const xml = await response.text();

      const items = [
        ...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi),
      ];

      for (const match of items.slice(0, 10)) {
        const item = match[1];

        const title =
          item.match(
            /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i
          )?.[1] ||
          item.match(
            /<title>([\s\S]*?)<\/title>/i
          )?.[1] ||
          "";

        const description =
          item.match(
            /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i
          )?.[1] ||
          item.match(
            /<description>([\s\S]*?)<\/description>/i
          )?.[1] ||
          "";

        const link =
          item.match(
            /<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i
          )?.[1] ||
          item.match(
            /<link>([\s\S]*?)<\/link>/i
          )?.[1] ||
          "";

        if (!title.trim() || !link.trim()) {
          continue;
        }

        const media = extractMedia(
          item,
          cleanUrl(link)
        );

        allItems.push({
          title: cleanText(title),
          description: cleanText(description),
          link: cleanUrl(link),
          source: feed.name,
          image_url: media.image_url,
          video_url: media.video_url,
        });
      }
    } catch (error) {
      console.error(
        `FEED ERROR: ${feed.name}`,
        error
      );
    }
  }

  return allItems;
}

async function rewriteNewsWithAI(
  item: NewsItem
): Promise<RewrittenNews> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing.");
  }

  const prompt = `
Kai ƙwararren editan labarai ne na IBRAHIM SANI NEWS.

Ka sake rubuta labarin da ke ƙasa cikin Hausa mai kyau,
bayyananniya kuma mai sauƙin fahimta.

MUHIMMAN ƘA'IDOJI:

1. Ka kiyaye ainihin ma'anar source.

2. Kada ka ƙirƙiri sabon bayani.

3. Kada ka cire muhimmin bayani.

4. Idan source ya ce mutane huɗu, ka rubuta "Mutum huɗu".
   Kada ka mayar da shi "wasu mutane".

5. Kada ka canza wanda abin ya shafa.

6. Kada ka canza babban abin da ya faru.

7. Idan source ya bayyana muhimmiyar hanyar da abin ya faru,
   ka kiyaye wannan bayanin.

8. Idan source ya ce "ana zargin", ka riƙe shi a matsayin zargi.
   Kada ka gabatar da zargi a matsayin tabbatacciyar gaskiya.

9. Kada ka ƙara sunaye, lambobi, wurare ko bayanan da source bai bayar ba.

10. Kada ka ƙirƙiri jita-jita.

11. Taken ya kasance cikin Hausa.

12. Taken ya kasance gajere kuma ƙwararre.

13. Idan akwai adadi mai muhimmanci, ka saka shi a taken.

14. Labarin ya kasance sakin layi 4 zuwa 6.

15. Kada ka yi sensationalism.

16. Kada ka ambaci AI.

17. Kada ka yi Markdown.

18. Kada ka kwafi jimlolin source kai tsaye.

19. Sake rubutawa kada ya canza ainihin ma'anar rahoton.

SOURCE:
${item.source}

TAKEN SOURCE:
${item.title}

BAYANIN SOURCE:
${item.description}

Ka dawo da JSON kawai kamar haka:

{
  "title": "Taken labarin cikin Hausa",
  "article": "Labarin Hausa mai sakin layi 4 zuwa 6"
}
`;

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
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Groq API error: ${errorText}`
    );
  }

  const result = await response.json();

  const output =
    result.choices?.[0]?.message?.content?.trim() || "";

  if (!output) {
    throw new Error(
      "Groq bai dawo da wani bayani ba."
    );
  }

  let jsonText = output;

  const firstBrace = output.indexOf("{");
  const lastBrace = output.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    jsonText = output.slice(
      firstBrace,
      lastBrace + 1
    );
  }

  let parsed: {
    title?: string;
    article?: string;
  };

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    console.error(
      "AI RAW OUTPUT:",
      output
    );

    throw new Error(
      "AI ya dawo da JSON mara inganci."
    );
  }

  const title =
    parsed.title?.trim() || "";

  const article =
    parsed.article?.trim() || "";

  if (!title || !article) {
    console.error(
      "AI PARSED OUTPUT:",
      parsed
    );

    throw new Error(
      "AI bai dawo da title ko article ba."
    );
  }

  return {
    title,
    article,
  };
}

export async function GET(request: Request) {
  try {
    const authHeader =
      request.headers.get("authorization");

    const cronSecret =
      process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "CRON_SECRET is missing.",
        },
        { status: 500 }
      );
    }

    if (
      authHeader !==
      `Bearer ${cronSecret}`
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const items =
      await getFeedItems();

    if (!items.length) {
      return NextResponse.json({
        success: true,
        found: 0,
        published: 0,
        message:
          "Ba a samu sabbin labarai ba.",
      });
    }

    const {
      data: recentNews,
      error: recentError,
    } = await supabase
      .from("news")
      .select("id,title")
      .order("created_at", {
        ascending: false,
      })
      .limit(100);

    if (recentError) {
      throw recentError;
    }

    let publishedCount = 0;

    for (const item of items) {
      const normalizedTitle =
        normalizeTitle(item.title);

      const duplicate =
        (recentNews || []).some(
          (news) =>
            normalizeTitle(news.title) ===
            normalizedTitle
        );

      if (duplicate) {
        continue;
      }

      let imageUrl =
        item.image_url || "";

      let videoUrl =
        item.video_url || "";

      if (!imageUrl || !videoUrl) {
        const ogMedia =
          await getOgMedia(item.link);

        if (!imageUrl) {
          imageUrl =
            ogMedia.image_url;
        }

        if (!videoUrl) {
          videoUrl =
            ogMedia.video_url;
        }
      }

      const rewritten =
        await rewriteNewsWithAI(item);

      const category =
        getCategory(item.title);

      const { error: insertError } =
        await supabase
          .from("news")
          .insert({
            title: rewritten.title,
            content: rewritten.article,
            source:
              `${item.source} — ${item.link}`,
            category,
            image_url: imageUrl || null,
            video_url: videoUrl || null,
            published: true,
            views: 0,
            is_breaking: false,
          });

      if (insertError) {
        console.error(
          "SUPABASE INSERT ERROR:",
          insertError
        );

        continue;
      }

      publishedCount++;

      break;
    }

    return NextResponse.json({
      success: true,
      found: items.length,
      published: publishedCount,
      message:
        publishedCount > 0
          ? "Sabon labari an wallafa successfully."
          : "Ba a samu sabon labari da ya dace ba.",
    });
  } catch (error) {
    console.error(
      "AUTO NEWS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Auto-news failed.",
      },
      { status: 500 }
    );
  }
}
