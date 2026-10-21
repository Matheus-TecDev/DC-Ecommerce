import { useEffect, useState } from 'react';
import { api, mensagemDeErro } from '../../../services/api';
import type { Produto } from '../../../types/modelos';

export interface EstadoProdutos {
  produtos: Produto[];
  carregando: boolean;
  erro: string;
}

export default function useProdutos(): EstadoProdutos {
  const [estado, setEstado] = useState<EstadoProdutos>({ produtos: [], carregando: true, erro: '' });

  useEffect(() => {
    let ativo = true;
    api
      .listarProdutos()
      .then((produtos) => {
        if (ativo) setEstado({ produtos, carregando: false, erro: '' });
      })
      .catch((erro: unknown) => {
        if (ativo) setEstado({ produtos: [], carregando: false, erro: mensagemDeErro(erro) });
      });
    return () => {
      ativo = false;
    };
  }, []);

  return estado;
}
