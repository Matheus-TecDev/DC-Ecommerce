import cors from "cors";
import express from "express";
import type { ErrorRequestHandler, RequestHandler } from "express";
import logger from "morgan";
import config from "./config";
import { erro } from "./lib/http";
import carroCompras from "./routes/carrinhos";
import indexRouter from "./routes/index";
import produtosRouter from "./routes/produtos";
import userRouter from "./routes/users";
import userAuth from "./routes/usersAuth";
import type { RespostaErro } from "./types/api";

function propriedade(valor: unknown, nome: string): unknown {
  if (typeof valor !== "object" || valor === null) return undefined;
  return Reflect.get(valor, nome);
}

function statusDoErro(err: unknown): number {
  const status = propriedade(err, "status") || propriedade(err, "statusCode");
  return typeof status === "number" ? status : 500;
}

const rotaNaoEncontrada: RequestHandler = (_req, _res, next) => {
  next(erro(404, "Rota não encontrada"));
};

const tratarErro: ErrorRequestHandler<Record<string, string>, RespostaErro> = (err: unknown, _req, res, _next) => {
  if (propriedade(err, "type") === "entity.parse.failed") {
    res.status(400).json({ erro: "JSON inválido" });
    return;
  }
  const status = statusDoErro(err);
  if (status >= 500 || !(err instanceof Error)) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno do servidor" });
    return;
  }
  res.status(status).json({ erro: err.message });
};

const app = express();

app.disable("x-powered-by");
if (process.env.NODE_ENV !== "test") {
  app.use(logger("dev"));
}
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: "100kb" }));

app.use("/imagens", express.static(config.imagensDir));

app.use("/", indexRouter);
app.use("/produtos", produtosRouter);
app.use("/users", userRouter);
app.use("/carrinho", carroCompras);
app.use("/userauth", userAuth);

app.use(rotaNaoEncontrada);
app.use(tratarErro);

export default app;
