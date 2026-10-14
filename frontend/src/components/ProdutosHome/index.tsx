import estilo from './styles.module.scss'
import ProdutoCard from '../ProdutoCard'
import { Link } from 'react-router-dom'
import useProdutos from '../../hooks/useProdutos'
export default function ProdutoHome() {
    const { produtos, carregando, erro } = useProdutos()
    return (
        <div className={estilo.containerProdutosEmAlta}>
            <div className={estilo.containerTitulo}>
                <div className={estilo.Titulo}>
                    Produtos em alta
                </div>
                <div className={estilo.TituloII}>
                    Coleções em destaque
                </div>
                <Link to="/produtos">Ver todos -{">"}</Link>
            </div>
            <div className={estilo.containerProdutos}>
                {carregando && <p>Carregando produtos...</p>}
                {erro && <p role="alert">{erro}</p>}
                {produtos.slice(0, 8).map((produto) => (
                    <ProdutoCard key={produto.id} produto={produto} />
                ))}
            </div>
        </div>
    )
}