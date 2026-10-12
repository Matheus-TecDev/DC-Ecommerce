import path from "path";
import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

type DuracaoJwt = Extract<NonNullable<SignOptions["expiresIn"]>, string>;

const DURACAO =
  /^-?\d*\.?\d+ *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i;

function duracaoValida(valor: string): valor is DuracaoJwt {
  return valor.length <= 100 && DURACAO.test(valor);
}

const raiz = path.join(__dirname, "..");

dotenv.config({ path: path.join(raiz, "..", ".env"), quiet: true });

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error(
    "JWT_SECRET ausente ou curto demais (mínimo de 32 caracteres). " +
      "Rode `npm run setup` na raiz do projeto ou defina a variável de ambiente."
  );
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";
if (!duracaoValida(jwtExpiresIn)) {
  throw new Error("JWT_EXPIRES_IN inválido. Use uma duração como 15m, 1h ou 7d.");
}

const saltRounds = Number.parseInt(process.env.SALT_HASH ?? "", 10);

export interface Configuracao {
  port: string;
  jwtSecret: string;
  jwtExpiresIn: DuracaoJwt;
  saltRounds: number;
  corsOrigins: string[];
  dataDir: string;
  seedDir: string;
  imagensDir: string;
}

const config: Configuracao = {
  port: process.env.PORT || "3001",
  jwtSecret,
  jwtExpiresIn,
  saltRounds: saltRounds >= 4 && saltRounds <= 15 ? saltRounds : 10,
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origem) => origem.trim())
    .filter(Boolean),
  dataDir: process.env.DATA_DIR || path.join(raiz, "data"),
  seedDir: path.join(raiz, "data", "seed"),
  imagensDir: path.join(raiz, "public", "imagens"),
};

export default config;
