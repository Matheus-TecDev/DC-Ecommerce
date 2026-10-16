import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { MockInstance } from 'vitest';
import { API_URL, ErroApi, api, mensagemDeErro, sessao, sessaoExpirada, urlImagem } from './api';

const CHAVE_TOKEN = 'digitalstore.token';

function responder(status: number, corpo: unknown): MockInstance<typeof fetch> {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () =>
      new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } })
    );
}

async function capturar(promessa: Promise<unknown>): Promise<unknown> {
  try {
    await promessa;
  } catch (erro) {
    return erro;
  }
  throw new Error('A chamada deveria ter falhado');
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('sessão', () => {
  test('guarda, lê e remove o token no localStorage', () => {
    expect(sessao.token()).toBeNull();
    sessao.salvar('abc');
    expect(window.localStorage.getItem(CHAVE_TOKEN)).toBe('abc');
    expect(sessao.token()).toBe('abc');
    sessao.limpar();
    expect(sessao.token()).toBeNull();
  });

  test('não quebra quando o armazenamento está indisponível', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(sessao.token()).toBeNull();
    expect(() => sessao.salvar('abc')).not.toThrow();
    vi.restoreAllMocks();
  });
});

describe('requisições', () => {
  test('só envia o cabeçalho Authorization quando há token', async () => {
    const fetchFalso = responder(200, []);
    await api.listarProdutos();
    expect(fetchFalso).toHaveBeenLastCalledWith(`${API_URL}/produtos`, { method: 'GET', headers: {}, body: undefined });

    sessao.salvar('abc');
    await api.listarProdutos();
    expect(fetchFalso).toHaveBeenLastCalledWith(
      `${API_URL}/produtos`,
      expect.objectContaining({ headers: { Authorization: 'Bearer abc' } })
    );
  });

  test('traduz os campos do formulário para o contrato da API', async () => {
    const fetchFalso = responder(201, { id: '1', user: 'Nova', email: 'nova@teste.example', role: 'customer' });
    await api.cadastrar({ nome: 'Nova', email: 'nova@teste.example', senha: 'senha-segura-1' });
    expect(fetchFalso).toHaveBeenCalledWith(`${API_URL}/userauth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: 'Nova', email: 'nova@teste.example', password: 'senha-segura-1' }),
    });
  });

  test('codifica o identificador do produto na URL', async () => {
    const fetchFalso = responder(404, { erro: 'Produto não encontrado' });
    await capturar(api.buscarProduto('a/b c'));
    expect(fetchFalso).toHaveBeenCalledWith(`${API_URL}/produtos/a%2Fb%20c`, expect.anything());
  });

  test('erro HTTP vira ErroApi com a mensagem e o status da API', async () => {
    responder(401, { erro: 'Token inválido ou expirado' });
    const erro = await capturar(api.carrinho());
    expect(erro).toBeInstanceOf(ErroApi);
    expect(mensagemDeErro(erro)).toBe('Token inválido ou expirado');
    expect(sessaoExpirada(erro)).toBe(true);
  });

  test('erro HTTP sem corpo JSON usa a mensagem genérica', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>', { status: 500 }));
    const erro = await capturar(api.listarProdutos());
    expect(mensagemDeErro(erro)).toBe('Ocorreu um erro inesperado. Tente novamente.');
    expect(sessaoExpirada(erro)).toBe(false);
  });

  test('falha de rede vira ErroApi sem status', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    const erro = await capturar(api.listarProdutos());
    expect(erro).toBeInstanceOf(ErroApi);
    expect(erro).toHaveProperty('status', null);
    expect(mensagemDeErro(erro)).toMatch('Não foi possível conectar ao servidor');
  });

  test('resposta 200 fora do contrato é recusada em vez de chegar à tela', async () => {
    responder(200, [{ id: '1', titulo: 'Sem preço' }]);
    const erro = await capturar(api.listarProdutos());
    expect(erro).toBeInstanceOf(ErroApi);
    expect(mensagemDeErro(erro)).toBe('O servidor retornou uma resposta inesperada. Tente novamente.');
  });
});

describe('utilitários', () => {
  test('mensagemDeErro lida com valores que não são Error', () => {
    expect(mensagemDeErro('falhou')).toBe('Ocorreu um erro inesperado. Tente novamente.');
    expect(mensagemDeErro(new Error('detalhe'))).toBe('detalhe');
    expect(sessaoExpirada(new Error('401'))).toBe(false);
  });

  test('urlImagem resolve caminhos da API e preserva URLs absolutas', () => {
    expect(urlImagem('/imagens/tenis.png')).toBe(`${API_URL}/imagens/tenis.png`);
    expect(urlImagem('https://cdn.example/tenis.png')).toBe('https://cdn.example/tenis.png');
    expect(urlImagem('')).toBe('');
  });
});
