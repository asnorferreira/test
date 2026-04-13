'use client'

import { ButtonHTMLAttributes, CSSProperties, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
}

const BASE: CSSProperties = {
  fontFamily: 'inherit',
  fontWeight: 600,
  borderRadius: 12,
  cursor: 'pointer',
  border: '1px solid transparent',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  transition: 'all .18s ease',
  whiteSpace: 'nowrap',
}

const SIZES: Record<Size, CSSProperties> = {
  sm: { padding: '8px 14px', fontSize: 13 },
  md: { padding: '11px 20px', fontSize: 15 },
  lg: { padding: '14px 26px', fontSize: 16 },
}

const VARIANTS: Record<Variant, CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg,#e26a8c,#d14b72)',
    color: '#fff',
    boxShadow: '0 6px 16px -6px rgba(209,75,114,.55)',
  },
  secondary: {
    background: '#fff',
    color: '#d14b72',
    borderColor: '#f4c6d3',
  },
  ghost: {
    background: 'transparent',
    color: '#1f2530',
  },
  danger: {
    background: '#fdecea',
    color: '#b42318',
    borderColor: '#f6b4ad',
  },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth, loading, disabled, style, children, ...rest },
  ref,
) {
  const mergedStyle: CSSProperties = {
    ...BASE,
    ...SIZES[size],
    ...VARIANTS[variant],
    width: fullWidth ? '100%' : undefined,
    opacity: disabled || loading ? 0.6 : 1,
    pointerEvents: disabled || loading ? 'none' : 'auto',
    ...style,
  }
  return (
    <button ref={ref} style={mergedStyle} disabled={disabled || loading} {...rest}>
      {loading ? 'Carregando…' : children}
    </button>
  )
})
