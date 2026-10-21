import estilo from './styles.module.scss'
import { ItensCarrinho, ResumoDoPedido } from '../../features/carrinho'
import { ProdutoCard, useProdutos } from '../../features/produtos'
import { Link } from 'react-router-dom'

export default function MeusPedidos() {
    const { produtos } = useProdutos()
    return (
        <div className={estilo.container}>
            <div className={estilo.meuCarrinho}>
                <div className={estilo.primeiraLinha}>
                    <div>
                        <ItensCarrinho />
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
                        <ProdutoCard key={produto.id} produto={produto} />
                    ))}
                </div>
            </div>
        </div>
    )
}
