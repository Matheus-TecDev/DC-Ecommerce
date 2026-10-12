const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { app, request, login, bearer, CLIENTE, dataDir } = require("./helpers");

const NOVO = { user: "Maria Teste", email: "maria@teste.example", password: "senha-segura-1" };

test("cadastro cria o usuário, não devolve a senha e a armazena com hash bcrypt", async () => {
  const res = await request(app).post("/userauth/signup").send(NOVO);

  assert.equal(res.status, 201);
  assert.equal(res.body.email, NOVO.email);
  assert.equal(res.body.role, "customer");
  assert.equal(res.body.password, undefined);

  const salvos = JSON.parse(fs.readFileSync(path.join(dataDir, "users.json"), "utf-8"));
  const salvo = salvos.find((u) => u.email === NOVO.email);
  assert.match(salvo.password, /^\$2[aby]\$/);
  assert.notEqual(salvo.password, NOVO.password);
});

test("cadastro recusa e-mail repetido", async () => {
  const res = await request(app)
    .post("/userauth/signup")
    .send({ ...NOVO, email: "MARIA@teste.example" });
  assert.equal(res.status, 409);
});

test("cadastro valida nome, e-mail e senha", async () => {
  const invalidos = [
    {},
    { ...NOVO, email: "sem-arroba" },
    { ...NOVO, email: "outra@teste.example", password: "curta" },
    { ...NOVO, email: "outra@teste.example", user: "" },
    { ...NOVO, email: "outra@teste.example", password: { $ne: "" } },
  ];
  for (const corpo of invalidos) {
    const res = await request(app).post("/userauth/signup").send(corpo);
    assert.equal(res.status, 422, JSON.stringify(corpo));
    assert.equal(typeof res.body.erro, "string");
  }
});

test("cadastro ignora tentativa de definir o papel de administrador", async () => {
  const res = await request(app)
    .post("/userauth/signup")
    .send({ user: "Esperto", email: "esperto@teste.example", password: "senha-segura-1", role: "admin" });
  assert.equal(res.status, 201);
  assert.equal(res.body.role, "customer");
});

test("login com credenciais válidas devolve um JWT e o usuário sem a senha", async () => {
  const res = await request(app).post("/userauth/login").send(CLIENTE);

  assert.equal(res.status, 200);
  assert.equal(res.body.auth, true);
  assert.equal(res.body.user.email, CLIENTE.email);
  assert.equal(res.body.user.password, undefined);
  assert.equal(res.body.token.split(".").length, 3);
});

test("login recusa senha errada e e-mail inexistente com a mesma resposta", async () => {
  const senhaErrada = await request(app)
    .post("/userauth/login")
    .send({ email: CLIENTE.email, password: "senha-errada-123" });
  const emailInexistente = await request(app)
    .post("/userauth/login")
    .send({ email: "ninguem@teste.example", password: "senha-errada-123" });

  assert.equal(senhaErrada.status, 401);
  assert.equal(emailInexistente.status, 401);
  assert.deepEqual(senhaErrada.body, emailInexistente.body);
});

test("login sem os campos obrigatórios responde 422", async () => {
  const res = await request(app).post("/userauth/login").send({});
  assert.equal(res.status, 422);
});

test("rota protegida devolve o usuário do token (Bearer e x-access-token)", async () => {
  const token = await login(CLIENTE);

  const comBearer = await request(app).get("/userauth/me").set(bearer(token));
  assert.equal(comBearer.status, 200);
  assert.equal(comBearer.body.email, CLIENTE.email);

  const comHeaderLegado = await request(app).get("/userauth/me").set("x-access-token", token);
  assert.equal(comHeaderLegado.status, 200);
});

test("rota protegida bloqueia requisição sem token", async () => {
  const res = await request(app).get("/userauth/me");
  assert.equal(res.status, 401);
  assert.equal(res.body.email, undefined);
});

test("rota protegida bloqueia token adulterado, expirado ou de outro segredo", async () => {
  const token = await login(CLIENTE);
  const sub = jwt.decode(token).sub;
  const tokens = [
    "nao-e-um-jwt",
    token.slice(0, -3) + "abc",
    jwt.sign({ sub }, "outro-segredo-qualquer-com-mais-de-32-caracteres"),
    jwt.sign({ sub }, process.env.JWT_SECRET, { expiresIn: -10 }),
    `${Buffer.from('{"alg":"none","typ":"JWT"}').toString("base64url")}.${Buffer.from(
      JSON.stringify({ sub })
    ).toString("base64url")}.`,
  ];
  for (const invalido of tokens) {
    const res = await request(app).get("/userauth/me").set(bearer(invalido));
    assert.equal(res.status, 401, invalido);
    assert.equal(res.body.email, undefined);
  }
});

test("token de uma conta removida deixa de ser aceito", async () => {
  const credenciais = { email: "temporario@teste.example", password: "senha-segura-1" };
  const cadastro = await request(app)
    .post("/userauth/signup")
    .send({ user: "Temporário", ...credenciais });
  const token = await login(credenciais);

  const remocao = await request(app).delete(`/users/${cadastro.body.id}`).set(bearer(token));
  assert.equal(remocao.status, 200);

  const res = await request(app).get("/userauth/me").set(bearer(token));
  assert.equal(res.status, 401);
});
