import assert from "node:assert/strict";
import { test } from "node:test";
import { ADMIN, CLIENTE, app, bearer, dataDir, login, request } from "./helpers";
import fs from "fs";
import path from "path";
import { validarColecao } from "../src/lib/colecoes";
import * as store from "../src/lib/store";
import type { NomeColecao } from "../src/types/modelos";

const COLECOES: NomeColecao[] = ["users", "produtos", "carrinho"];

function arquivo(nome: NomeColecao): string {
  return path.join(dataDir, `${nome}.json`);
}

test("primeira leitura copia o seed para o diretório de dados sem alterar o conteúdo", async () => {
  for (const nome of COLECOES) {
    assert.equal(fs.existsSync(arquivo(nome)), false, nome);
    const dados = await store.ler(nome);
    const seed = fs.readFileSync(path.join(__dirname, "..", "data", "seed", `${nome}.json`), "utf-8");
    assert.equal(fs.readFileSync(arquivo(nome), "utf-8"), seed, nome);
    assert.deepEqual(dados, JSON.parse(seed), nome);
  }
});

test("validação recusa registros fora do formato esperado", () => {
  const invalidos: [NomeColecao, unknown][] = [
    ["users", {}],
    ["users", [{ id: "1", user: "Sem senha", email: "a@b.example", role: "customer" }]],
    ["users", [{ id: "1", user: "Papel", email: "a@b.example", password: "hash", role: "root" }]],
    ["produtos", [{ id: 1, categoria: "c", titulo: "t", descricao: "d", valor: 1, desconto: 0, img: "/imagens/a.png" }]],
    ["produtos", [{ id: "1", categoria: "c", titulo: "t", descricao: "d", valor: "1", desconto: 0, img: "/imagens/a.png" }]],
    ["carrinho", [{ id: "1", produtos: [{ produto_id: "1", quantidade: "2" }], desconto: 0 }]],
    ["carrinho", [{ id: "1", desconto: 0 }]],
  ];
  for (const [nome, dados] of invalidos) {
    assert.throws(() => validarColecao(nome, dados), /Dados inválidos/, JSON.stringify(dados));
  }
});

test("gravação mantém o formato do arquivo e não deixa arquivo temporário", async () => {
  const token = await login(CLIENTE);
  await request(app).post("/carrinho/itens").set(bearer(token)).send({ produto_id: "1", quantidade: 2 });

  const conteudo = fs.readFileSync(arquivo("carrinho"), "utf-8");
  assert.deepEqual(JSON.parse(conteudo), [
    { id: "11111111-1111-4111-8111-111111111111", produtos: [{ produto_id: "1", quantidade: 2 }], desconto: 0 },
  ]);
  assert.equal(conteudo, JSON.stringify(JSON.parse(conteudo), null, 2));
  assert.equal(fs.existsSync(`${arquivo("carrinho")}.tmp`), false);
});

test("arquivo de dados inválido gera erro 500 sem detalhes internos e não é sobrescrito", async (t) => {
  const registro = t.mock.method(console, "error", () => undefined);
  const token = await login(ADMIN);
  const corrompido = JSON.stringify([{ id: "1", titulo: "Produto sem os demais campos" }]);
  fs.writeFileSync(arquivo("produtos"), corrompido);

  const leitura = await request(app).get("/produtos");
  assert.equal(leitura.status, 500);
  assert.deepEqual(leitura.body, { erro: "Erro interno do servidor" });

  const escrita = await request(app).patch("/produtos/1").set(bearer(token)).send({ valor: 1 });
  assert.equal(escrita.status, 500);
  assert.equal(fs.readFileSync(arquivo("produtos"), "utf-8"), corrompido);
  assert.equal(registro.mock.callCount(), 2);

  fs.rmSync(arquivo("produtos"));
  const restaurado = await request(app).get("/produtos/1");
  assert.equal(restaurado.status, 200);
});
