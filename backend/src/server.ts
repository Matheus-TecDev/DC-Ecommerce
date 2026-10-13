import http from "http";
import app from "./app";
import config from "./config";

function normalizarPorta(valor: string): number | string | false {
  const numero = Number.parseInt(valor, 10);
  if (Number.isNaN(numero)) return valor;
  return numero >= 0 ? numero : false;
}

const porta = normalizarPorta(config.port);
app.set("port", porta);

const server = http.createServer(app);

function aoFalhar(error: NodeJS.ErrnoException): void {
  if (error.syscall !== "listen") {
    throw error;
  }

  const destino = typeof porta === "string" ? `Pipe ${porta}` : `Port ${porta}`;

  switch (error.code) {
    case "EACCES":
      console.error(`${destino} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${destino} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function aoOuvir(): void {
  const endereco = server.address();
  const destino = typeof endereco === "string" ? `pipe ${endereco}` : `port ${endereco?.port ?? porta}`;
  console.log(`Digital Store API ouvindo em ${destino}`);
}

server.listen(porta);
server.on("error", aoFalhar);
server.on("listening", aoOuvir);
