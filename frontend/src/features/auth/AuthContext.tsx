import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, sessao, sessaoExpirada } from '../../services/api';
import type { Credenciais, UsuarioPublico, UsuarioSessao } from '../../types/modelos';

export type StatusSessao = 'restaurando' | 'anonimo' | 'autenticado';

type EstadoSessao =
  | { status: 'restaurando' | 'anonimo'; usuario: null }
  | { status: 'autenticado'; usuario: UsuarioSessao };

export interface AuthContextValue {
  status: StatusSessao;
  usuario: UsuarioSessao | null;
  entrar: (credenciais: Credenciais) => Promise<void>;
  sair: () => void;
}

const ANONIMO: EstadoSessao = { status: 'anonimo', usuario: null };
const RESTAURANDO: EstadoSessao = { status: 'restaurando', usuario: null };

const AuthContext = createContext<AuthContextValue | null>(null);

function paraUsuarioSessao(usuario: UsuarioPublico): UsuarioSessao {
  return { id: usuario.id, nome: usuario.user, email: usuario.email };
}

function autenticado(usuario: UsuarioPublico): EstadoSessao {
  return { status: 'autenticado', usuario: paraUsuarioSessao(usuario) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoSessao>(() => (sessao.token() ? RESTAURANDO : ANONIMO));

  const sair = useCallback(() => {
    sessao.limpar();
    setEstado(ANONIMO);
  }, []);

  const entrar = useCallback(async (credenciais: Credenciais) => {
    const { token } = await api.login(credenciais);
    sessao.salvar(token);
    setEstado(autenticado(await api.usuarioAtual()));
  }, []);

  useEffect(() => {
    if (!sessao.token()) return;
    let ativo = true;
    api
      .usuarioAtual()
      .then((usuario) => {
        if (ativo) setEstado(autenticado(usuario));
      })
      .catch((erro: unknown) => {
        if (!ativo) return;
        if (sessaoExpirada(erro)) {
          sair();
        } else {
          setEstado(ANONIMO);
        }
      });
    return () => {
      ativo = false;
    };
  }, [sair]);

  const valor = useMemo<AuthContextValue>(
    () => ({ status: estado.status, usuario: estado.usuario, entrar, sair }),
    [estado, entrar, sair]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return contexto;
}
