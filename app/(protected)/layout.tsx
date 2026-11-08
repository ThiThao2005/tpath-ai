import RequireAuth from "@/components/RequireAuth"
import AppNav from "@/components/AppNav"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AppNav />
      {children}
    </RequireAuth>
  )
}
