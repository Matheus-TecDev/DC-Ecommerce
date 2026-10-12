const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error(
    "JWT_SECRET ausente ou curto demais (mínimo de 32 caracteres). " +
      "Rode `npm run setup` na raiz do projeto ou defina a variável de ambiente."
  );
}

const saltRounds = Number.parseInt(process.env.SALT_HASH, 10);

module.exports = {
  port: process.env.PORT || "3001",
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  saltRounds: saltRounds >= 4 && saltRounds <= 15 ? saltRounds : 10,
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origem) => origem.trim())
    .filter(Boolean),
  dataDir: process.env.DATA_DIR || path.join(__dirname, "data"),
  seedDir: path.join(__dirname, "data", "seed"),
};
