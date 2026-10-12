const fs = require("fs/promises");
const path = require("path");
const config = require("../config");

const filas = new Map();

function caminho(nome) {
  return path.join(config.dataDir, `${nome}.json`);
}

async function ler(nome) {
  try {
    return JSON.parse(await fs.readFile(caminho(nome), "utf-8"));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    const seed = await fs.readFile(path.join(config.seedDir, `${nome}.json`), "utf-8");
    await fs.mkdir(config.dataDir, { recursive: true });
    await fs.writeFile(caminho(nome), seed);
    return JSON.parse(seed);
  }
}

async function gravar(nome, dados) {
  const temporario = `${caminho(nome)}.tmp`;
  await fs.writeFile(temporario, JSON.stringify(dados, null, 2));
  await fs.rename(temporario, caminho(nome));
}

function atualizar(nome, alterar) {
  const anterior = filas.get(nome) || Promise.resolve();
  const operacao = anterior
    .catch(() => {})
    .then(async () => {
      const dados = await ler(nome);
      const resultado = await alterar(dados);
      await gravar(nome, dados);
      return resultado;
    });
  filas.set(nome, operacao);
  return operacao;
}

module.exports = { ler, atualizar };
