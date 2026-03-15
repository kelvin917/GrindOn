'use client'

import { useEffect, useState } from 'react'

export default function PortfolioNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`p-nav${scrolled ? ' scrolled' : ''}`}>
      <div className="p-nav-logo"><span>♥</span> DINO</div>
      <ul className="p-nav-links">
        <li><a href="#works">作品</a></li>
        <li><a href="#skills">技能</a></li>
        <li><a href="#tools">工具</a></li>
        <li><a href="#about">关于</a></li>
        <li><a href="#contact">联系</a></li>
      </ul>
    </nav>
  )
}
