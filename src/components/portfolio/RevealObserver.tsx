'use client'

import { useEffect } from 'react'

export default function RevealObserver() {
  useEffect(() => {
    const reveals = document.querySelectorAll('.p-reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    reveals.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
