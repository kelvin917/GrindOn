import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrindOn · 每日打卡",
  description: "坚持每一天",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
