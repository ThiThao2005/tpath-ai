import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: Request) {

  try {

    const body = await req.json()
    let skills = body.skills

    if (typeof skills === "string") {
      skills = skills.split(",").map((s:string)=>s.trim())
    }

const prompt = `
User skills: ${skills.join(", ")}

Suggest 5 portfolio programming projects.

Return ONLY JSON.

Format:

[
 {
  "title": "",
  "description": "",
  "difficulty": "Beginner | Intermediate | Advanced",
  "stack": ["tech","tech"]
 }
]

No explanations.
`

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    })

    const result = await model.generateContent(prompt)

    const text = result.response.text()

    const cleaned = text.replace(/```json|```/g,"")

    const projects = JSON.parse(cleaned)

    return Response.json({ projects })

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "AI generation failed" },
      { status: 500 }
    )
  }

}