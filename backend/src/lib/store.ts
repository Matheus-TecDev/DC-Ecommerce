import fs from "fs/promises";
import path from "path";
import config from "../config";
import type { Colecoes, NomeColecao } from "../types/modelos";
import { validarColecao } from "./colecoes";

const filas = new Map<NomeColecao, Promise<unknown>>();

function caminho(nome: NomeColecao): string {
  return path.join(config.dataDir, `${nome}.json`);
}

function arquivoInexistente(err: unknown): boolean {
  return err instanceof Error && "code" in err && err.code === "ENOENT";
}

function interpretar<N extends NomeColecao>(nome: N, conteudo: string): Colecoes[N] {
  const dados: unknown = JSON.parse(conteudo);
  return validarColecao(nome, dados);
}

async function lerArquivo(nome: NomeColecao): Promise<string | undefined> {
  try {
    return await fs.readFile(caminho(nome), "utf-8");
  } catch (err) {
    if (!arquivoInexistente(err)) throw err;
    return undefined;
  }
}

export async function ler<N extends NomeColecao>(nome: N): Promise<Colecoes[N]> {
  const conteudo = await lerArquivo(nome);
  if (conteudo !== undefined) {
    return interpretar(nome, conteudo);
  }
  const seed = await fs.readFile(path.join(config.seedDir, `${nome}.json`), "utf-8");
  await fs.mkdir(config.dataDir, { recursive: true });
  await fs.writeFile(caminho(nome), seed);
  return interpretar(nome, seed);
}

async function gravar<N extends NomeColecao>(nome: N, dados: Colecoes[N]): Promise<void> {
  const temporario = `${caminho(nome)}.tmp`;
  await fs.writeFile(temporario, JSON.stringify(dados, null, 2));
  await fs.rename(temporario, caminho(nome));
}

export function atualizar<N extends NomeColecao, R>(
  nome: N,
  alterar: (dados: Colecoes[N]) => R | Promise<R>
): Promise<R> {
  const anterior = filas.get(nome) ?? Promise.resolve();
  const operacao = anterior
    .catch(() => undefined)
    .then(async () => {
      const dados = await ler(nome);
      const resultado = await alterar(dados);
      await gravar(nome, dados);
      return resultado;
    });
  filas.set(nome, operacao);
  return operacao;
}
