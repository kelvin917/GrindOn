'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const ring = ringRef.current
    if (!cursor || !ring) return

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0
    let rafId: number

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      cursor.style.left = (mouseX - 6) + 'px'
      cursor.style.top = (mouseY - 6) + 'px'
    }

    const animateRing = () => {
      ringX += (mouseX - ringX - 18) * 0.12
      ringY += (mouseY - ringY - 18) * 0.12
      ring.style.left = ringX + 'px'
      ring.style.top = ringY + 'px'
      rafId = requestAnimationFrame(animateRing)
    }

    document.addEventListener('mousemove', handleMove)
    rafId = requestAnimationFrame(animateRing)

    const handleEnter = () => {
      cursor.style.transform = 'scale(2.5)'
      ring.style.transform = 'scale(1.5)'
    }
    const handleLeave = () => {
      cursor.style.transform = 'scale(1)'
      ring.style.transform = 'scale(1)'
    }

    const interactives = document.querySelectorAll('a, button, .p-skill-card, .p-work-card, .p-contact-btn')
    interactives.forEach(el => {
      el.addEventListener('mouseenter', handleEnter)
      el.addEventListener('mouseleave', handleLeave)
    })

    return () => {
      document.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div ref={cursorRef} className="p-cursor" />
      <div ref={ringRef} className="p-cursor-ring" />
    </>
  )
}
