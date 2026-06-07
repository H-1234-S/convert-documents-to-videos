"use client"

import { useSession, signOut } from "@/lib/auth-client"
import Link from "next/link"

export function AuthStatus() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return <div className="text-sm text-gray-500">加载中...</div>
  }

  if (!session) {
    return (
      <div className="flex gap-4">
        <Link href="/login" className="text-sm hover:underline">
          登录
        </Link>
        <Link href="/signup" className="text-sm hover:underline">
          注册
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm">你好, {session.user.name}</span>
      <Link href="/profile" className="text-sm hover:underline">
        个人中心
      </Link>
      <button
        onClick={() => signOut()}
        className="text-sm hover:underline"
      >
        登出
      </button>
    </div>
  )
}
