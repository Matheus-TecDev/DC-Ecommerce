const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const destino = path.join(raiz, ".env");

if (fs.existsSync(destino)) {
  console.log(".env já existe - nada foi alterado.");
} else {
  const segredo = crypto.randomBytes(48).toString("hex");
  const exemplo = fs.readFileSync(path.join(raiz, ".env.example"), "utf-8");
  fs.writeFileSync(destino, exemplo.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${segredo}`), { mode: 0o600 });
  console.log(".env criado com um JWT_SECRET aleatório.");
}
