"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Turnstile } from "@marsidev/react-turnstile"
import { toast } from "sonner"

export default function SignupPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return "请输入邮箱地址"
    }
    if (!emailRegex.test(email)) {
      return "请输入有效的邮箱地址"
    }
    return null
  }

  const validatePassword = (pwd: string) => {
    if (!pwd) {
      return "请输入密码"
    }
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

  const checkEmailExists = async (email: string) => {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      return data.exists
    } catch {
      return false
    }
  }

  const handleEmailBlur = async () => {
    const error = validateEmail(email)
    if (error) {
      setEmailError(error)
      return
    }

    setLoading(true)
    const exists = await checkEmailExists(email)
    setLoading(false)

    if (exists) {
      setEmailError("该邮箱已被注册，请直接登录")
    } else {
      setEmailError("")
    }
  }

  const handlePasswordBlur = () => {
    const error = validatePassword(password)
    setPasswordError(error || "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setEmailError("")
    setPasswordError("")

    // 验证人机验证
    if (!captchaToken) {
      setError("请完成人机验证")
      return
    }

    // 前端验证
    const emailValidationError = validateEmail(email)
    if (emailValidationError) {
      setEmailError(emailValidationError)
      return
    }

    const passwordValidationError = validatePassword(password)
    if (passwordValidationError) {
      setPasswordError(passwordValidationError)
      return
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致")
      return
    }

    setLoading(true)

    // 检查邮箱是否已存在
    const emailExists = await checkEmailExists(email)
    if (emailExists) {
      setEmailError("该邮箱已被注册，请直接登录")
      setLoading(false)
      return
    }

    // 验证 Turnstile token
    try {
      const verifyResponse = await fetch('/api/auth/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken })
      })

      const verifyData = await verifyResponse.json()

      if (!verifyData.success) {
        setError("人机验证失败，请重试")
        setCaptchaToken(null)
        setLoading(false)
        return
      }
    } catch {
      setError("人机验证失败，请重试")
      setCaptchaToken(null)
      setLoading(false)
      return
    }

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || "注册失败")
        setLoading(false)
      } else {
        // 注册成功后跳转到登录页并显示 toast 提示
        toast.success("注册成功！", {
          description: "请查收邮件并验证后登录",
          duration: 5000,
        })
        router.push("/login")
      }
    } catch (err) {
      setError("注册失败，请稍后重试")
      setLoading(false)
    }
  }

  const handleWechatSignup = () => {
    window.location.href = "/api/auth/signin/wechat"
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">注册</CardTitle>
        <CardDescription>
          创建新账号以开始使用
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form onSubmit={handleSubmit}>
          <FormField>
            <FormLabel htmlFor="name">姓名</FormLabel>
            <Input
              id="name"
              type="text"
              placeholder="张三"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="email">邮箱</FormLabel>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError("")
              }}
              onBlur={handleEmailBlur}
              required
              disabled={loading}
            />
            {emailError && <FormMessage>{emailError}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="password">密码</FormLabel>
            <Input
              id="password"
              type="password"
              placeholder="至少8个字符，包含字母和数字"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError("")
              }}
              onBlur={handlePasswordBlur}
              required
              disabled={loading}
            />
            {passwordError && <FormMessage>{passwordError}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="confirmPassword">确认密码</FormLabel>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </FormField>

          {error && <FormMessage>{error}</FormMessage>}

          <div className="my-4">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
              onSuccess={(token) => setCaptchaToken(token)}
              onError={() => {
                setCaptchaToken(null)
                setError("人机验证加载失败，请刷新页面重试")
              }}
              onExpire={() => setCaptchaToken(null)}
            />
          </div>

          <div className="text-xs text-gray-500 mt-2">
            注册即表示您同意我们的服务条款和隐私政策
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !!emailError || !!passwordError || !captchaToken}
          >
            {loading ? "注册中..." : "注册"}
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
          onClick={handleWechatSignup}
          disabled={loading}
        >
          使用微信注册
        </Button>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-600 text-center w-full">
          已有账号？{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            立即登录
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
