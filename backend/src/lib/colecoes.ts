import type { Carrinho, Colecoes, ItemCarrinho, NomeColecao, Produto, Usuario } from "../types/modelos";
import { objeto } from "./http";

function ehUsuario(valor: unknown): valor is Usuario {
  return (
    objeto(valor) &&
    typeof valor.id === "string" &&
    typeof valor.user === "string" &&
    typeof valor.email === "string" &&
    typeof valor.password === "string" &&
    (valor.role === "customer" || valor.role === "admin")
  );
}

function ehProduto(valor: unknown): valor is Produto {
  return (
    objeto(valor) &&
    typeof valor.id === "string" &&
    typeof valor.categoria === "string" &&
    typeof valor.titulo === "string" &&
    typeof valor.descricao === "string" &&
    typeof valor.img === "string" &&
    typeof valor.valor === "number" &&
    Number.isFinite(valor.valor) &&
    typeof valor.desconto === "number" &&
    Number.isFinite(valor.desconto)
  );
}

function ehItemCarrinho(valor: unknown): valor is ItemCarrinho {
  return objeto(valor) && typeof valor.produto_id === "string" && Number.isInteger(valor.quantidade);
}

function ehCarrinho(valor: unknown): valor is Carrinho {
  return (
    objeto(valor) &&
    typeof valor.id === "string" &&
    typeof valor.desconto === "number" &&
    Number.isFinite(valor.desconto) &&
    Array.isArray(valor.produtos) &&
    valor.produtos.every(ehItemCarrinho)
  );
}

function lista<T>(ehRegistro: (valor: unknown) => valor is T) {
  return (dados: unknown): dados is T[] => Array.isArray(dados) && dados.every(ehRegistro);
}

const VALIDADORES: { [N in NomeColecao]: (dados: unknown) => dados is Colecoes[N] } = {
  users: lista(ehUsuario),
  produtos: lista(ehProduto),
  carrinho: lista(ehCarrinho),
};

export function validarColecao<N extends NomeColecao>(nome: N, dados: unknown): Colecoes[N] {
  const valido: (dados: unknown) => dados is Colecoes[N] = VALIDADORES[nome];
  if (!valido(dados)) {
    throw new Error(`Dados inválidos na coleção "${nome}"`);
  }
  return dados;
}
