import assert from "node:assert/strict";
import { test } from "node:test";
import { ADMIN, CLIENTE, app, bearer, login, request } from "./helpers";
import type { DadosProduto, Produto } from "../src/types/modelos";

const NOVO_PRODUTO: DadosProduto = {
  categoria: "Casual",
  titulo: "Tênis de Teste",
  descricao: "Produto criado pelos testes automatizados.",
  valor: 150,
  desconto: 10,
  img: "/imagens/tenis-casual.png",
};

test("lista os produtos sem exigir autenticação", async () => {
  const res = await request(app).get("/produtos");

  assert.equal(res.status, 200);
  assert.ok(res.body.length > 0);
  for (const campo of ["id", "categoria", "titulo", "descricao", "valor", "desconto", "img"]) {
    assert.ok(campo in res.body[0], campo);
  }
});

test("busca um produto pelo id e responde 404 quando não existe", async () => {
  const existente = await request(app).get("/produtos/1");
  assert.equal(existente.status, 200);
  assert.equal(existente.body.id, "1");

  const inexistente = await request(app).get("/produtos/9999");
  assert.equal(inexistente.status, 404);
  assert.equal(typeof inexistente.body.erro, "string");
});

test("busca por palavra-chave filtra pelo campo informado", async () => {
  const res = await request(app).get("/produtos/search").query({ palavra_chave: "categoria", info: "CORRIDA" });

  assert.equal(res.status, 200);
  assert.ok(res.body.length > 0);
  const encontrados: Produto[] = res.body;
  assert.ok(encontrados.every((p) => p.categoria === "Corrida"));
});

test("busca recusa campos fora da lista permitida", async () => {
  for (const palavra_chave of ["constructor", "__proto__", "id", undefined]) {
    const res = await request(app).get("/produtos/search").query({ palavra_chave, info: "x" });
    assert.equal(res.status, 400, String(palavra_chave));
  }
});

test("serve as imagens dos produtos de demonstração", async () => {
  const res = await request(app).get("/imagens/tenis-casual.png");
  assert.equal(res.status, 200);
  assert.equal(res.headers["content-type"], "image/png");
});

test("escrita no catálogo exige autenticação", async () => {
  const respostas = await Promise.all([
    request(app).post("/produtos").send(NOVO_PRODUTO),
    request(app).put("/produtos/1").send({ valor: 1 }),
    request(app).patch("/produtos/1").send({ valor: 1 }),
    request(app).delete("/produtos/1"),
  ]);
  for (const res of respostas) {
    assert.equal(res.status, 401);
  }

  const produto = await request(app).get("/produtos/1");
  assert.notEqual(produto.body.valor, 1);
});

test("escrita no catálogo é negada a usuários que não são administradores", async () => {
  const token = await login(CLIENTE);
  const res = await request(app).post("/produtos").set(bearer(token)).send(NOVO_PRODUTO);
  assert.equal(res.status, 403);
});

test("administrador cria, atualiza e remove um produto", async () => {
  const token = await login(ADMIN);

  const criado = await request(app).post("/produtos").set(bearer(token)).send(NOVO_PRODUTO);
  assert.equal(criado.status, 201);
  assert.equal(criado.body.titulo, NOVO_PRODUTO.titulo);
  const { id } = criado.body;

  const atualizado = await request(app)
    .patch(`/produtos/${id}`)
    .set(bearer(token))
    .send({ valor: 99.9, id: "1", admin: true });
  assert.equal(atualizado.status, 200);
  assert.equal(atualizado.body.valor, 99.9);
  assert.equal(atualizado.body.id, id);
  assert.equal(atualizado.body.admin, undefined);

  const removido = await request(app).delete(`/produtos/${id}`).set(bearer(token));
  assert.equal(removido.status, 200);
  assert.equal((await request(app).get(`/produtos/${id}`)).status, 404);
});

test("valida os dados do produto", async () => {
  const token = await login(ADMIN);
  const invalidos = [
    { ...NOVO_PRODUTO, valor: "150" },
    { ...NOVO_PRODUTO, valor: -1 },
    { ...NOVO_PRODUTO, desconto: 101 },
    { ...NOVO_PRODUTO, titulo: "" },
    { ...NOVO_PRODUTO, img: "javascript:alert(1)" },
    { titulo: "Faltam campos" },
  ];
  for (const corpo of invalidos) {
    const res = await request(app).post("/produtos").set(bearer(token)).send(corpo);
    assert.equal(res.status, 422, JSON.stringify(corpo));
  }
});

test("erros da API saem em JSON: rota inexistente e corpo malformado", async () => {
  const rota = await request(app).get("/rota-que-nao-existe");
  assert.equal(rota.status, 404);
  assert.equal(typeof rota.body.erro, "string");

  const corpo = await request(app)
    .post("/userauth/login")
    .set("Content-Type", "application/json")
    .send('{"email": ');
  assert.equal(corpo.status, 400);
  assert.equal(corpo.body.erro, "JSON inválido");

  const grande = await request(app)
    .post("/userauth/login")
    .send({ email: "x".repeat(200000) });
  assert.equal(grande.status, 413);
  assert.equal(typeof grande.body.erro, "string");
});

test("CORS libera apenas as origens configuradas", async () => {
  const permitida = await request(app).get("/produtos").set("Origin", "http://localhost:3000");
  assert.equal(permitida.headers["access-control-allow-origin"], "http://localhost:3000");

  const outra = await request(app).get("/produtos").set("Origin", "https://site-malicioso.example");
  assert.equal(outra.headers["access-control-allow-origin"], undefined);
});
