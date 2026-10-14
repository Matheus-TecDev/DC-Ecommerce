import { render } from '@testing-library/react';
import { useAuth } from './AuthContext';
import { useCarrinho } from './CartContext';
import { useSearch } from './SearchContext';

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
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
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
