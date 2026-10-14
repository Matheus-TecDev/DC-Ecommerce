import estilo from './styles.module.scss'
import SliderProduto from '../../components/SliderProdutosSelec'
import DescricaoProduto from '../../components/DescriçãoProdutoSelecionado'
import ProdutoCard from '../../components/ProdutoCard'
import { Link, useParams } from 'react-router-dom'
import useProduto from '../../hooks/useProduto'
import useProdutos from '../../hooks/useProdutos'

export default function ProdutoSelecionado() {
    const { id } = useParams()
    const estado = useProduto(id)
    const { produtos } = useProdutos()
    const produto = estado.status === 'carregado' ? estado.produto : null

    return (
        <div className={estilo.container}>
            <div className={estilo.caminho}>
            Home / Produtos{produto && ` / ${produto.categoria} / ${produto.titulo}`}
            </div>
            {estado.status === 'erro' && <p role="alert">{estado.mensagem}</p>}
            {estado.status === 'carregando' && <p>Carregando produto...</p>}
            {produto &&
            <div className={estilo.produto}>
                <div>
                    <SliderProduto produto={produto} />
                </div>
                <div >
                    <DescricaoProduto produto={produto} />
                </div>
            </div>}
            <div className={estilo.relacionados}>
                    <div className={estilo.containerTitulo}>
                        <div className={estilo.Titulo}>
                            Produtos Relacionados
                        </div>
                        <Link to="/produtos">Ver todos -{">"}</Link>
                    </div>
                <div className={estilo.produtosRelacionados}>
                    {produtos.filter((relacionado) => relacionado.id !== id).slice(0, 4).map((relacionado) => (
                        <ProdutoCard key={relacionado.id} produto={relacionado} />
                    ))}
                </div>
            </div>
        </div>
    )
}
