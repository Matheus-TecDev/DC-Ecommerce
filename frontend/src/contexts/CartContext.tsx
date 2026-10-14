import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { api, sessaoExpirada } from '../services/api';
import type { CarrinhoDetalhado } from '../types/modelos';
import { useAuth } from './AuthContext';

export interface CartContextValue {
  carrinho: CarrinhoDetalhado;
  adicionar: (produtoId: string) => Promise<void>;
  alterarQuantidade: (produtoId: string, quantidade: number) => Promise<void>;
  remover: (produtoId: string) => Promise<void>;
  esvaziar: () => Promise<void>;
}

const CARRINHO_VAZIO: CarrinhoDetalhado = {
  itens: [],
  quantidadeItens: 0,
  valorBruto: 0,
  descontoCarrinho: 0,
  descontoTotal: 0,
  valorTotal: 0,
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { usuario, sair } = useAuth();
  const [carrinho, setCarrinho] = useState<CarrinhoDetalhado>(CARRINHO_VAZIO);
  const ultimaChamada = useRef(0);
  const usuarioId = usuario?.id ?? null;

  const sincronizar = useCallback(
    async (chamada: () => Promise<CarrinhoDetalhado>) => {
      const identificador = ++ultimaChamada.current;
      try {
        const atualizado = await chamada();
        if (identificador === ultimaChamada.current) setCarrinho(atualizado);
      } catch (erro) {
        if (sessaoExpirada(erro)) sair();
        throw erro;
      }
    },
    [sair]
  );

  useEffect(() => {
    if (usuarioId === null) {
      ultimaChamada.current += 1;
      setCarrinho(CARRINHO_VAZIO);
      return;
    }
    sincronizar(api.carrinho).catch(() => undefined);
  }, [usuarioId, sincronizar]);

  const valor = useMemo<CartContextValue>(
    () => ({
      carrinho,
      adicionar: (produtoId) => sincronizar(() => api.adicionarAoCarrinho(produtoId)),
      alterarQuantidade: (produtoId, quantidade) =>
        sincronizar(() => api.alterarQuantidade(produtoId, quantidade)),
      remover: (produtoId) => sincronizar(() => api.removerDoCarrinho(produtoId)),
      esvaziar: () => sincronizar(api.esvaziarCarrinho),
    }),
    [carrinho, sincronizar]
  );

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export function useCarrinho(): CartContextValue {
  const contexto = useContext(CartContext);
  if (!contexto) {
    throw new Error('useCarrinho deve ser usado dentro de CartProvider');
  }
  return contexto;
}
