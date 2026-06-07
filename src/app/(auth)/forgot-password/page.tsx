"use client"

import { useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await authClient.$fetch("/request-password-reset", {
        method: "POST",
        body: {
          email,
          redirectTo: "/reset-password"
        }
      })

      if (result.error) {
        setError(result.error.message || "发送失败")
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError("发送失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">邮件已发送</CardTitle>
          <CardDescription>
            请查看您的邮箱
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-4 text-gray-700">
              我们已向 <strong>{email}</strong> 发送了重置密码的链接
            </p>
            <p className="mt-2 text-sm text-gray-500">
              请在1小时内完成重置，过期后需要重新请求
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">返回登录</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">忘记密码</CardTitle>
        <CardDescription>
          输入您的邮箱地址，我们将发送重置密码的链接
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form onSubmit={handleSubmit}>
          <FormField>
            <FormLabel htmlFor="email">邮箱</FormLabel>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </FormField>

          {error && <FormMessage>{error}</FormMessage>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "发送中..." : "发送重置链接"}
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
