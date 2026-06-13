import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Resend } from 'resend'
import { env } from "@/lib/env";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter });
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      try {
        // 构建前端重置密码页面URL，而不是API URL
        const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;

        await resend.emails.send({
          from: process.env.RESEND_FROM || 'onboarding@resend.dev',
          to: user.email,
          subject: '重置您的密码',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>重置密码</h2>
              <p>您好，</p>
              <p>我们收到了重置密码的请求。点击下面的链接设置新密码：</p>
              <p style="margin: 20px 0;">
                <a href="${resetUrl}" style="background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  重置密码
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">
                如果您没有请求重置密码，请忽略此邮件。<br>
                此链接将在1小时后失效。
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 40px;">
                如果按钮无法点击，请复制以下链接到浏览器：<br>
                ${resetUrl}
              </p>
            </div>
          `
        });
        console.log(`✓ Password reset email sent to ${user.email}`);
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw error;
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      try {
        // 检查邮件发送频率限制（5分钟冷却期）
        const recentVerification = await prisma.verification.findFirst({
          where: {
            identifier: user.email,
            value: { startsWith: 'email_verification:' },
            createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }
          },
          orderBy: { createdAt: 'desc' }
        });

        if (recentVerification) {
          const remainingTime = Math.ceil((5 * 60 * 1000 - (Date.now() - recentVerification.createdAt.getTime())) / 1000);
          throw new Error(`请等待 ${remainingTime} 秒后再重新发送验证邮件`);
        }

        // 构建前端验证页面URL，而不是API URL
        const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

        await resend.emails.send({
          from: process.env.RESEND_FROM || 'onboarding@resend.dev',
          to: user.email,
          subject: '验证您的邮箱地址',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>欢迎注册！</h2>
              <p>您好，</p>
              <p>感谢您的注册。请点击下面的链接验证您的邮箱地址：</p>
              <p style="margin: 20px 0;">
                <a href="${verificationUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  验证邮箱
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">
                验证后即可开始使用所有功能。
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 40px;">
                如果按钮无法点击，请复制以下链接到浏览器：<br>
                ${verificationUrl}
              </p>
            </div>
          `
        });
        console.log(`✓ Verification email sent to ${user.email}`);
      } catch (error) {
        console.error('Failed to send verification email:', error);
        throw error;
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh if session is older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute
    max: 10, // 10 requests per window (increased from 5)
  },
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',') || [],
  socialProviders: {
    wechat: {
      clientId: process.env.WECHAT_CLIENT_ID!,
      clientSecret: process.env.WECHAT_CLIENT_SECRET!,
      lang: "cn",
      scope: ['snsapi_login']
    },
  },
});

// Admin Authorization Helpers

export function isAdminEmail(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return env.ADMIN_EMAILS.includes(normalizedEmail);
}

export function isAdminSession(session: { user?: { email?: string } } | null): boolean {
  if (!session?.user?.email) {
    return false;
  }
  return isAdminEmail(session.user.email);
}
