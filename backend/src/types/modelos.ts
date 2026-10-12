export type Papel = "customer" | "admin";

export interface Usuario {
  id: string;
  user: string;
  email: string;
  password: string;
  role: Papel;
}

export type UsuarioPublico = Omit<Usuario, "password">;

export interface Credenciais {
  email: string;
  password: string;
}

export interface PayloadJwt {
  sub: string;
}

export interface Produto {
  categoria: string;
  titulo: string;
  descricao: string;
  valor: number;
  desconto: number;
  img: string;
  id: string;
}

export type DadosProduto = Omit<Produto, "id">;

export interface ItemCarrinho {
  produto_id: string;
  quantidade: number;
}

export interface Carrinho {
  id: string;
  produtos: ItemCarrinho[];
  desconto: number;
}

export interface Colecoes {
  users: Usuario[];
  produtos: Produto[];
  carrinho: Carrinho[];
}

export type NomeColecao = keyof Colecoes;
