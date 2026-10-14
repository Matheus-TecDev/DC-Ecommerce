export interface RotaNavegacao {
  title: string;
  route: string;
}

export const route: readonly RotaNavegacao[] = [
  { title: 'Home', route: '/' },
  { title: 'Produtos', route: '/produtos' },
  { title: 'Categorias', route: '/categorias' },
  { title: 'Meus Pedidos', route: '/meuspedidos' },
];
