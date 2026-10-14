import estilo from './styles.module.scss'
import Botao from '../../components/Botao'
import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCarrinho } from '../../contexts/CartContext'
import { mensagemDeErro, sessaoExpirada } from '../../services/api'
import { formatarPreco, precoComDesconto } from '../../utils/precos'
import type { Produto } from '../../types/modelos'

interface DescricaoProdutoProps {
    produto: Produto;
}

const CORES = ["#6FEEFF", "#FF6969", "#5E5E5E", "#6D70B7"] as const
const TAMANHOS = ["39", "40", "41", "42", "43"] as const

export default function DescricaoProduto({ produto }: DescricaoProdutoProps) {
    const { status } = useAuth()
    const { adicionar } = useCarrinho()
    const navigate = useNavigate()
    const [erro, setErro] = useState('')

    const [reais, centavos] = formatarPreco(precoComDesconto(produto)).split(',')

    async function comprar() {
        if (status === 'anonimo') {
            navigate('/login')
            return
        }
        try {
            await adicionar(produto.id)
            navigate('/produtos/carrinho')
        } catch (falha) {
            if (sessaoExpirada(falha)) {
                navigate('/login')
                return
            }
            setErro(mensagemDeErro(falha))
        }
    }

    const [selecionado, setSelecionado] = useState(0)
    const [numero, setNumero] = useState(0)

    return (
        <div className={estilo.container}>
            <div className={estilo.nomeProduto}>
                {produto.titulo}
            </div>
            <div className={estilo.referencias}>
                <span>{produto.categoria}</span>
                <span>| REF:{produto.id}</span>
            </div>
            <div className={estilo.avaliacoes}>
                <div className={estilo.estrelas}>
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="16" fill="currentColor" className="bi bi-star-fill" viewBox="0 0 16 16">
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                    </svg>
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="16" fill="currentColor" className="bi bi-star-fill" viewBox="0 0 16 16">
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                    </svg>
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="16" fill="currentColor" className="bi bi-star-fill" viewBox="0 0 16 16">
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                    </svg>
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="16" fill="currentColor" className="bi bi-star-fill" viewBox="0 0 16 16">
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                    </svg>
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="16" fill="currentColor" className="bi bi-star" viewBox="0 0 16 16">
                        <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
                    </svg>
                </div>
                <div className={estilo.mediaAvaliacao}>
                    <span>4.7</span>
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="10" fill="currentColor" className="bi bi-star-fill" viewBox="0 0 16 16">
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                    </svg>
                </div>
                <div className={estilo.totalAvaliacoes}>
                    (90 avaliações)
                </div>
            </div>
            <div className={estilo.preco}>
                <label>R$</label>
                <span className={estilo.precoFinal}>{reais}</span>
                <label className={estilo.precoFinal}>,{centavos}</label>
                {produto.desconto > 0 && <span className={estilo.precoDesconto}>{formatarPreco(produto.valor)}</span>}
            </div>
            <div className={estilo.descricaoProduto}>
                <label>Descrição do produto</label>
                <div>
                    {produto.descricao}
                </div>
            </div>
            <div className={estilo.tamanhoProduto}>
                <label>Tamanho</label>
                <div className={estilo.botoesTamanho}>
                    {
                        TAMANHOS.map((tamanho, index) => (
                            <div key={index} >
                                <button type="button" aria-pressed={numero === index} style={numero === index ? { backgroundColor: "#C92071", border: "none", color: "#FFFFFF" } : { backgroundColor: "white" }} onClick={() => {
                                    setNumero(index)
                                }}>{tamanho}</button>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className={estilo.cores}>
                <label>Cores</label>
                <div className={estilo.botoesCores}>
                    {
                        CORES.map((cor, index) => (
                            <div className={estilo.cor} key={index} style={selecionado === index ? { border: "2px solid #C92071" } : { border: "none" }}>
                                <button type="button" aria-label={`Cor ${index + 1}`} aria-pressed={selecionado === index} onClick={() => {
                                    setSelecionado(index)
                                }} style={{ backgroundColor: cor }}></button>
                            </div>
                        ))
                    }
                </div>
            </div>
            {erro && <p role="alert">{erro}</p>}
            <div className={estilo.botaoNormal}>
                <Botao cor={'#F5F5F5'} corFundo={'#FFB31F'} largura={'220px'} altura={'48px'} texto={'COMPRAR'} onClick={() => { comprar() }} />
            </div>
            <div className={estilo.botaoMedia}>
                <Botao cor={'#F5F5F5'} corFundo={'#FFB31F'} largura={'335px'} altura={'48px'} texto={'COMPRAR'} onClick={() => { comprar() }} />
            </div>
        </div>

    )
}

