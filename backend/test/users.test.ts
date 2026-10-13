import assert from "node:assert/strict";
import { test } from "node:test";
import { ADMIN, CLIENTE, app, bearer, login, request } from "./helpers";

const ID_CLIENTE = "11111111-1111-4111-8111-111111111111";
const ID_ADMIN = "22222222-2222-4222-8222-222222222222";

test("rotas de usuários exigem autenticação", async () => {
  const respostas = await Promise.all([
    request(app).get("/users"),
    request(app).get(`/users/${ID_CLIENTE}`),
    request(app).patch(`/users/${ID_CLIENTE}`).send({ user: "Invasor" }),
    request(app).delete(`/users/${ID_CLIENTE}`),
  ]);
  for (const res of respostas) {
    assert.equal(res.status, 401);
  }
});

test("somente administradores listam os usuários, e nunca com a senha", async () => {
  const negado = await request(app).get("/users").set(bearer(await login(CLIENTE)));
  assert.equal(negado.status, 403);

  const lista = await request(app).get("/users").set(bearer(await login(ADMIN)));
  assert.equal(lista.status, 200);
  assert.ok(lista.body.length >= 2);
  const usuarios: Record<string, unknown>[] = lista.body;
  assert.ok(usuarios.every((u) => u.password === undefined));
});

test("usuário acessa a própria conta, mas não a de outra pessoa", async () => {
  const token = await login(CLIENTE);

  const propria = await request(app).get(`/users/${ID_CLIENTE}`).set(bearer(token));
  assert.equal(propria.status, 200);
  assert.equal(propria.body.email, CLIENTE.email);
  assert.equal(propria.body.password, undefined);

  const alheia = await request(app).get(`/users/${ID_ADMIN}`).set(bearer(token));
  assert.equal(alheia.status, 403);

  const alterarAlheia = await request(app).patch(`/users/${ID_ADMIN}`).set(bearer(token)).send({ user: "Invasor" });
  assert.equal(alterarAlheia.status, 403);
});

test("atualização não permite promover a própria conta a administrador", async () => {
  const token = await login(CLIENTE);
  const res = await request(app)
    .patch(`/users/${ID_CLIENTE}`)
    .set(bearer(token))
    .send({ user: "Cliente Renomeado", role: "admin", id: "outro-id" });

  assert.equal(res.status, 200);
  assert.equal(res.body.user, "Cliente Renomeado");
  assert.equal(res.body.role, "customer");
  assert.equal(res.body.id, ID_CLIENTE);
});

test("troca de senha grava o novo hash e invalida a senha antiga", async () => {
  const token = await login(CLIENTE);
  const nova = "nova-senha-segura-9";

  const res = await request(app).patch(`/users/${ID_CLIENTE}`).set(bearer(token)).send({ password: nova });
  assert.equal(res.status, 200);

  const antiga = await request(app).post("/userauth/login").send(CLIENTE);
  assert.equal(antiga.status, 401);
  const atual = await request(app).post("/userauth/login").send({ email: CLIENTE.email, password: nova });
  assert.equal(atual.status, 200);
});

test("atualização valida os campos e recusa e-mail de outro usuário", async () => {
  const token = await login(ADMIN);

  const vazio = await request(app).patch(`/users/${ID_ADMIN}`).set(bearer(token)).send({});
  assert.equal(vazio.status, 400);

  const senhaCurta = await request(app).patch(`/users/${ID_ADMIN}`).set(bearer(token)).send({ password: "123" });
  assert.equal(senhaCurta.status, 422);

  const emailRepetido = await request(app)
    .patch(`/users/${ID_ADMIN}`)
    .set(bearer(token))
    .send({ email: CLIENTE.email });
  assert.equal(emailRepetido.status, 409);
});
