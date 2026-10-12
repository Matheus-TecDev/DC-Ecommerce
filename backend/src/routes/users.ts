import bcrypt from "bcrypt";
import { Router } from "express";
import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import config from "../config";
import { assincrono, corpo, erro, texto, usuarioAutenticado } from "../lib/http";
import * as store from "../lib/store";
import { SENHA, emailValido, normalizarEmail, semSenha, senhaValida } from "../lib/usuarios";
import { isAdmin, isAuthenticated } from "../middleware/isAuthenticated";
import type { ParametroId } from "../types/api";
import type { UsuarioPublico } from "../types/modelos";

const router = Router();

router.use(isAuthenticated);

const donoOuAdmin: RequestHandler<ParametroId> = (req, _res, next) => {
  const autenticado = usuarioAutenticado(req);
  if (autenticado.id !== req.params.id && autenticado.role !== "admin") {
    return next(erro(403, "Você não tem permissão para acessar este usuário"));
  }
  next();
};

router.get(
  "/",
  isAdmin,
  assincrono<ParamsDictionary, UsuarioPublico[]>(async (_req, res) => {
    const users = await store.ler("users");
    res.json(users.map(semSenha));
  })
);

router.get(
  "/:id",
  donoOuAdmin,
  assincrono<ParametroId, UsuarioPublico>(async (req, res) => {
    const users = await store.ler("users");
    const usuarioSelecionado = users.find((usuario) => usuario.id === req.params.id);
    if (!usuarioSelecionado) {
      throw erro(404, "Usuário não encontrado");
    }
    res.json(semSenha(usuarioSelecionado));
  })
);

const update = assincrono<ParametroId, UsuarioPublico>(async (req, res) => {
  const body = corpo(req);
  const { user, password } = body;
  const email = body.email === undefined ? undefined : normalizarEmail(body.email);

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
  assincrono<ParametroId, UsuarioPublico>(async (req, res) => {
    const deletedUser = await store.atualizar("users", (users) => {
      const indice = users.findIndex((u) => u.id === req.params.id);
      const [removido] = indice === -1 ? [] : users.splice(indice, 1);
      if (!removido) {
        throw erro(404, "Usuário não encontrado");
      }
      return removido;
    });

    await store.atualizar("carrinho", (carrinhos) => {
      const indice = carrinhos.findIndex((c) => c.id === deletedUser.id);
      if (indice !== -1) carrinhos.splice(indice, 1);
    });

    res.json(semSenha(deletedUser));
  })
);

export default router;
