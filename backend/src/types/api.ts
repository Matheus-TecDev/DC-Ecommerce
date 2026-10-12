import type { Produto, UsuarioPublico } from "./modelos";

export interface RespostaErro {
  erro: string;
}

export interface RespostaStatus {
  servico: string;
  status: string;
}

export interface RespostaLogin {
  auth: true;
  token: string;
  user: UsuarioPublico;
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

export interface ParametroId {
  id: string;
}

export interface ParametroProdutoId {
  produtoId: string;
}

export type ListaProdutos = Produto[];
