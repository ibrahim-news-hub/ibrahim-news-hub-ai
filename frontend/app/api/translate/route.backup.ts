import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      language,
      title,
      content,
    } = await request.json();

    if (!language || !title) {
      return NextResponse.json(
        { error: "Language da title suna da muhimmanci." },
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
Kai ƙwararren mai fassarar labarai ne na IBRAHIM SANI NEWS.

Ka fassara wannan labari zuwa ${language}.

KA'IDOJI:
- Ka kiyaye ma'anar labarin gaba ɗaya.
- Kada ka ƙirƙiri sabon bayani.
- Kada ka rage muhimman bayanai.
- Kada ka saka Markdown.
- Kada ka yi bayani game da fassarar.
- Ka dawo da JSON kawai kamar haka:

{
  "title": "translated title",
  "content": "translated content"
}

TITLE:
${title}

CONTENT:
${content || ""}
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

      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();

    let output =
      result.choices?.[0]?.message?.content || "";

    output = output
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let translated;

    try {
      translated = JSON.parse(output);
    } catch {
      return NextResponse.json(
        {
          error: "AI ta dawo da sakamakon da ba JSON ba.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      title: translated.title || title,
      content: translated.content || content || "",
    });
  } catch (error) {
    console.error("TRANSLATION ERROR:", error);

    return NextResponse.json(
      {
        error: "An samu kuskure wajen fassara labarin.",
      },
      { status: 500 }
    );
  }
}
