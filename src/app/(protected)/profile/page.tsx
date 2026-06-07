"use client"

import { useSession, signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleLinkWechat = () => {
    window.location.href = "/api/auth/signin/wechat"
  }

  if (isPending) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>未登录</CardTitle>
          <CardDescription>请先登录以查看个人信息</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/login")}>前往登录</Button>
        </CardContent>
      </Card>
    )
  }

  const user = session.user

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">个人中心</h1>
        <p className="text-gray-500 mt-2">管理您的账号信息</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>您的账号基本信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-20 w-20 rounded-full"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">用户 ID</p>
              <p className="mt-1 font-mono text-sm">{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">邮箱验证状态</p>
              <p className="mt-1">
                {user.emailVerified ? (
                  <span className="text-green-600">已验证</span>
                ) : (
                  <span className="text-orange-600">未验证</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">创建时间</p>
              <p className="mt-1">
                {user.createdAt ? format(new Date(user.createdAt), "yyyy-MM-dd HH:mm") : "未知"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">更新时间</p>
              <p className="mt-1">
                {user.updatedAt ? format(new Date(user.updatedAt), "yyyy-MM-dd HH:mm") : "未知"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>关联账号</CardTitle>
          <CardDescription>管理您的社交账号关联</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.691 2.188C7.788 2.188 7 3.077 7 4.094c0 1.018.788 1.906 1.691 1.906.903 0 1.691-.888 1.691-1.906 0-1.017-.788-1.906-1.691-1.906zm6.618 0C14.406 2.188 13.618 3.077 13.618 4.094c0 1.018.788 1.906 1.691 1.906.903 0 1.691-.888 1.691-1.906 0-1.017-.788-1.906-1.691-1.906zM8.691 17.906c-.903 0-1.691.888-1.691 1.906 0 1.017.788 1.906 1.691 1.906.903 0 1.691-.888 1.691-1.906 0-1.018-.788-1.906-1.691-1.906zm6.618 0c-.903 0-1.691.888-1.691 1.906 0 1.017.788 1.906 1.691 1.906.903 0 1.691-.888 1.691-1.906 0-1.018-.788-1.906-1.691-1.906zM12 12.001c-3.313 0-6 2.688-6 6h12c0-3.313-2.688-6-6-6z"/>
                </svg>
                <div>
                  <p className="font-medium">微信</p>
                  <p className="text-sm text-gray-500">通过微信快速登录</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLinkWechat}>
                关联微信
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>账号操作</CardTitle>
          <CardDescription>管理您的登录会话</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut}>
            登出
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
