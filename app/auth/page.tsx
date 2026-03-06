export default function AuthPage() {
  return (
    <div className="p-10 space-y-4">
      <h1 className="text-2xl font-bold">Authentication</h1>

      <a href="/auth/login" className="block text-blue-500">
        Login
      </a>

      <a href="/auth/register" className="block text-blue-500">
        Register
      </a>
    </div>
  )
}