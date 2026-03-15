import type { Metadata } from 'next'
import './portfolio.css'

export const metadata: Metadata = {
  title: 'heart DINO — Multimedia Artist',
  description: '摄影 · 电影 · 绘画 · 剪辑 · 3D · Unreal Engine · 平面设计',
}

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
