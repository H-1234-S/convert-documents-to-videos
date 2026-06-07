"use client"

import { ReactNode } from "react"
import { useSession } from "@/lib/auth-client"

export function Protected({
  children,
  fallback = <div>请先登录</div>
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return <div>加载中...</div>
  }

  if (!session) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
