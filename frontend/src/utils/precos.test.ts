import { describe, expect, test } from 'vitest';
import { formatarPreco, precoComDesconto } from './precos';

describe('precoComDesconto', () => {
  test('mantém o valor quando não há desconto', () => {
    expect(precoComDesconto({ valor: 219, desconto: 0 })).toBe(219);
  });

  test('aplica o percentual e arredonda para centavos como a API', () => {
    expect(precoComDesconto({ valor: 349.9, desconto: 15 })).toBe(297.42);
    expect(precoComDesconto({ valor: 899.9, desconto: 10 })).toBe(809.91);
    expect(precoComDesconto({ valor: 0.1, desconto: 33 })).toBe(0.07);
  });

  test('desconto total zera o preço', () => {
    expect(precoComDesconto({ valor: 120, desconto: 100 })).toBe(0);
  });
});

describe('formatarPreco', () => {
  test('usa vírgula decimal, ponto de milhar e sempre duas casas', () => {
    expect(formatarPreco(297.42)).toBe('297,42');
    expect(formatarPreco(219)).toBe('219,00');
    expect(formatarPreco(1234.5)).toBe('1.234,50');
  });

  test('trata valores não numéricos como zero', () => {
    expect(formatarPreco(Number.NaN)).toBe('0,00');
    expect(formatarPreco(Number.POSITIVE_INFINITY)).toBe('0,00');
  });
});
