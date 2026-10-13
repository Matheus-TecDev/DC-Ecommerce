import { Router } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { assincrono, corpo, erro, numero, texto } from "../lib/http";
import type { Corpo } from "../lib/http";
import * as store from "../lib/store";
import { isAdmin, isAuthenticated } from "../middleware/isAuthenticated";
import type { ListaProdutos, ParametroId } from "../types/api";
import type { DadosProduto, Produto } from "../types/modelos";

const router = Router();

const CAMPOS_BUSCA = ["categoria", "titulo", "descricao"] as const;

type CampoBusca = (typeof CAMPOS_BUSCA)[number];

function campoBuscaValido(valor: unknown): valor is CampoBusca {
  return CAMPOS_BUSCA.some((campo) => campo === valor);
}

function imagemValida(img: unknown): img is string {
  if (!texto(img, { max: 500 })) return false;
  if (img.startsWith("/imagens/")) return !img.includes("..");
  try {
    return ["http:", "https:"].includes(new URL(img).protocol);
  } catch {
    return false;
  }
}

const CAMPOS_PRODUTO = ["categoria", "titulo", "descricao", "valor", "desconto", "img"] as const;

type CampoProduto = (typeof CAMPOS_PRODUTO)[number];

interface Validador<T> {
  valido: (valor: unknown) => valor is T;
  mensagem: string;
}

const VALIDADORES: { [C in CampoProduto]: Validador<DadosProduto[C]> } = {
  categoria: {
    valido: (v): v is string => texto(v, { max: 60 }),
    mensagem: "categoria deve ser um texto de até 60 caracteres",
  },
  titulo: {
    valido: (v): v is string => texto(v, { max: 120 }),
    mensagem: "titulo deve ser um texto de até 120 caracteres",
  },
  descricao: {
    valido: (v): v is string => texto(v, { max: 1000 }),
    mensagem: "descricao deve ser um texto de até 1000 caracteres",
  },
  valor: {
    valido: (v): v is number => numero(v, { max: 1000000 }),
    mensagem: "valor deve ser um número maior ou igual a zero",
  },
  desconto: {
    valido: (v): v is number => numero(v, { max: 100 }),
    mensagem: "desconto deve ser um número entre 0 e 100",
  },
  img: { valido: imagemValida, mensagem: "img deve ser uma URL http(s) ou um caminho em /imagens" },
};

function validarCampo<T>({ valido, mensagem }: Validador<T>, valor: unknown): T {
  if (!valido(valor)) throw erro(422, mensagem);
  return valor;
}

function validarProduto(body: Corpo, { parcial }: { parcial: boolean }): Partial<DadosProduto> {
  const produto: Partial<DadosProduto> = {};
  for (const campo of CAMPOS_PRODUTO) {
    const valor = body[campo];
    if (valor === undefined) {
      if (!parcial) throw erro(422, `Campo obrigatório ausente: ${campo}`);
      continue;
    }
    if (campo === "valor" || campo === "desconto") {
      produto[campo] = validarCampo(VALIDADORES[campo], valor);
    } else {
      produto[campo] = validarCampo(VALIDADORES[campo], valor).trim();
    }
  }
  if (Object.keys(produto).length === 0) {
    throw erro(400, "Envie ao menos um campo do produto para atualizar");
  }
  return produto;
}

function produtoCompleto(produto: Partial<DadosProduto>): produto is DadosProduto {
  return CAMPOS_PRODUTO.every((campo) => produto[campo] !== undefined);
}

router.get(
  "/",
  assincrono<ParamsDictionary, ListaProdutos>(async (_req, res) => {
    res.json(await store.ler("produtos"));
  })
);

router.get(
  "/search",
  assincrono<ParamsDictionary, ListaProdutos>(async (req, res) => {
    const { palavra_chave, info } = req.query;
    if (!campoBuscaValido(palavra_chave)) {
      throw erro(400, `palavra_chave deve ser um destes campos: ${CAMPOS_BUSCA.join(", ")}`);
    }
    if (!texto(info, { max: 100 })) {
      throw erro(400, "Informe o termo de busca em info");
    }
    const termo = info.trim().toLowerCase();
    const produtos = await store.ler("produtos");
    res.json(produtos.filter((produto) => produto[palavra_chave].toLowerCase().includes(termo)));
  })
);

router.get(
  "/:id",
  assincrono<ParametroId, Produto>(async (req, res) => {
    const produtos = await store.ler("produtos");
    const produtoSelecionado = produtos.find((produto) => produto.id === req.params.id);
    if (!produtoSelecionado) {
      throw erro(404, "Produto não encontrado");
    }
    res.json(produtoSelecionado);
  })
);

router.post(
  "/",
  isAuthenticated,
  isAdmin,
  assincrono<ParamsDictionary, Produto>(async (req, res) => {
    const dados = validarProduto(corpo(req), { parcial: false });
    if (!produtoCompleto(dados)) {
      throw erro(422, "Campos obrigatórios do produto ausentes");
    }
    const produtoCriado = await store.atualizar("produtos", (produtos) => {
      const maiorID = produtos.reduce((maior, p) => Math.max(maior, Number.parseInt(p.id, 10) || 0), 0);
      const novo: Produto = { ...dados, id: String(maiorID + 1) };
      produtos.push(novo);
      return novo;
    });
    res.status(201).json(produtoCriado);
  })
);

const update = assincrono<ParametroId, Produto>(async (req, res) => {
  const dados = validarProduto(corpo(req), { parcial: true });
  const produtoAtualizado = await store.atualizar("produtos", (produtos) => {
    const produto = produtos.find((p) => p.id === req.params.id);
    if (!produto) {
      throw erro(404, "Produto não encontrado");
    }
    return Object.assign(produto, dados);
  });
  res.json(produtoAtualizado);
});

router.put<"/:id">("/:id", isAuthenticated, isAdmin, update);
router.patch<"/:id">("/:id", isAuthenticated, isAdmin, update);

router.delete<"/:id">(
  "/:id",
  isAuthenticated,
  isAdmin,
  assincrono<ParametroId, Produto>(async (req, res) => {
    const produtoDeletado = await store.atualizar("produtos", (produtos) => {
      const indice = produtos.findIndex((p) => p.id === req.params.id);
      const [removido] = indice === -1 ? [] : produtos.splice(indice, 1);
      if (!removido) {
        throw erro(404, "Produto não encontrado");
      }
      return removido;
    });
    res.json(produtoDeletado);
  })
);

export default router;
