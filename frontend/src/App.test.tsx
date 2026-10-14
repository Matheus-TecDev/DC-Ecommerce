import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { CHAVE_TOKEN, CLIENTE, PRODUTOS, TOKEN, criarApiFalsa } from './testes/apiFalsa';
import type { ApiFalsa, OpcoesApiFalsa } from './testes/apiFalsa';

let apiFalsa: ApiFalsa;

function prepararApi(opcoes?: OpcoesApiFalsa): void {
  apiFalsa = criarApiFalsa(opcoes);
}

function abrir(rota: string) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>
  );
}

function primeiro<T>(itens: T[]): T {
  const [item] = itens;
  if (item === undefined) throw new Error('Nenhum item encontrado');
  return item;
}

function autenticar(): void {
  window.localStorage.setItem(CHAVE_TOKEN, TOKEN);
}

async function sessaoRestaurada(): Promise<void> {
  expect((await screen.findAllByText('Olá , Cliente Demo')).length).toBeGreaterThan(0);
}

beforeEach(() => {
  window.localStorage.clear();
  prepararApi();
});

afterEach(async () => {
  await apiFalsa.ociosa();
});

describe('produtos', () => {
  test('lista os produtos vindos da API, com o preço já com desconto', async () => {
    abrir('/produtos');

    expect(screen.getByText('Carregando produtos...')).toBeInTheDocument();
    expect(await screen.findByText('Tênis Urban Flow')).toBeInTheDocument();
    expect(screen.getByText('Tênis Sprint Pro')).toBeInTheDocument();
    expect(screen.getByText('R$ 297,42')).toBeInTheDocument();
    expect(screen.getByText('R$ 219,00')).toBeInTheDocument();
    expect(screen.queryByText('Carregando produtos...')).not.toBeInTheDocument();
    expect(apiFalsa.chamadas('GET /produtos')).toHaveLength(1);
  });

  test('cada produto leva à sua página e a imagem tem texto alternativo', async () => {
    abrir('/produtos');

    const link = await screen.findByRole('link', { name: /Tênis Sprint Pro/ });
    expect(link).toHaveAttribute('href', '/produtos/2');
    expect(within(link).getByRole('img', { name: 'Tênis Sprint Pro' })).toHaveAttribute(
      'src',
      'http://localhost:3001/imagens/tenis-corrida.png'
    );
  });

  test('a busca do header filtra a listagem e atualiza o resumo dos resultados', async () => {
    abrir('/produtos');
    await screen.findByText('Tênis Urban Flow');
    expect(screen.getByText('"2" Produtos')).toBeInTheDocument();

    userEvent.type(screen.getByPlaceholderText('Pesquisar produto...'), 'sprint');

    expect(screen.queryByText('Tênis Urban Flow')).not.toBeInTheDocument();
    expect(screen.getByText('Tênis Sprint Pro')).toBeInTheDocument();
    expect(screen.getByText('"sprint"')).toBeInTheDocument();
    expect(screen.getByText('"1" Produtos')).toBeInTheDocument();
  });

  test('a busca considera a categoria e avisa quando nada é encontrado', async () => {
    abrir('/produtos');
    await screen.findByText('Tênis Urban Flow');
    const busca = screen.getByRole('textbox', { name: 'Pesquisar produto' });

    userEvent.type(busca, 'CASUAL');
    expect(screen.getByText('Tênis Urban Flow')).toBeInTheDocument();
    expect(screen.queryByText('Tênis Sprint Pro')).not.toBeInTheDocument();

    userEvent.clear(busca);
    userEvent.type(busca, 'sandália');
    expect(screen.getByText('Nenhum produto encontrado.')).toBeInTheDocument();
    expect(screen.getByText('"0" Produtos')).toBeInTheDocument();
  });

  test('mostra uma mensagem de erro quando a API está fora do ar', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    abrir('/produtos');

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível conectar ao servidor');
    expect(screen.queryByText('Carregando produtos...')).not.toBeInTheDocument();
    expect(screen.queryByText('Nenhum produto encontrado.')).not.toBeInTheDocument();
  });

  test('recusa uma listagem fora do contrato em vez de exibir dados quebrados', async () => {
    prepararApi({ respostas: { 'GET /produtos': { status: 200, corpo: [{ ...PRODUTOS[0], valor: '219' }] } } });
    abrir('/produtos');

    expect(await screen.findByRole('alert')).toHaveTextContent('O servidor retornou uma resposta inesperada');
    expect(screen.queryByText('Tênis Urban Flow')).not.toBeInTheDocument();
  });

  test('abre a página de um produto com os dados da API', async () => {
    abrir('/produtos/2');

    expect(screen.getByText('Carregando produto...')).toBeInTheDocument();
    expect(await screen.findByText('Leve e responsivo.')).toBeInTheDocument();
    expect(screen.queryByText('Carregando produto...')).not.toBeInTheDocument();
    expect(screen.getByText('Home / Produtos / Corrida / Tênis Sprint Pro')).toBeInTheDocument();
    expect(screen.getByText('297')).toBeInTheDocument();
    expect(screen.getByText(',42')).toBeInTheDocument();
    expect(screen.getByText('349,90')).toBeInTheDocument();
    expect(apiFalsa.chamadas('GET /produtos/2')).toHaveLength(1);
  });

  test('os produtos relacionados não repetem o produto aberto', async () => {
    abrir('/produtos/2');
    await screen.findByText('Leve e responsivo.');

    expect(await screen.findByRole('link', { name: /Tênis Urban Flow/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Tênis Sprint Pro/ })).not.toBeInTheDocument();
  });

  test('mostra o erro da API quando o produto não existe', async () => {
    abrir('/produtos/999');

    expect(await screen.findByRole('alert')).toHaveTextContent('Produto não encontrado');
    expect(screen.queryByText('Carregando produto...')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'COMPRAR' })).not.toBeInTheDocument();
  });

  test('seleção de tamanho e cor informa o estado aos leitores de tela', async () => {
    abrir('/produtos/1');
    await screen.findByText('Tênis casual.');

    const tamanho41 = screen.getByRole('button', { name: '41' });
    expect(screen.getByRole('button', { name: '39' })).toHaveAttribute('aria-pressed', 'true');
    expect(tamanho41).toHaveAttribute('aria-pressed', 'false');

    userEvent.click(tamanho41);
    expect(tamanho41).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '39' })).toHaveAttribute('aria-pressed', 'false');

    userEvent.click(screen.getByRole('button', { name: 'Cor 3' }));
    expect(screen.getByRole('button', { name: 'Cor 3' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Cor 1' })).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('navegação', () => {
  test('marca somente a rota atual como página ativa', async () => {
    abrir('/produtos');
    await screen.findByText('Tênis Urban Flow');

    const ativos = screen.getAllByRole('link', { current: 'page' });
    expect(ativos.length).toBeGreaterThan(0);
    for (const link of ativos) {
      expect(link).toHaveTextContent('Produtos');
      expect(link).toHaveAttribute('href', '/produtos');
    }
    for (const link of screen.getAllByRole('link', { name: 'Home' })) {
      expect(link).not.toHaveAttribute('aria-current');
      expect(link).not.toHaveAttribute('class', 'false');
    }
  });

  test('os destaques da home são um grupo de opções com uma única selecionada', async () => {
    abrir('/');
    await screen.findAllByText('Tênis Urban Flow');

    const opcoes = screen.getAllByRole('radio');
    expect(opcoes).toHaveLength(4);
    expect(opcoes.filter((opcao) => opcao instanceof HTMLInputElement && opcao.checked)).toHaveLength(1);
    expect(screen.getByRole('radio', { name: 'Exibir destaque 1 de 4' })).toBeChecked();

    userEvent.click(screen.getByRole('radio', { name: 'Exibir destaque 2 de 4' }));

    expect(screen.getByRole('radio', { name: 'Exibir destaque 2 de 4' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Exibir destaque 1 de 4' })).not.toBeChecked();
    expect(screen.getByRole('heading', { name: 'Tênis novos para você' })).toBeVisible();
  });

  test('rotas desconhecidas voltam para a home', async () => {
    abrir('/nao-existe');

    expect(await screen.findByText('Produtos em alta')).toBeInTheDocument();
    await screen.findAllByText('Tênis Urban Flow');
  });

  test('o botão de entrar do header é um link para o login', async () => {
    abrir('/');
    await screen.findAllByText('Tênis Urban Flow');

    for (const link of screen.getAllByRole('link', { name: 'Entrar' })) {
      expect(link).toHaveAttribute('href', '/login');
    }
    expect(screen.queryByRole('button', { name: 'Entrar' })).not.toBeInTheDocument();
  });
});

describe('autenticação', () => {
  function preencherLogin(email: string, senha: string): void {
    userEvent.type(screen.getByRole('textbox', { name: 'Login *' }), email);
    userEvent.type(screen.getByLabelText('Senha *'), senha);
    userEvent.click(screen.getByRole('button', { name: 'Acessar conta' }));
  }

  test('login com credenciais inválidas mostra o erro da API e não cria sessão', async () => {
    abrir('/login');
    preencherLogin(CLIENTE.email, 'senha-errada');

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos');
    expect(window.localStorage.getItem(CHAVE_TOKEN)).toBeNull();
    expect(screen.getByText('Acesse sua conta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acessar conta' })).toBeInTheDocument();
    expect(apiFalsa.chamadas('GET /userauth/me')).toHaveLength(0);
  });

  test('login sem preencher os campos não chama a API', () => {
    abrir('/login');

    userEvent.click(screen.getByRole('button', { name: 'Acessar conta' }));

    expect(apiFalsa.chamadas('POST /userauth/login')).toHaveLength(0);
    expect(screen.getByText('Acesse sua conta')).toBeInTheDocument();
  });

  test('login válido envia as credenciais à API, guarda o token e mostra o usuário', async () => {
    abrir('/login');
    preencherLogin(CLIENTE.email, CLIENTE.senha);

    expect(await screen.findByRole('button', { name: 'Entrando...' })).toBeInTheDocument();
    await sessaoRestaurada();
    expect(window.localStorage.getItem(CHAVE_TOKEN)).toBe(TOKEN);
    expect(primeiro(apiFalsa.chamadas('POST /userauth/login')).corpo).toEqual({
      email: CLIENTE.email,
      password: CLIENTE.senha,
    });
    expect(primeiro(apiFalsa.chamadas('GET /userauth/me')).autorizacao).toBe(`Bearer ${TOKEN}`);
    await waitFor(() => expect(apiFalsa.chamadas('GET /carrinho')).toHaveLength(1));
  });

  test('retoma a sessão ao recarregar e permite sair', async () => {
    autenticar();
    prepararApi({ carrinho: [{ produto_id: '1', quantidade: 2 }] });
    abrir('/');

    await sessaoRestaurada();
    expect((await screen.findAllByRole('button', { name: 'Carrinho com 2 itens' })).length).toBeGreaterThan(0);

    userEvent.click(primeiro(screen.getAllByRole('button', { name: 'Sair' })));

    expect(screen.queryByText('Olá , Cliente Demo')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(CHAVE_TOKEN)).toBeNull();
    expect(screen.getAllByRole('button', { name: 'Carrinho com 0 itens' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Entrar' }).length).toBeGreaterThan(0);
  });

  test('descarta um token que a API não aceita mais', async () => {
    window.localStorage.setItem(CHAVE_TOKEN, 'token-expirado');
    abrir('/');

    await waitFor(() => expect(window.localStorage.getItem(CHAVE_TOKEN)).toBeNull());
    expect(screen.queryByText(/Olá ,/)).not.toBeInTheDocument();
    expect(apiFalsa.chamadas('GET /carrinho')).toHaveLength(0);
  });

  test('mantém o token quando a restauração da sessão falha por indisponibilidade', async () => {
    autenticar();
    prepararApi({ respostas: { 'GET /userauth/me': { status: 503, corpo: { erro: 'Serviço indisponível' } } } });
    abrir('/');

    await screen.findAllByText('Tênis Urban Flow');
    await apiFalsa.ociosa();

    expect(window.localStorage.getItem(CHAVE_TOKEN)).toBe(TOKEN);
    expect(screen.queryByText(/Olá ,/)).not.toBeInTheDocument();
  });

  test('a tela de cadastro leva o e-mail informado para o formulário completo', () => {
    abrir('/cadastro');

    userEvent.type(screen.getByRole('textbox', { name: 'Email *' }), 'nova+loja@teste.example');

    expect(screen.getByRole('link', { name: 'Criar Conta' })).toHaveAttribute(
      'href',
      '/cadastro/nova%2Bloja%40teste.example'
    );
  });

  describe('cadastro', () => {
    const campos: Record<string, string> = {
      'Nome Completo *': 'Nova Cliente',
      'CPF *': '000.000.000-00',
      'Celular *': '(00) 00000-0000',
      'Senha *': 'senha-segura-1',
      'Endereço *': 'Rua de Teste, 1',
      'Bairro *': 'Centro',
      'Cidade *': 'Cidade Fictícia',
      'CEP *': '00000-000',
      'Complemento *': 'Casa',
    };

    function preencherCadastro(): void {
      for (const [titulo, valor] of Object.entries(campos)) {
        userEvent.type(screen.getByLabelText(titulo), valor);
      }
    }

    test('cria a conta na API (somente nome, e-mail e senha) e já autentica', async () => {
      abrir('/cadastro/nova@teste.example');

      expect(screen.getByLabelText('E-mail *')).toHaveValue('nova@teste.example');
      preencherCadastro();
      userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));

      await waitFor(() => expect(window.localStorage.getItem(CHAVE_TOKEN)).toBe(TOKEN));
      expect(primeiro(apiFalsa.chamadas('POST /userauth/signup')).corpo).toEqual({
        user: 'Nova Cliente',
        email: 'nova@teste.example',
        password: 'senha-segura-1',
      });
      expect(primeiro(apiFalsa.chamadas('POST /userauth/login')).corpo).toEqual({
        email: 'nova@teste.example',
        password: 'senha-segura-1',
      });
      expect(await screen.findByText('Produtos em alta')).toBeInTheDocument();
      await screen.findAllByText('Tênis Urban Flow');
    });

    test('exige todos os campos antes de chamar a API', () => {
      abrir('/cadastro/nova@teste.example');

      userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));

      expect(screen.getByRole('alert')).toHaveTextContent('Todos os campos devem ser preenchidos');
      expect(apiFalsa.chamadas('POST /userauth/signup')).toHaveLength(0);
    });

    test('não pede consentimento de marketing nem aceite de termos para cadastrar', async () => {
      abrir('/cadastro/nova@teste.example');

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      expect(screen.queryByText(/ofertas e novidades/i)).not.toBeInTheDocument();

      preencherCadastro();
      userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));

      await waitFor(() => expect(apiFalsa.chamadas('POST /userauth/signup')).toHaveLength(1));
      expect(screen.queryByText(/aceite os nossos termos/i)).not.toBeInTheDocument();
      await waitFor(() => expect(window.localStorage.getItem(CHAVE_TOKEN)).toBe(TOKEN));
      await screen.findAllByText('Tênis Urban Flow');
    });

    test('mostra o erro da API quando o e-mail já está cadastrado e permite tentar de novo', async () => {
      abrir(`/cadastro/${CLIENTE.email}`);

      preencherCadastro();
      userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Usuário já existente');
      expect(window.localStorage.getItem(CHAVE_TOKEN)).toBeNull();
      expect(apiFalsa.chamadas('POST /userauth/login')).toHaveLength(0);
      expect(screen.getByRole('button', { name: 'Criar Conta' })).toBeInTheDocument();
    });
  });
});

describe('carrinho', () => {
  test('comprar sem estar autenticado leva ao login e não chama a API do carrinho', async () => {
    abrir('/produtos/1');
    await screen.findByText('Tênis casual.');

    userEvent.click(primeiro(screen.getAllByRole('button', { name: 'COMPRAR' })));

    expect(await screen.findByText('Acesse sua conta')).toBeInTheDocument();
    expect(apiFalsa.chamadas('POST /carrinho/itens')).toHaveLength(0);
  });

  test('usuário autenticado adiciona o produto e vê o carrinho com os valores da API', async () => {
    autenticar();
    abrir('/produtos/2');
    await screen.findByText('Leve e responsivo.');
    await sessaoRestaurada();

    userEvent.click(primeiro(screen.getAllByRole('button', { name: 'COMPRAR' })));

    expect((await screen.findAllByText('MEU CARRINHO')).length).toBeGreaterThan(0);
    const adicao = primeiro(apiFalsa.chamadas('POST /carrinho/itens'));
    expect(adicao.autorizacao).toBe(`Bearer ${TOKEN}`);
    expect(adicao.corpo).toEqual({ produto_id: '2', quantidade: 1 });
    expect(screen.getAllByText('R$ 297,42').length).toBeGreaterThan(0);
    expect(screen.getAllByText('R$ 349,90').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Carrinho com 1 item' }).length).toBeGreaterThan(0);
  });

  test('sessão expirada ao comprar encerra a sessão e leva ao login', async () => {
    autenticar();
    abrir('/produtos/2');
    await screen.findByText('Leve e responsivo.');
    await sessaoRestaurada();
    await apiFalsa.ociosa();
    apiFalsa.invalidarToken();

    userEvent.click(primeiro(screen.getAllByRole('button', { name: 'COMPRAR' })));

    expect(await screen.findByText('Acesse sua conta')).toBeInTheDocument();
    expect(window.localStorage.getItem(CHAVE_TOKEN)).toBeNull();
  });

  test('carrinho vazio mostra o aviso e os totais zerados', async () => {
    autenticar();
    abrir('/produtos/carrinho');
    await sessaoRestaurada();
    await apiFalsa.ociosa();

    expect(screen.getAllByText('Seu carrinho está vazio.').length).toBeGreaterThan(0);
    expect(screen.getAllByText('R$ 0,00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ou 10x de R$ 0,00 sem juros').length).toBeGreaterThan(0);
  });

  test('altera a quantidade e recalcula os totais com a resposta da API', async () => {
    autenticar();
    prepararApi({ carrinho: [{ produto_id: '2', quantidade: 1 }] });
    abrir('/produtos/carrinho');

    const diminuir = primeiro(await screen.findAllByRole('button', { name: 'Diminuir quantidade de Tênis Sprint Pro' }));
    expect(diminuir).toBeDisabled();

    userEvent.click(primeiro(screen.getAllByRole('button', { name: 'Aumentar quantidade de Tênis Sprint Pro' })));

    expect((await screen.findAllByText('R$ 594,84')).length).toBeGreaterThan(0);
    expect(primeiro(apiFalsa.chamadas('PATCH /carrinho/itens/2')).corpo).toEqual({ quantidade: 2 });
    expect(screen.getAllByText('R$ 699,80').length).toBeGreaterThan(0);
    expect(screen.getAllByText('R$ 104,96').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ou 10x de R$ 59,48 sem juros').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Carrinho com 2 itens' }).length).toBeGreaterThan(0);

    const diminuirHabilitado = primeiro(screen.getAllByRole('button', { name: 'Diminuir quantidade de Tênis Sprint Pro' }));
    expect(diminuirHabilitado).toBeEnabled();
    userEvent.click(diminuirHabilitado);

    await waitFor(() => expect(apiFalsa.chamadas('PATCH /carrinho/itens/2')).toHaveLength(2));
    expect(apiFalsa.chamadas('PATCH /carrinho/itens/2')[1]?.corpo).toEqual({ quantidade: 1 });
    expect((await screen.findAllByRole('button', { name: 'Carrinho com 1 item' })).length).toBeGreaterThan(0);
  });

  test('remove um item e mantém os demais', async () => {
    autenticar();
    prepararApi({
      carrinho: [
        { produto_id: '1', quantidade: 1 },
        { produto_id: '2', quantidade: 1 },
      ],
    });
    abrir('/produtos/carrinho');

    userEvent.click(primeiro(await screen.findAllByRole('button', { name: 'Remover Tênis Urban Flow do carrinho' })));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Remover Tênis Urban Flow do carrinho' })).not.toBeInTheDocument()
    );
    expect(apiFalsa.chamadas('DELETE /carrinho/itens/1')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Remover Tênis Sprint Pro do carrinho' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Carrinho com 1 item' }).length).toBeGreaterThan(0);
  });

  test('mostra o erro da API quando a alteração do carrinho falha', async () => {
    autenticar();
    prepararApi({
      carrinho: [{ produto_id: '2', quantidade: 1 }],
      respostas: { 'PATCH /carrinho/itens/2': { status: 422, corpo: { erro: 'quantidade deve ser um inteiro entre 1 e 99' } } },
    });
    abrir('/produtos/carrinho');

    userEvent.click(primeiro(await screen.findAllByRole('button', { name: 'Aumentar quantidade de Tênis Sprint Pro' })));

    expect(primeiro(await screen.findAllByRole('alert'))).toHaveTextContent('quantidade deve ser um inteiro entre 1 e 99');
    expect(screen.getAllByRole('button', { name: 'Carrinho com 1 item' }).length).toBeGreaterThan(0);
    expect(window.localStorage.getItem(CHAVE_TOKEN)).toBe(TOKEN);
  });

  test('o carrinho do header abre, lista os itens e pode ser esvaziado', async () => {
    autenticar();
    prepararApi({ carrinho: [{ produto_id: '2', quantidade: 2 }] });
    abrir('/');
    await screen.findAllByText('Tênis Urban Flow');

    const alternar = primeiro(await screen.findAllByRole('button', { name: 'Carrinho com 2 itens' }));
    expect(alternar).toHaveAttribute('aria-expanded', 'false');
    userEvent.click(alternar);

    expect(alternar).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('2 x Corrida')).toBeInTheDocument();
    expect(screen.getByText('R$ 594,84')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver Carrinho' })).toHaveAttribute('href', '/produtos/carrinho');

    userEvent.click(screen.getByRole('button', { name: 'Esvaziar' }));

    expect((await screen.findAllByRole('button', { name: 'Carrinho com 0 itens' })).length).toBeGreaterThan(0);
    expect(apiFalsa.chamadas('DELETE /carrinho')).toHaveLength(1);
  });

  test('o resumo do checkout usa os valores do carrinho', async () => {
    autenticar();
    prepararApi({ carrinho: [{ produto_id: '2', quantidade: 2 }] });
    abrir('/finalizarcompra');

    expect(await screen.findByText('2 x Tênis Sprint Pro')).toBeInTheDocument();
    expect(screen.getAllByText('R$ 594,84').length).toBeGreaterThan(0);
    for (const link of screen.getAllByRole('link', { name: 'Concluir demonstração' })) {
      expect(link).toHaveAttribute('href', '/comprafinalizada');
    }
  });
});

describe('checkout demonstrativo', () => {
  test('avisa que nada é processado e não pede dados de cartão', async () => {
    abrir('/finalizarcompra');
    await apiFalsa.ociosa();

    const avisos = screen.getAllByRole('note');
    expect(avisos[0]).toHaveTextContent('Checkout demonstrativo.');
    expect(avisos[0]).toHaveTextContent('nenhum pagamento é processado');
    expect(avisos[1]).toHaveTextContent('não solicita dados de cartão');

    for (const campo of screen.getAllByRole('textbox')) {
      expect(campo).not.toHaveAccessibleName(/cart[ãa]o|cvv|validade/i);
    }
    expect(screen.queryByPlaceholderText(/cart[ãa]o|cvv/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Realizar Pagamento/i)).not.toBeInTheDocument();
  });

  test('preencher e concluir o checkout não envia nada à API', async () => {
    abrir('/finalizarcompra');
    await apiFalsa.ociosa();
    const chamadasAntes = apiFalsa.totalDeChamadas();

    userEvent.type(screen.getByRole('textbox', { name: 'Nome Completo' }), 'Pessoa de Teste');
    userEvent.click(screen.getByRole('radio', { name: 'Boleto Bancário' }));
    userEvent.click(primeiro(screen.getAllByRole('link', { name: 'Concluir demonstração' })));

    expect(await screen.findByText('Demonstração de compra concluída!')).toBeInTheDocument();
    await apiFalsa.ociosa();
    expect(apiFalsa.totalDeChamadas()).toBe(chamadasAntes);
  });

  test('a confirmação declara que nenhum pagamento foi processado e não mostra cartão', async () => {
    abrir('/comprafinalizada');
    await apiFalsa.ociosa();

    expect(screen.getByRole('note')).toHaveTextContent('Nenhum pagamento foi processado.');
    expect(screen.getByRole('note')).toHaveTextContent('dados exibidos abaixo são fictícios');
    expect(screen.queryByText(/Compra Realizada com sucesso/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Titular do Cartão/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\*{4,}/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Recibo/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para Home' })).toHaveAttribute('href', '/');
  });
});

describe('galeria do produto', () => {
  function selecionada(): string | null {
    const [ativa] = screen.getAllByRole('button', { name: /^Imagem \d de 5$/, pressed: true });
    return ativa ? ativa.getAttribute('aria-label') : null;
  }

  test('as miniaturas são botões nomeados e somente uma fica selecionada', async () => {
    abrir('/produtos/2');
    await screen.findByText('Leve e responsivo.');

    expect(screen.getAllByRole('button', { name: /^Imagem \d de 5$/ })).toHaveLength(5);
    expect(screen.getAllByRole('button', { name: /^Imagem \d de 5$/, pressed: true })).toHaveLength(1);
    expect(selecionada()).toBe('Imagem 1 de 5');

    userEvent.click(screen.getByRole('button', { name: 'Imagem 4 de 5' }));

    expect(screen.getAllByRole('button', { name: /^Imagem \d de 5$/, pressed: true })).toHaveLength(1);
    expect(selecionada()).toBe('Imagem 4 de 5');
  });

  test('as setas percorrem as imagens nos dois sentidos, voltando ao início e ao fim', async () => {
    abrir('/produtos/2');
    await screen.findByText('Leve e responsivo.');
    const proxima = primeiro(screen.getAllByRole('button', { name: 'Próxima imagem' }));
    const anterior = primeiro(screen.getAllByRole('button', { name: 'Imagem anterior' }));

    userEvent.click(proxima);
    expect(selecionada()).toBe('Imagem 2 de 5');

    userEvent.click(anterior);
    userEvent.click(anterior);
    expect(selecionada()).toBe('Imagem 5 de 5');

    userEvent.click(proxima);
    expect(selecionada()).toBe('Imagem 1 de 5');
  });

  test('miniaturas e setas funcionam pelo teclado', async () => {
    abrir('/produtos/2');
    await screen.findByText('Leve e responsivo.');

    const terceira = screen.getByRole('button', { name: 'Imagem 3 de 5' });
    terceira.focus();
    userEvent.keyboard('{enter}');
    expect(selecionada()).toBe('Imagem 3 de 5');

    primeiro(screen.getAllByRole('button', { name: 'Próxima imagem' })).focus();
    userEvent.keyboard('{space}');
    expect(selecionada()).toBe('Imagem 4 de 5');
  });
});
