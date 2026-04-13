'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, style, ...rest },
  ref,
) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {label && (
        <span style={{ fontSize: 13, fontWeight: 600, color: '#4a4554' }}>{label}</span>
      )}
      <input
        ref={ref}
        style={{
          padding: '12px 14px',
          borderRadius: 12,
          border: `1px solid ${error ? '#f6b4ad' : '#f4c6d3'}`,
          background: '#fff',
          fontSize: 15,
          fontFamily: 'inherit',
          color: '#1f2530',
          outline: 'none',
          transition: 'border-color .15s',
          ...style,
        }}
        {...rest}
      />
      {hint && !error && <span style={{ fontSize: 12, color: '#8a8593' }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: '#b42318' }}>{error}</span>}
    </label>
  )
})
