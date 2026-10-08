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

type Feed = {
  name: string;
  url: string;
  region: string;
};

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

function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";

    return parsed
      .toString()
      .replace(/\/$/, "");
  } catch {
    return url
      .trim()
      .toLowerCase()
      .replace(/\/$/, "");
  }
}

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

function extractTag(
  item: string,
  tag: string
): string {
  const cdata = item.match(
    new RegExp(
      `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`,
      "i"
    )
  )?.[1];

  if (cdata) {
    return cdata;
  }

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
          "User-Agent":
            "Ibrahim-News-Hub-AI/4.0",
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

  const seenTitles = new Set<string>();
  const seenUrls = new Set<string>();

  return allItems.filter((item) => {
    const title = normalizeTitle(
      item.title
    );

    const url = normalizeUrl(
      item.link
    );

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
    /iran|israel|palestine|gaza|hamas|hezbollah|lebanon|syria|iraq|yemen|houthi|saudi|qatar|uae|united arab emirates|jordan|middle east/.test(
      text
    )
  ) {
    return "Middle East";
  }

  if (
    /russia|ukraine|moscow|kremlin|putin/.test(
      text
    )
  ) {
    return "Russia";
  }

  if (
    /china|beijing|taiwan|hong kong|chinese/.test(
      text
    )
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
    | GET RSS NEWS
    |--------------------------------------------------------------------------
    */

    const items =
      await getFeedItems();

    if (!items.length) {
      return NextResponse.json({
        success: true,
        found: 0,
        queued: 0,
        message:
          "Ba a samu sabbin labarai ba.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | EXISTING PUBLISHED NEWS
    |--------------------------------------------------------------------------
    */

    const {
      data: recentNews,
      error: recentError,
    } = await supabase
      .from("news")
      .select(
        "id,title,source_url"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(300);

    if (recentError) {
      throw recentError;
    }

    /*
    |--------------------------------------------------------------------------
    | EXISTING QUEUE
    |--------------------------------------------------------------------------
    */

    const {
      data: existingQueue,
      error: queueError,
    } = await supabase
      .from("news_queue")
      .select(
        "id,title,source_url,status"
      )
      .in("status", [
        "queued",
        "processing",
      ])
      .limit(300);

    if (queueError) {
      throw queueError;
    }

    const publishedTitles =
      new Set(
        (recentNews || []).map(
          (news) =>
            normalizeTitle(
              news.title
            )
        )
      );

    const publishedUrls =
      new Set(
        (recentNews || [])
          .map((news) =>
            news.source_url
              ? normalizeUrl(
                  news.source_url
                )
              : ""
          )
          .filter(Boolean)
      );

    const queuedTitles =
      new Set(
        (existingQueue || []).map(
          (item) =>
            normalizeTitle(
              item.title
            )
        )
      );

    const queuedUrls =
      new Set(
        (existingQueue || [])
          .map((item) =>
            item.source_url
              ? normalizeUrl(
                  item.source_url
                )
              : ""
          )
          .filter(Boolean)
      );

    /*
    |--------------------------------------------------------------------------
    | BUILD QUEUE
    |--------------------------------------------------------------------------
    */

    const queueRows: Array<{
      title: string;
      article: string;
      caption: string;
      image_url: string | null;
      category: string;
      source_url: string;
      status: "queued";
      scheduled_at: string;
      attempts: number;
    }> = [];

    for (const item of items) {
      if (queueRows.length >= 50) {
        break;
      }

      const normalizedTitle =
        normalizeTitle(
          item.title
        );

      const normalizedUrl =
        normalizeUrl(
          item.link
        );

      if (
        publishedTitles.has(
          normalizedTitle
        ) ||
        publishedUrls.has(
          normalizedUrl
        )
      ) {
        continue;
      }

      if (
        queuedTitles.has(
          normalizedTitle
        ) ||
        queuedUrls.has(
          normalizedUrl
        )
      ) {
        continue;
      }

      const category =
        getCategory(
          item.title
        );

      const article =
        item.description ||
        item.title;

      const caption =
        `📰 ${item.title}\n\n` +
        `${article}\n\n` +
        `IBRAHIM SANI NEWS (ISN)\n\n` +
        `#ISN #IbrahimSaniNews`;

      queueRows.push({
        title: item.title,
        article,
        caption,
        image_url: null,
        category,
        source_url: item.link,
        status: "queued",
        scheduled_at:
          new Date().toISOString(),
        attempts: 0,
      });

      queuedTitles.add(
        normalizedTitle
      );

      queuedUrls.add(
        normalizedUrl
      );
    }

    /*
    |--------------------------------------------------------------------------
    | INSERT QUEUE
    |--------------------------------------------------------------------------
    */

    if (!queueRows.length) {
      return NextResponse.json({
        success: true,
        found: items.length,
        queued: 0,
        message:
          "Babu sabon labari da bai riga ya shiga Queue ba.",
      });
    }

    const {
      data: inserted,
      error: insertError,
    } = await supabase
      .from("news_queue")
      .insert(queueRows)
      .select(
        "id,title,category,status"
      );

    if (insertError) {
      throw insertError;
    }

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,
      found: items.length,
      queued:
        inserted?.length || 0,
      message:
        `${inserted?.length || 0} sabbin labarai an saka su cikin Queue.`,
    });
  } catch (error) {
    console.error(
      "AUTO NEWS QUEUE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Auto-news queue failed.",
      },
      { status: 500 }
    );
  }
}
