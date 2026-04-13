'use client'

import { CSSProperties, HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: number | string
  children: ReactNode
}

export function Card({ padding = 24, style, children, ...rest }: CardProps) {
  const merged: CSSProperties = {
    background: '#fff',
    borderRadius: 20,
    padding,
    boxShadow: '0 8px 30px -16px rgba(31,37,48,.12)',
    border: '1px solid #f6dde5',
    ...style,
  }
  return (
    <div style={merged} {...rest}>
      {children}
    </div>
  )
}

export function CardTitle({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <h3
      style={{
        margin: 0,
        marginBottom: 12,
        fontFamily: 'var(--font-playfair), serif',
        color: '#1f2530',
        fontSize: 20,
        ...style,
      }}
    >
      {children}
    </h3>
  )
}
