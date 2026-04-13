'use client'

import Link from 'next/link'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { useCart } from '@/modules/cart/CartContext'
import { ROUTES } from '@/lib/routing/routes'

export function Header() {
  const { session, signOut } = useAuth()
  const { itemCount } = useCart()

  return (
    <header
      style={{
        background: '#fff',
        borderBottom: '1px solid #f6dde5',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Link
        href={ROUTES.home}
        style={{
          fontFamily: 'var(--font-playfair), serif',
          fontSize: 22,
          color: '#d14b72',
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        Mãe Mais
      </Link>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <Link href={ROUTES.produto} style={linkStyle}>
          Produtos
        </Link>
        <Link href={ROUTES.minhaContaPrescricao} style={linkStyle}>
          Minha prescrição
        </Link>
        <Link
          href={ROUTES.carrinho}
          style={{ ...linkStyle, position: 'relative' }}
          aria-label="Carrinho"
        >
          Carrinho
          {itemCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -8,
                right: -14,
                background: '#d14b72',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 999,
                padding: '2px 7px',
                minWidth: 20,
                textAlign: 'center',
              }}
            >
              {itemCount}
            </span>
          )}
        </Link>
        {session ? (
          <button
            onClick={signOut}
            style={{
              ...linkStyle,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Sair
          </button>
        ) : (
          <Link href={ROUTES.entrar} style={linkStyle}>
            Entrar
          </Link>
        )}
      </nav>
    </header>
  )
}

const linkStyle = {
  color: '#1f2530',
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 500,
}
