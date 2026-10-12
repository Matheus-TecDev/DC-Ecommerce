import estilo from './styles.module.scss'
import SliderProduto from '../../components/SliderProdutosSelec'
import DescricaoProduto from '../../components/DescriçãoProdutoSelecionado'
import ProdutoCard from '../../components/ProdutoCard'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import useProdutos from '../../hooks/useProdutos'
export default function ProdutoHome() {
    const { id } = useParams()
    const [produto, setProduto] = useState(null)
    const [erro, setErro] = useState('')
    const { produtos } = useProdutos()

    useEffect(() => {
        let ativo = true
        setProduto(null)
        setErro('')
        api.buscarProduto(id)
            .then((dados) => ativo && setProduto(dados))
            .catch((falha) => ativo && setErro(falha.message))
        return () => { ativo = false }
    }, [id])

    return (
        <div className={estilo.container}>
            <div className={estilo.caminho}>
            Home / Produtos{produto && ` / ${produto.categoria} / ${produto.titulo}`}
            </div>
            {erro && <p role="alert">{erro}</p>}
            {!produto && !erro && <p>Carregando produto...</p>}
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