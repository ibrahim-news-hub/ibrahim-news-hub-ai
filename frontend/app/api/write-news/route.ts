import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const {
      headline,
      sourceText,
      category = "General",
      imageUrl = "",
      published = true,
    } = await request.json();

    if (!headline?.trim() || !sourceText?.trim()) {
      return NextResponse.json(
        {
          error: "Take da bayanan labari suna da muhimmanci.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing." },
        { status: 500 }
      );
    }

    const prompt = `
Kai ƙwararren ɗan jarida ne na gidan Ibrahim News Hub AI.

Aiki:
Rubuta cikakken labari cikin Hausa mai sauƙin karantawa.

MUHIMMAN ƘA'IDOJI:
- Kada ka rubuta ko maimaita taken labarin a cikin amsar.
- Kada ka fara da take.
- Kada ka yi amfani da ** ko Markdown.
- Ka fara kai tsaye da sakin layin farko na labarin.
- Ka rubuta sakin layi 4 zuwa 6.
- Kada ka ƙirƙiri bayanan da ba a ba ka ba.
- Ka yi amfani da salon aikin jarida.
- Ka kiyaye ma'anar bayanan da aka ba ka.
- Ka ƙare da taƙaitaccen bayani idan ya dace.

Take:
${headline}

Bayanan Labari:
${sourceText}
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
          temperature: 0.7,
        }),
      }
    );

    console.log("GROQ STATUS:", response.status);

    if (!response.ok) {
      const text = await response.text();

      console.log("GROQ ERROR:", text);

      return NextResponse.json(
        { error: text },
        { status: response.status }
      );
    }

    const result = await response.json();

    let article =
      result.choices?.[0]?.message?.content ||
      "Ba a samu labari ba.";

    article = article
      .replace(/\*\*/g, "")
      .replace(/^#+\s*/gm, "")
      .trim();

    if (
      article.toLowerCase().startsWith(headline.toLowerCase())
    ) {
      article = article.slice(headline.length).trim();
    }

    const { data, error } = await supabase
      .from("news")
      .insert([
        {
          title: headline,
          content: article,
          source: sourceText,
          category,
          image_url: imageUrl,
          published,
        },
      ])
      .select();

    console.log("INSERT DATA:", data);
    console.log("INSERT ERROR:", error);

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          article,
          error: "Supabase insert failed",
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      article,
      news: data?.[0] || null,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "An samu kuskure.",
      },
      {
        status: 500,
      }
    );
  }
}
