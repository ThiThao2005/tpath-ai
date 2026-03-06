async function getUser(username: string) {

  const res = await fetch(
    `http://localhost:3000/api/user/${username}`,
    { cache: "no-store" }
  )

  return res.json()
}

export default async function Page({ params }: any) {

  const user = await getUser(params.username)

  return (

    <div className="max-w-3xl mx-auto p-10">

      <div className="flex items-center gap-4 mb-6">

        <img
          src={user.avatar}
          width={80}
          className="rounded-full"
        />

        <div>
          <h1 className="text-3xl font-bold">
            {user.name}
          </h1>

          <p className="text-gray-500">
            {user.bio}
          </p>
        </div>

      </div>

      <h2 className="text-xl font-bold mb-4">
        Projects
      </h2>

      <div className="space-y-4">

        {user.projects.map((p:any,i:number)=>(
          <div
            key={i}
            className="border p-4 rounded-lg shadow"
          >

            <h3 className="font-bold text-lg">
              {p.name}
            </h3>

            <p className="text-gray-600">
              {p.description}
            </p>

            <a
              href={p.link}
              className="text-blue-600"
            >
              View project
            </a>

          </div>
        ))}

      </div>

    </div>

  )
}