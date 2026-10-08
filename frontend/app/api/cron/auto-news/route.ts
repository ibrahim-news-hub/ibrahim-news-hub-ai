import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type NewsItem = {
  title: string;
  description: string;
  link: string;
  source: string;
  publishedAt: string;
};

type RewrittenNews = {
  title: string;
  article: string;
};

type Feed = {
  name: string;
  url: string;
  region: string;
};

const NEWS_IMAGE_BUCKET = "news-images";

/*
|--------------------------------------------------------------------------
| CLEANERS
|--------------------------------------------------------------------------
*/

function cleanText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
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

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.trim().toLowerCase().replace(/\/$/, "");
  }
}

/*
|--------------------------------------------------------------------------
| CATEGORY
|--------------------------------------------------------------------------
*/

function getCategory(title: string) {
  const text = title.toLowerCase();

  if (
    /nigeria|abuja|kaduna|kano|lagos|ibadan|jos|sokoto|zamfara|katsina|kwara|benue|borno|yobe|governor|president|senate|house of representatives|tinubu|atiku|pdp|apc|labour party/.test(
      text
    )
  ) {
    return "Nigeria";
  }

  if (
    /africa|ghana|kenya|south africa|sudan|ethiopia|somalia|egypt|libya|niger republic|chad|cameroon|mali|burkina|senegal|uganda|tanzania|rwanda|congo/.test(
      text
    )
  ) {
    return "Africa";
  }

  if (
    /iran|israel|palestine|gaza|hamas|hezbollah|lebanon|syria|iraq|yemen|houthi|saudi|saudi arabia|qatar|uae|united arab emirates|jordan|middle east/.test(
      text
    )
  ) {
    return "Middle East";
  }

  if (
    /russia|ukraine|moscow|kremlin|putin/.test(text)
  ) {
    return "Russia";
  }

  if (
    /china|beijing|taiwan|hong kong|chinese/.test(text)
  ) {
    return "China";
  }

  if (
    /ai|artificial intelligence|technology|tech|google|apple|microsoft|meta|openai|robot|cyber|chip|semiconductor|software/.test(
      text
    )
  ) {
    return "Technology";
  }

  if (
    /business|economy|market|bank|oil|finance|dollar|investment|company|stock|shares|inflation|trade/.test(
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

/*
|--------------------------------------------------------------------------
| IMAGE STYLE
|--------------------------------------------------------------------------
*/

function getImageStyle(category: string, title: string) {
  const styles = [
    "professional international newsroom photography, cinematic composition",
    "modern breaking-news editorial graphic, dramatic newsroom lighting",
    "high-end documentary photojournalism, realistic natural lighting",
    "clean international news magazine cover style",
    "modern African digital newsroom visual, premium editorial composition",
    "cinematic geopolitical news illustration with realistic environments",
    "minimal premium news graphic with strong visual hierarchy",
    "dynamic world-news editorial photography with atmospheric lighting",
  ];

  const hash = Array.from(title).reduce(
    (total, char) => total + char.charCodeAt(0),
    0
  );

  const style = styles[hash % styles.length];

  const categoryDirection: Record<string, string> = {
    Nigeria:
      "Focus on Nigeria, Nigerian environment, Nigerian people or institutions when relevant.",
    Africa:
      "Use an authentic African visual environment relevant to the story.",
    "Middle East":
      "Use a realistic Middle Eastern environment relevant to the story.",
    Russia:
      "Use a realistic Russian environment, architecture or geography when relevant.",
    China:
      "Use a realistic Chinese environment, architecture or city setting when relevant.",
    Technology:
      "Use modern technology, computers, AI, data or digital infrastructure when relevant.",
    Business:
      "Use professional finance, commerce, business or economic imagery when relevant.",
    Sports:
      "Use a realistic sports-news visual appropriate to the story.",
    World:
      "Use a realistic international-news environment appropriate to the story.",
  };

  return `${style}. ${
    categoryDirection[category] ||
    categoryDirection.World
  }`;
}

/*
|--------------------------------------------------------------------------
| RSS SOURCES
|--------------------------------------------------------------------------
*/

function getFeeds(): Feed[] {
  return [
    {
      name: "BBC Africa",
      url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml",
      region: "Africa",
    },
    {
      name: "BBC Middle East",
      url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
      region: "Middle East",
    },
    {
      name: "BBC China",
      url: "https://feeds.bbci.co.uk/news/world/asia/china/rss.xml",
      region: "China",
    },
    {
      name: "BBC World",
      url: "https://feeds.bbci.co.uk/news/world/rss.xml",
      region: "World",
    },
    {
      name: "BBC Technology",
      url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
      region: "Technology",
    },
    {
      name: "BBC Business",
      url: "https://feeds.bbci.co.uk/news/business/rss.xml",
      region: "Business",
    },
    {
      name: "Al Jazeera",
      url: "https://www.aljazeera.com/xml/rss/all.xml",
      region: "World",
    },
    {
      name: "DW World",
      url: "https://rss.dw.com/rdf/rss-en-world",
      region: "World",
    },
    {
      name: "Euronews",
      url: "https://www.euronews.com/rss",
      region: "World",
    },
    {
      name: "The Guardian World",
      url: "https://www.theguardian.com/world/rss",
      region: "World",
    },

    /*
    |--------------------------------------------------------------------------
    | GOOGLE NEWS RSS
    |--------------------------------------------------------------------------
    | These broaden coverage beyond BBC and Al Jazeera.
    |--------------------------------------------------------------------------
    */

    {
      name: "Google News Nigeria",
      url:
        "https://news.google.com/rss/search?q=when:24h%20Nigeria&hl=en-US&gl=US&ceid=US:en",
      region: "Nigeria",
    },
    {
      name: "Google News Africa",
      url:
        "https://news.google.com/rss/search?q=when:24h%20Africa&hl=en-US&gl=US&ceid=US:en",
      region: "Africa",
    },
    {
      name: "Google News Iran",
      url:
        "https://news.google.com/rss/search?q=when:24h%20Iran&hl=en-US&gl=US&ceid=US:en",
      region: "Middle East",
    },
    {
      name: "Google News Saudi Arabia",
      url:
        "https://news.google.com/rss/search?q=when:24h%20Saudi%20Arabia&hl=en-US&gl=US&ceid=US:en",
      region: "Middle East",
    },
    {
      name: "Google News Middle East",
      url:
        "https://news.google.com/rss/search?q=when:24h%20Middle%20East&hl=en-US&gl=US&ceid=US:en",
      region: "Middle East",
    },
    {
      name: "Google News Russia",
      url:
        "https://news.google.com/rss/search?q=when:24h%20Russia&hl=en-US&gl=US&ceid=US:en",
      region: "Russia",
    },
    {
      name: "Google News China",
      url:
        "https://news.google.com/rss/search?q=when:24h%20China&hl=en-US&gl=US&ceid=US:en",
      region: "China",
    },
    {
      name: "Google News Technology",
      url:
        "https://news.google.com/rss/search?q=when:24h%20technology%20AI&hl=en-US&gl=US&ceid=US:en",
      region: "Technology",
    },
    {
      name: "Google News Business",
      url:
        "https://news.google.com/rss/search?q=when:24h%20business%20economy&hl=en-US&gl=US&ceid=US:en",
      region: "Business",
    },
  ];
}

/*
|--------------------------------------------------------------------------
| RSS PARSER
|--------------------------------------------------------------------------
*/

function extractTag(
  item: string,
  tag: string
): string {
  const cdata =
    item.match(
      new RegExp(
        `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`,
        "i"
      )
    )?.[1];

  if (cdata) return cdata;

  return (
    item.match(
      new RegExp(
        `<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
        "i"
      )
    )?.[1] || ""
  );
}

async function getFeedItems(): Promise<NewsItem[]> {
  const feeds = getFeeds();

  const allItems: NewsItem[] = [];

  for (const feed of feeds) {
    try {
      const response = await fetch(feed.url, {
        cache: "no-store",
        headers: {
          "User-Agent": "Ibrahim-News-Hub-AI/3.0",
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
        ...xml.matchAll(
          /<item\b[^>]*>([\s\S]*?)<\/item>/gi
        ),
      ];

      for (const match of items.slice(0, 8)) {
        const item = match[1];

        const title = cleanText(
          extractTag(item, "title")
        );

        const description = cleanText(
          extractTag(item, "description")
        );

        const link = cleanUrl(
          extractTag(item, "link")
        );

        const publishedAt =
          extractTag(item, "pubDate") ||
          extractTag(item, "published") ||
          extractTag(item, "updated") ||
          "";

        if (!title || !link) {
          continue;
        }

        allItems.push({
          title,
          description,
          link,
          source: feed.name,
          publishedAt,
        });
      }
    } catch (error) {
      console.error(
        `FEED ERROR: ${feed.name}`,
        error
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | NEWEST FIRST
  |--------------------------------------------------------------------------
  */

  allItems.sort((a, b) => {
    const aTime = Date.parse(a.publishedAt);
    const bTime = Date.parse(b.publishedAt);

    if (
      Number.isNaN(aTime) ||
      Number.isNaN(bTime)
    ) {
      return 0;
    }

    return bTime - aTime;
  });

  /*
  |--------------------------------------------------------------------------
  | REMOVE DUPLICATES INSIDE THE RSS RESULT
  |--------------------------------------------------------------------------
  */

  const seenTitles = new Set<string>();
  const seenUrls = new Set<string>();

  return allItems.filter((item) => {
    const title = normalizeTitle(item.title);
    const url = normalizeUrl(item.link);

    if (
      seenTitles.has(title) ||
      seenUrls.has(url)
    ) {
      return false;
    }

    seenTitles.add(title);
    seenUrls.add(url);

    return true;
  });
}

/*
|--------------------------------------------------------------------------
| AI NEWS WRITER
|--------------------------------------------------------------------------
*/

async function rewriteNewsWithAI(
  item: NewsItem
): Promise<RewrittenNews> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is missing."
    );
  }

  const category = getCategory(item.title);

  const prompt = `
Kai ƙwararren editan labarai ne na IBRAHIM SANI NEWS (ISN).

Ka sake rubuta wannan rahoto cikin Hausa mai kyau,
mai sauƙin fahimta kuma cikin salon ƙwararren gidan labarai.

CATEGORY:
${category}

SOURCE:
${item.source}

SOURCE TITLE:
${item.title}

SOURCE DESCRIPTION:
${item.description}

MUHIMMAN ƘA'IDOJI:

1. Kada ka ƙirƙiri wani sabon bayani.

2. Kada ka ƙara sunaye, lambobi, wurare ko bayanan da source bai bayar ba.

3. Kada ka canza ma'anar rahoton.

4. Idan bayanin zargi ne, ka rubuta shi a matsayin zargi.

5. Idan rahoton bai tabbatar da wani abu ba, kada ka gabatar da shi a matsayin tabbataccen abu.

6. Kada ka yi sensationalism.

7. Kada ka yi amfani da kalmomin da za su iya yaudarar mai karatu.

8. Taken ya kasance Hausa.

9. Taken ya kasance gajere, ƙarfi kuma ƙwararre.

10. Labarin ya kasance sakin layi 4 zuwa 6.

11. Kada ka kwafi jimlolin source kai tsaye.

12. Kada ka ambaci AI.

13. Kada ka yi Markdown.

14. Idan bayanin source ya yi kaɗan, kada ka ƙirƙiri ƙarin bayani domin cike gibin.

15. Ka yi amfani da "Rahotanni sun ce" ko makamancin haka idan source bai tabbatar da cikakken bayani ba.

16. Kada ka rubuta ra'ayi naka.

17. Ka kula sosai da sunayen ƙasashe, shugabanni, ƙungiyoyi da wurare.

Ka dawo da JSON kawai:

{
  "title": "Taken Hausa",
  "article": "Labarin Hausa"
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
    result.choices?.[0]?.message?.content?.trim() ||
    "";

  if (!output) {
    throw new Error(
      "Groq bai dawo da bayani ba."
    );
  }

  let jsonText = output;

  const firstBrace =
    output.indexOf("{");

  const lastBrace =
    output.lastIndexOf("}");

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

  if (
    !parsed.title?.trim() ||
    !parsed.article?.trim()
  ) {
    throw new Error(
      "AI bai dawo da title ko article ba."
    );
  }

  return {
    title: parsed.title.trim(),
    article: parsed.article.trim(),
  };
}

/*
|--------------------------------------------------------------------------
| OPENAI IMAGE GENERATION
|--------------------------------------------------------------------------
*/

async function generateISNImage(
  title: string,
  article: string,
  category: string
): Promise<string> {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing."
    );
  }

  const style = getImageStyle(
    category,
    title
  );

  const prompt = `
Create an original 16:9 professional news graphic
for a Nigerian digital news organization called:

IBRAHIM SANI NEWS (ISN)

This must be an ORIGINAL editorial graphic.

IMPORTANT:
- Do NOT use BBC branding.
- Do NOT use Al Jazeera branding.
- Do NOT use Reuters branding.
- Do NOT use CNN branding.
- Do NOT use any other news organization's logo.
- Do NOT copy an existing news graphic.
- Do NOT reproduce any source outlet's watermark.
- The visual must be original.

BRANDING:
Use a premium Nigerian newsroom identity.
Use deep green, white, dark gray and gold.
Use red only as a breaking-news accent.
Include clear text:
"IBRAHIM SANI NEWS (ISN)"

LAYOUT:
Professional Facebook news graphic.
Strong visual hierarchy.
Clean typography.
Modern international newsroom appearance.
Make the main subject visually dominant.
Leave a clean area for headline treatment.

NEWS CATEGORY:
${category}

HEADLINE:
${title}

NEWS CONTEXT:
${article.slice(0, 1600)}

VISUAL STYLE:
${style}

Create a realistic, professional editorial image.
Avoid graphic violence, gore or disturbing imagery.
Do not show fake logos of real organizations.
Do not create misleading documentary evidence.
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
        size: "1536x864",
        quality: "medium",
        output_format: "png",
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `OpenAI Image API error: ${errorText}`
    );
  }

  const result =
    await response.json();

  const base64 =
    result.data?.[0]?.b64_json;

  if (!base64) {
    throw new Error(
      "OpenAI bai dawo da hoton base64 ba."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UPLOAD TO SUPABASE STORAGE
  |--------------------------------------------------------------------------
  */

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (
    !serviceRoleKey ||
    !supabaseUrl
  ) {
    throw new Error(
      "Supabase Storage environment variables sun ɓace."
    );
  }

  const imageBuffer =
    Buffer.from(base64, "base64");

  const safeTitle =
    normalizeTitle(title)
      .replace(/\s+/g, "-")
      .slice(0, 70) ||
    "isn-news";

  const fileName =
    `auto-news/${Date.now()}-${safeTitle}.png`;

  const uploadResponse =
    await fetch(
      `${supabaseUrl}/storage/v1/object/${NEWS_IMAGE_BUCKET}/${fileName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "image/png",
          "x-upsert": "true",
        },
        body: imageBuffer,
      }
    );

  if (!uploadResponse.ok) {
    const errorText =
      await uploadResponse.text();

    throw new Error(
      `Supabase image upload error: ${errorText}`
    );
  }

  const publicUrl =
    `${supabaseUrl}/storage/v1/object/public/${NEWS_IMAGE_BUCKET}/${fileName}`;

  return publicUrl;
}

/*
|--------------------------------------------------------------------------
| MAKE WEBHOOK
|--------------------------------------------------------------------------
*/

async function sendNewsToMake(payload: {
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
    console.error(
      "MAKE_WEBHOOK_URL is missing."
    );
    return;
  }

  try {
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

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "MAKE WEBHOOK ERROR:",
        response.status,
        errorText
      );

      return;
    }

    console.log(
      "MAKE WEBHOOK: ISN news sent successfully."
    );
  } catch (error) {
    console.error(
      "MAKE WEBHOOK FETCH ERROR:",
      error
    );
  }
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export async function GET(
  request: Request
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    const authHeader =
      request.headers.get(
        "authorization"
      );

    const cronSecret =
      process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        {
          success: false,
          error:
            "CRON_SECRET is missing.",
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

    /*
    |--------------------------------------------------------------------------
    | GET NEWS
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | RECENT DATABASE NEWS
    |--------------------------------------------------------------------------
    */

    const {
      data: recentNews,
      error: recentError,
    } = await supabase
      .from("news")
      .select(
        "id,title,source,source_name,source_url"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(200);

    if (recentError) {
      throw recentError;
    }

    let publishedCount = 0;

    /*
    |--------------------------------------------------------------------------
    | FIND ONE NEW STORY
    |--------------------------------------------------------------------------
    */

    for (const item of items) {
      const normalizedTitle =
        normalizeTitle(item.title);

      const normalizedUrl =
        normalizeUrl(item.link);

      const duplicate =
        (recentNews || []).some(
          (news) => {
            const oldUrl =
              news.source_url
                ? normalizeUrl(
                    news.source_url
                  )
                : "";

            return (
              (oldUrl &&
                oldUrl ===
                  normalizedUrl) ||
              normalizeTitle(
                news.title
              ) === normalizedTitle
            );
          }
        );

      if (duplicate) {
        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | CATEGORY
      |--------------------------------------------------------------------------
      */

      const category =
        getCategory(item.title);

      /*
      |--------------------------------------------------------------------------
      | AI HAUSA ARTICLE
      |--------------------------------------------------------------------------
      */

      let rewritten: RewrittenNews;

      try {
        rewritten =
          await rewriteNewsWithAI(
            item
          );
      } catch (error) {
        console.error(
          "AI REWRITE FAILED:",
          error
        );

        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | ORIGINAL ISN IMAGE
      |--------------------------------------------------------------------------
      */

      let imageUrl = "";

      try {
        imageUrl =
          await generateISNImage(
            rewritten.title,
            rewritten.article,
            category
          );
      } catch (error) {
        console.error(
          "ISN IMAGE GENERATION FAILED:",
          error
        );

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT:
        | We do NOT fall back to the source image.
        | This guarantees BBC/Al Jazeera/etc images
        | are never sent to Make.
        |--------------------------------------------------------------------------
        */

        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | SAVE NEWS TO SUPABASE
      |--------------------------------------------------------------------------
      */

      const {
        error: insertError,
      } = await supabase
        .from("news")
        .insert({
          title: rewritten.title,
          content: rewritten.article,

          source:
            `${item.source} — ${item.link}`,

          source_name:
            item.source,

          source_url:
            item.link,

          category,

          /*
          | IMPORTANT:
          | This is now the ORIGINAL ISN image,
          | not the source image.
          */

          image_url:
            imageUrl,

          video_url:
            null,

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

      /*
      |--------------------------------------------------------------------------
      | FACEBOOK CAPTION
      |--------------------------------------------------------------------------
      */

      const facebookCaption =
        `🔴 ${rewritten.title}

${rewritten.article}

📰 IBRAHIM SANI NEWS (ISN)

#ISN #IbrahimSaniNews`;

      /*
      |--------------------------------------------------------------------------
      | MAKE → FACEBOOK
      |--------------------------------------------------------------------------
      */

      await sendNewsToMake({
        title:
          rewritten.title,

        article:
          rewritten.article,

        caption:
          facebookCaption,

        /*
        |--------------------------------------------------------------------------
        | VERY IMPORTANT:
        | Make receives generated ISN image URL.
        |--------------------------------------------------------------------------
        */

        image_url:
          imageUrl,

        category,

        source_url:
          item.link,
      });

      /*
      |--------------------------------------------------------------------------
      | ONLY ONE NEWS PER CRON RUN
      |--------------------------------------------------------------------------
      */

      break;
    }

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,
      found: items.length,
      published:
        publishedCount,

      message:
        publishedCount > 0
          ? "Sabon labari da ORIGINAL ISN graphic an shirya kuma an aika."
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
