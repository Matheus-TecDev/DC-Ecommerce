const fs = require("fs");
const os = require("os");
const path = require("path");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "segredo-usado-somente-nos-testes-automatizados";
process.env.SALT_HASH = "4";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "dc-ecommerce-test-"));

const request = require("supertest");
const app = require("../app");

const CLIENTE = { email: "cliente@digitalstore.example", password: "cliente-demo-123" };
const ADMIN = { email: "admin@digitalstore.example", password: "admin-demo-123" };

async function login(credenciais) {
  const res = await request(app).post("/userauth/login").send(credenciais);
  return res.body.token;
}

function bearer(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = { app, request, login, bearer, CLIENTE, ADMIN, dataDir: process.env.DATA_DIR };
