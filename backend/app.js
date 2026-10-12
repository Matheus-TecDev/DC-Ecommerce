const path = require("path");
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const config = require("./config");
const { erro } = require("./lib/http");

const indexRouter = require("./routes/index");
const produtosRouter = require("./routes/produtos");
const userRouter = require("./routes/users");
const carroCompras = require("./routes/carrinhos");
const userAuth = require("./routes/usersAuth");

const app = express();

app.disable("x-powered-by");
if (process.env.NODE_ENV !== "test") {
  app.use(logger("dev"));
}
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: "100kb" }));

app.use("/imagens", express.static(path.join(__dirname, "public", "imagens")));

app.use("/", indexRouter);
app.use("/produtos", produtosRouter);
app.use("/users", userRouter);
app.use("/carrinho", carroCompras);
app.use("/userauth", userAuth);

app.use(function (req, res, next) {
  next(erro(404, "Rota não encontrada"));
});

app.use(function (err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido" });
  }
  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
  res.status(status).json({ erro: err.message });
});

module.exports = app;
