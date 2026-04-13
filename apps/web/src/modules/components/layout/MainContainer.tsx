'use client'

import { CSSProperties, ReactNode } from 'react'

export function MainContainer({
  children,
  maxWidth = 1100,
  style,
}: {
  children: ReactNode
  maxWidth?: number
  style?: CSSProperties
}) {
  return (
    <main
      style={{
        maxWidth,
        margin: '0 auto',
        padding: '32px 20px 80px',
        ...style,
      }}
    >
      {children}
    </main>
  )
}
