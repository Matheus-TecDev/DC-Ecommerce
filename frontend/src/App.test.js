import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';


const API = 'http://localhost:3001';
const TOKEN = 'token-de-teste';
const CHAVE_TOKEN = 'digitalstore.token';
const CLIENTE = { email: 'cliente@digitalstore.example', senha: 'cliente-demo-123' };

const PRODUTOS = [
  { id: '1', categoria: 'Casual', titulo: 'Tênis Urban Flow', descricao: 'Tênis casual.', valor: 219, desconto: 0, img: '/imagens/tenis-casual.png' },
  { id: '2', categoria: 'Corrida', titulo: 'Tênis Sprint Pro', descricao: 'Leve e responsivo.', valor: 349.9, desconto: 15, img: '/imagens/tenis-corrida.png' },
];

function resposta(status, corpo) {
  return { ok: status < 400, status, json: async () => corpo };
}

function carrinhoDetalhado(itens) {
  const valorTotal = itens.reduce((soma, item) => soma + item.subtotal, 0);
  const valorBruto = itens.reduce((soma, item) => soma + item.valor * item.quantidade, 0);
  return {
    itens,
    quantidadeItens: itens.reduce((soma, item) => soma + item.quantidade, 0),
    valorBruto,
    descontoCarrinho: 0,
    descontoTotal: valorBruto - valorTotal,
    valorTotal,
  };
}

function criarApiFalsa() {
  const itens = [];
  return jest.fn(async (url, { method = 'GET', headers = {}, body } = {}) => {
    const rota = `${method} ${url.replace(API, '')}`;
    const dados = body ? JSON.parse(body) : {};
    const autenticado = headers.Authorization === `Bearer ${TOKEN}`;

    if (rota === 'GET /produtos') return resposta(200, PRODUTOS);
    if (rota.startsWith('GET /produtos/')) {
      const produto = PRODUTOS.find((p) => rota.endsWith(`/${p.id}`));
      return produto ? resposta(200, produto) : resposta(404, { erro: 'Produto não encontrado' });
    }
    if (rota === 'POST /userauth/login') {
      return (dados.email === CLIENTE.email || dados.email === 'nova@teste.example') && dados.password.length >= 8 && dados.password !== 'senha-errada'
        ? resposta(200, { auth: true, token: TOKEN, user: { id: 'id-cliente', user: 'Cliente Demo', email: dados.email, role: 'customer' } })
        : resposta(401, { erro: 'E-mail ou senha inválidos' });
    }
    if (rota === 'POST /userauth/signup') {
      return resposta(201, { id: 'novo-id', user: dados.user, email: dados.email, role: 'customer' });
    }
    if (!autenticado) return resposta(401, { erro: 'Token inválido ou expirado' });

    if (rota === 'GET /userauth/me') return resposta(200, { id: 'id-cliente', user: 'Cliente Demo', email: CLIENTE.email, role: 'customer' });
    if (rota === 'GET /carrinho') return resposta(200, carrinhoDetalhado(itens));
    if (rota === 'POST /carrinho/itens') {
      const produto = PRODUTOS.find((p) => p.id === dados.produto_id);
      const valorUnitario = produto.id === '2' ? 297.42 : produto.valor;
      itens.push({ ...produto, produto_id: produto.id, quantidade: 1, valorUnitario, subtotal: valorUnitario });
      return resposta(200, carrinhoDetalhado(itens));
    }
    return resposta(404, { erro: 'Rota não encontrada' });
  });
}

function chamadas(rota) {
  return global.fetch.mock.calls.filter(([url, opcoes = {}]) => `${opcoes.method || 'GET'} ${url}` === `${rota.split(' ')[0]} ${API}${rota.split(' ')[1]}`);
}

function abrir(rota) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  global.fetch = criarApiFalsa();
});

describe('produtos', () => {
  test('lista os produtos vindos da API, com o preço já com desconto', async () => {
    abrir('/produtos');

    expect(screen.getByText('Carregando produtos...')).toBeInTheDocument();
    expect(await screen.findByText('Tênis Urban Flow')).toBeInTheDocument();
    expect(screen.getByText('Tênis Sprint Pro')).toBeInTheDocument();
    expect(screen.getByText('R$ 297,42')).toBeInTheDocument();
    expect(screen.queryByText('Carregando produtos...')).not.toBeInTheDocument();
    expect(chamadas('GET /produtos')).toHaveLength(1);
  });

  test('a busca do header filtra a listagem', async () => {
    abrir('/produtos');
    await screen.findByText('Tênis Urban Flow');

    userEvent.type(screen.getByPlaceholderText('Pesquisar produto...'), 'sprint');

    expect(screen.queryByText('Tênis Urban Flow')).not.toBeInTheDocument();
    expect(screen.getByText('Tênis Sprint Pro')).toBeInTheDocument();
  });

  test('mostra uma mensagem de erro quando a API está fora do ar', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    abrir('/produtos');

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível conectar ao servidor');
  });

  test('abre a página de um produto com os dados da API', async () => {
    abrir('/produtos/2');

    expect(await screen.findByText('Leve e responsivo.')).toBeInTheDocument();
    expect(chamadas('GET /produtos/2')).toHaveLength(1);
  });
});

describe('autenticação', () => {
  function preencherLogin(email, senha) {
    userEvent.type(screen.getByPlaceholderText('Insira seu login ou email'), email);
    userEvent.type(screen.getByPlaceholderText('Insira sua senha'), senha);
    userEvent.click(screen.getByRole('button', { name: 'Acessar conta' }));
  }

  test('login com credenciais inválidas mostra o erro da API e não cria sessão', async () => {
    abrir('/login');
    preencherLogin(CLIENTE.email, 'senha-errada');

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos');
    expect(window.localStorage.getItem(CHAVE_TOKEN)).toBeNull();
    expect(screen.getByText('Acesse sua conta')).toBeInTheDocument();
  });

  test('login válido envia as credenciais à API, guarda o token e mostra o usuário', async () => {
    abrir('/login');
    preencherLogin(CLIENTE.email, CLIENTE.senha);

    expect((await screen.findAllByText('Olá , Cliente Demo')).length).toBeGreaterThan(0);
    expect(window.localStorage.getItem(CHAVE_TOKEN)).toBe(TOKEN);
    const [, opcoes] = chamadas('POST /userauth/login')[0];
    expect(JSON.parse(opcoes.body)).toEqual({ email: CLIENTE.email, password: CLIENTE.senha });
  });

  test('retoma a sessão ao recarregar e permite sair', async () => {
    window.localStorage.setItem(CHAVE_TOKEN, TOKEN);
    abrir('/');

    expect((await screen.findAllByText('Olá , Cliente Demo')).length).toBeGreaterThan(0);

    userEvent.click(screen.getAllByText('Sair')[0]);
    expect(screen.queryByText('Olá , Cliente Demo')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(CHAVE_TOKEN)).toBeNull();
  });

  test('descarta um token que a API não aceita mais', async () => {
    window.localStorage.setItem(CHAVE_TOKEN, 'token-expirado');
    abrir('/');

    await waitFor(() => expect(window.localStorage.getItem(CHAVE_TOKEN)).toBeNull());
    expect(screen.queryByText(/Olá ,/)).not.toBeInTheDocument();
  });

  test('cadastro cria a conta na API (somente nome, e-mail e senha) e já autentica', async () => {
    abrir('/cadastro/nova@teste.example');

    const campos = {
      'Insira seu nome': 'Nova Cliente',
      'Insira seu cpf': '000.000.000-00',
      'Insira seu celular': '(00) 00000-0000',
      'Crie uma senha (mínimo de 8 caracteres)': 'senha-segura-1',
      'Insira seu endereço': 'Rua de Teste, 1',
      'Insira seu bairro': 'Centro',
      'Insira seu cidade': 'Cidade Fictícia',
      'Insira seu cep': '00000-000',
      'Insira seu complemento': 'Casa',
    };
    for (const [placeholder, valor] of Object.entries(campos)) {
      userEvent.type(screen.getByPlaceholderText(placeholder), valor);
    }
    userEvent.click(screen.getByRole('checkbox'));
    userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));

    await waitFor(() => expect(window.localStorage.getItem(CHAVE_TOKEN)).toBe(TOKEN));
    const [, opcoes] = chamadas('POST /userauth/signup')[0];
    expect(JSON.parse(opcoes.body)).toEqual({
      user: 'Nova Cliente',
      email: 'nova@teste.example',
      password: 'senha-segura-1',
    });
  });
});

describe('carrinho', () => {
  test('comprar sem estar autenticado leva ao login e não chama a API do carrinho', async () => {
    abrir('/produtos/1');
    await screen.findByText('Tênis casual.');

    userEvent.click(screen.getAllByText('COMPRAR')[0]);

    expect(await screen.findByText('Acesse sua conta')).toBeInTheDocument();
    expect(chamadas('POST /carrinho/itens')).toHaveLength(0);
  });

  test('usuário autenticado adiciona o produto e vê o carrinho com os valores da API', async () => {
    window.localStorage.setItem(CHAVE_TOKEN, TOKEN);
    abrir('/produtos/2');
    await screen.findByText('Leve e responsivo.');
    await screen.findAllByText('Olá , Cliente Demo');

    userEvent.click(screen.getAllByText('COMPRAR')[0]);

    expect((await screen.findAllByText('MEU CARRINHO')).length).toBeGreaterThan(0);
    const [, opcoes] = chamadas('POST /carrinho/itens')[0];
    expect(opcoes.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    expect(JSON.parse(opcoes.body)).toEqual({ produto_id: '2', quantidade: 1 });
    expect(screen.getAllByText('R$ 297,42').length).toBeGreaterThan(0);
  });
});
