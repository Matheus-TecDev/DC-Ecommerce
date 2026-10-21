import estilo from './styles.module.scss'
import { urlImagem } from '../../../../services/api'
import { useState } from "react"
import type { Produto } from '../../../../types/modelos'

interface GaleriaProdutoProps {
    produto: Produto;
}

const FUNDOS = ["#E2E3FF", "#FFC0BC", "#DEC699", "#E8DFCF", "#E8DFCF"] as const
const TOTAL = FUNDOS.length

const SETA_ESQUERDA = "M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
const SETA_DIREITA = "M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"

interface SetaProps {
    rotulo: string;
    className: string | undefined;
    largura: number;
    desenho: string;
    onClick: () => void;
}

function Seta({ rotulo, className, largura, desenho, onClick }: SetaProps) {
    return (
        <button type="button" aria-label={rotulo} className={className} onClick={onClick}>
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={largura} fill="#474747" viewBox="0 0 16 16">
                <path fillRule="evenodd" d={desenho} />
            </svg>
        </button>
    )
}

export default function GaleriaProduto({ produto }: GaleriaProdutoProps) {
    const img = urlImagem(produto.img)

    const [imagem, setImagem] = useState(0)

    const anterior = () => setImagem((atual) => (atual + TOTAL - 1) % TOTAL)
    const proxima = () => setImagem((atual) => (atual + 1) % TOTAL)

    return (
        <div>
            <div className={estilo.container}>
                <div className={estilo.imgPrincipal} style={{ backgroundColor: FUNDOS[imagem] }}>
                    <Seta rotulo="Imagem anterior" className={estilo.normalLeft} largura={45} desenho={SETA_ESQUERDA} onClick={anterior} />
                    <Seta rotulo="Imagem anterior" className={estilo.mediaLeft} largura={20} desenho={SETA_ESQUERDA} onClick={anterior} />
                    <img src={img} alt={produto.titulo} style={{ objectFit: "contain" }} />
                    <Seta rotulo="Próxima imagem" className={estilo.normalRight} largura={45} desenho={SETA_DIREITA} onClick={proxima} />
                    <Seta rotulo="Próxima imagem" className={estilo.mediaRight} largura={20} desenho={SETA_DIREITA} onClick={proxima} />
                </div>
                <div className={estilo.imgSecundarias}>
                    {
                        FUNDOS.map((fundo, index) => (
                            <button
                                type="button"
                                className={estilo.img}
                                key={index}
                                aria-label={`Imagem ${index + 1} de ${TOTAL}`}
                                aria-pressed={imagem === index}
                                onClick={() => setImagem(index)}
                                style={imagem === index ? { border: "1px solid #C92071", backgroundColor: fundo } : { backgroundColor: fundo, border: "none" }}
                            >
                                <span className={estilo.miniatura} style={imagem === index ? { boxShadow: "0px 4px 25px rgba(0, 0, 0, 0.05)" } : { border: "none" }}>
                                    <img src={img} alt="" style={{ objectFit: "contain" }} />
                                </span>
                            </button>
                        ))
                    }
                </div>
            </div>
        </div >

    )
}
