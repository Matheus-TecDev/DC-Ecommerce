import estilo from './styles.module.scss'
import { Link } from 'react-router-dom'
import { urlImagem } from '../../../../services/api'
import { formatarPreco, precoComDesconto } from '../../../../utils/precos'
import type { Produto } from '../../../../types/modelos'

interface ProdutoCardProps {
    produto: Produto;
}

export default function ProdutoCard({ produto }: ProdutoCardProps) {
    return (
        <div className={estilo.ProdutoGeral}>
            <Link to={"/produtos/" + produto.id}>
                <div className={estilo.Produto}>
                    <div className={estilo.caixaImagem}>
                        <img src={urlImagem(produto.img)} alt={produto.titulo} className={estilo.ImagemProduto} />
                    </div>
                    <div className={estilo.TipoProduto} style={{ whiteSpace: "nowrap" }}>
                        {produto.categoria}
                    </div>
                    <div className={estilo.NomeProduto}>
                        {produto.titulo}
                    </div>
                    <div className={estilo.PrecoProduto} style={{ whiteSpace: "nowrap" }}>
                        R$ {formatarPreco(precoComDesconto(produto))}
                    </div>
                </div>
            </Link>
        </div>
    )
}
