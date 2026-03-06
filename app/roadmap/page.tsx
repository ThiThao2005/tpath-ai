import Link from "next/link"

export default function HomePage() {

  return(

    <div className="min-h-screen flex flex-col items-center justify-center gap-6">

      <h1 className="text-4xl font-bold">
        ITPath AI
      </h1>

      <p className="text-gray-500">
        AI Career Path Generator
      </p>

      <div className="grid grid-cols-2 gap-4 mt-6">

        <Link
          href="/(auth)/register"
          className="border px-6 py-3 rounded text-center"
        >
          Register
        </Link>

        <Link
          href="/(auth)/login"
          className="border px-6 py-3 rounded text-center"
        >
          Login
        </Link>

        <Link
          href="/quiz"
          className="border px-6 py-3 rounded text-center"
        >
          Skill Quiz
        </Link>

        <Link
          href="/roadmap"
          className="border px-6 py-3 rounded text-center"
        >
          AI Roadmap
        </Link>

        <Link
          href="/projects"
          className="border px-6 py-3 rounded text-center"
        >
          AI Project Ideas
        </Link>

        <Link
          href="/dashboard"
          className="border px-6 py-3 rounded text-center"
        >
          Dashboard
        </Link>

        <Link
          href="/portfolio"
          className="border px-6 py-3 rounded text-center"
        >
          Portfolio
        </Link>

        <Link
          href="/u/thao"
          className="border px-6 py-3 rounded text-center"
        >
          Public Profile
        </Link>

      </div>

    </div>

  )

}