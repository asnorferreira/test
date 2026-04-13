import { apiRequest } from '@/lib/api-client'

export type ShippingAddressInput = {
  zipCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  recipient: string
  phone: string
}

export type CreateOrderInput = {
  prescriptionId: string
  items: { productId: string; quantity: number }[]
  shippingAddress: ShippingAddressInput
  shippingFeeCents: number
  partnerPharmacyId?: string
}

export type OrderResponse = {
  id: string
  status: string
  subtotalAmount: number
  shippingFee: number
  totalAmount: number
  trackingCode?: string | null
  createdAt: string
  items: {
    productId: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  shippingAddress?: ShippingAddressInput | null
}

export type PayOrderInput = {
  paymentMethod: 'CREDIT_CARD' | 'PIX'
  cardToken?: string
  installments?: number
  customerDocument?: string
}

export type PayOrderResponse = OrderResponse & {
  transactionId?: string
  pix?: { qrCode: string; qrCodeUrl?: string; expiresAt?: string }
}

export async function createOrder(input: CreateOrderInput): Promise<OrderResponse> {
  return apiRequest<OrderResponse>('/orders', { method: 'POST', body: input })
}

export async function payOrder(
  orderId: string,
  input: PayOrderInput,
): Promise<PayOrderResponse> {
  return apiRequest<PayOrderResponse>(`/orders/${orderId}/pay`, {
    method: 'POST',
    body: input,
  })
}

export async function listMyOrders(): Promise<OrderResponse[]> {
  return apiRequest<OrderResponse[]>('/orders/my-orders')
}
