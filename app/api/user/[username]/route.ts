import { NextResponse } from "next/server";

// Định nghĩa Interface cho params để hết lỗi
interface Params {
  params: {
    username: string;
  };
}

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ username: string }> } // Khai báo params là Promise
) {
  const { username } = await params;

  const user = {
    username: username,
    name: "Thao Nguyen",
    bio: "Fullstack Developer",
    avatar: "/avatar.png",
    projects: [
      {
        name: "Portfolio Builder",
        description: "Create portfolio website automatically",
        link: "https://github.com/thao/portfolio"
      },
      {
        name: "AI Chat App",
        description: "ChatGPT clone",
        link: "https://github.com/thao/aichat"
      }
    ]
  };

  return NextResponse.json(user);
}