"use client"

import { cn } from "@/lib/utils"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  animation?: "fadeIn" | "fadeInUp" | "fadeInLeft" | "fadeInRight" | "scaleIn"
  delay?: number
}

export function AnimatedSection({
  children,
  className,
  animation = "fadeInUp",
  delay = 0,
}: AnimatedSectionProps) {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.1 })

  const baseStyles = {
    fadeIn: "opacity-0",
    fadeInUp: "opacity-0 translate-y-10",
    fadeInLeft: "opacity-0 -translate-x-10",
    fadeInRight: "opacity-0 translate-x-10",
    scaleIn: "opacity-0 scale-95",
  }

  const activeStyles = {
    fadeIn: "opacity-100",
    fadeInUp: "opacity-100 translate-y-0",
    fadeInLeft: "opacity-100 translate-x-0",
    fadeInRight: "opacity-100 translate-x-0",
    scaleIn: "opacity-100 scale-100",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isInView ? activeStyles[animation] : baseStyles[animation],
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
