import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrindOn · 自律打卡",
  description: "每天打卡，坚持自律",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
