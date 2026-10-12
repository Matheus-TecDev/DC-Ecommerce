import crypto from "crypto";
import bcrypt from "bcrypt";
import { Router } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import jwt from "jsonwebtoken";
import config from "../config";
import { assincrono, corpo, erro, texto, usuarioAutenticado } from "../lib/http";
import * as store from "../lib/store";
import { SENHA, emailValido, normalizarEmail, semSenha, senhaValida } from "../lib/usuarios";
import { isAuthenticated } from "../middleware/isAuthenticated";
import type { RespostaLogin } from "../types/api";
import type { PayloadJwt, Usuario, UsuarioPublico } from "../types/modelos";

const router = Router();

const HASH_FICTICIO = bcrypt.hashSync("senha-inexistente", config.saltRounds);

router.post(
  "/signup",
  assincrono<ParamsDictionary, UsuarioPublico>(async (req, res) => {
    const body = corpo(req);
    const { user, password } = body;
    const email = normalizarEmail(body.email);

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
      const newUser: Usuario = {
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
  assincrono<ParamsDictionary, RespostaLogin>(async (req, res) => {
    const body = corpo(req);
    const { password } = body;
    const email = normalizarEmail(body.email);

    if (!email || typeof password !== "string" || !password) {
      throw erro(422, "Informe e-mail e senha");
    }

    const users = await store.ler("users");
    const user = users.find((u) => u.email === email);
    const senhaConfere = await bcrypt.compare(password, user ? user.password : HASH_FICTICIO);

    if (!user || !senhaConfere) {
      throw erro(401, "E-mail ou senha inválidos");
    }

    const payload: PayloadJwt = { sub: user.id };
    const token = jwt.sign(payload, config.jwtSecret, {
      algorithm: "HS256",
      expiresIn: config.jwtExpiresIn,
    });
    res.json({ auth: true, token, user: semSenha(user) });
  })
);

router.get<ParamsDictionary, UsuarioPublico>("/me", isAuthenticated, (req, res) => {
  res.json(usuarioAutenticado(req));
});

export default router;
