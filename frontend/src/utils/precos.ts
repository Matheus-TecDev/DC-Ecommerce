import type { Produto } from '../types/modelos';

export function formatarPreco(valor: number): string {
  return (Number.isFinite(valor) ? valor : 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function precoComDesconto(produto: Pick<Produto, 'valor' | 'desconto'>): number {
  return Math.round((Math.round(produto.valor * 100) * (100 - produto.desconto)) / 100) / 100;
}
