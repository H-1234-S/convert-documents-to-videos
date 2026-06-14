"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** 定价方案定义 */
const PLANS = [
  {
    name: "免费版",
    price: "¥0",
    period: "/月",
    features: [
      "每月 5 次视频生成",
      "最长 3 分钟视频",
      "16:9 横屏",
      "标准 AI 配音",
      "720p 导出",
    ],
    badge: "当前方案",
    buttonLabel: "已有方案",
    buttonVariant: "outline" as const,
  },
  {
    name: "专业版",
    price: "¥29",
    period: "/月",
    features: [
      "每月 50 次视频生成",
      "最长 15 分钟视频",
      "全部比例（16:9 / 9:16 / 1:1）",
      "高品质 AI 配音",
      "1080p 导出",
      "无水印",
      "优先生成队列",
    ],
    buttonLabel: "升级",
    buttonVariant: "default" as const,
  },
  {
    name: "企业版",
    price: "¥99",
    period: "/月",
    features: [
      "无限次视频生成",
      "最长 60 分钟视频",
      "全部比例",
      "顶级 AI 配音 + 自定义声纹",
      "4K 导出",
      "无水印",
      "极速生成队列",
      "API 接口开放",
      "专属客户经理",
    ],
    buttonLabel: "联系销售",
    buttonVariant: "outline" as const,
  },
];

/**
 * 订阅升级 Tab：三张静态定价卡片，无支付逻辑。
 *
 * 免费版始终标记为"当前方案"（hardcoded），所有按钮无实际处理函数。
 */
export function SubscribeTab() {
  return (
    <div className="py-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${
              plan.badge ? "border-primary" : ""
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="px-3">
                  {plan.badge}
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <CardDescription />
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-green-500 shrink-0"
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
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant={plan.buttonVariant}
                className="w-full"
                disabled
              >
                {plan.buttonLabel}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
