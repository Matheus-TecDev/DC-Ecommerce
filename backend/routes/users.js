const express = require("express");
const bcrypt = require("bcrypt");
const config = require("../config");
const store = require("../lib/store");
const { erro, assincrono, texto } = require("../lib/http");
const { isAuthenticated, isAdmin } = require("../middleware/isAuthenticated");
const { normalizarEmail, emailValido, senhaValida, semSenha, SENHA } = require("../lib/usuarios");

const router = express.Router();

router.use(isAuthenticated);

function donoOuAdmin(req, res, next) {
  if (req.user.id !== req.params.id && req.user.role !== "admin") {
    return next(erro(403, "Você não tem permissão para acessar este usuário"));
  }
  next();
}

router.get(
  "/",
  isAdmin,
  assincrono(async (req, res) => {
    const users = await store.ler("users");
    res.json(users.map(semSenha));
  })
);

router.get(
  "/:id",
  donoOuAdmin,
  assincrono(async (req, res) => {
    const users = await store.ler("users");
    const usuarioSelecionado = users.find((usuario) => usuario.id === req.params.id);
    if (!usuarioSelecionado) {
      throw erro(404, "Usuário não encontrado");
    }
    res.json(semSenha(usuarioSelecionado));
  })
);

const update = assincrono(async (req, res) => {
  const { user, password } = req.body;
  const email = req.body.email === undefined ? undefined : normalizarEmail(req.body.email);

  if (user === undefined && email === undefined && password === undefined) {
    throw erro(400, "Envie ao menos um campo para atualizar: user, email ou password");
  }
  if (user !== undefined && !texto(user, { min: 2, max: 80 })) {
    throw erro(422, "Informe um nome com 2 a 80 caracteres");
  }
  if (email !== undefined && !emailValido(email)) {
    throw erro(422, "Informe um e-mail válido");
  }
  if (password !== undefined && !senhaValida(password)) {
    throw erro(422, `A senha deve ter de ${SENHA.min} a ${SENHA.max} caracteres`);
  }

  const passwordHashed = password === undefined ? undefined : await bcrypt.hash(password, config.saltRounds);

  const atualizado = await store.atualizar("users", (users) => {
    const updatedUser = users.find((u) => u.id === req.params.id);
    if (!updatedUser) {
      throw erro(404, "Usuário não encontrado");
    }
    if (email !== undefined && users.some((u) => u.email === email && u.id !== updatedUser.id)) {
      throw erro(409, "E-mail já utilizado por outro usuário");
    }
    if (user !== undefined) updatedUser.user = user.trim();
    if (email !== undefined) updatedUser.email = email;
    if (passwordHashed !== undefined) updatedUser.password = passwordHashed;
    return updatedUser;
  });

  res.json(semSenha(atualizado));
});

router.put("/:id", donoOuAdmin, update);
router.patch("/:id", donoOuAdmin, update);

router.delete(
  "/:id",
  donoOuAdmin,
  assincrono(async (req, res) => {
    const deletedUser = await store.atualizar("users", (users) => {
      const indice = users.findIndex((u) => u.id === req.params.id);
      if (indice === -1) {
        throw erro(404, "Usuário não encontrado");
      }
      return users.splice(indice, 1)[0];
    });

    await store.atualizar("carrinho", (carrinhos) => {
      const indice = carrinhos.findIndex((c) => c.id === deletedUser.id);
      if (indice !== -1) carrinhos.splice(indice, 1);
    });

    res.json(semSenha(deletedUser));
  })
);

module.exports = router;
