export type Papel = 'customer' | 'admin';

export interface UsuarioPublico {
  id: string;
  user: string;
  email: string;
  role: Papel;
}

export interface UsuarioSessao {
  id: string;
  nome: string;
  email: string;
}

export interface Credenciais {
  email: string;
  senha: string;
}

export interface DadosCadastro extends Credenciais {
  nome: string;
}

export interface Produto {
  id: string;
  categoria: string;
  titulo: string;
  descricao: string;
  valor: number;
  desconto: number;
  img: string;
}

export interface ItemCarrinhoDetalhado {
  produto_id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  img: string;
  quantidade: number;
  valor: number;
  desconto: number;
  valorUnitario: number;
  subtotal: number;
}

export interface CarrinhoDetalhado {
  itens: ItemCarrinhoDetalhado[];
  quantidadeItens: number;
  valorBruto: number;
  descontoCarrinho: number;
  descontoTotal: number;
  valorTotal: number;
}
