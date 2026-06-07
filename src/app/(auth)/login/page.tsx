"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormLabel } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn.email({
        email,
        password,
        rememberMe,
      })

      if (result.error) {
        const errorMessage = result.error.message || "登录失败"

        if (errorMessage.includes("429") || errorMessage.includes("Too Many Requests")) {
          toast.error("请求过于频繁", {
            description: "请稍后再试",
          })
        } else if (errorMessage.includes("Invalid") || errorMessage.includes("credentials")) {
          toast.error("邮箱或密码错误", {
            description: "请检查您的登录信息",
          })
        } else if (errorMessage.includes("verified")) {
          toast.error("邮箱未验证", {
            description: "请先验证邮箱后再登录",
          })
        } else {
          toast.error("登录失败", {
            description: errorMessage,
          })
        }
        setLoading(false)
      } else if (result.data) {
        toast.success("登录成功！")
        router.push(callbackUrl)
      } else {
        toast.error("登录失败", {
          description: "请检查邮箱和密码",
        })
        setLoading(false)
      }
    } catch (err: any) {
      if (err?.status === 429 || err?.message?.includes("429")) {
        toast.error("请求过于频繁", {
          description: "请等待1分钟后再试",
        })
      } else if (err?.status === 401) {
        toast.error("邮箱或密码错误", {
          description: "请检查您的登录信息",
        })
      } else {
        toast.error("登录失败", {
          description: "请稍后重试",
        })
      }
      setLoading(false)
    }
  }

  const handleWechatLogin = () => {
    window.location.href = "/api/auth/signin/wechat"
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">登录</CardTitle>
        <CardDescription>
          使用邮箱密码或微信登录
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

          <FormField>
            <FormLabel htmlFor="password">密码</FormLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </FormField>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              记住我
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              忘记密码？
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </Button>
        </Form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">或</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleWechatLogin}
          disabled={loading}
        >
          微信登录
        </Button>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-600 text-center w-full">
          还没有账号？{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            立即注册
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">登录</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
      </Card>
    }>
      <LoginForm />
    </Suspense>
  )
}
