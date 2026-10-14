import estilo from './styles.module.scss'
import { urlImagem } from '../../services/api'
import { useState } from "react"
import type { Produto } from '../../types/modelos'

interface SliderProdutosSelecProps {
    produto: Produto;
}

const FUNDOS = ["#E2E3FF", "#FFC0BC", "#DEC699", "#E8DFCF", "#E8DFCF"] as const

export default function SliderProdutosSelec({ produto }: SliderProdutosSelecProps) {
    const img = urlImagem(produto.img)

    const [imagem, setImagem] = useState(0)

    return (
        <div>
            <div className={estilo.container}>
                <div className={estilo.imgPrincipal}>
                    <button className={estilo.normalLeft}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="45" fill="#474747" className="bi bi-chevron-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                        </svg>
                    </button>
                    <button className={estilo.mediaLeft}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" fill="#474747" className="bi bi-chevron-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                        </svg>
                    </button>
                    <img src={img} alt={produto.titulo} style={{ objectFit: "contain" }} />
                    <button className={estilo.normalRight}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="45" fill="#474747" className="bi bi-chevron-right" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </button>
                    <button className={estilo.mediaRight}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" fill="#474747" className="bi bi-chevron-right" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </button>
                </div>
                <div className={estilo.imgSecundarias}>
                    {
                        FUNDOS.map((fundo, index) => (
                            <div className={estilo.img} key={index} onClick={() => setImagem(index)} style={imagem === index ? { border: "1px solid #C92071", backgroundColor: fundo } : { backgroundColor: fundo, border: "none" }}>
                                <div style={imagem === index ? { boxShadow: "0px 4px 25px rgba(0, 0, 0, 0.05)" } : { border: "none" }}>
                                    <img src={img} alt={produto.titulo} style={{ objectFit: "contain" }} />
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div >

    )
}