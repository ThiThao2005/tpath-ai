import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // Chỉ user đã đăng nhập mới được gọi Gemini (tránh bị dùng trộm quota)
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const { data: userData } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } };
    if (!userData.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    let skills: unknown = body.skills;

    if (typeof skills === "string") {
      skills = skills.split(",").map((s) => s.trim());
    }
    if (!Array.isArray(skills) || skills.length === 0) {
      return Response.json({ error: "Missing skills" }, { status: 400 });
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