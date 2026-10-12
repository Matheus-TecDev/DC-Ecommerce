import { SEGREDO, dataDir } from "./ambiente";
import request from "supertest";
import app from "../src/app";
import type { Credenciais } from "../src/types/modelos";

export const CLIENTE: Credenciais = { email: "cliente@digitalstore.example", password: "cliente-demo-123" };
export const ADMIN: Credenciais = { email: "admin@digitalstore.example", password: "admin-demo-123" };

export async function login(credenciais: Credenciais): Promise<string> {
  const res = await request(app).post("/userauth/login").send(credenciais);
  if (typeof res.body.token !== "string") {
    throw new Error(`Login falhou para ${credenciais.email} (status ${res.status})`);
  }
  return res.body.token;
}

export function bearer(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export { app, request, dataDir, SEGREDO };
