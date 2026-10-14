import type { UsuarioPublico } from './modelos';

export interface RespostaErro {
  erro: string;
}

export interface RespostaLogin {
  auth: true;
  token: string;
  user: UsuarioPublico;
}

export type MetodoHttp = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface CorpoCadastro {
  user: string;
  email: string;
  password: string;
}

export interface CorpoLogin {
  email: string;
  password: string;
}

export interface CorpoAdicionarItem {
  produto_id: string;
  quantidade: number;
}

export interface CorpoAlterarQuantidade {
  quantidade: number;
}
