import type {
  CorpoAdicionarItem,
  CorpoAlterarQuantidade,
  CorpoCadastro,
  CorpoLogin,
  MetodoHttp,
  RespostaLogin,
} from '../types/api';
import type {
  CarrinhoDetalhado,
  Credenciais,
  DadosCadastro,
  Produto,
  UsuarioPublico,
} from '../types/modelos';
import {
  RespostaInvalidaError,
  ehRegistro,
  validarCarrinho,
  validarLogin,
  validarProduto,
  validarProdutos,
  validarUsuario,
} from './validacao';
import type { Validador } from './validacao';

const API_PADRAO = import.meta.env.DEV ? '/api' : 'http://localhost:3001';

export const API_URL = (import.meta.env.VITE_API_URL || API_PADRAO).replace(/\/+$/, '');

const CHAVE_TOKEN = 'digitalstore.token';

const MENSAGEM_SEM_CONEXAO = 'Não foi possível conectar ao servidor. Verifique se a API está em execução.';
const MENSAGEM_INESPERADA = 'Ocorreu um erro inesperado. Tente novamente.';
const MENSAGEM_RESPOSTA_INVALIDA = 'O servidor retornou uma resposta inesperada. Tente novamente.';

export class ErroApi extends Error {
  readonly status: number | null;

  constructor(mensagem: string, status: number | null = null) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
  }
}

export function mensagemDeErro(erro: unknown): string {
  return erro instanceof Error && erro.message ? erro.message : MENSAGEM_INESPERADA;
}

export function sessaoExpirada(erro: unknown): boolean {
  return erro instanceof ErroApi && erro.status === 401;
}

export const sessao = {
  token(): string | null {
    try {
      return window.localStorage.getItem(CHAVE_TOKEN);
    } catch {
      return null;
    }
  },
  salvar(token: string): void {
    try {
      window.localStorage.setItem(CHAVE_TOKEN, token);
    } catch {
      return;
    }
  },
  limpar(): void {
    try {
      window.localStorage.removeItem(CHAVE_TOKEN);
    } catch {
      return;
    }
  },
};

interface OpcoesRequisicao<C> {
  method?: MetodoHttp;
  body?: C;
}

function mensagemDaApi(dados: unknown): string {
  return ehRegistro(dados) && typeof dados.erro === 'string' && dados.erro ? dados.erro : MENSAGEM_INESPERADA;
}

async function requisicao<T, C = never>(
  caminho: string,
  validar: Validador<T>,
  { method = 'GET', body }: OpcoesRequisicao<C> = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = sessao.token();
  if (token) headers.Authorization = `Bearer ${token}`;

  let resposta: Response;
  try {
    resposta = await fetch(API_URL + caminho, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ErroApi(MENSAGEM_SEM_CONEXAO);
  }

  const dados: unknown = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    throw new ErroApi(mensagemDaApi(dados), resposta.status);
  }
  try {
    return validar(dados);
  } catch (erro) {
    if (erro instanceof RespostaInvalidaError) {
      throw new ErroApi(MENSAGEM_RESPOSTA_INVALIDA, resposta.status);
    }
    throw erro;
  }
}

function caminhoItem(produtoId: string): string {
  return `/carrinho/itens/${encodeURIComponent(produtoId)}`;
}

export const api = {
  listarProdutos: (): Promise<Produto[]> => requisicao('/produtos', validarProdutos),
  buscarProduto: (id: string): Promise<Produto> =>
    requisicao(`/produtos/${encodeURIComponent(id)}`, validarProduto),

  cadastrar: ({ nome, email, senha }: DadosCadastro): Promise<UsuarioPublico> =>
    requisicao<UsuarioPublico, CorpoCadastro>('/userauth/signup', validarUsuario, {
      method: 'POST',
      body: { user: nome, email, password: senha },
    }),
  login: ({ email, senha }: Credenciais): Promise<RespostaLogin> =>
    requisicao<RespostaLogin, CorpoLogin>('/userauth/login', validarLogin, {
      method: 'POST',
      body: { email, password: senha },
    }),
  usuarioAtual: (): Promise<UsuarioPublico> => requisicao('/userauth/me', validarUsuario),

  carrinho: (): Promise<CarrinhoDetalhado> => requisicao('/carrinho', validarCarrinho),
  adicionarAoCarrinho: (produtoId: string, quantidade = 1): Promise<CarrinhoDetalhado> =>
    requisicao<CarrinhoDetalhado, CorpoAdicionarItem>('/carrinho/itens', validarCarrinho, {
      method: 'POST',
      body: { produto_id: produtoId, quantidade },
    }),
  alterarQuantidade: (produtoId: string, quantidade: number): Promise<CarrinhoDetalhado> =>
    requisicao<CarrinhoDetalhado, CorpoAlterarQuantidade>(caminhoItem(produtoId), validarCarrinho, {
      method: 'PATCH',
      body: { quantidade },
    }),
  removerDoCarrinho: (produtoId: string): Promise<CarrinhoDetalhado> =>
    requisicao(caminhoItem(produtoId), validarCarrinho, { method: 'DELETE' }),
  esvaziarCarrinho: (): Promise<CarrinhoDetalhado> =>
    requisicao('/carrinho', validarCarrinho, { method: 'DELETE' }),
};

export function urlImagem(img: string): string {
  if (!img) return '';
  return img.startsWith('/') ? API_URL + img : img;
}
