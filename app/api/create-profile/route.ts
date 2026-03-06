import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {

  const body = await req.json()
  const { userId, username } = body

  const { error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      username: username
    })

  if(error){
    return Response.json({error}, {status:500})
  }

  return Response.json({success:true})
}