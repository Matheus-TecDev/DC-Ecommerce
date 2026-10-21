import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useAuth } from './auth/AuthContext';
import { useCarrinho } from './carrinho/CartContext';
import { useSearch } from './produtos/SearchContext';

function ConsumidorAuth() {
  useAuth();
  return null;
}

function ConsumidorCarrinho() {
  useCarrinho();
  return null;
}

function ConsumidorBusca() {
  useSearch();
  return null;
}

describe('hooks de contexto fora do provider', () => {
  function erroEsperado(evento: ErrorEvent): void {
    evento.preventDefault();
  }

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    window.addEventListener('error', erroEsperado);
  });

  afterEach(() => {
    window.removeEventListener('error', erroEsperado);
  });

  test('useAuth falha com uma mensagem clara', () => {
    expect(() => render(<ConsumidorAuth />)).toThrow('useAuth deve ser usado dentro de AuthProvider');
  });

  test('useCarrinho falha com uma mensagem clara', () => {
    expect(() => render(<ConsumidorCarrinho />)).toThrow('useCarrinho deve ser usado dentro de CartProvider');
  });

  test('useSearch falha com uma mensagem clara', () => {
    expect(() => render(<ConsumidorBusca />)).toThrow('useSearch deve ser usado dentro de SearchProvider');
  });
});
