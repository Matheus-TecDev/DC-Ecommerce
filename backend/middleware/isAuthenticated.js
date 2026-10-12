const jwt = require("jsonwebtoken");
const config = require("../config");
const store = require("../lib/store");
const { erro, assincrono } = require("../lib/http");

function extrairToken(req) {
  const authorization = req.headers.authorization || "";
  if (authorization.startsWith("Bearer ")) {
    return authorization.slice(7).trim();
  }
  return req.headers["x-access-token"];
}

exports.isAuthenticated = assincrono(async (req, res, next) => {
  const token = extrairToken(req);
  if (!token || typeof token !== "string") {
    throw erro(401, "Token não fornecido");
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
  } catch {
    throw erro(401, "Token inválido ou expirado");
  }

  const users = await store.ler("users");
  const user = users.find((u) => u.id === payload.sub);
  if (!user) {
    throw erro(401, "Token inválido ou expirado");
  }

  req.user = { id: user.id, user: user.user, email: user.email, role: user.role };
  next();
});

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(erro(403, "Acesso restrito a administradores"));
  }
  next();
};
