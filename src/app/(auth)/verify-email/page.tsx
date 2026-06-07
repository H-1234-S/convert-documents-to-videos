/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { verifyEmail } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("缺少验证令牌")
      return
    }

    const verify = async () => {
      try {
        const result = await verifyEmail({
          query: { token }
        })

        if (result.error) {
          setStatus("error")
          setMessage(result.error.message || "验证失败")
        } else {
          setStatus("success")
          setMessage("邮箱验证成功！")
          toast.success("邮箱验证成功！", {
            description: "请登录以继续",
            duration: 5000,
          })
          setTimeout(() => router.push("/login"), 2000)
        }
      } catch (err) {
        setStatus("error")
        setMessage("验证失败，请稍后重试")
      }
    }

    verify()
  }, [token, router])

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">邮箱验证</CardTitle>
        <CardDescription>
          {status === "verifying" && "正在验证您的邮箱..."}
          {status === "success" && "验证成功"}
          {status === "error" && "验证失败"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "verifying" && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
        )}
        {status === "success" && (
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="mt-4 text-gray-700">{message}</p>
            <p className="mt-2 text-sm text-gray-500">即将跳转到登录页面...</p>
          </div>
        )}
        {status === "error" && (
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
            <p className="mt-4 text-gray-700">{message}</p>
          </div>
        )}
      </CardContent>
      {status === "error" && (
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button className="w-full">返回登录</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">邮箱验证</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
      </Card>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
