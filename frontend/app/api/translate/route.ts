import { NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b";

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {}
  }

  return null;
}

async function callGroq(apiKey: string, prompt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    return await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      }),
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  try {
    const { language, title, content } = await request.json();

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
You are a professional news translator for IBRAHIM SANI NEWS.

Translate the following news article into ${language}.

RULES:
- Preserve the exact meaning and facts.
- Do not add new information.
- Do not remove important information.
- Do not summarize.
- Do not use Markdown.
- Return ONLY valid JSON.
- Do not put the JSON inside a code block.
- Use exactly these two fields:

{
  "title": "translated title",
  "content": "translated content"
}

TITLE:
${title}

CONTENT:
${content || ""}
`;

    let response: Response | null = null;
    let lastError: unknown = null;

    // Try up to 3 times because the network can occasionally
    // close or timeout a connection to Groq.
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await callGroq(apiKey, prompt);

        if (response.ok) {
          break;
        }

        const errorText = await response.text();

        if (attempt === 3) {
          return NextResponse.json(
            { error: errorText || "Groq API error." },
            { status: response.status }
          );
        }
      } catch (error) {
        lastError = error;

        console.error(
          `TRANSLATION ATTEMPT ${attempt} FAILED:`,
          error
        );

        if (attempt < 3) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * attempt)
          );
        }
      }
    }

    if (!response) {
      console.error("TRANSLATION FINAL ERROR:", lastError);

      return NextResponse.json(
        {
          error:
            "An kasa haɗuwa da sabis ɗin fassara. Da fatan sake gwadawa.",
        },
        { status: 503 }
      );
    }

    const result = await response.json();

    const output =
      result.choices?.[0]?.message?.content || "";

    const translated = extractJson(output);

    if (!translated) {
      console.error("INVALID TRANSLATION JSON:", output);

      return NextResponse.json(
        {
          error:
            "AI ta dawo da sakamakon da ba a iya karanta shi ba. Da fatan sake gwadawa.",
        },
        { status: 502 }
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
