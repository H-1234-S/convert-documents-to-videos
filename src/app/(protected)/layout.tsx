import { ReactNode } from "react"
import { AuthStatus } from "@/components/auth/auth-status"
import Link from "next/link"

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold">
                首页
              </Link>
            </div>
            <div className="flex items-center">
              <AuthStatus />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
