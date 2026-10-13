import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { UsuarioPublico } from "../types/modelos";

export class ErroHttp extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = "ErroHttp";
    this.status = status;
  }
}

export function erro(status: number, mensagem: string): ErroHttp {
  return new ErroHttp(status, mensagem);
}

export type Corpo = Record<string, unknown>;

export function objeto(valor: unknown): valor is Corpo {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

export function corpo(req: { body: unknown }): Corpo {
  return objeto(req.body) ? req.body : {};
}

export function usuarioAutenticado(req: Pick<Request, "user">): UsuarioPublico {
  if (!req.user) {
    throw erro(401, "Token não fornecido");
  }
  return req.user;
}

export function assincrono<P = ParamsDictionary, Resposta = unknown>(
  handler: (req: Request<P, Resposta, unknown>, res: Response<Resposta>, next: NextFunction) => unknown
): RequestHandler<P, Resposta, unknown> {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

interface Limites {
  min?: number;
  max?: number;
}

export function texto(valor: unknown, { min = 1, max = 200 }: Limites = {}): valor is string {
  if (typeof valor !== "string") return false;
  const tamanho = valor.trim().length;
  return tamanho >= min && tamanho <= max;
}

export function numero(valor: unknown, { min = 0, max = Number.MAX_SAFE_INTEGER }: Limites = {}): valor is number {
  return typeof valor === "number" && Number.isFinite(valor) && valor >= min && valor <= max;
}
