const express = require("express");
const store = require("../lib/store");
const { erro, assincrono, texto, numero } = require("../lib/http");
const { isAuthenticated, isAdmin } = require("../middleware/isAuthenticated");

const router = express.Router();

const CAMPOS_BUSCA = ["categoria", "titulo", "descricao"];

function imagemValida(img) {
  if (!texto(img, { max: 500 })) return false;
  if (img.startsWith("/imagens/")) return !img.includes("..");
  try {
    return ["http:", "https:"].includes(new URL(img).protocol);
  } catch {
    return false;
  }
}

const VALIDADORES = {
  categoria: [(v) => texto(v, { max: 60 }), "categoria deve ser um texto de até 60 caracteres"],
  titulo: [(v) => texto(v, { max: 120 }), "titulo deve ser um texto de até 120 caracteres"],
  descricao: [(v) => texto(v, { max: 1000 }), "descricao deve ser um texto de até 1000 caracteres"],
  valor: [(v) => numero(v, { max: 1000000 }), "valor deve ser um número maior ou igual a zero"],
  desconto: [(v) => numero(v, { max: 100 }), "desconto deve ser um número entre 0 e 100"],
  img: [imagemValida, "img deve ser uma URL http(s) ou um caminho em /imagens"],
};

function validarProduto(body, { parcial }) {
  const produto = {};
  for (const [campo, [valido, mensagem]] of Object.entries(VALIDADORES)) {
    if (body[campo] === undefined) {
      if (!parcial) throw erro(422, `Campo obrigatório ausente: ${campo}`);
      continue;
    }
    if (!valido(body[campo])) throw erro(422, mensagem);
    produto[campo] = typeof body[campo] === "string" ? body[campo].trim() : body[campo];
  }
  if (Object.keys(produto).length === 0) {
    throw erro(400, "Envie ao menos um campo do produto para atualizar");
  }
  return produto;
}

router.get(
  "/",
  assincrono(async (req, res) => {
    res.json(await store.ler("produtos"));
  })
);

router.get(
  "/search",
  assincrono(async (req, res) => {
    const { palavra_chave, info } = req.query;
    if (!CAMPOS_BUSCA.includes(palavra_chave)) {
      throw erro(400, `palavra_chave deve ser um destes campos: ${CAMPOS_BUSCA.join(", ")}`);
    }
    if (!texto(info, { max: 100 })) {
      throw erro(400, "Informe o termo de busca em info");
    }
    const termo = info.trim().toLowerCase();
    const produtos = await store.ler("produtos");
    res.json(produtos.filter((produto) => String(produto[palavra_chave]).toLowerCase().includes(termo)));
  })
);

router.get(
  "/:id",
  assincrono(async (req, res) => {
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
  assincrono(async (req, res) => {
    const dados = validarProduto(req.body, { parcial: false });
    const produtoCriado = await store.atualizar("produtos", (produtos) => {
      const maiorID = produtos.reduce((maior, p) => Math.max(maior, Number.parseInt(p.id, 10) || 0), 0);
      const novo = { ...dados, id: String(maiorID + 1) };
      produtos.push(novo);
      return novo;
    });
    res.status(201).json(produtoCriado);
  })
);

const update = assincrono(async (req, res) => {
  const dados = validarProduto(req.body, { parcial: true });
  const produtoAtualizado = await store.atualizar("produtos", (produtos) => {
    const produto = produtos.find((p) => p.id === req.params.id);
    if (!produto) {
      throw erro(404, "Produto não encontrado");
    }
    return Object.assign(produto, dados);
  });
  res.json(produtoAtualizado);
});

router.put("/:id", isAuthenticated, isAdmin, update);
router.patch("/:id", isAuthenticated, isAdmin, update);

router.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  assincrono(async (req, res) => {
    const produtoDeletado = await store.atualizar("produtos", (produtos) => {
      const indice = produtos.findIndex((p) => p.id === req.params.id);
      if (indice === -1) {
        throw erro(404, "Produto não encontrado");
      }
      return produtos.splice(indice, 1)[0];
    });
    res.json(produtoDeletado);
  })
);

module.exports = router;
