const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");
const store = require("../lib/store");
const { erro, assincrono, texto } = require("../lib/http");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const { SENHA, normalizarEmail, emailValido, senhaValida, semSenha } = require("../lib/usuarios");

const router = express.Router();

const HASH_FICTICIO = bcrypt.hashSync("senha-inexistente", config.saltRounds);

router.post(
  "/signup",
  assincrono(async (req, res) => {
    const { user, password } = req.body;
    const email = normalizarEmail(req.body.email);

    if (!texto(user, { min: 2, max: 80 })) {
      throw erro(422, "Informe um nome com 2 a 80 caracteres");
    }
    if (!emailValido(email)) {
      throw erro(422, "Informe um e-mail válido");
    }
    if (!senhaValida(password)) {
      throw erro(422, `A senha deve ter de ${SENHA.min} a ${SENHA.max} caracteres`);
    }

    const passwordHashed = await bcrypt.hash(password, config.saltRounds);

    const novo = await store.atualizar("users", (users) => {
      if (users.some((u) => u.email === email)) {
        throw erro(409, "Usuário já existente");
      }
      const newUser = {
        id: crypto.randomUUID(),
        user: user.trim(),
        email,
        password: passwordHashed,
        role: "customer",
      };
      users.push(newUser);
      return newUser;
    });

    res.status(201).json(semSenha(novo));
  })
);

router.post(
  "/login",
  assincrono(async (req, res) => {
    const { password } = req.body;
    const email = normalizarEmail(req.body.email);

    if (!email || typeof password !== "string" || !password) {
      throw erro(422, "Informe e-mail e senha");
    }

    const users = await store.ler("users");
    const user = users.find((u) => u.email === email);
    const senhaConfere = await bcrypt.compare(password, user ? user.password : HASH_FICTICIO);

    if (!user || !senhaConfere) {
      throw erro(401, "E-mail ou senha inválidos");
    }

    const token = jwt.sign({ sub: user.id }, config.jwtSecret, {
      algorithm: "HS256",
      expiresIn: config.jwtExpiresIn,
    });
    res.json({ auth: true, token, user: semSenha(user) });
  })
);

router.get("/me", isAuthenticated, (req, res) => {
  res.json(req.user);
});

module.exports = router;
