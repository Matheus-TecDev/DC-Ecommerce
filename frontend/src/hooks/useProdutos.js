import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function useProdutos() {
    const [estado, setEstado] = useState({ produtos: [], carregando: true, erro: '' });

    useEffect(() => {
        let ativo = true;
        api.listarProdutos()
            .then((produtos) => ativo && setEstado({ produtos, carregando: false, erro: '' }))
            .catch((erro) => ativo && setEstado({ produtos: [], carregando: false, erro: erro.message }));
        return () => { ativo = false };
    }, []);

    return estado;
}
