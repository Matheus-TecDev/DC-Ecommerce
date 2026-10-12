import estilo from './styles.module.scss'
import { Link } from 'react-router-dom'
import { urlImagem, formatarPreco, precoComDesconto } from '../../services/api'
export default function ProdutoHome(props) {
    const { produto } = props
    if (!produto) return null
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