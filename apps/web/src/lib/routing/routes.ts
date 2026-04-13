export const ROUTES = {
  home: '/',
  entrar: '/entrar',
  cadastro: '/cadastro',
  questionario: '/questionario',
  aguardandoMedico: '/aguardando-medico',
  minhaConta: '/minha-conta',
  minhaContaPedidos: '/minha-conta/pedidos',
  minhaContaPrescricao: '/minha-conta/prescricao',
  produto: '/produto',
  carrinho: '/carrinho',
  checkout: '/checkout',
  obrigado: '/obrigado',
} as const

export type RouteKey = keyof typeof ROUTES
