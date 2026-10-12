export const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const CHAVE_TOKEN = 'digitalstore.token';

export const sessao = {
    token() {
        try {
            return window.localStorage.getItem(CHAVE_TOKEN);
        } catch {
            return null;
        }
    },
    salvar(token) {
        try {
            window.localStorage.setItem(CHAVE_TOKEN, token);
        } catch { }
    },
    limpar() {
        try {
            window.localStorage.removeItem(CHAVE_TOKEN);
        } catch { }
    },
};

async function requisicao(caminho, { method = 'GET', body } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const token = sessao.token();
    if (token) headers.Authorization = `Bearer ${token}`;

    let resposta;
    try {
        resposta = await fetch(API_URL + caminho, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new Error('Não foi possível conectar ao servidor. Verifique se a API está em execução.');
    }

    const dados = await resposta.json().catch(() => null);
    if (!resposta.ok) {
        const erro = new Error(dados?.erro || 'Ocorreu um erro inesperado. Tente novamente.');
        erro.status = resposta.status;
        throw erro;
    }
    return dados;
}

export const api = {
    listarProdutos: () => requisicao('/produtos'),
    buscarProduto: (id) => requisicao(`/produtos/${encodeURIComponent(id)}`),

    cadastrar: ({ nome, email, senha }) =>
        requisicao('/userauth/signup', { method: 'POST', body: { user: nome, email, password: senha } }),
    login: (email, senha) =>
        requisicao('/userauth/login', { method: 'POST', body: { email, password: senha } }),
    usuarioAtual: () => requisicao('/userauth/me'),

    carrinho: () => requisicao('/carrinho'),
    adicionarAoCarrinho: (produtoId, quantidade = 1) =>
        requisicao('/carrinho/itens', { method: 'POST', body: { produto_id: produtoId, quantidade } }),
    alterarQuantidade: (produtoId, quantidade) =>
        requisicao(`/carrinho/itens/${encodeURIComponent(produtoId)}`, { method: 'PATCH', body: { quantidade } }),
    removerDoCarrinho: (produtoId) =>
        requisicao(`/carrinho/itens/${encodeURIComponent(produtoId)}`, { method: 'DELETE' }),
    esvaziarCarrinho: () => requisicao('/carrinho', { method: 'DELETE' }),
};

export function urlImagem(img) {
    if (!img) return '';
    return img.startsWith('/') ? API_URL + img : img;
}

export function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function precoComDesconto(produto) {
    return Math.round((Math.round(produto.valor * 100) * (100 - produto.desconto)) / 100) / 100;
}
