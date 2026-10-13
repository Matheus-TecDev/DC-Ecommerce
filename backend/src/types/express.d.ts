import type { UsuarioPublico } from "./modelos";

declare global {
  namespace Express {
    interface Request {
      user?: UsuarioPublico;
    }
  }
}
