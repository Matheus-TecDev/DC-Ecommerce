import type { RespostaLogin } from '../types/api';
import type {
  CarrinhoDetalhado,
  ItemCarrinhoDetalhado,
  Papel,
  Produto,
  UsuarioPublico,
} from '../types/modelos';

export type Validador<T> = (valor: unknown) => T;

type Registro = Record<string, unknown>;

export class RespostaInvalidaError extends Error {
  constructor(detalhe: string) {
    super(`Resposta da API fora do contrato esperado: ${detalhe}`);
    this.name = 'RespostaInvalidaError';
  }
}

export function ehRegistro(valor: unknown): valor is Registro {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function registro(valor: unknown, nome: string): Registro {
  if (!ehRegistro(valor)) throw new RespostaInvalidaError(`${nome} deveria ser um objeto`);
  return valor;
}

function texto(origem: Registro, campo: string): string {
  const valor = origem[campo];
  if (typeof valor !== 'string') throw new RespostaInvalidaError(`${campo} deveria ser um texto`);
  return valor;
}

function numero(origem: Registro, campo: string): number {
  const valor = origem[campo];
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new RespostaInvalidaError(`${campo} deveria ser um número`);
  }
  return valor;
}

function lista<T>(valor: unknown, nome: string, validarItem: Validador<T>): T[] {
  if (!Array.isArray(valor)) throw new RespostaInvalidaError(`${nome} deveria ser uma lista`);
  return valor.map((item: unknown) => validarItem(item));
}

function papel(origem: Registro): Papel {
  const valor = origem.role;
  if (valor !== 'customer' && valor !== 'admin') {
    throw new RespostaInvalidaError('role deveria ser customer ou admin');
  }
  return valor;
}

export function validarProduto(valor: unknown): Produto {
  const origem = registro(valor, 'produto');
  return {
    id: texto(origem, 'id'),
    categoria: texto(origem, 'categoria'),
    titulo: texto(origem, 'titulo'),
    descricao: texto(origem, 'descricao'),
    valor: numero(origem, 'valor'),
    desconto: numero(origem, 'desconto'),
    img: texto(origem, 'img'),
  };
}

export function validarProdutos(valor: unknown): Produto[] {
  return lista(valor, 'produtos', validarProduto);
}

export function validarUsuario(valor: unknown): UsuarioPublico {
  const origem = registro(valor, 'usuário');
  return {
    id: texto(origem, 'id'),
    user: texto(origem, 'user'),
    email: texto(origem, 'email'),
    role: papel(origem),
  };
}

export function validarLogin(valor: unknown): RespostaLogin {
  const origem = registro(valor, 'login');
  if (origem.auth !== true) throw new RespostaInvalidaError('auth deveria ser true');
  const token = texto(origem, 'token');
  if (token === '') throw new RespostaInvalidaError('token não deveria ser vazio');
  return { auth: true, token, user: validarUsuario(origem.user) };
}

function validarItemCarrinho(valor: unknown): ItemCarrinhoDetalhado {
  const origem = registro(valor, 'item do carrinho');
  return {
    produto_id: texto(origem, 'produto_id'),
    titulo: texto(origem, 'titulo'),
    descricao: texto(origem, 'descricao'),
    categoria: texto(origem, 'categoria'),
    img: texto(origem, 'img'),
    quantidade: numero(origem, 'quantidade'),
    valor: numero(origem, 'valor'),
    desconto: numero(origem, 'desconto'),
    valorUnitario: numero(origem, 'valorUnitario'),
    subtotal: numero(origem, 'subtotal'),
  };
}

export function validarCarrinho(valor: unknown): CarrinhoDetalhado {
  const origem = registro(valor, 'carrinho');
  return {
    itens: lista(origem.itens, 'itens', validarItemCarrinho),
    quantidadeItens: numero(origem, 'quantidadeItens'),
    valorBruto: numero(origem, 'valorBruto'),
    descontoCarrinho: numero(origem, 'descontoCarrinho'),
    descontoTotal: numero(origem, 'descontoTotal'),
    valorTotal: numero(origem, 'valorTotal'),
  };
}
