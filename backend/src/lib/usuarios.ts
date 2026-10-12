import type { Usuario, UsuarioPublico } from "../types/modelos";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SENHA = { min: 8, max: 72 } as const;

export function normalizarEmail(email: unknown): string {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function emailValido(email: string): boolean {
  return email.length <= 254 && EMAIL.test(email);
}

export function senhaValida(password: unknown): password is string {
  return typeof password === "string" && password.length >= SENHA.min && password.length <= SENHA.max;
}

export function semSenha({ password, ...publico }: Usuario): UsuarioPublico {
  return publico;
}
