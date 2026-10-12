import estilo from './styles.module.scss'
import Filtrar from '../../components/MenuFiltrar'
import Produtos from '../../components/ProdutoCard'
import Ordenar from '../../components/MenuOrdenar'
import { useContext } from 'react'
import { SearchContext } from '../../App'
import useProdutos from '../../hooks/useProdutos'
export default function ProdutoHome() {
    const { produtos, carregando, erro } = useProdutos()
    const search = useContext(SearchContext)

    const termo = search.search.trim().toLowerCase()
    const produtosFiltrados = produtos.filter((produto) =>
        [produto.titulo, produto.descricao, produto.categoria].some((texto) => texto.toLowerCase().includes(termo)))

    return (
        <div className={estilo.teste}>
            <div className={estilo.container}>
                <div className={estilo.Ordenar}>
                    <Ordenar termo={search.search.trim()} total={produtosFiltrados.length} />
                </div>
                <div className={estilo.containerProdutos}>
                    <div className={estilo.menuFiltrar}>
                        <Filtrar />
                    </div>
                    <div className={estilo.produtos}>
                        {carregando && <p>Carregando produtos...</p>}
                        {erro && <p role="alert">{erro}</p>}
                        {!carregando && !erro && produtosFiltrados.length === 0 && <p>Nenhum produto encontrado.</p>}

                        {produtosFiltrados.map((produto)=>(
                            
                              <Produtos key={produto.id} produto={produto}/>
                            
                        ))}
                      
                       
                    </div>

                </div>
            </div>
        </div>
    )
}