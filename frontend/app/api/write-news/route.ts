import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { headline, sourceText } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing." },
        { status: 500 }
      );
    }

    const prompt = `
Kai ƙwararren ɗan jarida ne na gidan Ibrahim News Hub AI.

Rubuta cikakken labari cikin Hausa mai sauƙin karantawa.

Ka bi waɗannan ƙa'idoji:
- Ka fara da take mai jan hankali.
- Ka rubuta sakin layi 4 zuwa 6.
- Kada ka ƙirƙiri bayanan da ba a ba ka ba.
- Ka yi amfani da salon aikin jarida.
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
          model: "llama-3.3-70b-versatile",
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

    const article =
      result.choices?.[0]?.message?.content || "Ba a samu labari ba.";

    const { data, error } = await supabase
      .from("news")
      .insert([
        {
          title: headline,
          content: article,
          source: sourceText,
        },
      ])
      .select();

    console.log("INSERT DATA:", data);
    console.log("INSERT ERROR:", error);

    return NextResponse.json({
      success: true,
      article,
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
