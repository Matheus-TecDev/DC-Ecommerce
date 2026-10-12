const { test } = require("node:test");
const assert = require("node:assert/strict");
const { app, request, login, bearer, CLIENTE, ADMIN } = require("./helpers");

test("carrinho exige autenticação em todas as rotas", async () => {
  const respostas = await Promise.all([
    request(app).get("/carrinho"),
    request(app).post("/carrinho/itens").send({ produto_id: "1" }),
    request(app).patch("/carrinho/itens/1").send({ quantidade: 2 }),
    request(app).delete("/carrinho/itens/1"),
    request(app).delete("/carrinho"),
  ]);
  for (const res of respostas) {
    assert.equal(res.status, 401);
  }
});

test("adiciona itens e calcula os valores com os preços do catálogo", async () => {
  const token = await login(CLIENTE);
  const [p1, p2] = (await request(app).get("/produtos")).body;

  await request(app).post("/carrinho/itens").set(bearer(token)).send({ produto_id: p1.id, valor: 0.01 });
  await request(app).post("/carrinho/itens").set(bearer(token)).send({ produto_id: p1.id });
  const res = await request(app).post("/carrinho/itens").set(bearer(token)).send({ produto_id: p2.id, quantidade: 3 });

  assert.deepEqual([p1.valor, p1.desconto, p2.valor, p2.desconto], [219, 0, 349.9, 15]);

  assert.equal(res.status, 200);
  assert.equal(res.body.itens.length, 2);
  assert.equal(res.body.itens[0].quantidade, 2);
  assert.equal(res.body.itens[1].valorUnitario, 297.42);
  assert.equal(res.body.quantidadeItens, 5);
  assert.equal(res.body.valorBruto, 1487.7);
  assert.equal(res.body.valorTotal, 1330.26);
  assert.equal(res.body.descontoTotal, 157.44);
});

test("altera a quantidade, remove um item e esvazia o carrinho", async () => {
  const token = await login(CLIENTE);

  const alterado = await request(app).patch("/carrinho/itens/1").set(bearer(token)).send({ quantidade: 5 });
  assert.equal(alterado.body.itens.find((i) => i.produto_id === "1").quantidade, 5);

  const removido = await request(app).delete("/carrinho/itens/1").set(bearer(token));
  assert.equal(removido.body.itens.some((i) => i.produto_id === "1"), false);

  const vazio = await request(app).delete("/carrinho").set(bearer(token));
  assert.deepEqual(vazio.body.itens, []);
  assert.equal(vazio.body.valorTotal, 0);
});

test("valida produto e quantidade", async () => {
  const token = await login(CLIENTE);
  const casos = [
    [{ produto_id: "9999" }, 404],
    [{}, 422],
    [{ produto_id: "1", quantidade: 0 }, 422],
    [{ produto_id: "1", quantidade: 1.5 }, 422],
    [{ produto_id: "1", quantidade: "2" }, 422],
    [{ produto_id: "1", quantidade: 1000 }, 422],
  ];
  for (const [corpo, status] of casos) {
    const res = await request(app).post("/carrinho/itens").set(bearer(token)).send(corpo);
    assert.equal(res.status, status, JSON.stringify(corpo));
  }

  const semItem = await request(app).patch("/carrinho/itens/1").set(bearer(token)).send({ quantidade: 2 });
  assert.equal(semItem.status, 404);
});

test("cada usuário enxerga somente o próprio carrinho", async () => {
  const cliente = await login(CLIENTE);
  const admin = await login(ADMIN);

  await request(app).post("/carrinho/itens").set(bearer(cliente)).send({ produto_id: "2" });

  const doAdmin = await request(app).get("/carrinho").set(bearer(admin));
  assert.deepEqual(doAdmin.body.itens, []);

  const doCliente = await request(app).get("/carrinho").set(bearer(cliente));
  assert.equal(doCliente.body.itens.length, 1);
});

test("adições simultâneas não se perdem", async () => {
  const token = await login(CLIENTE);
  await request(app).delete("/carrinho").set(bearer(token));

  await Promise.all(
    Array.from({ length: 10 }, () =>
      request(app).post("/carrinho/itens").set(bearer(token)).send({ produto_id: "3" })
    )
  );

  const res = await request(app).get("/carrinho").set(bearer(token));
  assert.equal(res.body.itens[0].quantidade, 10);
});
