import {
  RespostaInvalidaError,
  validarCarrinho,
  validarLogin,
  validarProduto,
  validarProdutos,
  validarUsuario,
} from './validacao';

const produto = {
  id: '2',
  categoria: 'Corrida',
  titulo: 'Tênis Sprint Pro',
  descricao: 'Leve e responsivo.',
  valor: 349.9,
  desconto: 15,
  img: '/imagens/tenis-corrida.png',
};

const usuario = { id: 'id-cliente', user: 'Cliente Demo', email: 'cliente@digitalstore.example', role: 'customer' };

const item = {
  produto_id: '2',
  titulo: 'Tênis Sprint Pro',
  descricao: 'Leve e responsivo.',
  categoria: 'Corrida',
  img: '/imagens/tenis-corrida.png',
  quantidade: 2,
  valor: 349.9,
  desconto: 15,
  valorUnitario: 297.42,
  subtotal: 594.84,
};

const carrinho = {
  itens: [item],
  quantidadeItens: 2,
  valorBruto: 699.8,
  descontoCarrinho: 0,
  descontoTotal: 104.96,
  valorTotal: 594.84,
};

describe('produtos', () => {
  test('aceita o contrato da API e descarta campos desconhecidos', () => {
    expect(validarProduto({ ...produto, estoque: 3 })).toEqual(produto);
    expect(validarProdutos([produto])).toEqual([produto]);
  });

  test.each([
    ['valor em texto', { ...produto, valor: '349.9' }],
    ['desconto ausente', { ...produto, desconto: undefined }],
    ['valor não finito', { ...produto, valor: Number.NaN }],
    ['id numérico', { ...produto, id: 2 }],
    ['resposta nula', null],
    ['lista no lugar do objeto', [produto]],
  ])('rejeita %s', (_caso, valor) => {
    expect(() => validarProduto(valor)).toThrow(RespostaInvalidaError);
  });

  test('rejeita uma lista com um item inválido ou que não é lista', () => {
    expect(() => validarProdutos([produto, { ...produto, titulo: null }])).toThrow(RespostaInvalidaError);
    expect(() => validarProdutos({ produtos: [produto] })).toThrow(RespostaInvalidaError);
  });
});

describe('usuário e login', () => {
  test('aceita o usuário público e nunca repassa a senha', () => {
    expect(validarUsuario({ ...usuario, password: 'hash' })).toEqual(usuario);
  });

  test('rejeita papéis desconhecidos', () => {
    expect(() => validarUsuario({ ...usuario, role: 'root' })).toThrow(RespostaInvalidaError);
  });

  test('aceita a resposta de login completa', () => {
    expect(validarLogin({ auth: true, token: 'abc', user: usuario })).toEqual({ auth: true, token: 'abc', user: usuario });
  });

  test.each([
    ['auth falso', { auth: false, token: 'abc', user: usuario }],
    ['token vazio', { auth: true, token: '', user: usuario }],
    ['token ausente', { auth: true, user: usuario }],
    ['usuário ausente', { auth: true, token: 'abc' }],
  ])('rejeita login com %s', (_caso, valor) => {
    expect(() => validarLogin(valor)).toThrow(RespostaInvalidaError);
  });
});

describe('carrinho', () => {
  test('aceita o carrinho detalhado, inclusive vazio', () => {
    expect(validarCarrinho(carrinho)).toEqual(carrinho);
    expect(validarCarrinho({ ...carrinho, itens: [] }).itens).toEqual([]);
  });

  test.each([
    ['itens ausentes', { ...carrinho, itens: undefined }],
    ['total em texto', { ...carrinho, valorTotal: '594.84' }],
    ['item sem subtotal', { ...carrinho, itens: [{ ...item, subtotal: undefined }] }],
    ['item com quantidade em texto', { ...carrinho, itens: [{ ...item, quantidade: '2' }] }],
  ])('rejeita carrinho com %s', (_caso, valor) => {
    expect(() => validarCarrinho(valor)).toThrow(RespostaInvalidaError);
  });
});
