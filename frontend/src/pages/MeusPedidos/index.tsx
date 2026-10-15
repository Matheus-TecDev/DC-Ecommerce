import estilo from './styles.module.scss'
import ResumoDoPedido from '../../components/ResumoDoPedido'
import Carrinho from '../../components/MeuCarrinho'
import Produto from '../../components/ProdutoCard'
import { Link } from 'react-router-dom'
import useProdutos from '../../hooks/useProdutos'

export default function MeusPedidos() {
    const { produtos } = useProdutos()
    return (
        <div className={estilo.container}>
            <div className={estilo.meuCarrinho}>
                <div className={estilo.primeiraLinha}>
                    <div>
                        <Carrinho />
                    </div>
                    <div>
                        <ResumoDoPedido />
                    </div>
                </div>
                <div className={estilo.segundaLinha}>
                    <div className={estilo.titulo}>
                        Produtos Relacionados
                    </div>
                    <Link to="/produtos">Ver todos -{">"}</Link>
                </div>
                <div className={estilo.terceiraLinha}>
                    {produtos.slice(0, 3).map((produto) => (
                        <Produto key={produto.id} produto={produto} />
                    ))}
                </div>
            </div>
        </div>
    )
}