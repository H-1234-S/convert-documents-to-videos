"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { resetPassword } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return "密码至少需要8个字符"
    }
    if (!/[a-zA-Z]/.test(pwd)) {
      return "密码必须包含字母"
    }
    if (!/\d/.test(pwd)) {
      return "密码必须包含数字"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("缺少重置令牌，请重新请求重置链接")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("两次输入的密码不一致")
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)

    try {
      const result = await resetPassword({ newPassword, token })

      if (result.error) {
        setError(result.error.message || "重置失败")
      } else {
        router.push("/login?message=密码重置成功，请登录")
      }
    } catch (err) {
      setError("重置失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">重置密码</CardTitle>
          <CardDescription>无效的重置链接</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <p className="mt-4 text-gray-700">缺少重置令牌</p>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/forgot-password" className="w-full">
            <Button className="w-full">重新请求重置链接</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">重置密码</CardTitle>
        <CardDescription>
          设置您的新密码
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form onSubmit={handleSubmit}>
          <FormField>
            <FormLabel htmlFor="newPassword">新密码</FormLabel>
            <Input
              id="newPassword"
              type="password"
              placeholder="至少8个字符，包含字母和数字"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="confirmPassword">确认密码</FormLabel>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="再次输入新密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </FormField>

          {error && <FormMessage>{error}</FormMessage>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "重置中..." : "重置密码"}
          </Button>
        </Form>
      </CardContent>
      <CardFooter>
        <Link href="/login" className="w-full">
          <Button variant="outline" className="w-full">返回登录</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">重置密码</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
      </Card>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
