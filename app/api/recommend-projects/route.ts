import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let skills = body.skills;

    if (typeof skills === "string") {
      skills = skills.split(",").map((s: string) => s.trim());
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            projects: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING },
                  difficulty: { type: SchemaType.STRING },
                  // THÊM TRƯỜNG REASON Ở ĐÂY
                  reason: { type: SchemaType.STRING }, 
                  stack: { 
                    type: SchemaType.ARRAY, 
                    items: { type: SchemaType.STRING } 
                  },
                },
                required: ["title", "description", "difficulty", "reason", "stack"],
              },
            },
          },
        },
      },
    });

    const prompt = `
      User skills: ${skills.join(", ")}.
      Suggest 5 innovative portfolio programming projects.
      For the 'reason' field, explain in Vietnamese why this project is a perfect match for the user's current skill set and how it helps them improve.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return Response.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return Response.json(
      { error: "AI generation failed." },
      { status: 500 }
    );
  }
}