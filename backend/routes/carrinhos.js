const express = require("express");
const store = require("../lib/store");
const { erro, assincrono, texto } = require("../lib/http");
const { isAuthenticated } = require("../middleware/isAuthenticated");

const router = express.Router();

const QUANTIDADE_MAXIMA = 99;

router.use(isAuthenticated);

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

function quantidadeValida(quantidade) {
  return Number.isInteger(quantidade) && quantidade >= 1 && quantidade <= QUANTIDADE_MAXIMA;
}

function carrinhoDoUsuario(carrinhos, userId) {
  let carrinho = carrinhos.find((c) => c.id === userId);
  if (!carrinho) {
    carrinho = { id: userId, produtos: [], desconto: 0 };
    carrinhos.push(carrinho);
  }
  return carrinho;
}

async function detalhar(carrinho) {
  const produtos = await store.ler("produtos");
  const itens = [];
  let valorBruto = 0;
  let subtotal = 0;

  for (const item of carrinho.produtos) {
    const produto = produtos.find((p) => p.id === item.produto_id);
    if (!produto) continue;

    const valorUnitario = Math.round((Math.round(produto.valor * 100) * (100 - produto.desconto)) / 100) / 100;
    const totalItem = arredondar(valorUnitario * item.quantidade);
    valorBruto += produto.valor * item.quantidade;
    subtotal += totalItem;
    itens.push({
      produto_id: produto.id,
      titulo: produto.titulo,
      descricao: produto.descricao,
      categoria: produto.categoria,
      img: produto.img,
      quantidade: item.quantidade,
      valor: produto.valor,
      desconto: produto.desconto,
      valorUnitario,
      subtotal: totalItem,
    });
  }

  const valorTotal = arredondar(subtotal * (1 - carrinho.desconto / 100));
  valorBruto = arredondar(valorBruto);
  return {
    itens,
    quantidadeItens: itens.reduce((soma, item) => soma + item.quantidade, 0),
    valorBruto,
    descontoCarrinho: carrinho.desconto,
    descontoTotal: arredondar(valorBruto - valorTotal),
    valorTotal,
  };
}

function responderCarrinho(alterar) {
  return assincrono(async (req, res) => {
    const carrinho = await store.atualizar("carrinho", async (carrinhos) => {
      const meuCarrinho = carrinhoDoUsuario(carrinhos, req.user.id);
      await alterar(meuCarrinho, req);
      return meuCarrinho;
    });
    res.json(await detalhar(carrinho));
  });
}

router.get(
  "/",
  assincrono(async (req, res) => {
    const carrinhos = await store.ler("carrinho");
    const carrinho = carrinhos.find((c) => c.id === req.user.id) || { produtos: [], desconto: 0 };
    res.json(await detalhar(carrinho));
  })
);

router.post(
  "/itens",
  responderCarrinho(async (carrinho, req) => {
    const { produto_id, quantidade = 1 } = req.body;
    if (!texto(produto_id, { max: 20 })) {
      throw erro(422, "Informe o produto_id");
    }
    if (!quantidadeValida(quantidade)) {
      throw erro(422, `quantidade deve ser um inteiro entre 1 e ${QUANTIDADE_MAXIMA}`);
    }
    const produtos = await store.ler("produtos");
    if (!produtos.some((p) => p.id === produto_id)) {
      throw erro(404, "Produto não encontrado");
    }

    const item = carrinho.produtos.find((p) => p.produto_id === produto_id);
    if (item) {
      item.quantidade = Math.min(item.quantidade + quantidade, QUANTIDADE_MAXIMA);
    } else {
      carrinho.produtos.push({ produto_id, quantidade });
    }
  })
);

router.patch(
  "/itens/:produtoId",
  responderCarrinho((carrinho, req) => {
    const { quantidade } = req.body;
    if (!quantidadeValida(quantidade)) {
      throw erro(422, `quantidade deve ser um inteiro entre 1 e ${QUANTIDADE_MAXIMA}`);
    }
    const item = carrinho.produtos.find((p) => p.produto_id === req.params.produtoId);
    if (!item) {
      throw erro(404, "Item não encontrado no carrinho");
    }
    item.quantidade = quantidade;
  })
);

router.delete(
  "/itens/:produtoId",
  responderCarrinho((carrinho, req) => {
    const indice = carrinho.produtos.findIndex((p) => p.produto_id === req.params.produtoId);
    if (indice === -1) {
      throw erro(404, "Item não encontrado no carrinho");
    }
    carrinho.produtos.splice(indice, 1);
  })
);

router.delete(
  "/",
  responderCarrinho((carrinho) => {
    carrinho.produtos = [];
  })
);

module.exports = router;
