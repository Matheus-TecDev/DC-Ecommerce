import { act } from '@testing-library/react';
import type {
  CarrinhoDetalhado,
  ItemCarrinhoDetalhado,
  Produto,
  UsuarioPublico,
} from '../types/modelos';

export const API = 'http://localhost:3001';
export const TOKEN = 'token-de-teste';
export const CHAVE_TOKEN = 'digitalstore.token';
export const CLIENTE = { email: 'cliente@digitalstore.example', senha: 'cliente-demo-123' };

export const USUARIO: UsuarioPublico = {
  id: 'id-cliente',
  user: 'Cliente Demo',
  email: CLIENTE.email,
  role: 'customer',
};

export const PRODUTOS: Produto[] = [
  { id: '1', categoria: 'Casual', titulo: 'Tênis Urban Flow', descricao: 'Tênis casual.', valor: 219, desconto: 0, img: '/imagens/tenis-casual.png' },
  { id: '2', categoria: 'Corrida', titulo: 'Tênis Sprint Pro', descricao: 'Leve e responsivo.', valor: 349.9, desconto: 15, img: '/imagens/tenis-corrida.png' },
];

interface ItemGuardado {
  produto_id: string;
  quantidade: number;
}

export interface Chamada {
  rota: string;
  corpo: unknown;
  autorizacao: string | null;
}

export interface OpcoesApiFalsa {
  carrinho?: ItemGuardado[];
  respostas?: Record<string, { status: number; corpo: unknown }>;
}

export interface ApiFalsa {
  chamadas: (rota: string) => Chamada[];
  invalidarToken: () => void;
  ociosa: () => Promise<void>;
}

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function detalhar(itens: ItemGuardado[]): CarrinhoDetalhado {
  const detalhados: ItemCarrinhoDetalhado[] = [];
  for (const item of itens) {
    const produto = PRODUTOS.find((p) => p.id === item.produto_id);
    if (!produto) continue;
    const valorUnitario = Math.round((Math.round(produto.valor * 100) * (100 - produto.desconto)) / 100) / 100;
    detalhados.push({
      produto_id: produto.id,
      titulo: produto.titulo,
      descricao: produto.descricao,
      categoria: produto.categoria,
      img: produto.img,
      quantidade: item.quantidade,
      valor: produto.valor,
      desconto: produto.desconto,
      valorUnitario,
      subtotal: arredondar(valorUnitario * item.quantidade),
    });
  }
  const valorBruto = arredondar(detalhados.reduce((soma, item) => soma + item.valor * item.quantidade, 0));
  const valorTotal = arredondar(detalhados.reduce((soma, item) => soma + item.subtotal, 0));
  return {
    itens: detalhados,
    quantidadeItens: detalhados.reduce((soma, item) => soma + item.quantidade, 0),
    valorBruto,
    descontoCarrinho: 0,
    descontoTotal: arredondar(valorBruto - valorTotal),
    valorTotal,
  };
}

function resposta(status: number, corpo: unknown): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function campo(corpo: unknown, nome: string): unknown {
  if (typeof corpo !== 'object' || corpo === null) return undefined;
  return Reflect.get(corpo, nome);
}

function texto(corpo: unknown, nome: string): string {
  const valor = campo(corpo, nome);
  return typeof valor === 'string' ? valor : '';
}

function lerChamada(input: RequestInfo | URL, init?: RequestInit): Chamada {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const corpo: unknown = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
  return {
    rota: `${init?.method ?? 'GET'} ${url.replace(API, '')}`,
    corpo,
    autorizacao: new Headers(init?.headers).get('Authorization'),
  };
}

export function criarApiFalsa({ carrinho = [], respostas = {} }: OpcoesApiFalsa = {}): ApiFalsa {
  const itens = carrinho.map((item) => ({ ...item }));
  const senhas = new Map<string, string>([[CLIENTE.email, CLIENTE.senha]]);
  const registradas: Chamada[] = [];
  const pendentes = new Set<Promise<Response>>();
  let tokenValido = true;

  function responder({ rota, corpo, autorizacao }: Chamada): Response {
    const fixa = respostas[rota];
    if (fixa) return resposta(fixa.status, fixa.corpo);

    if (rota === 'GET /produtos') return resposta(200, PRODUTOS);
    if (rota.startsWith('GET /produtos/')) {
      const produto = PRODUTOS.find((p) => rota === `GET /produtos/${p.id}`);
      return produto ? resposta(200, produto) : resposta(404, { erro: 'Produto não encontrado' });
    }
    if (rota === 'POST /userauth/login') {
      const email = texto(corpo, 'email');
      return senhas.has(email) && senhas.get(email) === texto(corpo, 'password')
        ? resposta(200, { auth: true, token: TOKEN, user: { ...USUARIO, email } })
        : resposta(401, { erro: 'E-mail ou senha inválidos' });
    }
    if (rota === 'POST /userauth/signup') {
      const email = texto(corpo, 'email');
      if (senhas.has(email)) return resposta(409, { erro: 'Usuário já existente' });
      senhas.set(email, texto(corpo, 'password'));
      return resposta(201, { id: 'novo-id', user: texto(corpo, 'user'), email, role: 'customer' });
    }

    if (!tokenValido || autorizacao !== `Bearer ${TOKEN}`) {
      return resposta(401, { erro: 'Token inválido ou expirado' });
    }

    if (rota === 'GET /userauth/me') return resposta(200, USUARIO);
    if (rota === 'GET /carrinho') return resposta(200, detalhar(itens));
    if (rota === 'DELETE /carrinho') {
      itens.length = 0;
      return resposta(200, detalhar(itens));
    }
    if (rota === 'POST /carrinho/itens') {
      const produtoId = texto(corpo, 'produto_id');
      const quantidade = campo(corpo, 'quantidade');
      if (!PRODUTOS.some((p) => p.id === produtoId)) return resposta(404, { erro: 'Produto não encontrado' });
      const existente = itens.find((item) => item.produto_id === produtoId);
      const acrescimo = typeof quantidade === 'number' ? quantidade : 1;
      if (existente) {
        existente.quantidade += acrescimo;
      } else {
        itens.push({ produto_id: produtoId, quantidade: acrescimo });
      }
      return resposta(200, detalhar(itens));
    }
    if (rota.startsWith('PATCH /carrinho/itens/') || rota.startsWith('DELETE /carrinho/itens/')) {
      const produtoId = decodeURIComponent(rota.slice(rota.lastIndexOf('/') + 1));
      const indice = itens.findIndex((item) => item.produto_id === produtoId);
      const item = itens[indice];
      if (!item) return resposta(404, { erro: 'Item não encontrado no carrinho' });
      if (rota.startsWith('DELETE')) {
        itens.splice(indice, 1);
        return resposta(200, detalhar(itens));
      }
      const quantidade = campo(corpo, 'quantidade');
      if (typeof quantidade !== 'number' || !Number.isInteger(quantidade) || quantidade < 1 || quantidade > 99) {
        return resposta(422, { erro: 'quantidade deve ser um inteiro entre 1 e 99' });
      }
      item.quantidade = quantidade;
      return resposta(200, detalhar(itens));
    }
    return resposta(404, { erro: 'Rota não encontrada' });
  }

  jest.spyOn(global, 'fetch').mockImplementation((input, init) => {
    const chamada = lerChamada(input, init);
    registradas.push(chamada);
    const promessa = Promise.resolve().then(() => responder(chamada));
    pendentes.add(promessa);
    return promessa;
  });

  return {
    chamadas: (rota) => registradas.filter((chamada) => chamada.rota === rota),
    invalidarToken: () => {
      tokenValido = false;
    },
    ociosa: async () => {
      await act(async () => {
        while (pendentes.size > 0) {
          const emAndamento = [...pendentes];
          pendentes.clear();
          await Promise.allSettled(emAndamento);
          await new Promise((resolver) => setTimeout(resolver, 0));
        }
      });
    },
  };
}
