'use client'

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type CartItem = {
  productId: string
  name: string
  slug: string
  unitPriceCents: number
  quantity: number
  imageUrl?: string
}

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  subtotalCents: number
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clear: () => void
}

const CART_KEY = 'maemais_cart_v1'

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem(CART_KEY)
    if (raw) {
      try {
        setItems(JSON.parse(raw))
      } catch {
        /* ignore */
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem = useCallback(
    (input: Omit<CartItem, 'quantity'>, quantity = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.productId === input.productId)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity }
          return next
        }
        return [...prev, { ...input, quantity }]
      })
    },
    [],
  )

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, quantity: Math.max(1, quantity) } : p,
      ),
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((acc, i) => acc + i.quantity, 0)
    const subtotalCents = items.reduce(
      (acc, i) => acc + i.unitPriceCents * i.quantity,
      0,
    )
    return { items, itemCount, subtotalCents, addItem, removeItem, updateQuantity, clear }
  }, [items, addItem, removeItem, updateQuantity, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de <CartProvider>')
  return ctx
}

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
