import estilo from './styles.module.scss'
import { MenuFiltrar, MenuOrdenar, ProdutoCard, useProdutos, useSearch } from '../../features/produtos'

export default function Produtos() {
    const { produtos, carregando, erro } = useProdutos()
    const { search } = useSearch()

    const termo = search.trim().toLowerCase()
    const produtosFiltrados = produtos.filter((produto) =>
        [produto.titulo, produto.descricao, produto.categoria].some((texto) => texto.toLowerCase().includes(termo)))

    return (
        <div className={estilo.teste}>
            <div className={estilo.container}>
                <div className={estilo.Ordenar}>
                    <MenuOrdenar termo={search.trim()} total={produtosFiltrados.length} />
                </div>
                <div className={estilo.containerProdutos}>
                    <div className={estilo.menuFiltrar}>
                        <MenuFiltrar />
                    </div>
                    <div className={estilo.produtos}>
                        {carregando && <p>Carregando produtos...</p>}
                        {erro && <p role="alert">{erro}</p>}
                        {!carregando && !erro && produtosFiltrados.length === 0 && <p>Nenhum produto encontrado.</p>}
                        {produtosFiltrados.map((produto) => (
                            <ProdutoCard key={produto.id} produto={produto} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
