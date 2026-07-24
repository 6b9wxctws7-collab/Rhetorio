const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

type RequestBody = {
  image_base64?: string;
  mime_type?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.1-flash";
    if (!geminiKey) throw new Error("GEMINI_API_KEY ist nicht gesetzt.");

    const body = (await req.json()) as RequestBody;
    const imageBase64 = (body.image_base64 ?? "").trim();
    const mimeType = (body.mime_type ?? "image/jpeg").toLowerCase();

    if (!imageBase64) throw new Error("Es wurde kein Bild gesendet.");
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error("Bildformat wird nicht unterstuetzt. Erlaubt sind JPEG, PNG und WebP.");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  "Du extrahierst Text aus Bildern fuer ein Lern- und Trainings-Tool. " +
                  "Gib AUSSCHLIESSLICH den lesbaren Inhalt zurueck, eins zu eins, ohne Kommentar, ohne Markdown-Codeblock und ohne Einleitung. " +
                  "Behalte Reihenfolge und sinnvolle Absaetze. Wenn das Bild kein lesbarer Text ist, beschreibe knapp und sachlich, was zu sehen ist."
              }
            ]
          },
          contents: [
            {
              role: "user",
              parts: [
                { text: "Extrahiere den Text aus diesem Bild." },
                { inlineData: { mimeType, data: imageBase64 } }
              ]
            }
          ],
          generationConfig: { temperature: 0 }
        })
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const completion = await response.json();
    const text = (completion.candidates?.[0]?.content?.parts ?? [])
      .map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim();
    if (!text) throw new Error("Aus dem Bild konnte kein Text extrahiert werden.");

    return Response.json(
      { text },
      { headers: { ...corsHeaders, "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unbekannter Fehler" },
      { status: 400, headers: corsHeaders }
    );
  }
});
