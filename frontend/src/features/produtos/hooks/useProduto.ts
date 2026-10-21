import { useEffect, useState } from 'react';
import { api, mensagemDeErro } from '../../../services/api';
import type { Produto } from '../../../types/modelos';

export type EstadoProduto =
  | { status: 'carregando' }
  | { status: 'erro'; mensagem: string }
  | { status: 'carregado'; produto: Produto };

const CARREGANDO: EstadoProduto = { status: 'carregando' };

export default function useProduto(id: string | undefined): EstadoProduto {
  const [estado, setEstado] = useState<EstadoProduto>(CARREGANDO);

  useEffect(() => {
    if (id === undefined) {
      setEstado({ status: 'erro', mensagem: 'Produto não encontrado' });
      return;
    }
    let ativo = true;
    setEstado(CARREGANDO);
    api
      .buscarProduto(id)
      .then((produto) => {
        if (ativo) setEstado({ status: 'carregado', produto });
      })
      .catch((erro: unknown) => {
        if (ativo) setEstado({ status: 'erro', mensagem: mensagemDeErro(erro) });
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  return estado;
}
