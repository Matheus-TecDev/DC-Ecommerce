import { Router } from "express";
import type { Request } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { assincrono, corpo, erro, texto, usuarioAutenticado } from "../lib/http";
import * as store from "../lib/store";
import { isAuthenticated } from "../middleware/isAuthenticated";
import type { CarrinhoDetalhado, ItemCarrinhoDetalhado, ParametroProdutoId } from "../types/api";
import type { Carrinho } from "../types/modelos";

const router = Router();

const QUANTIDADE_MAXIMA = 99;

router.use(isAuthenticated);

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function quantidadeValida(quantidade: unknown): quantidade is number {
  return (
    typeof quantidade === "number" &&
    Number.isInteger(quantidade) &&
    quantidade >= 1 &&
    quantidade <= QUANTIDADE_MAXIMA
  );
}

function carrinhoDoUsuario(carrinhos: Carrinho[], userId: string): Carrinho {
  let carrinho = carrinhos.find((c) => c.id === userId);
  if (!carrinho) {
    carrinho = { id: userId, produtos: [], desconto: 0 };
    carrinhos.push(carrinho);
  }
  return carrinho;
}

async function detalhar(carrinho: Pick<Carrinho, "produtos" | "desconto">): Promise<CarrinhoDetalhado> {
  const produtos = await store.ler("produtos");
  const itens: ItemCarrinhoDetalhado[] = [];
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

function responderCarrinho<P = ParamsDictionary>(
  alterar: (carrinho: Carrinho, req: Request<P, CarrinhoDetalhado, unknown>) => void | Promise<void>
) {
  return assincrono<P, CarrinhoDetalhado>(async (req, res) => {
    const userId = usuarioAutenticado(req).id;
    const carrinho = await store.atualizar("carrinho", async (carrinhos) => {
      const meuCarrinho = carrinhoDoUsuario(carrinhos, userId);
      await alterar(meuCarrinho, req);
      return meuCarrinho;
    });
    res.json(await detalhar(carrinho));
  });
}

router.get(
  "/",
  assincrono<ParamsDictionary, CarrinhoDetalhado>(async (req, res) => {
    const userId = usuarioAutenticado(req).id;
    const carrinhos = await store.ler("carrinho");
    const carrinho = carrinhos.find((c) => c.id === userId) || { produtos: [], desconto: 0 };
    res.json(await detalhar(carrinho));
  })
);

router.post(
  "/itens",
  responderCarrinho(async (carrinho, req) => {
    const { produto_id, quantidade = 1 } = corpo(req);
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
  responderCarrinho<ParametroProdutoId>((carrinho, req) => {
    const { quantidade } = corpo(req);
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
  responderCarrinho<ParametroProdutoId>((carrinho, req) => {
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

export default router;
