async function getUser(username: string) {
  const res = await fetch(
    `http://localhost:3000/api/user/${username}`,
    { cache: "no-store" }
  );
  
  // Kiểm tra nếu API lỗi để tránh crash trang
  if (!res.ok) return null;
  
  return res.json();
}

// 1. Cập nhật kiểu dữ liệu cho params (Promise)
export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  
  // 2. Chờ (await) params để lấy username
  const resolvedParams = await params;
  const username = resolvedParams.username;

  // 3. Gọi hàm lấy dữ liệu
  const user = await getUser(username);

  // Xử lý trường hợp không tìm thấy user
  if (!user) {
    return <div className="p-10 text-center">User not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-10">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={user.avatar || "https://i.pravatar.cc/150"} // Dự phòng nếu thiếu avatar.png
          width={80}
          height={80}
          className="rounded-full bg-gray-200"
          alt={user.name}
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
        {user.projects.map((p: any, i: number) => (
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
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View project
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}