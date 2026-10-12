import type { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { assincrono, erro, objeto, usuarioAutenticado } from "../lib/http";
import * as store from "../lib/store";
import type { PayloadJwt } from "../types/modelos";

function extrairToken(req: Request): unknown {
  const authorization = req.headers.authorization || "";
  if (authorization.startsWith("Bearer ")) {
    return authorization.slice(7).trim();
  }
  return req.headers["x-access-token"];
}

function ehPayloadJwt(valor: unknown): valor is PayloadJwt {
  return objeto(valor) && typeof valor.sub === "string";
}

function verificarToken(token: string): PayloadJwt {
  let payload: unknown;
  try {
    payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
  } catch {
    throw erro(401, "Token inválido ou expirado");
  }
  if (!ehPayloadJwt(payload)) {
    throw erro(401, "Token inválido ou expirado");
  }
  return payload;
}

export const isAuthenticated: RequestHandler = assincrono(async (req, _res, next) => {
  const token = extrairToken(req);
  if (!token || typeof token !== "string") {
    throw erro(401, "Token não fornecido");
  }

  const payload = verificarToken(token);

  const users = await store.ler("users");
  const user = users.find((u) => u.id === payload.sub);
  if (!user) {
    throw erro(401, "Token inválido ou expirado");
  }

  req.user = { id: user.id, user: user.user, email: user.email, role: user.role };
  next();
});

export const isAdmin: RequestHandler = (req, _res, next) => {
  if (usuarioAutenticado(req).role !== "admin") {
    return next(erro(403, "Acesso restrito a administradores"));
  }
  next();
};
